const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('.'));

const IPSTACK_API_KEY = 'YOUR_IPSTACK_API_KEY';
const ABUSEIPDB_API_KEY = 'YOUR_ABUSE_IP';

// Mock data generator
function generateMockAttacks(count = 5) {
    return Array.from({ length: count }, () => ({
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        countryCode: ['US', 'UK', 'JP', 'DE', 'BR', 'CN', 'RU', 'IN'][Math.floor(Math.random() * 8)],
        abuseConfidenceScore: Math.floor(Math.random() * 30) + 70, // Score between 70-100
        lastReportedAt: new Date().toISOString()
    }));
}

app.get('/api/attacks', async (req, res) => {
    try {
        // Use mock data by default
        const mockData = generateMockAttacks();
        console.log('Sending mock attack data');
        res.json({
            data: mockData,
            total: mockData.length
        });
    } catch (error) {
        console.error('Error in /api/attacks:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch attack data', 
            details: error.message 
        });
    }
});

// Separate endpoint for real API data (use sparingly)
app.get('/api/attacks/live', async (req, res) => {
    try {
        console.log('Fetching live attacks from AbuseIPDB...');
        const response = await axios.get('https://api.abuseipdb.com/api/v2/blacklist', {
            headers: {
                'Key': ABUSEIPDB_API_KEY,
                'Accept': 'application/json'
            },
            params: {
                limit: 100,
                confidenceMinimum: 90
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching from AbuseIPDB:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch live attack data', details: error.message });
    }
});

app.get('/api/location/:ip', async (req, res) => {
    try {
        // Return mock location data to preserve API quota
        res.json({
            latitude: Math.random() * 180 - 90,
            longitude: Math.random() * 360 - 180,
            country_name: ['USA', 'UK', 'Japan', 'Germany', 'Brazil'][Math.floor(Math.random() * 5)],
            city: ['New York', 'London', 'Tokyo', 'Berlin', 'São Paulo'][Math.floor(Math.random() * 5)]
        });
    } catch (error) {
        console.error('Error in /api/location:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch location data', 
            details: error.message 
        });
    }
});

app.get('/api/test', (req, res) => {
    res.json({ status: 'Server is running' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:3000`);
}); 