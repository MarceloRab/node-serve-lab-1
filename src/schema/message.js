const { gql } = require('apollo-server-express');

module.exports = gql`
extend type Query {       
    messages(cursor: String, limit: Int): MessageConnection!
    message(id: ID!): Message!
},

extend type Mutation {
    createMessage(text: String!): Message!
    deleteMessage(id: ID!): Boolean!
}

type MessageConnection {
  edges: [Message!]!
  pageInfo: PageInfo!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String!
}

type Message {
  id: ID!
  text: String!
  createdAt: String!
  userId: Int!
  user: User
}

extend type Subscription {
  messageCreated: MessageCreated!
}

type MessageCreated {
  message: Message!
}
`;

// ######  SEMPRE VERIFICA O PARENT NOS RESOLVERS FINAL - ELE FAZ A MESMA COISA PARA TODOS

//messagesId (id: ID!): [Message!]!
//messagesId (id: ID!): [Message!]! => id do usuário