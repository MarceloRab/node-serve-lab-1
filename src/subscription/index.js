const { PubSub } = require( 'apollo-server');

const MESSAGE_EVENTS = require( './message');

const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
};

const pubsub = new PubSub()

module.exports = { pubsub, EVENTS};