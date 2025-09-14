import mongoose from "mongoose";

// Set up the event listener *before* attempting to connect.
// This ensures it's ready to catch the 'connected' event whenever it happens.
mongoose.connection.on('connected', () => {
    console.log("mongoDb connected Succesfully 💄");
});

// Set up an error listener as well, which is good practice.
mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
});

const connectDB = async () => {
    try {
        // The await here will pause the function until the connection is established.
        // Once connected, the 'connected' event listener above will fire.
        await mongoose.connect(`${process.env.MONGODB_URL}/SIH25`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;

