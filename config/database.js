require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sableashish32_db_user:YVfx1APhKSbgBDnP@scraper.pfmfqsz.mongodb.net/?retryWrites=true&w=majority&appName=Scraper'; // should now point to localhost

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ Local MongoDB connected!');
    } catch (error) {
        console.error('❌ Cannot connect to MongoDB:', error.message);
        throw error;
    }
};

module.exports = { connectDB };
