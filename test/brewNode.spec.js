'use strict';

const async = require('async');
const BrewNode = require('../brewNode');

class Node {
  constructor(serverPort, clientPort) {
    const brewNode = new BrewNode(serverPort);

    // Starting brewNode.
    brewNode.init(() => {
      console.log(`brewNode is listening at port: ${serverPort}`);
    });

    // Starting brewNode client to add new peer.
    brewNode.addPeer('127.0.0.1', clientPort);
  }
}

async.parallel(
  {
    one: function() {
      new Node(8081, 8087);
    },
    two: function() {
      new Node(8082, 8081);
    },
    three: function() {
      new Node(8083, 8082);
    },
    four: function() {
      new Node(8084, 8083);
    },
    five: function() {
      new Node(8085, 8084);
    },
    six: function() {
      new Node(8086, 8085);
    },
    seven: function() {
      new Node(8087, 8086);
    }
  },
  (err, result) => {
    if (err) {
      throw err;
    }
    console.log(`result:\n${result}`);
  }
);
