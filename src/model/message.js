
// configurando message type para sequelize - postegres
const message = (sequelize, DataTypes) => {
    const Message = sequelize.define('message', {
      text: {
        type: DataTypes.STRING,
        validate: { notEmpty: true }, // lança erro se vazio
      },
    });
  
    Message.associate = models => {
      Message.belongsTo(models.User);
    };
  
    return Message;
  };
  
  module.exports = message;