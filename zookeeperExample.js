const { Infrastructure, Machine } = require('kelda');
const zookeeper = require('./zookeeper.js');

const n = 3;
const zoo = new zookeeper.Zookeeper(n);

const baseMachine = new Machine({
  provider: 'Amazon',
  region: 'us-west-1',
  size: 'm4.large',
  diskSize: 32,
});

const infra = new Infrastructure(baseMachine, baseMachine.replicate(n));
zoo.deploy(infra);
