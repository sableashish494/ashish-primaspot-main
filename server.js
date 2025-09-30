// Load environment variables
require('dotenv').config();

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { connectDB } = require('./config/database');
const DatabaseService = require('./services/databaseService');
const databaseRoutes = require('./routes/databaseRoutes');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Database routes
app.use('/api/db', databaseRoutes);

// Image proxy endpoint
app.get('/api/image', async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        // Fetch the image from Instagram
        const response = await axios.get(url, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.instagram.com/',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
            }
        });

        // Set appropriate headers
        res.set({
            'Content-Type': response.headers['content-type'] || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            'Access-Control-Allow-Origin': '*'
        });

        // Pipe the image data to the response
        response.data.pipe(res);

    } catch (error) {
        console.error('Error proxying image:', error.message);
        res.status(500).json({ error: 'Failed to load image' });
    }
});

// API endpoint to fetch Instagram profile
app.post('/api/fetch-profile', async (req, res) => {
    const { username } = req.body;
    
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        // Run the backend script
        const backendProcess = spawn('node', ['backend.js', username], {
            cwd: __dirname,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        backendProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        backendProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        // Wait for the process to complete
        await new Promise((resolve, reject) => {
            backendProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Backend script failed with code ${code}: ${stderr}`));
                }
            });
        });

        // Read the generated JSON files
        const profilePath = path.join(__dirname, 'profile.json');
        const postsPath = path.join(__dirname, 'posts.json');
        const reelsPath = path.join(__dirname, 'reels.json');

        if (!fs.existsSync(profilePath)) {
            throw new Error('Profile data not found');
        }

        const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        const posts = fs.existsSync(postsPath) ? JSON.parse(fs.readFileSync(postsPath, 'utf8')) : [];
        const reels = fs.existsSync(reelsPath) ? JSON.parse(fs.readFileSync(reelsPath, 'utf8')) : [];

        // Save to database
        try {
            await DatabaseService.saveProfile(profile);
            if (posts.length > 0) {
                await DatabaseService.savePosts(username, posts);
            }
            if (reels.length > 0) {
                await DatabaseService.saveReels(username, reels);
            }
            console.log(`✅ Data saved to database for user: ${username}`);
        } catch (dbError) {
            console.error('⚠️ Database save failed (continuing with API response):', dbError.message);
        }

        res.json({ profile, posts, reels });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch profile data' 
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            console.log(`📱 Open your browser and enter an Instagram username to get started!`);
            console.log(`🗄️  Database routes available at /api/db`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();