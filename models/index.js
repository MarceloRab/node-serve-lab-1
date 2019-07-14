'use strict';
require('dotenv/config'); // configurar sequelize pelos valores denv
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const { DB } = require("../config/environments");
//const env = process.env.NODE_ENV || 'development';
//const config = require(__dirname + '/../config/config.json')[env]; // pelo config json default
const config = DB;
const db = {};

/* let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
} */


/* const sequelize = new Sequelize(config.database, config.username, config.password,
  {
    dialect: 'postgres',
  }); */

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(config.url, {
    dialect: 'postgres',
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password,
    {
      dialect: 'postgres',
    },
  );
}

/* const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: 'postgres',
  },
); */

//console.log("configurou sequelize --------------------");

let model;
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {


    model = sequelize['import'](path.join(__dirname, file));

    /* if(model.name){
      console.log("configurou sequelize --------------------" + model.name);
    } */
    db[model.name] = model;


  });



Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//module.exports = db;  // padrão

module.exports = { db, sequelize };
