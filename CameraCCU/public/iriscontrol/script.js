var cameras = [
    "10.100.4.131",
    "10.100.3.108",
    "10.100.6.230",
    "10.100.6.222",
    "10.100.6.223",
    "10.100.6.224"
]



cameras.forEach(camera => {
    console.log("http://" + camera + "/cgi-bin/aw_ptz?cmd=%23AXI&res=1")
    fetch("http://" + camera + "/cgi-bin/aw_ptz?cmd=%23AXI&res=1", {mode: 'no-cors', credentials: "include"}).then(function(data){console.log(data)})
});