'use strict';

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true, // apenas 1
      allowNull: false,
      validate: { // lança erro se vazio
        notEmpty: true,
      },
    },
    idade: {
      type: DataTypes.STRING,
      /* unique: true,
      allowNull: true,
      validate: { // lança erro se vazio
        notEmpty: true,
      }, */
    },
    email: {
      type: DataTypes.STRING,
      unique: true, // apenas 1
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [7, 42],
      },
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: function() {
        return 'geral'
      }
    },

  //}, {});
  }, {

    /* classMethods: {
      associate: function (models) {
        User.hasMany(models.message, { onDelete: 'CASCADE' });
      },

    } */
  });

  User.associate = function (db) {
    User.hasMany(db.message, { onDelete: 'CASCADE' });
  };

  // ######## FAZENDO AS FUNÇÕES ATRELADAS AO OBJETO USER - USAR SE NECESSÁRIO
  // verifica igualdade nos valores pelo username ou pelo email
  // LOGIN USADA NO SIG-IN - RESOLVERS
  User.findByLogin = async login => {
    let user = await User.findOne({
      where: { username: login },
    });

    if (!user) {
      user = await User.findOne({
        where: { email: login },
      });
    }

    return user;
  };

  //criando token para entrada no banco
  //guarda password criptografado toda vez que cria algo
  User.beforeCreate(async user => {
    user.password = await user.generatePasswordHash();
  });

  User.prototype.generatePasswordHash = async function () {
    const saltRounds = 10;
    return await bcrypt.hash(this.password, saltRounds);
  };

  // LOGIN USADA NO SIG-IN - RESOLVERS
  User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};