const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI ='mongodb+srv://herodb:Pranjal18@cluster0fortelebot.ihjua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0fortelebot';
        
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`🗄️  MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('🔌 MongoDB Disconnected');
    } catch (error) {
        console.error('❌ Database disconnection error:', error.message);
    }
};

module.exports = { connectDB, disconnectDB };