'use strict';
module.exports = (sequelize, DataTypes) => {

  //console.log("configurou model --------------------");


  const Message = sequelize.define('message', {
    text: {
      type: DataTypes.STRING,
      validate: { notEmpty: true }, // lança erro se vazio
    },



  },
    {

     /*  classMethods: {
        associate: function (models) {
          Message.belongsTo(models.user);
        },

      } */
    });

  //Message.belongsTo(User, {foreignKey: 'userId'});

   Message.associate = function (db) {
     Message.belongsTo(db.user);
   };
 
  return Message;
};