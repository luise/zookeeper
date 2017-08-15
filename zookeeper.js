const { Container, PortRange, allow } = require('@quilt/quilt');

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
  const containers = new Container('zookeeper', image).replicate(n);

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

  allow(containers, containers, new PortRange(1000, 65535));

  this.deploy = function deploy(deployment) {
    deployment.deploy(containers);
  };
}

exports.Zookeeper = Zookeeper;
