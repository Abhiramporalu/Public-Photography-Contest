// utils/checkForWatermark.js
const Tesseract = require('tesseract.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const checkForWatermark = async (photoUrl) => {
    const tempFilePath = path.join(__dirname, 'temp.jpg');

    try {
        const response = await axios({
            url: photoUrl,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const { data: { text } } = await Tesseract.recognize(tempFilePath, 'eng');
        fs.unlinkSync(tempFilePath);

        const lowerText = text.toLowerCase();
        const suspiciousKeywords = ['shutterstock', 'pixabay', 'istock', 'getty', 'unsplash', 'pexels'];

        const isSuspicious = suspiciousKeywords.some(keyword => lowerText.includes(keyword));

        return {
            isSuspicious,
            extractedText: text.trim(),
        };
    } catch (err) {
        console.error('Error checking watermark:', err.message);
        return {
            isSuspicious: false,
            extractedText: '',
        };
    }
};

module.exports = checkForWatermark;
