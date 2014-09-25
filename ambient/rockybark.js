var tessel = require('tessel');
var ambientlib = require('ambient-attx4');

var ambient = ambientlib.use(tessel.port['B']);

ambient.on('ready', function () {
	var lastStatus = "";
	var currentStatus = "";
	var countTweets = 0;
	setInterval( function () {		
			ambient.getSoundLevel( function(err, sdata) {
				if (err) throw err;
				console.log ("Sound level:",sdata.toFixed(8));
			
		})}, 500);	

	ambient.setSoundTrigger(0.1);

	ambient.on('sound-trigger', function(data) {
		currentStatus = buildStatus(data, lastStatus);
		tweet(currentStatus+" #loudBarks "+data.toFixed(3));
		countTweets ++;
		console.log(currentStatus);
		lastStatus = currentStatus;
		ambient.clearSoundTrigger();
		if (countTweets >= 10) {
			exit();
		}

		setTimeout(function () {
			ambient.setSoundTrigger(0.1);

		}, 1000);

	});
});

ambient.on('error', function (err) {
	console.log(err);
});

//TODO rate limit (>15 seconds between tweets)

function buildStatus (intensity, lastStatus) {
	
	if (lastStatus === "" || 
			lastStatus === "Time for a dog nap.." ) {
		status = "Rocky wakes up from his nap...";
		return status;
	}
	
	if (intensity > 0.15 && intensity < 0.25){
	 	status = "He lets out a couple warning 'Boofs'... something could be amiss";
	}
	else if (intensity >= 0.25){
	 	status = "All hell is breaking loose.  Hurry up human, someone is doing something unauthorized by dog.";
	}
	else {
		status = "Nothing to see here...";
	}

	if (lastStatus === "Nothing to see here..."){
		status = "Time for a dog nap..";
	}
	return status;
}


function tweet (status) {

	// Node requires
	var https = require('https');
	var crypto = require('crypto');

	var twitterHandle = '@RockyBuddyBoy';

	// The status to tweet
	var status = status;

	
	// Timestamp
	var curtime = parseInt(process.env.DEPLOY_TIMESTAMP || Date.now());


	var oauth_consumer_key = "nU2J72kmywnzTUaIQKh6UqcsA";
	var oauth_consumer_secret = "3RdbF1lsPpBxvgvFzpRiHtRVVnX5uMmfDoajZAtc6eIXqA0nit";
	var oauth_access_token = "2830596043-KrwuywklV7AkDgotUwai8qR4PyvzWcfk2hNcRcN";
	var oauth_access_secret = "uAaqafbYckV6otIw1B9byQ55NsSzgNkmfv0qGnbJ5nXWF";

	var oauth_data = {
	  oauth_consumer_key: oauth_consumer_key,
	  oauth_nonce: crypto.pseudoRandomBytes(32).toString('hex'),
	  oauth_signature_method: 'HMAC-SHA1',
	  oauth_timestamp: Math.floor(curtime / 1000),
	  oauth_token: oauth_access_token,
	  oauth_version: '1.0'
	};
	oauth_data.status = status;
	var out = [].concat(
	  ['POST', 'https://api.twitter.com/1.1/statuses/update.json'],
	  (Object.keys(oauth_data).sort().map(function (k) {
	    return encodeURIComponent(k) + '=' + encodeURIComponent(oauth_data[k]);
	  }).join('&'))
	).map(encodeURIComponent).join('&');
	delete oauth_data.status;
	oauth_data.oauth_signature = crypto
	  .createHmac('sha1', [oauth_consumer_secret, oauth_access_secret].join('&'))
	  .update(out)
	  .digest('base64');
	var auth_header = 'OAuth ' + Object.keys(oauth_data).sort().map(function (key) {
	  return key + '="' + encodeURIComponent(oauth_data[key]) + '"';
	}).join(', ');

	// Set up a request
	var req = https.request({
	  port: 443,
	  method: 'POST',
	  hostname: 'api.twitter.com',
	  path: '/1.1/statuses/update.json',
	  headers: {
	    Host: 'api.twitter.com',
	    'Accept': '*/*',
	    "User-Agent": "tessel",
	    'Authorization': auth_header,
	    'Content-Type': 'application/x-www-form-urlencoded',
	    'Connection': 'keep-alive'
	  }
	}, function (res) {
	  console.log("statusCode: ", res.statusCode);
	  console.log("headers: ", res.headers);
	  res.on('data', function(d) {
	    console.log(' ');
	    console.log(' ');
	    console.log(String(d));
	  });
	});

	// POST to Twitter
	req.write('status=' + encodeURIComponent(status));
	req.end();

	// Log any errors
	req.on('error', function(e) {
	  console.error(e);
	});
}