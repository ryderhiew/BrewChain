'use strict';

const crypto = require('crypto');

/**
 * BrewChain
 *
 * @class BrewChain
 */
class BrewChain {
  constructor() {
    this.chain = [];
    this.currentBlock = null;
    this.genesisBlock = null;
  }

  /**
   * Main business logic method
   * @public
   *
   * @memberof BrewChain
   */
  init() {
    this.genesisBlock = {
      index: 0,
      timestamp: 1511818270000,
      data: 'Our genesis data',
      previousHash: '-1',
      nonce: 0
    };
    this.genesisBlock.hash = this._createHash(this.genesisBlock);
    this.chain.push(this.genesisBlock);
    this.currentBlock = this.genesisBlock;
  }

  _createHash({ index, timestamp, data, previousHash, nonce }) {
    return crypto
      .createHash('SHA256')
      .update(timestamp + data + index + previousHash + nonce)
      .digest('hex');
  }

  /**
   * @public
   *
   * @param {object} block
   * @returns boolean
   * @memberof BrewChain
   */
  addToChain(block) {
    if (this._checkNewBlockIsValid(block, this.currentBlock)) {
      this.chain.push(block);
      this.currentBlock = block;
      return true;
    }

    return false;
  }

  _checkNewBlockIsValid(block, previousBlock) {
    if (previousBlock.index + 1 !== block.index) {
      return false;
    } else if (previousBlock.hash !== block.previousHash) {
      return false;
    } else if (!this._hashIsValid(block)) {
      return false;
    }
    return true;
  }

  _hashIsValid(block) {
    return this._createHash(block) === block.hash;
  }

  /**
   * @public
   *
   * @param {array} newChain
   * @returns boolean
   * @memberof BrewChain
   */
  checkNewChainIsValid(newChain) {
    if (this._createHash(newChain[0] !== this.genesisBlock.hash)) {
      return false;
    }

    let previousBlock = newChain[0];
    let blockIndex = 1;

    while (blockIndex < newChain.length) {
      let block = newChain[blockIndex];

      if (block.previousHash !== this._createHash(previousBlock)) {
        return false;
      }

      if (block.hash.slice(-3) !== '000') {
        return false;
      }

      previousBlock = block;
      blockIndex++;
    }

    return true;
  }

  /**
   * @public
   *
   * @param {string} data
   * @returns newBlock
   * @memberof BrewChain
   */
  createBlock(data) {
    let newBlock = {
      timestamp: new Date().getTime(),
      data,
      index: this.currentBlock.index + 1,
      previousHash: this.currentBlock.hash,
      nonce: 0
    };
    newBlock = this._proofOfWork(newBlock);

    return newBlock;
  }

  _proofOfWork(block) {
    while (true) {
      block.hash = this._createHash(block);
      if (block.hash.slice(-3) === '000') {
        return block;
      } else {
        block.nonce++;
      }
    }
  }

  /**
   * @public
   *
   * @returns currentBlock
   * @memberof BrewChain
   */
  get latestBlock() {
    return this.currentBlock;
  }

  /**
   * @public
   *
   * @returns chain length
   * @memberof BrewChain
   */
  get totalBlocks() {
    return this.chain.length;
  }

  /**
   * @public
   *
   * @returns chain
   * @memberof BrewChain
   */
  get blockChain() {
    return this.chain;
  }

  /**
   * @public
   *
   * @param {object} newChain
   * @memberof BrewChain
   */
  replaceChain(newChain) {
    this.chain = newChain;
    this.currentBlock = this.chain[this.chain.length - 1];
  }
}

module.exports = BrewChain;
