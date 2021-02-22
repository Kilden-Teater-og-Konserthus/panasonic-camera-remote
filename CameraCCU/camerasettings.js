const  http = require('http');
const express = require('express');
const { response } = require('express');
const app = express()
const port = 3000

var cameraValues = {
    "Power status": {
        "Command": "p",
        "values": {
            "PowerOff": "0",
            "PowerOn": "1",
        },
        "index": 1
    }
}
var cameras = ["10.100.6.230", "10.100.6.222", "10.100.6.223", "10.100.4.131"];
var values = {
    1: {Name: "Power status", Converter: function(val){
        switch(val){
            case "p0":
                return "Power Off"
            case "p1":
                return "Power On"
        }
    }},
    2: {Name: "Model"},
    4: {Name: "Format", Converter: function(val){
        val = val.split("x")[1];
        switch(val){
            case "15":
                return "1080p25"
        }
    }},
    5: {Name: "Title"},
    6: {Name: "Gain", Converter: function(val){
        val = val.split("x")[1];
        switch(val){
            case "08":
                return "0db"
        }
    }},
    7: {Name: "AWB Mode", Converter: function(val){
        val = val.split(":")[1];
        switch(val){
            case "0":
                return "ATW"
            case "2":
                return "AWB A"
            case "3":
                return "AWB B"
            case "4":
                return "3200K"
            case "5":
                return "5600K"
            case "9":
                return "VAR"
        }
    }},
    9: {Name: "Detail", Converter: function(val){
        val = val.split(":")[1];
        switch(val){
            case "0":
                return "Off"
            case "1":
                return "On"
            case "2":
                return "On"
        }
    }},
    37: {Name: "R Gain", Converter: function(val){
        return (parseInt(val.split("x")[1], 16) - 150);
    }},
    38: {Name: "B Gain", Converter: function(val){
        return (parseInt(val.split("x")[1], 16) - 150);
    }},
    39: {Name: "Pedestal", Converter: function(val){
        return (parseInt(val.split("x")[1], 16) - 150);
    }},
    40: {Name: "R Pedestal", Converter: function(val){
        return (parseInt(val.split("x")[1], 16) - 150);
    }},
    41: {Name: "B Pedestal", Converter: function(val){
        return (parseInt(val.split("x")[1], 16) - 150);
    }},
}

Object.filter = function( obj, predicate) {
    let result = {}, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
};

app.use('/', express.static(__dirname + '/public'));

app.get('/api', (req, res) => {
    cameraResponses = 0;
    responseObject = {};
    for(var h = 0; h < cameras.length; h++){
        httpRequest(cameras[h], 80, "/live/camdata.html", h).then(function(data){
            console.log(data);
            dataArray = data.str.replace( /\r\n/g, " " ).split(" ");
            responseObject["Camera" + data.index] = {}
            for(var i = 0; i < dataArray.length; i++){
                console.log(i,": ", dataArray[i]);
            }
            responseObject["Camera" + data.index]["index"] = data.index;
            responseObject["Camera" + data.index]["IPAddress"] = cameras[data.index];
            for(var i = 0; i < Object.keys(values).length; i++){
                if(values[Object.keys(values)[i]]["Converter"] != undefined){
                    responseObject["Camera" + data.index][values[Object.keys(values)[i]]["Name"]] = values[Object.keys(values)[i]]["Converter"](dataArray[Object.keys(values)[i]]);
                }
                else if(dataArray[Object.keys(values)[i]].split(":")[1] != undefined){
                    responseObject["Camera" + data.index][values[Object.keys(values)[i]]["Name"]] = dataArray[Object.keys(values)[i]].split(":")[1]
                }
                else{
                    responseObject["Camera" + data.index][values[Object.keys(values)[i]]["Name"]] = dataArray[Object.keys(values)[i]].split(":")[0]
                }
            }
            cameraResponses++;
            console.log(cameraResponses);
            console.log(cameras.length);
            if(cameraResponses == (cameras.length)){

                const ordered = {};
                Object.keys(responseObject).sort().forEach(function(key) {
                ordered[key] = responseObject[key];
                });
                console.log("RES")
                res.send(ordered);
            }
        });        
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

function httpRequest(host, port, path, index){
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
          resolve({str, index});
        });
      }
      
      var req = http.request(options, callback);
      req.end();
    })
  }