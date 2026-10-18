const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const app = require('./src/app');
const connectDB = require('./src/db/db');

const PORT = Number(process.env.PORT || 5000);
let server;
let isShuttingDown = false;

async function startServer() {
  try {
    if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
      throw new Error('PORT must be an integer between 1 and 65535.');
    }

    await connectDB();
    await new Promise((resolve, reject) => {
      server = app.listen(PORT);
      server.once('error', reject);
      server.once('listening', () => {
        console.log(`Server is running on port ${PORT}`);
        resolve();
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

const shutdown = async () => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error.message);
    process.exit(1);
  }
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
