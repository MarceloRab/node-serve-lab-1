require('dotenv/config');
module.exports = {
    PORT: process.env.PORT,
    DB: {
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      host: "localhost",
      dialect: "postgres"
    }
  };