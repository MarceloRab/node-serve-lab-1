
const { GraphQLDateTime } = require( 'graphql-iso-date');
const userResolvers = require( './user');
const messageResolvers = require( './message');

const customScalarResolver = {
    Date: GraphQLDateTime,
  };

module.exports = [customScalarResolver, userResolvers, messageResolvers];
//module.exports = [ userResolvers, messageResolvers];