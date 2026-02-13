import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { fileToBase64, encryptImage, decryptImage } from '../lib/encryption';
import './AdminPage.css';

function AdminPage() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // New player form
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerDescription, setNewPlayerDescription] = useState('');

    // Edit mode
    const [editingPlayer, setEditingPlayer] = useState(null);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const { data: playersData, error } = await supabase
                .from('players')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;

            // Fetch photos for each player from SECURE table
            const playersWithPhotos = await Promise.all(
                (playersData || []).map(async (player) => {
                    const { data: photos } = await supabase
                        .from('secure_player_photos')
                        .select('*')
                        .eq('player_id', player.id)
                        .order('created_at', { ascending: true });

                    // Decrypt photos
                    const decryptedPhotos = (photos || []).map(photo => {
                        try {
                            const decryptedUrl = decryptImage(photo.encrypted_data, photo.iv);
                            return {
                                ...photo,
                                photo_url: decryptedUrl // Add this virtual property for display
                            };
                        } catch (e) {
                            console.error('Failed to decrypt photo', photo.id);
                            return null;
                        }
                    }).filter(p => p !== null && p.photo_url);

                    return { ...player, photos: decryptedPhotos };
                })
            );

            setPlayers(playersWithPhotos);
        } catch (error) {
            console.error('Error fetching players:', error);
            alert('Error fetching players: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const addPlayer = async (e) => {
        e.preventDefault();
        if (!newPlayerName.trim()) return;

        try {
            const { data, error } = await supabase
                .from('players')
                .insert([
                    {
                        name: newPlayerName,
                        description: newPlayerDescription,
                        order_index: players.length
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            setPlayers([...players, { ...data, photos: [] }]);
            setNewPlayerName('');
            setNewPlayerDescription('');
        } catch (error) {
            console.error('Error adding player:', error);
            alert('Error adding player: ' + error.message);
        }
    };

    const deletePlayer = async (playerId) => {
        if (!confirm('Are you sure you want to delete this player?')) return;

        try {
            const { error } = await supabase
                .from('players')
                .delete()
                .eq('id', playerId);

            if (error) throw error;

            setPlayers(players.filter(p => p.id !== playerId));
        } catch (error) {
            console.error('Error deleting player:', error);
            alert('Error deleting player: ' + error.message);
        }
    };

    const uploadPhoto = async (playerId, file) => {
        if (!file) return;

        setUploading(true);
        try {
            // 1. Convert to Base64
            const base64Data = await fileToBase64(file);

            // 2. Encrypt
            const { encryptedData, iv } = encryptImage(base64Data);

            // 3. Insert into SECURE table
            const { data: photoData, error: dbError } = await supabase
                .from('secure_player_photos')
                .insert([
                    {
                        player_id: playerId,
                        encrypted_data: encryptedData,
                        iv: iv
                    }
                ])
                .select()
                .single();

            if (dbError) throw dbError;

            // 4. Update local state (add decrypted URL for display)
            const newPhoto = {
                ...photoData,
                photo_url: base64Data // Use local base64 for immediate feedback
            };

            setPlayers(players.map(p => {
                if (p.id === playerId) {
                    return { ...p, photos: [...p.photos, newPhoto] };
                }
                return p;
            }));

        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error uploading photo: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const deletePhoto = async (playerId, photoId) => {
        if (!confirm('Delete this photo?')) return;

        try {
            // Delete from database
            const { error: dbError } = await supabase
                .from('secure_player_photos')
                .delete()
                .eq('id', photoId);

            if (dbError) throw dbError;

            // Update local state
            setPlayers(players.map(p => {
                if (p.id === playerId) {
                    return { ...p, photos: p.photos.filter(ph => ph.id !== photoId) };
                }
                return p;
            }));

        } catch (error) {
            console.error('Error deleting photo:', error);
            alert('Error deleting photo: ' + error.message);
        }
    };

    const updatePlayer = async (playerId, updates) => {
        try {
            const { error } = await supabase
                .from('players')
                .update(updates)
                .eq('id', playerId);

            if (error) throw error;

            setPlayers(players.map(p => {
                if (p.id === playerId) {
                    return { ...p, ...updates };
                }
                return p;
            }));
            setEditingPlayer(null);
        } catch (error) {
            console.error('Error updating player:', error);
            alert('Error updating player: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <h1>Admin - TJKT 2 Server</h1>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>Admin Panel</h1>
                <Link to="/" className="back-link">← Back to Site</Link>
            </header>

            {/* Add New Player Form */}
            <section className="admin-section">
                <h2>Add New Player</h2>
                <form onSubmit={addPlayer} className="add-player-form">
                    <input
                        type="text"
                        placeholder="Player Name"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Description (optional)"
                        value={newPlayerDescription}
                        onChange={(e) => setNewPlayerDescription(e.target.value)}
                    />
                    <button type="submit">Add Player</button>
                </form>
            </section>

            {/* Players List */}
            <section className="admin-section">
                <h2>Players ({players.length})</h2>

                {players.length === 0 ? (
                    <p className="empty-message">No players yet. Add one above!</p>
                ) : (
                    <div className="players-grid">
                        {players.map((player) => (
                            <div key={player.id} className="admin-player-card">
                                <div className="player-header">
                                    {editingPlayer === player.id ? (
                                        <div className="edit-form">
                                            <input
                                                type="text"
                                                defaultValue={player.name}
                                                id={`name-${player.id}`}
                                            />
                                            <textarea
                                                defaultValue={player.description || ''}
                                                id={`desc-${player.id}`}
                                            />
                                            <div className="edit-buttons">
                                                <button
                                                    onClick={() => {
                                                        const name = document.getElementById(`name-${player.id}`).value;
                                                        const description = document.getElementById(`desc-${player.id}`).value;
                                                        updatePlayer(player.id, { name, description });
                                                    }}
                                                >
                                                    Save
                                                </button>
                                                <button onClick={() => setEditingPlayer(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3>{player.name}</h3>
                                            <p>{player.description || 'No description'}</p>
                                            <div className="player-actions">
                                                <button onClick={() => setEditingPlayer(player.id)}>Edit</button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => deletePlayer(player.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Photos Section */}
                                <div className="photos-section">
                                    <h4>Photos ({player.photos.length})</h4>

                                    <div className="photos-grid">
                                        {player.photos.map((photo) => (
                                            <div key={photo.id} className="photo-item">
                                                <img src={photo.photo_url} alt="Player" />
                                                <button
                                                    className="delete-photo-btn"
                                                    onClick={() => deletePhoto(player.id, photo.id, photo.photo_url)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}

                                        {/* Upload New Photo */}
                                        <label className="upload-photo-btn">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => uploadPhoto(player.id, e.target.files[0])}
                                                disabled={uploading}
                                            />
                                            {uploading ? '...' : '+'}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default AdminPage;
