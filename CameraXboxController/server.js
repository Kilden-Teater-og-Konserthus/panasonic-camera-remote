var HID = require('node-hid');
var http = require('http');
const { Console } = require('console');
var devices = HID.devices();
var device = new HID.HID(1118,767);
var maxHexVal = 65535;
console.log(devices);

var mode = "live";

var clientConfig = {
  host: '10.100.4.131',
  port: '80'
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
        resolve(str);
      });
    }
    
    var req = http.request(options, callback);
    req.end();
  })
}

function setPreset(int){
  console.log("Setting preset " + int)
  httpRequest(clientConfig.host, clientConfig.port, `/cgi-bin/aw_ptz?cmd=%23M${int.toString().padStart(2,0)}&res=1`).then(function(result){
    console.log(result);
  });
}

function recallPreset(int){
  console.log("Recalling preset " + int)
  httpRequest(clientConfig.host, clientConfig.port, `/cgi-bin/aw_ptz?cmd=%23P${int.toString().padStart(2,0)}&res=1`).then(function(result){
    console.log(result);
  });
}

function decToHex(dec){
  return (Math.round((maxHexVal / 2) + (dec * (maxHexVal / 2)))).toString(16).padStart(4,0).toUpperCase();
}

function PTZRelative(x,y){
  yval = parseInt(50 + (y*49)).toString().padStart(2, "0");
  xval = parseInt(50 + (x*49)).toString().padStart(2, "0");
  console.log(xval, yval, `/cgi-bin/aw_ptz?cmd=%23PTS${yval}${xval}&res=1`);
  httpRequest(clientConfig.host, clientConfig.port, `/cgi-bin/aw_ptz?cmd=%23PTS${yval}${xval}&res=1`);
  //httpRequest(clientConfig.host, clientConfig.port, `/cgi-bin/aw_ptz?cmd=%23T${xval}&res=1`);
  //httpRequest(clientConfig.host, clientConfig.port, `/cgi-bin/aw_ptz?cmd=%23P${yval}&res=1`);
}

function outputPosition(){
  httpRequest(clientConfig.host, clientConfig.port, `/live/camdata.html`).then(function(result){
    //console.log("x: " + (parseInt(result.match(/aPC.*?\b/g)[0].substring(3,7), 16) / maxHexVal) + "\ny: " + (parseInt(result.match(/aPC.*?\b/g)[0].substring(7,11), 16) / maxHexVal));
  })
}

var recordArray = []

function PTZRecord(x,y){
  recordArray.push({x, y});
}

var step = 0;

function PTZPlayback(){
  if(recordArray[step]){
    PTZRelative(recordArray[step].x,recordArray[step].y)
    step++;
  }
  else{
    mode = "stopped"
    step = 0;
    console.log("End of tracing");
  }
}

function startPlayback(){
  console.log("Start tracing playback");
  //recallPreset(99);
  step = 0;
}

function startRecord(){
  console.log("Start tracing record");
  //setPreset(99)
  recordArray = [];
}

function stop(){
  console.log("Stopped")
}


