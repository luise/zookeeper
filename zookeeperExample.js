const { Infrastructure, Machine, githubKeys } = require('kelda');
const zookeeper = require('./zookeeper.js');

const n = 3;
const zoo = new zookeeper.Zookeeper(n);

const baseMachine = new Machine({
  provider: 'Amazon',
  region: 'us-west-1',
  size: 'm4.large',
  diskSize: 32,
  sshKeys: githubKeys('ejj'), // Replace with your GitHub username.
});

const infra = new Infrastructure(baseMachine, baseMachine.replicate(n));
zoo.deploy(infra);
