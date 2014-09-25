// Node requires
var https = require('https');
var crypto = require('crypto');

var twitterHandle = '@pkinnairdTessel';

// The status to tweet
var status = 'Hello ' + twitterHandle + '. This is your #Tessel speaking.';
// Timestamp
var curtime = parseInt(process.env.DEPLOY_TIMESTAMP || Date.now());


var oauth_consumer_key = "7NrHyEbG3y2mZ4cfGxaxQLvu5";
var oauth_consumer_secret = "QfGh4NSFVqMmxkZGWVrSf6CuS4a1Eww1f6Z7RLy49Ah5ohLyZe";
var oauth_access_token = "2820335017-USL00HpFt92d8KZe4nwoX87mFPxLgmQQCB3XRqM";
var oauth_access_secret = "uDWy9Lpnbd2kgE7NfkrpXorJ0rgezJeN5y3GluJpVggJb";

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