const { Sequelize } = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize(`${process.env.DB_NAME}`, `${process.env.DB_USERNAME}`, `${process.env.DB_PASSWORD}`, {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // optional: disable logging
});

// Test the connection
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

connectDB();

module.exports = sequelize;
