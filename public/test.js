describe('Who Tweets LyonJS', function(){
  assert = chai.assert;

  it('should show the last tweet', function(done){
    $('button').click();
    setTimeout(function(){
      assert($('quote').text(), 'Tweet not present');
      done();
    }, 1000);
  })
});
