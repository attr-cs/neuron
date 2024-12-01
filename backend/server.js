require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDb = require('./config/db');
const router = require('./routes/index');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const app = express();
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
app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip,
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

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});