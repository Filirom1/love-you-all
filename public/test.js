describe('Who Tweets LyonJS', function(){

  it('should show the last tweet', function(done){
    $('button').click();
    setTimeout(function(){
      if(!$('quote').text()) throw new Error('Tweet not present')
      done();
    }, 1000);
  })
});
