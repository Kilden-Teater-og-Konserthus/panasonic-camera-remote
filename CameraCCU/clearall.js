const net = require('net');
const http = require('http');

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
    "10.100.4.131",
    "10.100.3.108",
    "10.100.6.230",
    "10.100.6.222",
    "10.100.6.223",
    "10.100.6.225",
]

var camera = {IP: "10.100.6.225"}

cameras.forEach(camera => {
    wipe(camera)
});

async function wipe(IP){
    for(var i = 0; i < 100; i++){
        await httpRequest(IP, 80, "/cgi-bin/aw_ptz?cmd=%23C" + i.toString().padStart(2,0) + "&res=1")
    }
}
async function set(){
    
    for(var i = 0; i < 100; i++){
        await httpRequest(camera.IP, 80, "/cgi-bin/aw_ptz?cmd=%23M" + i.toString().padStart(2,0) + "&res=1")
    }

}