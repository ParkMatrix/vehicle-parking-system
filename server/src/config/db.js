const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI is not set. Copy server/.env.example to server/.env and fill it in.');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = connectDB;
