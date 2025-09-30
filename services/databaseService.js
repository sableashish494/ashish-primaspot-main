const Profile = require('../models/Profile');
const Post = require('../models/Post');
const Reel = require('../models/Reel');

class DatabaseService {
    // Save profile data
    static async saveProfile(profileData) {
        try {
            const profile = await Profile.findOneAndUpdate(
                { username: profileData.username },
                {
                    username: profileData.username,
                    data: profileData,
                    last_updated: new Date()
                },
                { 
                    upsert: true, 
                    new: true
                }
            );
            return profile;
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    }

    // Save posts data
    static async savePosts(username, postsData) {
        try {
            // Delete existing posts for this user
            await Post.deleteMany({ username });
            
            // Insert new posts
            const post = new Post({
                username,
                data: postsData,
                last_updated: new Date()
            });
            
            const savedPost = await post.save();
            return savedPost;
        } catch (error) {
            console.error('Error saving posts:', error);
            throw error;
        }
    }

    // Save reels data
    static async saveReels(username, reelsData) {
        try {
            // Delete existing reels for this user
            await Reel.deleteMany({ username });
            
            // Insert new reels
            const reel = new Reel({
                username,
                data: reelsData,
                last_updated: new Date()
            });
            
            const savedReel = await reel.save();
            return savedReel;
        } catch (error) {
            console.error('Error saving reels:', error);
            throw error;
        }
    }

    // Get profile from database
    static async getProfile(username) {
        try {
            const profile = await Profile.findOne({ username });
            return profile ? profile.data : null;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }

    // Get posts from database
    static async getPosts(username, limit = 15) {
        try {
            const post = await Post.findOne({ username });
            return post ? post.data.slice(0, limit) : [];
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    }

    // Get reels from database
    static async getReels(username, limit = 7) {
        try {
            const reel = await Reel.findOne({ username });
            return reel ? reel.data.slice(0, limit) : [];
        } catch (error) {
            console.error('Error fetching reels:', error);
            throw error;
        }
    }

    // Get all data for a user
    static async getUserData(username) {
        try {
            const [profile, posts, reels] = await Promise.all([
                this.getProfile(username),
                this.getPosts(username),
                this.getReels(username)
            ]);

            if (!profile) {
                return null;
            }

            return {
                profile,
                posts,
                reels
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    // Check if user data exists in database
    static async userExists(username) {
        try {
            const profile = await Profile.findOne({ username });
            return !!profile;
        } catch (error) {
            console.error('Error checking user existence:', error);
            return false;
        }
    }

    // Get all users in database
    static async getAllUsers() {
        try {
            const users = await Profile.find({}, 'username full_name last_updated')
                .sort({ last_updated: -1 });
            return users;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    }
}

module.exports = DatabaseService;
