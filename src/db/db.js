const mongoose = require('mongoose');

async function connectDB() {
<<<<<<< HEAD
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("Database connection error:", err);
    }
=======
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined. Create a .env file with a MongoDB connection string.');
  }

  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB connection already established.');
    return mongoose.connection;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    console.log('MongoDB connected successfully.');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw new Error(`Unable to connect to MongoDB. Check MONGO_URI and ensure MongoDB is running. ${error.message}`);
  }
>>>>>>> b325f371cd0e2a46b5661b7a33021c9a70bf2ba6
}

module.exports = connectDB;