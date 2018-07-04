'use strict';

const cluster = require('cluster');

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

