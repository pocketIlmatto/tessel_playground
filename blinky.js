var tessel = require('tessel');

var led1 = tessel.led[0].output(1);
var led2 = tessel.led[1].output(1);

setInterval(function () {
	//console.log("Blinking! (Ctrl + C) to stop");
	led1.toggle();
	led2.toggle();
}, 100);