var buttonMapping = ["Start", "Select", "R1", "L1", "Y", "X", "B", "A"];
var DpadOrder = ["Up", "UpRight", "Right", "DownRight", "Down", "DownLeft", "Left", "UpLeft"]
var previousJoyL = {
  x: 0,
  y: 0
}
var previousJoyR = {
  x: 0,
  y: 0
}
var previousL2 = {
  val: 0,
  tier: 0
}
var previousR2 = {
  val: 0,
  tier: 0
}
var previousDpad = 0;
buttonMapping = buttonMapping.reverse();
var previousButtonBinary = 0;
device.on("data", function(data) {
  var Dpad = data[14];
  if (previousDpad != Dpad && Dpad == 0){
    console.log("DpadRelease");
  }
  else if (previousDpad != Dpad){
    console.log(DpadOrder[Dpad-1]);
    if(DpadOrder[Dpad-1] == "Left"){
      setPreset(1)
    }
    else if(DpadOrder[Dpad-1] == "Right"){
      recallPreset(1)
    }
    else if(DpadOrder[Dpad-1] == "Up"){
      setPreset(2)
    }
    else if(DpadOrder[Dpad-1] == "Down"){
      recallPreset(2)
    }
  }
  var JoyL = {
    x: data[3],
    y: data[1],
  }
  var JoyR = {
    x: data[7],
    y: data[5],
  }
  if(JoyL.x != previousJoyL.x || JoyL.y != previousJoyL.y){
    //console.log("Left Joystick: ", JoyL);
  }
  if(JoyR.x != previousJoyR.x || JoyR.y != previousJoyR.y){
    //console.log("Right Joystick: ", JoyR);
  }
  var L2 = {
    val: data[8],
    tier: data[9]
  }
  var R2 = {
    val: data[10],
    tier: data[11]
  }
  if(L2.val != previousL2.val || L2.tier != previousL2.tier){
    //console.log("L2: ", L2.val + 255 * L2.tier);
  }
  if(R2.val != previousR2.val || R2.tier != previousR2.tier){
    //console.log("R2: ",R2.val + 255 * R2.tier);
  }
  
  
  var buttonBinary = data[12];
  var changesBinary = (previousButtonBinary ^ buttonBinary);
  if(changesBinary != 0){
    for (var i = 0; i < 8; i++){
      var pow = Math.pow(2,i);
      if((changesBinary & pow) > 0){
        if((previousButtonBinary & pow) > 0){
          console.log(buttonMapping[i] + " released")
        }
        else{
          console.log(buttonMapping[i] + " pressed")
          if(buttonMapping[i] == "A"){
            setPreset(98);
            startRecord();
            mode = "recording";
          }
          else if(buttonMapping[i] == "B"){
            stop()
            mode = "stopped"
          }
          else if(buttonMapping[i] == "Y"){
            recallPreset(98);
            setTimeout(function(){
              startPlayback();
              mode = "playback"
            },10000)
          }
          else if(buttonMapping[i] == "X"){
            mode = "live"
          }
          else if(buttonMapping[i] == "L1"){
            setPreset(98)
          }
          else if(buttonMapping[i] == "R1"){
            recallPreset(98)
          }
        }
      }
    }
  }
  previousButtonBinary = buttonBinary;
  previousJoyL = JoyL;
  previousJoyR = JoyR;
  previousL2 = L2;
  previousR2 = R2;
  previousDpad = Dpad;

});

var xyDeadZone = 16;
var maxVal = 255;

setInterval(function(){
  var statusObject = {
    rJoystick: {
      x: 0,
      y: 0
    },
    lJoystick: {
      x: 0,
      y: 0
    },
  }
  if(((maxVal/2) - xyDeadZone) > previousJoyR.x || previousJoyR.x > ((maxVal/2) + xyDeadZone)){
    statusObject.rJoystick.x = Math.round((((previousJoyR.x - 128) + 0.5)/128) * 100, 3)/100
  }
  else{
    statusObject.rJoystick.x = 0;
  }
  if(((maxVal/2) - xyDeadZone) > previousJoyR.y || previousJoyR.y > ((maxVal/2) + xyDeadZone)){
    statusObject.rJoystick.y = Math.round((((previousJoyR.y - 128) + 0.5)/128) * 100, 3)/100
  }
  else{
    statusObject.rJoystick.y = 0;
  }
  if(((maxVal/2) - xyDeadZone) > previousJoyL.x || previousJoyL.x > ((maxVal/2) + xyDeadZone)){
    statusObject.lJoystick.x = Math.round((((previousJoyL.x - 128) + 0.5)/128) * 100, 3)/100
  }
  else{
    statusObject.lJoystick.x = 0;
  }
  if(((maxVal/2) - xyDeadZone) > previousJoyL.y|| previousJoyL.y > ((maxVal/2) + xyDeadZone)){
    statusObject.lJoystick.y = Math.round((((previousJoyL.y - 128) + 0.5)/128) * 100, 3)/100
  }
  else{
    statusObject.lJoystick.y = 0;
  }
  //console.log(statusObject)
  if(mode == "live"){
    PTZRelative(statusObject.rJoystick.x, statusObject.rJoystick.y);
    outputPosition();
  }
  if(mode == "recording"){
    PTZRelative(statusObject.rJoystick.x, statusObject.rJoystick.y);
    PTZRecord(statusObject.rJoystick.x, statusObject.rJoystick.y);
    outputPosition();
  }
  if(mode == "playback"){
    PTZPlayback();
    outputPosition();
  }
}, 250)