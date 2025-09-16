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
const initializeSocket = require('./socket/index');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// Validate required env vars
if (!process.env.CLIENT_URL || !process.env.DB_URL) {
  console.error("Missing required environment variables. Ensure CLIENT_URL and DB_URL are set.");
  process.exit(1);
}

// Connect to database
connectDb();

// Trust proxy headers (for rate limiting and deployment setups)
app.set('trust proxy', 1);

// Parse allowed origins from env variable
const allowedOrigins = process.env.CLIENT_URL.split(',');

// CORS configuration with dynamic origin checking
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Rate limiter setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000,
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'] || req.ip;
    return forwarded.split(',').shift().trim();
  },
  handler: (req, res) => {
    res.status(429).json({ error: true, message: 'Too many requests, please try again later.' });
  },
});
app.use(limiter);

// API routes
app.use('/api', router);

// Error handling
app.use((err, req, res, next) => {
  console.error(`[Error]:`, err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message
  });
});

// Socket.IO setup
const io = initializeSocket(httpServer);
app.set('io', io);

// Root route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
