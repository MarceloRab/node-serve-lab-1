'use strict'

require('dotenv/config');
const http = require('http');
const express = require('express');
//comunicação entre servidores
const cors = require('cors');
//const connect = require('connect');
const jwt = require('jsonwebtoken');

const DataLoader  = require( 'dataloader');

//const { execute, subscribe } = require(  'graphql');
const graphiqlExpress = require('express-graphql');
const bodyParser = require('body-parser')
const { execute, subscribe } = require('graphql');
//const { SubscriptionClient  } = require( 'subscriptions-transport-ws');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { SubscriptionClient, addGraphQLSubscriptions } = require('subscriptions-transport-ws');
const ApolloClient = require('apollo-boost');
const { ApolloLink } = require('apollo-link');
const { createHttpLink } = require('apollo-link-http');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { split } = require('apollo-link');
//onst fetch = require( 'isomorphic-fetch');
const ws = require('ws');
const { HttpLink } = require('apollo-link-http');
const { WebSocketLink } = require('apollo-link-ws');
const { getMainDefinition } = require('apollo-utilities');
const fetch = require('node-fetch');

const loaders = require(  './loaders');


const {
  ApolloServer,
  AuthenticationError,
} = require('apollo-server-express');
//const {typeDefs,resolvers, userLogado } = require('../src/config/graphql');


const { db, sequelize } = require('../models');
const typeDefs = require('../src/schema');
const resolvers = require('../src/resolvers');


//const models = require('../src/model');
//const query = require('qs-middleware');

//const { models, sequelize } = require('../src/model');

//const models = db;

const app = express();
app.use(cors());

//const userLogado = {};

//porta de entrada para servidor
// req global com herad com token já processa a chave ao entrar meddle
// retorna o user registrado quando o token foi criado - vide resolver user createToken
const getMe = async req => {
  const token = req.headers['x-token'];
  //const token = req.headers['Authorization'];
  // verifica se tem um token, se falhar emite erro do Apollo Server

  //console.log("index mains token -------- "+ JSON.stringify(token));
  if (token) {
    try {

      const userLogado = await jwt.verify(token, process.env.SECRET);
      // console.log('Index principal - token- '+ userLogado);

      //console.log("user LOGADO ---- ....111 "+ JSON.stringify(userLogado));

      return userLogado;
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
};

/* const batchUsers = async (keys, db) => {
  const users = await db.user.findAll({
    where: {
      id: {
        $in: keys,
      },
    },
  });
  let listKeysUSers = keys.map(key => users.find(user => user.id === key));

  console.log("index main "+ JSON.stringify(listKeysUSers));

  return listKeysUSers ;
};

const userLoader = new DataLoader(keys => batchUsers(keys, db)); */

const server = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {

    if (connection) {
      console.log('index main - ___________ ... Connection');
      return {
        db,
      };
    }

    if (req) {
      let userLogado = await getMe(req); // gerado pela verificação do token criado após regitro inicial ou login
      // pode verificar mensagens mas não criar novas, pois depende do id dele.
      //console.log('index main -_______   ..... req');

      //console.log("user LOGADO ---- 222 ...."+ JSON.stringify(userLogin));

      //const userLogado = { id, email, username, role };
      //console.log('index main user -_______   ..... ' + userLogado.id);
      return {
        db,
        //models,
        userLogado,
        secret: process.env.SECRET,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, db),
          ),
        },
      };
    }

  },

  subscriptions: {
    onConnect: (connectionParams, webSocket) => {
      console.log('Websocket CONNECTED');
      return {
        hello: 'world'
      }
    },
    onDisconnect: () => console.log('Websocket CONNECTED'),
  }

});

//app.use(query());
server.applyMiddleware({ app, path: '/graphql' });



const port = normalizePort(process.env.Port || '4000'); // porta normalizada
const httpServer = http.createServer(app);

app.use('/graphql', bodyParser.json(), graphiqlExpress({ schema: typeDefs, subscriptionsEndpoint: `ws://localhost:${port}${server.graphqlPath}` }));
app.get('/graphql', graphiqlExpress({ endPointURL: '/graphql' }));



const createApolloClient = () => {
  //const createApolloClient = (authToken) =>{
  return new ApolloClient({
    link: new WebSocketLink({
      uri: `ws://localhost:${port}${server.graphqlPath}`,
      options: {
        reconnect: true,
        connectionParams: {
          headers: {
            // Authorization: `Bearer ${authToken}` 

          }
        }
      }
    }),
    cache: new InMemoryCache()
  });
};



const createApolloClient2 = () => {
  //const createApolloClient = (authToken) =>{
  const http = new HttpLink({
    uri: `http://localhost:${port}/graphql`,
    fetch,
  });

  const wsForNode = typeof window === "undefined" ? ws : null

  //...

  const wsClient = new SubscriptionClient(
    `wss://localhost:${port}${server.graphqlPath}`,
    {
      reconnect: true
    },
    wsForNode
  )

  //...
  const websocket = new WebSocketLink(wsClient)
};

