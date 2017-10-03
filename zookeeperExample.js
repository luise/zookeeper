const { createDeployment, Machine, githubKeys } = require('@quilt/quilt');
const zookeeper = require('./zookeeper.js');

const n = 3;
const zoo = new zookeeper.Zookeeper(n);
const deployment = createDeployment({});

const baseMachine = new Machine({
  provider: 'Amazon',
  region: 'us-west-1',
  size: 'm4.large',
  diskSize: 32,
  sshKeys: githubKeys('ejj'), // Replace with your GitHub username.
});

deployment.deploy(baseMachine.asMaster());
deployment.deploy(baseMachine.asWorker().replicate(n));
zoo.deploy(deployment);
