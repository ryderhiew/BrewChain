'use strict';

require('./config');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const BrewNode = require('./brewNode');

const port = 8080;
const node1 = new BrewNode(port);

// Starting node
node1.init(() => {
  console.log(`Starting node on ${port}`);
});

/* class BrewHTTP {
  constructor(port) {
    this._port = port || process.env.DEFAULT_BREWHTTP_PORT;
  }
}

new BrewHTTP(8081); */

const httpPort = 8081 || process.env.DEFAULT_BREWHTTP_PORT;

const app = express(http);
app.use(bodyParser.json());

app.get('/addNode/:port', (req, res) => {
  console.log('addNode connection!');
  node1.addPeer('127.0.0.1', req.params.port);
  res.send('addNode');
});

app.get('/spawnBrew/:teammember', (req, res) => {
  console.log('spawnBrew connection!');
  node1.createBlock(req.params.teammember);
  res.end('spawnBrew');
});

app.listen(httpPort, () => {
  console.log(`HTTP server is listening at ${httpPort}`);
});
