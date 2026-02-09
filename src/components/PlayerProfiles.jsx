import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

function PlayerProfiles() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPhotoIndexes, setCurrentPhotoIndexes] = useState({});

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            // Fetch players with their photos
            const { data: playersData, error: playersError } = await supabase
                .from('players')
                .select('*')
                .order('order_index', { ascending: true });

            if (playersError) throw playersError;

            // Fetch photos for each player
            const playersWithPhotos = await Promise.all(
                (playersData || []).map(async (player) => {
                    const { data: photos, error: photosError } = await supabase
                        .from('player_photos')
                        .select('*')
                        .eq('player_id', player.id)
                        .order('created_at', { ascending: true });

                    if (photosError) {
                        console.error('Error fetching photos:', photosError);
                        return { ...player, photos: [] };
                    }

                    return { ...player, photos: photos || [] };
                })
            );

            setPlayers(playersWithPhotos);

            // Initialize photo indexes
            const indexes = {};
            playersWithPhotos.forEach(p => {
                indexes[p.id] = 0;
            });
            setCurrentPhotoIndexes(indexes);
        } catch (error) {
            console.error('Error fetching players:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (playerId, index) => {
        setCurrentPhotoIndexes(prev => ({
            ...prev,
            [playerId]: index
        }));
    };

    if (loading) {
        return (
            <section className="players-section">
                <h2 className="players-title">👥 Para Pemain</h2>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                    Memuat data pemain...
                </p>
            </section>
        );
    }

    if (players.length === 0) {
        return (
            <section className="players-section">
                <h2 className="players-title">👥 Para Pemain</h2>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                    Belum ada pemain terdaftar. Tambahkan melalui halaman admin.
                </p>
            </section>
        );
    }

    return (
        <section className="players-section">
            <h2 className="players-title">👥 Para Pemain</h2>

            {players.map((player, index) => {
                // Alternating: first player RIGHT, second LEFT, third RIGHT, etc.
                const isRight = index % 2 === 0;
                const currentPhotoIndex = currentPhotoIndexes[player.id] || 0;
                const currentPhoto = player.photos[currentPhotoIndex];

                return (
                    <div
                        key={player.id}
                        className={`player-card ${isRight ? 'right' : 'left'}`}
                    >
                        <div className="player-photo-container">
                            {currentPhoto ? (
                                <img
                                    src={currentPhoto.photo_url}
                                    alt={player.name}
                                    className="player-photo"
                                />
                            ) : (
                                <div
                                    className="player-photo"
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '3rem'
                                    }}
                                >
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                            )}

                            {/* Photo carousel dots */}
                            {player.photos.length > 1 && (
                                <div className="photo-dots">
                                    {player.photos.map((_, photoIndex) => (
                                        <span
                                            key={photoIndex}
                                            className={`photo-dot ${photoIndex === currentPhotoIndex ? 'active' : ''}`}
                                            onClick={() => handlePhotoChange(player.id, photoIndex)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="player-info">
                            <h3 className="player-name">{player.name}</h3>
                            <p className="player-description">
                                {player.description || 'Pemain aktif di server TJKT 2 Minecraft.'}
                            </p>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}

export default PlayerProfiles;
