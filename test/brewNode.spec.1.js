const BrewNode = require('../brewNode');

const [serverPort, clientPort] = [8081, 8082];
const brewNode = new BrewNode(serverPort);

// Starting brewNode.
brewNode.init(() => {
  console.log(`brewNode is listening at port: ${serverPort}`);
});

// Starting brewNode client to add new peer.
brewNode.addPeer('127.0.0.1', clientPort);