createApolloClient2();

/* const networkInterface = createHttpLink({ uri:
  `http://localhost:${port}${server.graphqlPath}`});

  networkInterface.use([{
    applyMiddleware(req, next) {
      setTimeout(next, 500);
    },
  }]);

  const wsClient = new SubscriptionClient(`ws://localhost:${port}/subscriptions`, {
  reconnect: true,});

  const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
    networkInterface,
    wsClient,
  );

  const client = new ApolloClient({
    networkInterface: networkInterfaceWithSubscriptions,    
  }); */


/* new SubscriptionServer({
  execute,
  subscribe,
  typeDefs
}, {
  server: httpServer,
  path: '/subscriptions',
}); */

//   ######   #############    333#####################################
server.installSubscriptionHandlers(httpServer);

let apolloClient = null

const httpUri = `http://localhost:${port}/graphql`;
const wsUri = `ws://localhost:${port}${server.graphqlPath}`;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

const client = new SubscriptionClient(
  wsUri,
  {
    reconnect: true
  },
  ws
);

const hasSubscriptionOperation = ({ query: { definitions } }) =>
  definitions.some(
    ({ kind, operation }) =>
      kind === 'OperationDefinition' && operation === 'subscription'
  );

const link = ApolloLink.split(
  hasSubscriptionOperation,
  new WebSocketLink(client),
  new HttpLink({ uri: httpUri, fetch })
);

const create = (initialState) => {
  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link,
    cache: new InMemoryCache().restore(initialState || {})
  })
};

const initApollo = (initialState) => {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState)
  }

  return apolloClient
};

/* const uri = `http://localhost:4000/graphql`;
const wsUri = `ws://localhost:4000/graphql`;
// Create an http link:
const httpLink = new HttpLink({ uri, fetch });

const wsClient = new SubscriptionClient(wsUri, { reconnect: true }, ws);
const wsLink = new WebSocketLink(wsClient); */

/* const wsLink = new WebSocketLink({
  uri: wsUri,
  options: {
    reconnect: true
  }
}); */
// Create a WebSocket link:
/* const wsLink = new WebSocketLink({
  //uri: `ws://localhost:${port}${server.subscriptionsPath}`,
  uri: wsUri,
  options: {
    reconnect: true
  }
}); */


/* const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return (
      kind === 'OperationDefinition' && operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
); */


/* app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:4000/graphql/subscriptions`
}));
 */
const eraseDatabaseOnSync = false;

const isTest = !!process.env.TEST_DATABASE; // !! retorna objeto?
const isProduction = !!process.env.DATABASE_URL;

sequelize.sync({ force: isTest || isProduction }).then(async () => {

  if (isTest || isProduction) {
    try {

      console.log("index main teste adiciona _________ ... ______");
      createUsersWithMessages(new Date());
    }

    catch (erro) {
      console.log('index main----' + erro);

    }
  }

  httpServer.listen({ port: port }, () => {
    console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`)

    //createApolloClient();
    //createApolloClient2();

    //initApollo();

    /* new SubscriptionServer({
      execute,
      subscribe,
      typeDefs
    }, {
      server: httpServer,
      path: '/subscriptions',
    }); */
  });
});





// ADICIONANDO USARIOS ESTÁTICOS - JÁ UNIQUE NO SEQUELIZE
const createUsersWithMessages = async date => {

  /* var userCC = await db.User.findOne(
    {
      where: {
        username: 'Sarah amor',
        email: 'teste_2@david.com',
      },

    },
  ); */

  //if (!userCC === null) {

  //console.log("index main ---- --- "+ db.user.name);

  await db.user.create(
    {
      username: 'Nome teste_1',
      idade: "30",
      email: 'teste_3@david.com',
      password: 'Teste123',
      messages: [
        {
          text: 'Segunda mensage,...',
          createdAt: date.setSeconds(date.getSeconds() + 1),

        },
        {
          text: 'Mais 1 mensagem ...',
        },
      ],

    },
    {
      include: [db.message],
    },
  );




  /* var userC_2 = await db.User.findOne(
    {
      where: {
        username: 'Marcelo Rabelo',
        email: 'teste_3@robin.com',
      },

    },
  ); */

  //if (!userC_2 === null) {

  await db.user.create(
    {

      username: 'Marcelo Rabelo',
      idade: "25",
      email: 'teste_1@robin.com',
      password: 'Marcelo123',
      role: 'ADMIN',
      messages: [
        {
          text: 'Primeiro mensagem create',

        },
      ],

    },
    {
      include: [db.message],
    },
  );


  /* user: {
             id: "1",
             username: "Marcelo Rabelo"
           } */






};


function normalizePort(val) {
  const port = parseInt(val, 10);
  // se não conseguir 

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}
