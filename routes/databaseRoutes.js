const express = require('express');
const DatabaseService = require('../services/databaseService');
const router = express.Router();

// Get user data from database
router.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const userData = await DatabaseService.getUserData(username);
        
        if (!userData) {
            return res.status(404).json({ 
                error: 'User not found in database',
                message: 'Try fetching fresh data first'
            });
        }

        res.json(userData);
    } catch (error) {
        console.error('Database route error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch user data from database',
            details: error.message 
        });
    }
});

// Check if user exists in database
router.get('/user/:username/exists', async (req, res) => {
    try {
        const { username } = req.params;
        
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const exists = await DatabaseService.userExists(username);
        
        res.json({ 
            username, 
            exists,
            message: exists ? 'User data available in database' : 'User not found in database'
        });
    } catch (error) {
        console.error('Database check error:', error);
        res.status(500).json({ 
            error: 'Failed to check user existence',
            details: error.message 
        });
    }
});

// Get all users in database
router.get('/users', async (req, res) => {
    try {
        const users = await DatabaseService.getAllUsers();
        
        res.json({
            users,
            count: users.length,
            message: `Found ${users.length} users in database`
        });
    } catch (error) {
        console.error('Database users error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch users from database',
            details: error.message 
        });
    }
});

// Save user data to database (internal route)
router.post('/save', async (req, res) => {
    try {
        const { profile, posts, reels, username } = req.body;
        
        if (!username || !profile) {
            return res.status(400).json({ error: 'Username and profile data are required' });
        }

        // Save profile
        const savedProfile = await DatabaseService.saveProfile(profile);
        
        // Save posts if provided
        let savedPosts = [];
        if (posts && posts.length > 0) {
            savedPosts = await DatabaseService.savePosts(username, posts);
        }
        
        // Save reels if provided
        let savedReels = [];
        if (reels && reels.length > 0) {
            savedReels = await DatabaseService.saveReels(username, reels);
        }

        res.json({
            success: true,
            message: 'Data saved to database successfully',
            data: {
                profile: savedProfile,
                posts: savedPosts.length,
                reels: savedReels.length
            }
        });
    } catch (error) {
        console.error('Database save error:', error);
        res.status(500).json({ 
            error: 'Failed to save data to database',
            details: error.message 
        });
    }
});

// Get analytics data from database
router.get('/analytics/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const userData = await DatabaseService.getUserData(username);
        
        if (!userData) {
            return res.status(404).json({ 
                error: 'User not found in database',
                message: 'Try fetching fresh data first'
            });
        }

        // Calculate analytics (reuse existing logic)
        const analytics = calculateAnalytics(userData.posts, userData.reels, userData.profile);
        
        res.json({
            profile: userData.profile,
            posts: userData.posts,
            reels: userData.reels,
            analytics
        });
    } catch (error) {
        console.error('Database analytics error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch analytics from database',
            details: error.message 
        });
    }
});

// Helper function to calculate analytics (copied from frontend)
function calculateAnalytics(posts, reels, profile) {
    const allContent = [...posts, ...reels];
    
    // Posts analytics
    const postsAnalytics = calculateContentAnalytics(posts, 'Posts');
    
    // Reels analytics
    const reelsAnalytics = calculateContentAnalytics(reels, 'Reels');
    
    // Overall analytics
    const totalLikes = allContent.reduce((sum, item) => sum + item.likes, 0);
    const totalComments = allContent.reduce((sum, item) => sum + item.comments, 0);
    const avgLikes = allContent.length > 0 ? Math.round(totalLikes / allContent.length) : 0;
    const avgComments = allContent.length > 0 ? Math.round(totalComments / allContent.length) : 0;
    
    // Engagement rate (simplified)
    const totalEngagement = totalLikes + totalComments;
    const engagementRate = profile.followers > 0 ? ((totalEngagement / allContent.length) / profile.followers * 100) : 0;
    
    return {
        posts: postsAnalytics,
        reels: reelsAnalytics,
        overall: {
            totalPosts: posts.length,
            totalReels: reels.length,
            totalContent: allContent.length,
            avgLikes,
            avgComments,
            totalLikes,
            totalComments,
            engagementRate: Math.round(engagementRate * 100) / 100
        }
    };
}

function calculateContentAnalytics(content, type) {
    if (content.length === 0) {
        return {
            count: 0,
            avgLikes: 0,
            avgComments: 0,
            totalLikes: 0,
            totalComments: 0,
            bestPerforming: null,
            engagementRate: 0
        };
    }
    
    const totalLikes = content.reduce((sum, item) => sum + item.likes, 0);
    const totalComments = content.reduce((sum, item) => sum + item.comments, 0);
    const avgLikes = Math.round(totalLikes / content.length);
    const avgComments = Math.round(totalComments / content.length);
    
    // Find best performing content
    const bestPerforming = content.reduce((best, current) => {
        const currentEngagement = current.likes + current.comments;
        const bestEngagement = best.likes + best.comments;
        return currentEngagement > bestEngagement ? current : best;
    });
    
    return {
        count: content.length,
        avgLikes,
        avgComments,
        totalLikes,
        totalComments,
        bestPerforming,
        engagementRate: Math.round((totalLikes + totalComments) / content.length)
    };
}

module.exports = router;
