var request = require('request');
var chai = require('chai');
expect = chai.expect;
var server = require('../server');

var baseUrl = 'http://localhost:3000';
describe('Server', function(){
  it('should serve static files', function(done){
    request(baseUrl + '/index.html', function(err, res, body){
      if(err) return done(err);
      expect(body).to.include('<html>');
      done();
    });
  });

  it('should proxy twitter request', function(done){
    request({
      url: baseUrl + '/twitter?q=LyonJs',
      json: true
    }, function(err, res, body){
      if(err) return done(err);
      expect(body.results.length).to.be.gt(0);
      done();
    });
  });
});
