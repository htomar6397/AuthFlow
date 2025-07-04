import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/authFlow");
        console.log('MongoDB connected');
    } catch (error) {
        console.error(error);
    }
}

export default connectDB;
