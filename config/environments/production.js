require('dotenv/config');
module.exports = {
  PORT: process.env.PORT,
  DB: {
      url: process.env.DATABASE_URL,
      dialect: "postgres"
  }
};