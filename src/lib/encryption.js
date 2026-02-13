import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-fallback-key';

// Encrypt data (returns { encryptedData, iv })
export const encryptImage = (base64Data) => {
    // Generate a secure random IV
    const iv = CryptoJS.lib.WordArray.random(16);

    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(base64Data, CryptoJS.enc.Utf8.parse(SECRET_KEY), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return {
        encryptedData: encrypted.toString(),
        iv: iv.toString(CryptoJS.enc.Hex)
    };
};

// Decrypt data (returns base64 string)
export const decryptImage = (encryptedData, ivHex) => {
    try {
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(SECRET_KEY), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};

// Helper: Convert File to Base64
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};
