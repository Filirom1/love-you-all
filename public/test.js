describe('Who Tweets LyonJS', function(){
  assert = chai.assert;

  var server;
  before(function () { 
    server = sinon.fakeServer.create(); 
    server.respondWith(/twitter/, function(xhr){
      xhr.respond(200, {"content-type": "application/json"}, JSON.stringify({results: [ {from_user: "name", text: "LyonJS is so good", profile_image_url: "http://placekitten.com/100/130"} ]}))
    });
  });

  it('should show the last tweet', function(done){
    $('button').click();
    server.respond();
    assert($('quote').text(), 'Tweet not present');
    done();
  })
});
