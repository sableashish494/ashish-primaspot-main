require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

const testConnection = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ Local MongoDB is working!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Cannot connect to MongoDB:', error.message);
    }
};

testConnection();
