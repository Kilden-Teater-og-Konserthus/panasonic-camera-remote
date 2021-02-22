var lastResponse = {};

function refresh() {
    fetch("http://localhost:3000/api").then(response => response.json()).then(function(data){
        lastResponse = data;
        $("body").html("");
        var numberInputs = [
            {
                "name": "R Gain",
                "min": -150,
                "max": 150
            },
            {
                "name": "B Gain",
                "min": -150,
                "max": 150
            },
            {
                "name": "Pedestal",
                "min": -150,
                "max": 150
            },
            {
                "name": "R Pedestal",
                "min": -150,
                "max": 150,
                "step": 5
            },
            {
                "name": "B Pedestal",
                "min": -150,
                "max": 150,
                "step": 5
            },
        ]
        for (var i = 0; i < Object.keys(data).length; i++){
            var channelStrip = $("<div class='channelStrip'></div>");
            $(channelStrip).append(
            `<div class='infoRow'>
                <div class="cameraName">${data[Object.keys(data)[i]].Title}</div>
            </div>`);
            $(channelStrip).append(
            `<div class='infoRow'>
                <button onclick="powerOnCamera('${data[Object.keys(data)[i]].IPAddress}')">Power on</button>
                <button onclick="powerOffCamera('${data[Object.keys(data)[i]].IPAddress}')">Power off</button>
            </div>`);
            for(var h = 0; h < numberInputs.length; h++){
                $(channelStrip).append(
                `<div class='infoRow'>
                    <div class="inputTitle">${numberInputs[h].name}</div>
                    <input type="number" id="quantity" min="${numberInputs[h].min}" max="${numberInputs[h].max}" value="${data[Object.keys(data)[i]][numberInputs[h].name]}" onchange="setValue('${numberInputs[h].name}', this, '${data[Object.keys(data)[i]].IPAddress}')">
                </div>`);                
            }
            /* for (var h = 0; h < Object.keys(data[Object.keys(data)[i]]).length; h++){
                $(channelStrip).append(`<div class='infoRow'>${Object.keys(data[Object.keys(data)[i]])[h]}: ${data[Object.keys(data)[i]][Object.keys(data[Object.keys(data)[i]])[h]]}</div>`)
            } */
            $("body").append(channelStrip);
        }

        console.log(data);
    });
    
}

function setValue(type, obj, IP) {
    console.log(type);
    console.log(obj.value);
    switch (type){
        case "R Gain":
            sendCommand("ORI:" + (parseFloat(obj.value) + 150).toString(16).padStart(3, "0").toUpperCase(), "cam",  IP)
        case "B Gain":
            sendCommand("OBI:" + (parseFloat(obj.value) + 150).toString(16).padStart(3, "0").toUpperCase(), "cam",  IP)
        case "Pedestal":
            sendCommand("OTP:" + (parseFloat(obj.value) + 150).toString(16).padStart(3, "0").toUpperCase(), "cam",  IP)
        case "R Pedestal":
            sendCommand("ORP:" + (parseFloat(obj.value) + 150).toString(16).padStart(3, "0").toUpperCase(), "cam",  IP)
        case "B Pedestal":
            sendCommand("OBP:" + (parseFloat(obj.value) + 150).toString(16).padStart(3, "0").toUpperCase(), "cam",  IP)
    }
}

function sendCommand(command, type, IP) {
    fetch("http://" + IP + "/cgi-bin/aw_"+ type + "?cmd=" + command + "&res=1", {mode: 'no-cors'}).then(function(data){console.log(data)});
}

function powerOnCamera(IP) {
    sendCommand("%23O1", "cam", IP)
}
function powerOffCamera(IP) {
    sendCommand("%23O0", "cam", IP)
}

refresh()
//setInterval(function(){refresh()}, 1000);