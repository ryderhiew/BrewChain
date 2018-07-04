'use strict';

// Importing .env variables
require('./config');
const brewChain = require('./brewChain');
const WebSocket = require('ws');

/**
 * BrewNode
 *
 * @class BrewNode
 */
class BrewNode {
  /**
   *Creates an instance of BrewNode.
   * @param {number} port
   * @memberof BrewNode
   */
  constructor(port) {
    this.brewSockets = [];
    this.brewServer = null;
    this._port = port || process.env.DEFAULT_BREWNODE_PORT;
    this.chain = new brewChain();

    this.msgEvents = {
      REQUEST_CHAIN: 'REQUEST_CHAIN',
      REQUEST_BLOCK: 'REQUEST_BLOCK',
      BLOCK: 'BLOCK',
      CHAIN: 'CHAIN'
    };
  }

  /**
   * Main business logic method, starting a WebSocket Server.
   * @public
   * @memberof BrewNode
   */
  init(callback) {
    this.chain.init();
    this.brewServer = new WebSocket.Server({ port: this._port });
    if (callback !== undefined) {
      this.brewServer.on('listening', callback);
    }
    this.brewServer.on('connection', (ws /* , request */) => {
      console.log('Connection in...');
      this._initConnection(ws);
    });
  }

  /**
   * Both used as a server and a client method
   * @private
   *
   * @param {object} ws
   * @memberof init
   */
  _initConnection(ws) {
    console.log('Init connection.');
    this._messageHandler(ws);
    this._requestLatestBlock(ws);
    this.brewSockets.push(ws);

    ws.on('error', () => {
      this._closeConnection(ws);
    });
    ws.on('close', () => {
      this._closeConnection(ws);
    });
  }

  /**
   * Handling incoming message data and update the current node as client.
   *
   * Response with data to incoming request.
   * @private
   *
   * @param {object} ws
   * @memberof _initConnection
   */
  _messageHandler(ws) {
    ws.on('message', (data) => {
      /**
       * @type {object}
       * @property {object} msg
       * @property {string} msg.event
       * @property {object} msg.message
       */
      let msg;
      try {
        return (msg = JSON.parse(data));
      } catch (err) {
        throw err;
      }

      switch (msg.event) {
        case this.msgEvents.REQUEST_CHAIN:
          this._requestChain(ws);
          break;

        case this.msgEvents.REQUEST_BLOCK:
          this._requestLatestBlock(ws);
          break;

        case this.msgEvents.BLOCK:
          this._processedReceivedBlock(msg.message);
          break;

        case this.msgEvents.CHAIN:
          this._processedReceivedChain(msg.message);
          break;

        default:
          console.log('Unknown message.');
      }
    });
  }

  /**
   * Response with the chain.
   * @private
   *
   * @param {object} ws
   * @memberof _messageHandler
   */
  _requestChain(ws) {
    ws.send(
      JSON.stringify({
        event: this.msgEvents.CHAIN,
        message: this.chain.blockChain
      })
    );
  }

  /**
   * Response with the latest block.
   * @private
   *
   * @param {object} ws
   * @memberof _messageHandler
   */
  _requestLatestBlock(ws) {
    ws.send(
      JSON.stringify({
        event: this.msgEvents.BLOCK,
        message: this.chain.latestBlock
      })
    );
  }

  /**
   * @private
   *
   * @param {object} ws
   * @memberof init
   */
  _closeConnection(ws) {
    console.log('closing connection.');
    this.brewSockets.splice(this.brewSockets.indexOf(ws), 1);
  }

  /**
   * Checking if is the same or oder, or next, or ahead block and broadcasting to request for keeping the chain be latest if needed.
   * @private
   *
   * @param {object} block
   * @memberof _messageHandler
   */
  _processedReceivedBlock(block) {
    let currentTopBlock = this.chain.latestBlock;

    // Make sure it is not tha same or older chain.
    if (block.index <= currentTopBlock.index) {
      console.log('No update needed');
      return;
    }
    
    // Is claiming to be the next of the chain
    if (block.previousHash === currentTopBlock.hash) {
      // Adding the top block to our chain
      this.chain.addToChain(block);

      console.log('New block added:\n', this.chain.latestBlock);
    } else {
      // If it's ahead, we are therefore a little behind, request the whole chain
      console.log('Requesting chain.');
      this.broadcastMessage(this.msgEvents.REQUEST_CHAIN, 'Chain needed!');
    }
  }

  /**
   * Replacing the current chain with new chain if needed.
   * @private
   *
   * @param {array} blocks
   * @memberof _messageHandler
   */
  _processedReceivedChain(blocks) {
    let newChain = blocks.sort((block1, block2) => block1.index - block2.index);

    if (
      newChain.length > this.chain.totalBlocks &&
      this.chain.checkNewChainIsValid(newChain)
    ) {
      this.chain.replaceChain(newChain);
      console.log('Chain replaced and updated!');
    }
  }

  /**
   * The block is ahead, therefore broadcasting and  requesting chain from all nodes.
   *
   * On the opposite side, If new block is created, then broadcasting it to other nodes with this new block.
   * @public
   *
   * @param {string} event
   * @param {string|object} message
   * @memberof _processedReceivedBlock
   */
  broadcastMessage(event, message) {
    this.brewSockets.forEach((node) => {
      node.send(JSON.stringify({ event, message }));
    });
  }

  /**
   * Creating new block and broadcasting it to other nodes.
   * @public
   *
   * @param {object} teammember
   * @memberof BrewNode
   */
  createBlock(teammember) {
    let newBlock = this.chain.createBlock(teammember);
    this.chain.addToChain(newBlock);
    this.broadcastMessage(this.msgEvents.BLOCK, newBlock);
  }

  /**
   * Get total blocks length
   *
   * @returns chain length
   * @memberof BrewNode
   */
  getStats() {
    return {
      blocks: this.chain.totalBlocks
    };
  }

  /**
   * Opening WebSocket connection with supplied address as a client to add new peer to create a block based on a teammember's name and adding it to the chain.
   * @public
   * @param {string} host
   * @param {number} port
   * @param {function} callback
   * @memberof BrewNode
   */
  addPeer(
    host = '127.0.0.1',
    port = process.env.DEFAULT_WEBSOCKET_CLIENT_PORT
  ) {
    const ws = new WebSocket(`ws://${host}:${port}`);
    
    ws.on('error', (err) => {
      console.log(err);
    });
    
    ws.on('open', (ws) => {
      console.log(`A new peer is connected:\n ${port}`);
      this._initConnection(ws);
    });
  }
}

module.exports = BrewNode;
