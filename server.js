require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
// const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected successfully.'))
//   .catch(err => console.error('MongoDB connection error:', err));

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    console.log('Using existing database connection.');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  } 
}

app.use(async (req, res, next) => { 
  if (!isConnected) {
    await connectToDatabase();
  }
  next();
});

// API Routes
app.use('/api', apiRoutes);

// // Start server
// app.listen(PORT, () => {
//   console.log(`Backend server running on http://localhost:${PORT}`);
// });

//don not use app.listen in vercel deployment
module.exports = app;