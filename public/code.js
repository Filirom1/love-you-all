$(function(){
  $('button').click(function(){
    $.getJSON('http://localhost:3000/twitter?q=lyonjs').done(function(json){
      var jslover = json.results[0];
      $('.name').text(jslover.from_user);
      $('quote').text(jslover.text);
      $('img').attr('src', jslover.profile_image_url);
    });
    return false;
  });
});
