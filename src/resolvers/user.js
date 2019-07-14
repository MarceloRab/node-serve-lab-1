const {
  lista_usuarios,
  lista_mensagens,
} = require('../model');

//criar chave - token de acesso ao banco de dados
const jwt = require('jsonwebtoken');
const { combineResolvers } = require('graphql-resolvers');
const { AuthenticationError, UserInputError } = require('apollo-server');

const { isAdmin } = require('../resolvers/authorization');

var getUsuarios = async (parent, args, { db, userLogado, secret }) => {

  var listUsers = await db.user.findAll({
    include: [db.message]
  });

 // console.log("resolvres usres --------- lista de messagens users: _____________   "+ JSON.stringify(listUsers[0].messages[0].userId));
 // console.log("resolvres usres --------- lista de messagens users: _____________   "+ JSON.stringify(listUsers[0].messages[0]));
 // console.log("resolvres usres --------- lista de messagens users: _____________   "+ isNaN(listUsers[0].messages[0].userId) );
 // console.log("resolvres usres --------- lista de messagens users: _____________   "+ (typeof listUsers[0].messages[0].userId === 'number'));
  return listUsers;

  //return lista_usuarios;
}

var getUser = async (parent, {id}, { db, userLogado, secret }) => {

  var user = await db.user.findByPk(Number(id), {
    include: [db.message]
  });

  return user;
  //var id = args.id;
  /* return lista_usuarios.filter(usuario => {
      return usuario.id == id;
  })[0];
*/
}

var createUser = function (parent, { username, idade }, { userLogado }) {

  let id = (lista_usuarios.length + 1).toString();
  let user = { id: id, username: username, idade: idade };
  lista_usuarios.push(user);
  return user;

};


var deleteUser = combineResolvers(
  isAdmin, // não esqucer da role - não pode ser vazia #################
  async (parent, { id }, { db }) => {

    return await db.user.destroy({
      where: { id },
    });
  },
);

var userLogadoFunction = async (parent, args, { userLogado }) => {
  //var id = args.id;
  //console.log(" graphql -- uselogado " + userLogado.username);  
  if (!userLogado) {
    return null;
  }
  return await models.User.findByPk(userLogado.id);
  //return userLogado;

}

// guarda o token pelo tempo expiresIn e aguarda o objeto relacionado - no caso user com id, email e username
const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, role } = user;

  console.log(" resolvres user login create ----______ -- uselogado id " + id); 
  console.log(" resolvres user login create ----______ -- uselogado email" + email); 
  console.log(" resolvres user login create ----______ -- uselogado username" + username); 
  return await jwt.sign({ id, email, username, role }, secret, {
  //return await jwt.sign(user, secret, {
    expiresIn,
  });
};

// entrada no banco - registro inicial
var signUp = async (
  parent,
  { username, email, password },
  { db, userLogado, secret },
) => {

  //console.log("resolvres ----------" + db.length);
  const user = await db.User.create({
    username,
    email,
    password,
  });

  //console.log("Criou usuarios ---------------");



  return { token: createToken(user, secret, "30m") }; // token dura 30min, após deve efetuar login novamente
}

// login ou assinatura
var sigIn = async (
  parent,
  { login, password },
  { db, userLogado, secret },
) => {
  const user = await db.user.findByLogin(login);

  console.log("resolve user _ ...  login id ..." + user.id)

  if (!user) {
    throw new UserInputError(
      'No user found with this login credentials.',
    );
  }

  const isValid = await user.validatePassword(password);

  if (!isValid) {
    throw new AuthenticationError('Invalid password.');
  }

  return { token: createToken(user, secret, '2h') };// novo token após login dura 30min, após deve efetuar login novamente
};

module.exports = {
  Query: {
    userLogado: userLogadoFunction,
    user: getUser,
    users: getUsuarios
  },

  Mutation: {
    newUser: createUser,
    signUp: signUp,
    signIn: sigIn,
    deleteUser: deleteUser
  },
  // parent - (1º parametro) quando gerar cada usuário e pedir o userName retorne o que quiser - vide abaixo
 /*  User: {
    messages: async (user, args, { db }) => {
      return await db.message.findAll({
        where: {
          userId: user.id,
        },
      });
      // return `${user.username} - ${user.idade} anos`;
    }
  }, */
};
