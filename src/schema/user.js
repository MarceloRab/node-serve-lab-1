const { gql } = require('apollo-server-express');

// extend para poder mesclar com outro schema
module.exports = gql`
extend type Query {
    userLogado: User
    user(id: ID!): User
    users: [User!]   
},

extend type Mutation {
    newUser(username: String!, idade: String!): User   
    upDateUser(username: String!, idade: String!): User  
    signUp(
        username: String!
        email: String!
        password: String!
      ): Token!
    signIn(login: String!, password: String!): Token!
    deleteUser(id: ID!): Boolean!   
},

type Token {
    token: String!
},

type User {
    id: ID!
    username: String!
    email: String!
    idade: String
    role: String
    messages: [Message!]
},
`;