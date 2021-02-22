const net = require('net');
const  http = require('http');
const express = require('express');
const { response } = require('express');
const app = express()
const app2 = express()
const port = 80
const port2 = 81

var client;
client = new net.Socket();

client.connect({port: 35200, host: "10.100.3.51"});

client.on('connect', () => {
  console.log('connected to server!');
});

client.on('data', function(data){
  console.log(data)
});

client.on('end', () => {
  console.log('disconnected from server');
});

var server = net.createServer(function(socket) {
    try {
        socket.on('data', function(data) {
            console.log("TCP: ",data.toString())
        });
        
    } catch (error) {
        console.log(error);
    }
}).listen(35200);

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

app.get('/*', function (req, res) {
    console.log(req.originalUrl);
    httpRequest("10.100.6.222", 80, req.originalUrl).then(response =>{
        console.log(80, response.str)
        res.send(response.str)
    });
})

app2.get('/*', function (req, res) {
    console.log(81, req.originalUrl);
    httpRequest("10.100.6.223", 80, req.originalUrl).then(response =>{
        console.log(response.str)
        res.send(response.str)
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
app2.listen(port2, () => {
    console.log(`Example app listening at http://localhost:${port2}`)
})