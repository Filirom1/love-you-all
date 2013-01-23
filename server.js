var Path = require('path');
var express = require('express');
var request = require('request');

var app = express();
app.use(express.static(Path.join(__dirname, 'public')));

var twitterUrl = 'http://search.twitter.com/search.json?q=';
app.get('/twitter', function(req, resp, next){
  request.get(twitterUrl + req.query.q).pipe(resp)
});

app.listen(3000);
