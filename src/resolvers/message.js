
//const uuidv4 = require('uuid/v4');
//const { ForbiddenError } = require('apollo-server-express');
const { isAuthenticated, isMessageOwner } = require('../resolvers/authorization');
const { combineResolvers } = require('graphql-resolvers');
const { pubsub, EVENTS } = require('../subscription');

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');


var getMensagens = async (parent, { cursor, limit = 100 }, { db }) => {

  const cursorOptions = cursor
    ? {
      where: {
        createdAt: {
          [Sequelize.Op.lt]: fromCursorHash(cursor),
        },
      },
    }
    : {};

  var messages = await db.message.findAll({
    //include: [db.user],
    order: [['createdAt', 'DESC']],
    limit: limit + 1,
    ...cursorOptions,
  });

  const hasNextPage = messages.length > limit;
  const edges = hasNextPage ? messages.slice(0, -1) : messages;

  /* messages.forEach(message => {
      message.userId = String(message.userId);
      console.log("resolvres usres ---- lista de messagens users: ____ ...  "+ (typeof messages[0].userId === 'string'));

  }); */
  //console.log("resolvres usres --- lista de messagens users: __ ... " + JSON.stringify(messages[0]));
  return {
    edges,
    pageInfo: {
      hasNextPage,
      endCursor: toCursorHash(
        edges[edges.length - 1].createdAt.toString(),
      ),
    },
  };
}
//return lista_mensagens;


var getMensagensId = async (parent, { id }, { db }) => {
  return await db.message.findByPk(id);
}

var createMessage = combineResolvers( //associa o erro com usuer com resolvers
  isAuthenticated, // ../resolvers/authorization
  async (parent, { text }, { db, userLogado }) => {


    let message = await db.message.create({
      text,
      user: userLogado,
      userId: userLogado.id,
      //userId: 8,
    });

    pubsub.publish(EVENTS.MESSAGE, {
      messageCreated: { message },
    });


    return message;
  },
);

/* var createMessage = async (parent, { text }, { models, userLogado }) => {
    if (!userLogado) {
        throw new ForbiddenError('Not authenticated as user.');
      }

    try {
        return await models.Message.create({
            text,
            user: userLogado,
        });
    } catch (error) {
        throw new Error(error); //
    }
} */

/* var deleteMessage = (parent, { id }, { userLogado }) => {
    const { [id]: message, ...otherMessages } = lista_mensagens;
    if (!message) {
        return false;
    }
    //messages = otherMessages;
    for (var i = 0; i < lista_mensagens.length; i++) {
        if (lista_mensagens[i].id === id) {
            lista_mensagens.splice(i, 1);
        }
    }
    return true;
}; */

var deleteMessage = combineResolvers(
  isMessageOwner,
  async (parent, { id }, { db }) => {
    return await db.message.destroy({ where: { id } });
  },
);

var dateCreateMessage = async function (parent, { date }, { db, userLogado }) {
  return await db.message.create({
    text,
    user: userLogado,
    //userId: 8
    userId: userLogado.id,
  });

};

module.exports = {
  Query: {
    //messagesId: getMensagensId,
    messages: getMensagens,
    message: getMensagensId
  },

  Mutation: {
    createMessage: createMessage,
    deleteMessage: deleteMessage,   
    //createdAt: dateCreateMessage
  },

  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE),
    },
  },

  // parent - (1º parametro) quando gerar cada usuário e pedir o userName retorne o que quiser - vide abaixo
  Message: {
    user: async (message, args, { loaders }) => {
      //console.log("resolvres messageId "+ message.userId);
     // let userLoad = await loaders.user.load(message.userId);
      //console.log("resolvres message parent user "+ JSON.stringify(userLoad));

      return await loaders.user.load(message.userId);
    },
  }
  //toda vez que rodar a função em cada objeto message ele retorna o que esta no contex o usário logado
  // neste caso posso verificar se esta null
  /* Message: {
      user: (parent, args, { userLogado }) => {
        return userLogado;
      },
    }, */

  // toda vez que rodar um objeto mensagem retorne para user como na função
  // ## não esquecer que tem de ser o mesmo nome dos PARAMETROS
  /* Message: {
      user: async (message, args, { db }) => {
          return await db.user.findByPk(message.userId);
      },
  }, */
};