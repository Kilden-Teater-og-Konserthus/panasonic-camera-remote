
var http = require('http');
const express = require('express');
const app = express();
var port = 3001;

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

var cameras = [
  {
    IP: '10.100.4.131',
    positions: {},
    presets: [98,99],
    lastpreset: 1,
    active: true
  },
  {
    IP: '10.100.3.108',
    positions: {},
    presets: [98,99],
    lastpreset: 1,
    active: false
  },
  {
    IP: '10.100.6.230',
    positions: {},
    presets: [98,99],
    lastpreset: 1,
    active: false
  },
  {
    IP: '10.100.6.222',
    positions: {},
    presets: [98,99],
    lastpreset: 1,
    active: false
  },
  {
    IP: '10.100.6.223',
    positions: {},
    presets: [98,99],
    lastpreset: 1,
    active: false
  },
  {
    IP: '10.100.6.224',
    positions: {},
    presets: [98,99],
    lastpreset: 1,
    active: false
  },
]

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
        resolve(str);
      });
    }
    
    var req = http.request(options, callback);
    req.end();
  })
}

function setPosition(pos, camera){
  console.log(camera)
  cameras[camera-1].positions[pos] = {};
  httpRequest(cameras[camera-1].IP, 80, "/cgi-bin/aw_ptz?cmd=%23APC&res=1").then(function(data){
    console.log(data);
    cameras[camera-1].positions[pos].coodinates = data;
  })
  httpRequest(cameras[camera-1].IP, 80, "/cgi-bin/aw_ptz?cmd=%23AXZ&res=1").then(function(data){
    console.log(data);
    cameras[camera-1].positions[pos].zoom = data;
  })
  httpRequest(cameras[camera-1].IP, 80, "/cgi-bin/aw_ptz?cmd=%23M" + pos + "&res=1");
}

app.get('/setPosition', function(req, res){
    console.log(req.originalUrl);
    setPosition(req.query.position, req.query.camera)
    res.sendStatus(200);
});

function getPosition(pos, camera){
  console.log(pos, camera)
    console.log("/cgi-bin/aw_ptz?cmd=%23" + cameras[camera].positions[pos].coodinates.toUpperCase() + "&res=1")
    httpRequest(cameras[camera].IP, 80, "/cgi-bin/aw_ptz?cmd=%23R" + pos + "&res=1");
}

app.get('/getPosition', function(req, res){
    console.log(req.originalUrl);
    getPosition(req.query.position, (req.query.camera - 1))
    res.sendStatus(200);
});

app.get('/start', function(req, res){
    console.log(req.originalUrl);
    var camera = req.query.camera;
    getPosition(cameras[camera-1].presets[cameras[camera-1].lastpreset], (req.query.camera - 1));
    cameras[camera-1].active = true;
    res.sendStatus(200);
  });
  
  app.get('/stop', function(req, res){
    console.log(req.originalUrl);
    var camera = req.query.camera;
    cameras[req.query.camera-1].active = false;
    httpRequest(cameras[camera-1].IP, 80, "/cgi-bin/aw_ptz?cmd=%23RPC80008000&res=1");
    res.sendStatus(200);
});

function toDec(hex){
    return parseInt(hex, 16);
}

var xyMargin = 200;
var zoomMargin = 20;


setInterval(()=>{

  cameras.forEach((camera, i) => {
    if((camera.positions[99] != undefined) && (camera.positions[98] != undefined)){
      httpRequest(camera.IP, 80, "/cgi-bin/aw_ptz?cmd=%23APC&res=1").then(function(coor){
        httpRequest(camera.IP, 80, "/cgi-bin/aw_ptz?cmd=%23AXZ&res=1").then(function(zoom){
          if (camera.active && Math.abs(toDec(zoom.substring(3,6)) - toDec(camera.positions[camera.presets[camera.lastpreset]].zoom.substring(3,6))) <= zoomMargin && Math.abs(toDec(coor.substring(3,7)) - toDec(camera.positions[camera.presets[camera.lastpreset]].coodinates.substring(3,7))) <= xyMargin && Math.abs(toDec(coor.substring(7,11)) - toDec(camera.positions[camera.presets[camera.lastpreset]].coodinates.substring(7,11))) <= xyMargin) {
            console.log("RETURN")
            getPosition(camera.presets[1 - camera.lastpreset], i)
            camera.lastpreset = 1 - camera.lastpreset
          }
        })
      })
    }
  });
},500);