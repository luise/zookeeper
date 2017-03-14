var image = "quilt/zookeeper";

function Zookeeper(n) {
    var cns = new Container(image)
        .replicate(n);
    this.zoo = new Service("zookeeper", cns);

    var allMembers = [];
    for (var i = 0; i < cns.length; i++) {
        cns[i].setHostname("zk" + (i+1));
        allMembers.push(cns[i].getHostname());
    }

    var allMembersStr = allMembers.join(",");
    for (var i = 0; i < cns.length; i++) {
        cns[i].command = ["" + (i + 1), allMembersStr];
    }

    this.zoo.connect(new PortRange(1000, 65535), this.zoo);
    this.deploy = function(deployment) {
        deployment.deploy(this.zoo);
    }
}

exports.Zookeeper = Zookeeper;
