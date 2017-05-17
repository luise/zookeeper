const {Service, Container, PortRange} = require("@quilt/quilt");

var image = "jplock/zookeeper:3.4.8";
var dataDir = "/tmp/zookeeper";

function Zookeeper(n) {
    var cns = new Container(image)
        .replicate(n);
    this.zoo = new Service("zookeeper", cns);

    var cluster = {};
    for (var i = 0; i < cns.length; i++) {
        cns[i].setHostname("zk" + i)
        cluster[i.toString()] = cns[i].getHostname();
    }

    var cfg = buildConfig(cluster);
    for (var i = 0; i < cns.length; i++) {
        cns[i].filepathToContent["/opt/zookeeper/conf/zoo.cfg"] = cfg;
        cns[i].filepathToContent[dataDir + "/myid"] = i.toString();
    }

    this.zoo.connect(new PortRange(1000, 65535), this.zoo);
    this.deploy = function(deployment) {
        deployment.deploy(this.zoo);
    }
}

function buildConfig(cluster) {
    var cfg = "tickTime=2000\n" +
              "dataDir=" + dataDir + "\n" +
              "clientPort=2181\n" +
              "initLimit=5\n" +
              "syncLimit=2\n"
    for (id in cluster) {
        cfg += "server." + id + "=" + cluster[id] + ":2888:3888\n";
    }
    return cfg;
}

exports.Zookeeper = Zookeeper;
