const app = require('./app');
const connectDB = require('./db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB(process.env.MONGODB_URI);
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();