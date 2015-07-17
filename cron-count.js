var moment  = require('moment');
var request = require('request');

request('http://localhost:3000/stat/count', function(err, res, body) {
  if (err) {
    console.error(moment().toISOString(), err);
  } else {
    console.log(moment().toISOString(), body);
  }
});
