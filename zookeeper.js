const { Service, Container, PortRange } = require('@quilt/quilt');

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
  const cns = new Container(image)
    .replicate(n);
  this.zoo = new Service('zookeeper', cns);

  const cluster = {};
  cns.forEach((cn, i) => {
    cns[i].setHostname(`zk${i}`);
    cluster[i.toString()] = cns[i].getHostname();
  });

  const cfg = buildConfig(cluster);
  cns.forEach((cn, i) => {
    cns[i].filepathToContent['/opt/zookeeper/conf/zoo.cfg'] = cfg;
    cns[i].filepathToContent[`${dataDir}/myid`] = i.toString();
  });

  this.zoo.connect(new PortRange(1000, 65535), this.zoo);

  this.deploy = function deploy(deployment) {
    deployment.deploy(this.zoo);
  };
}

exports.Zookeeper = Zookeeper;
