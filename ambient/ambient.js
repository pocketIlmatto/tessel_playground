var tessel = require('tessel');
var ambientlib = require('ambient-attx4');

var ambient = ambientlib.use(tessel.port['A']);

ambient.on('ready', function () {
	setInterval( function () {
		ambient.getLightLevel( function(err, ldata) {
			if (err) throw err;
			ambient.getSoundLevel( function(err, sdata) {
				if (err) throw err;
				console.log ("Light level: ", ldata.toFixed(8), " Sound level:",
					sdata.toFixed(8));
			});
		})}, 500);

	ambient.setLightTrigger(0.5);

	ambient.on('light-trigger', function(data) {
		console.log("light trigger bam: ", data);
		ambient.clearLightTrigger();
		setTimeout(function () {
			ambient.setLightTrigger(0.5);
		}, 1500);
	});

	ambient.setSoundTrigger(0.1);

	ambient.on('sound-trigger', function(data) {
		console.log("sound trigger bam: ", data);
		ambient.clearSoundTrigger();
		setTimeout(function () {
			ambient.setSoundTrigger(0.1);

		}, 1500);

	});
});

ambient.on('error', function (err) {
	console.log(err);
});