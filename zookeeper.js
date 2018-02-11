const { Container, allowTraffic } = require('kelda');

const image = 'jplock/zookeeper:3.4.8';
const dataDir = '/tmp/zookeeper';

function buildConfig(cluster) {
  let cfg = `tickTime=2000
dataDir=${dataDir}
clientPort=2181
initLimit=5
syncLimit=2
`;
  Object.keys(cluster).forEach((id) => {
    cfg += `server.${id}=${cluster[id]}:2888:3888\n`;
  });
  return cfg;
}

function Zookeeper(n) {
  const containers = [];
  for (let i = 0; i < n; i += 1) {
    containers.push(new Container({ name: 'zookeeper', image }));
  }

  const zkIDToHostname = {};
  containers.forEach((cn, i) => {
    zkIDToHostname[i.toString()] = cn.getHostname();
  });

  const cfg = buildConfig(zkIDToHostname);
  containers.forEach((_, i) => {
    const cn = containers[i];
    cn.filepathToContent['/opt/zookeeper/conf/zoo.cfg'] = cfg;
    cn.filepathToContent[`${dataDir}/myid`] = i.toString();
  });

  // Used by peers for general communication.
  allowTraffic(containers, containers, 2888);

  // Used by peers for leader election.
  allowTraffic(containers, containers, 3888);

  // Used for client connections. While not strictly necessary, it's
  // convenient for the containers in the cluster to be able to create a client
  // for debugging.
  allowTraffic(containers, containers, 2181);

  this.deploy = function deploy(deployment) {
    containers.forEach(container => container.deploy(deployment));
  };
}

exports.Zookeeper = Zookeeper;
