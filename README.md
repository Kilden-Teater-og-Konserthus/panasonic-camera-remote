# PanasonicCameraRemote
Warning: None of these applications are production ready, but more of a proof of concept.

To run an application you will need the [Node.js Runtime](https://nodejs.org/en/) and install its dependencies using:

    npm install

for each individual application, and then running:

    node [applicationname.js]

In the corresponding folder

Contents:
 - CameraCCU
	 - cameraTCP.js: Subscribe to TCP data from cameras, recieve Zoom, Focus and Iris values as table in the log.
	 - camerasettings.js: Unfinished application to standardize controls between HE130 and UE150 cameras.
	 - clearall.js: delete all presets for all cameras listed.
 - CameraComputerMiddleman
	 - index.js: Proof of concept to have a computer be the connection point between the control panel (Panasonic AW-RP150) and the camera. This enables quicker camera selection for multiple panels when re-organizing.
 - CameraLoop
	 - multicameraloop.js: Application to have cameras automatically go from one preset to another, using the cameras preset speed.
 - CameraXboxController
	 - server.js: Application to control Panasonic PTZ Cameras using a HID Device such as a Microsoft Xbox Controller

Cameras that have been tested:
 - Panasonic AW-HE130
 - Panasonic AW-UE150
