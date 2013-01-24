[![build status](https://secure.travis-ci.org/Filirom1/love-you-all.png)](http://travis-ci.org/Filirom1/love-you-all)

# Presentation de la stack: mocha, chai, sinon, phantom, travis au LyonJS

## Intro

Bonjour je m'appelle Romain Philibert mais je suis également connu sous le pseudo de [Filirom1 sur internet](https://github.com/Filirom1).

Je travaille actuellement à [Atos](http://fr.atos.net/fr-fr/) avec les technos [node.js](http://nodejs.org/), [backbone.js](http://backbonejs.org/), [mongodb](http://www.mongodb.org/) et [elasticsearch](http://www.elasticsearch.org/).

Et le nuit, je travaille sur [OpenRuko](https://github.com/openruko) un clone OpenSource d'[Heroku](http://www.heroku.com/) qui est installable chez soi en [moins de 5 commandes](https://github.com/openruko/vagrant-openruko#install)

Voila j'ai fais ma pub, maintenant passons aux tests !

J'ai fais mes premiers tests en JS server side, en node.js, avec une librairies qui s'appelle [vows](http://vowsjs.org/), mais celle ci était tellement buggué que j'ai commencé à faire des [pull-requests](https://github.com/cloudhead/vows/issues/created_by/Filirom1?page=1&sort=updated&state=open). Mais passé 7 pull-requests j'ai abandonné vows pour passer à [mocha](http://visionmedia.github.com/mocha/).

Commençons le live coding.

## Code à tester

J'ai déjà codé une petite application que voici:

    <!DOCTYPE HTML>
    <html>
      <head>
        <script src="jquery-1.9.0.min.js"></script>
        <script src="code.js"></script>
      </head>
      <body>
        <button>click on me</button>
        <h1>Hello <span class="name"></span>!</h1>
        <quote></quote>
        <img src="" />
      </body>
    </html>

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
    })

Le principe de l'application est simple. Quand j'appuie sur le bouton, le dernier tweet mentionnant LyonJs s'afichera sur la page.
Donc vous avez compris si vous voulez apparaitre sur l'écran il faut tweeter maintenant.

A cause de problème de cross domain, j'ai codé un serveur en nodejs qui transfère mes requettes à twitter.

Malgré son apparence simpliste, cette application reflète bien ce que l'on teste côté front: des clicks, qui génèrent des requettes ajax, où l'on doit attendre quelque ms pour afin pouvoir vérifier qu'une div ou un texte est présent sur la page.

## Test en mocha

Pour faire des tests en mocha, je dois modifier mon index.html pour rajouter [mocha.js](https://raw.github.com/visionmedia/mocha/master/mocha.js), [mocha.css](https://raw.github.com/visionmedia/mocha/master/mocha.css), une div vide avec l'id mocha qui contiendra le resultat des tests, un setup pour passer quelques options à mocha, et mon test.

       <head>
         <script src="jquery-1.9.0.min.js"></script>
         <script src="code.js"></script>
    +    <script src="mocha.js"></script>
    +    <script>mocha.setup({ui: 'bdd', ignoreLeaks: true})</script>
    +    <script src="test.js"></script>
    +    <link rel="stylesheet" href="mocha.css" />
       </head>
       <body>
    +    <div id="mocha"></div>
         <button>click on me</button>
         <h1>Hello <span class="name"></span>!</h1>
         <quote></quote>

Le test lui se s'ogranise à l'aide de 2 verbes: describe et it.
Un describe permet de décrire un groupe de test.
Un it permet de décrire 1 test.

    describe('Who Tweets LyonJS', function(){

      it('should show the last tweet', function(done){
        $('button').click();
        setTimeout(function(){
          if(!$('quote').text()) throw new Error('Tweet not present')
          done();
        }, 1000);
      })
    });

Voici mon test. Il faut le lire de la manière suivante: Who Tweets LyonJS (c'est le nom de mon application) should show the last tweet. Il ne faut pas prenoncer le it, car il réference le describe du dessus.

Que fait le test: il click sur un boutton, attend 1 seconde et vérifie la présence d'un tweet sinon il throw une erreur.

Lançons le test.

## Chai assert

Un niveau de la syntaxe, si on avait eu des assert, on ourait pu écrire les choses de manière plus concises.

C'est pour cela que l'on va utiliser chai.

On le rajoute à l'index.html

         <script src="jquery-1.9.0.min.js"></script>
         <script src="code.js"></script>
         <script src="mocha.js"></script>
    +    <script src="chai.js"></script>
         <script>mocha.setup({ui: 'bdd', ignoreLeaks: true})</script>
         <script src="test.js"></script>
         <link rel="stylesheet" href="mocha.css" />

Et on refactore notre test pour utiliser des asserts

     describe('Who Tweets LyonJS', function(){
    +  assert = chai.assert;
     
       it('should show the last tweet', function(done){
         $('button').click();
         setTimeout(function(){
    -      if(!$('quote').text()) throw new Error('Tweet not present')
    +      assert($('quote').text(), 'Tweet not present');
           done();
         }, 1000);
       })

Maintenant la syntaxte et plus courte, mais le test fait exactement la même chose.

Avec [chai](http://chaijs.com/) il y a plusieurs assert possible voire même plusieurs façon d'écrire les choses.
J'ai utilisé la syntaxe la plus minimaliste mais on peut faire mieux:

    chai.should();

    foo.should.be.a('string');
    foo.should.equal('bar');
    foo.should.have.length(3);
    tea.should.have.property('flavors').with.length(3);


    var expect = chai.expect;

    expect(foo).to.be.a('string');
    expect(foo).to.equal('bar');
    expect(foo).to.have.length(3);
    expect(tea).to.have.property('flavors').with.length(3);


    var assert = chai.assert;

    assert.typeOf(foo, 'string');
    assert.equal(foo, 'bar');
    assert.lengthOf(foo, 3)
    assert.property(tea, 'favors');
    assert.lengthOf(tea.flavors, 3);

## Sinon JS

Maintenant il reste un truc bien pourri dans notre test, c'est le setTimeout. Il nous fait perdre du temps et on n'est pas certain qu'une seconde soit suffisente pour réaliser l'action.

Du coup ce que l'on va faire, c'est mocker le server twitter et par la même occasion enlever le setTimeout.

On ajoute sinon dans l'index.html

    +    <script src="sinon.js"></script>

Et on refactore notre test:

     describe('Who Tweets LyonJS', function(){
       assert = chai.assert;
     
    +  var server;
    +  before(function () { 
    +    server = sinon.fakeServer.create(); 
    +    server.respondWith(/twitter/, function(xhr){
    +      xhr.respond(200, {"content-type": "application/json"}, JSON.stringify({results:[ {from_user: "name", text: "LyonJS is so good", profile_image_url: "http://placekitten.com/100/130"} ]}))
    +    });
    +  });
    +
       it('should show the last tweet', function(done){
         $('button').click();
    -    setTimeout(function(){
    -      assert($('quote').text(), 'Tweet not present');
    -      done();
    -    }, 1000);
    +    server.respond();
    +    assert($('quote').text(), 'Tweet not present');
    +    done();
       })
     });

On découvre en même temps la notion de before de mocha.
C'est une fonction qui sera appelé une seule fois avant l'execution de la suite de tests.
Contrairement au beforeEach qui sera appelé avant l'execution de chaque test.

Notre fakeServer va mocker les requettes ajax si l'url contient twitter, et renverra toujours le même contenu:
* statusCode: 200
* content-type: application/json
* body: {results:[ {from_user: "name", text: "LyonJS is so good", profile_image_url: "http:/    /placekitten.com/100/130"} ]}

On execute notre test, celui-ci s'execute maintenant en 40ms au lieu de 1s et quelques. De plus il ne depend pas de service externe, ce qui le rend plus robuste.

## Et les tests côté serveurs

Il sont également écrit en mocha + chai :)

    $ npm install mocha
    $ npm install chai

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

Par contre le resultat est affiché dans la console, ce qui est super pratique.

    $ ./node_modules/.bin/mocha test -R spec

    Server
      ✓ should serve static files (44ms)
      ✓ should proxy twitter request (430ms)


    2 tests complete (501 ms)


## PhantomJS

Et si on voulait afficher le resultat des tests front dans la console ?

On peut le faire avec un projet qui s'appelle [mocha-phantomjs](https://github.com/metaskills/mocha-phantomjs)

Parce que notre front ne dépend plus du serveur pour faire fonctionner les tests, nous pouvons lancer la tests avec phantomj très facilement:

    $ npm install mocha-phantomjs
    $ ./node_modules/.bin/mocha-phantomjs -R spec public/index.html

Il faut néanmoins modifier l'index.html

    +    <script>
    +      if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
    +    </script>

Et maintenant on a également le resultat des tests front dans la console:

    $ ./node_modules/.bin/mocha-phantomjs -R spec public/index.html

    Who Tweets LyonJS
      â—¦ should show the last tweet: 
      âœ“ should show the last tweet (42ms)


    1 test complete (171 ms)


## Intégration continu ?

Et maintenant que l'on a tout dans la console, on aimerait avoir le resultat de nos test dans notre CI préféré : travis.

Pour cela il suffit de rajouter un fichier .travis.yml

    $ cat .travis.yml 
    language: node_js
    node_js:
      - 0.8

Parce que l'on est en node on va specifier un package.json avec scripts.test

    $ cat package.json 
    {
      "name": "prez2",
      "version": "0.0.0",
      "description": "ERROR: No README.md file found!",
      "main": "server.js",
      "scripts": {
        "test": "./node_modules/.bin/mocha test -R spec && ./node_modules/.bin/mocha-phantomjs -R spec public/index.html",
        "start": "node server.js"
      },
      "repository": "",
      "author": "",
      "license": "BSD",
      "devDependencies": {
        "mocha": "~1.8.1",
        "chai": "~1.4.2",
        "mocha-phantomjs": "~1.1.3"
      },
      "dependencies": {
        "express": "~3.0.6",
        "request": "~2.12.0"
      }
    }

On active travis sur github et on push...

Et là magique on retrouve les resultats de nos tests !!!!!

<https://travis-ci.org/Filirom1/love-you-all>
