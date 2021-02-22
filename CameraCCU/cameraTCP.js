const net = require('net');
const http = require('http');

function log(source, data){
        console.log(`${msToTime(new Date())} [${source}] ${data.split(/\r?\n/g)[2]}`)
}

function msToTime(s) {
  var pad = (n, z = 2) => ('00' + n).slice(-z);
  return pad(s/3.6e6|0) + ':' + pad((s%3.6e6)/6e4 | 0) + ':' + pad((s%6e4)/1000|0) + '.' + pad(s%1000, 3);
}

function httpRequest(host, port, path){
    return new Promise(function(resolve, reject) {
        var options = {
            host: host,
            path: path,
            port: port,
        };
        callback = function(response) {
            var str = ''
            response.on('data', function (chunk) {
                str += chunk;
            });
            response.on('end', function () {
                resolve({str});
            });
        }
        var req = http.request(options, callback);
        req.end();
    })
}


var cameras = [
    {
        IP: "10.100.3.108", 
        name: "UE150 - Camera1",
        focus: 00,
        zoom: 00,
        iris: 00,
        position: {
            x: 0,
            y: 0,
        },
    },
    {
        IP: "10.100.6.230", 
        name: "HE130 - Camera2",
        focus: 00,
        zoom: 00,
        iris: 00,
        position: {
            x: 0,
            y: 0,
        },
    },
    {
        IP: "10.100.4.131", 
        name: "UE150 - Camera3",
        focus: 00,
        zoom: 00,
        iris: 00,
        position: {
            x: 0,
            y: 0,
        },
    },
    {
        IP: "10.100.6.225", 
        name: "HE130 - Camera4",
        focus: 00,
        zoom: 00,
        iris: 00,
        position: {
            x: 0,
            y: 0,
        },
    },
];

var settings = {
    focus: {
        min: 1365,
        max: 4095,
    },
    zoom: {
        min: 1365,
        max: 4095,
    },
    iris: {
        min: 1365,
        max: 4095,
    },
}

var sockets = [];

cameras.forEach((camera, i) => {
    var server = net.createServer(function(socket) {
        try {
            sockets.push(socket)
            socket.on('data', function(data) {
                cgiDecoder(i, data.toString())
                //log("CAMERA " + (i + 1), data.toString())
            });
            
        } catch (error) {
            console.log(error);
        }
    }).listen(31000 + i);
    try {
        httpRequest(camera.IP, 80, "/cgi-bin/event?connect=start&my_port=" + (31000 + i) + "&uid=0")
        
    } catch (error) {
        console.log(error)
    }
});

function cgiDecoder(camera, data){
    console.log(data.split(/\r?\n/g)[2]);
    var type = data.split(/\r?\n/g)[2].substring(0,3);
    switch (type) {
        case "lPI":
            cameras[camera].zoom = ((parseInt(data.split(/\r?\n/g)[2].substring(3,6), 16) - settings.zoom.min) / (settings.zoom.max - settings.zoom.min)).toFixed(2);
            cameras[camera].focus = ((parseInt(data.split(/\r?\n/g)[2].substring(6,9), 16) - settings.focus.min) / (settings.focus.max - settings.focus.min)).toFixed(2);
            cameras[camera].iris = ((parseInt(data.split(/\r?\n/g)[2].substring(9,12), 16)- settings.iris.min) / (settings.iris.max - settings.iris.min)).toFixed(2);
            break;
        case "aPC":
            cameras[camera].position.x = (parseInt(data.split(/\r?\n/g)[2].substring(3,7), 16))
            cameras[camera].position.y = (parseInt(data.split(/\r?\n/g)[2].substring(7,10), 16))
            break;
        default:
            break;
    }
    console.clear()
    console.table(cameras);
}