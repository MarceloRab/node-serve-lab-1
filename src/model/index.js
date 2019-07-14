require('dotenv/config');
const Sequelize = require('sequelize');

//console.log(require('dotenv').config())

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: 'postgres',
  },
);

// instancia das tabelas
const models = {
  User: sequelize.import('./user'),
  Message: sequelize.import('./message'),
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

module.exports = { models, sequelize };

/* var lista_usuarios = [
    { id: "0", username: "Patricia", idade: "20", messageIds: ["0", "1"] },
    { id: "1", username: "Thiago", idade: "30", messageIds: ["2"] },
    { id: "2", username: "Junior", idade: "40", messageIds: ["3"] },
    { id: "3", username: "Marcelo", idade: "18", messageIds: [] }
];

// pode-se guardar apenas o id da mensagem
// pode-se guardar apenas o id do usurio



var lista_mensagens = [
    { id: "0", text: "Boa tarde", userId: "0" },
    { id: "1", text: "Oi tudo bem", userId: "0" },
    { id: "2", text: "Como estao as coisas", userId: "1" },
    { id: "3", text: "Tudo bem com você?", userId: "2" }
];

module.exports =  {
  lista_usuarios,
  lista_mensagens,
  }; */


