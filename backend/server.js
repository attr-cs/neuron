require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDb = require('./config/db');
const router = require('./routes/index');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { createServer } = require('http');
const initializeSocket = require('./socket');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

if (!process.env.CLIENT_URL || !process.env.DB_URL) {
  console.error("Missing required environment variables. Ensure CLIENT_URL and DB_URL are set.");
  process.exit(1);
}

connectDb();

app.set('trust proxy', 1);

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000, // Limit each IP to 3000 requests
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'] || req.ip;
    return forwarded.split(',').shift().trim(); // Handle multiple IPs in x-forwarded-for
  },
  handler: (req, res) => {
    res.status(429).json({ error: true, message: 'Too many requests, please try again later.' });
  },
});
app.use(limiter);

app.use('/api', router);

app.use((err, req, res, next) => {
  console.error(`[Error]:`, err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message
  });
});

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Store io instance on app for potential use in routes
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



app.get('/', (req, res) => {
  res.send('Server is running');
});


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});