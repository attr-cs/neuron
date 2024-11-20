require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');
const router = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 4000;


if (!process.env.CLIENT_URL || !process.env.DB_URL) {
  console.error("Missing required environment variables. Ensure CLIENT_URL and DB_URL are set.");
  process.exit(1);
}

connectDb();

const corsOptions = {
  origin: process.env.CLIENT_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, 
};
app.use(cors(corsOptions));

app.use(express.json());

app.use('/api', router);

app.use((err, req, res, next) => {
  console.error(`[Error]: ${err.message}`);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal Server Error",
  });
});

process.on('SIGINT', async () => {
  console.log("Shutting down server...");
  await mongoose.connection.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
