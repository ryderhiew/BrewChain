const BrewChain = require('./brewChain');

const myBrew = new BrewChain();

myBrew.init();
myBrew.addToChain(myBrew.createBlock('The first block.'));
myBrew.addToChain(myBrew.createBlock('The second block.'));

console.log('myBrew.getChain():\n ', myBrew.getChain());
