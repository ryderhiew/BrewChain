const createBlock = (lastBlock, data) => { 
  let newBlock = {
    timestamp: new Date().getTime(),
    data: data,
    index: lastBlock.index + 1,
    previousHash: lastBlock.hash
  };
};