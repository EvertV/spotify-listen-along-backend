const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8080;

const MongoClient = mongodb.MongoClient;
var db;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.set('view engine', 'ejs');

MongoClient.connect('mongodb://EvertV:'+process.env.DB_PASS+'@ds251902.mlab.com:51902/spotify-listen-along', { useNewUrlParser: true }, (err, client) => {
  if(err) return console.log(err);
  db = client.db('spotify-listen-along');
  app.listen(port, () => {
    console.log('Server listening on', port);
  })
});

app.get('/api/quotes', (req, res) => {
  var cursor = db.collection('quotes').find();
  db.collection('quotes').find().toArray(function(err, result) {
    if (err) return console.log(err);

    res.json(result);
  })
});

app.get('/api/allplaying', (req, res) => {
  var cursor = db.collection('usersNowPlaying').find();
  db.collection('usersNowPlaying').find().toArray(function(err, result) {
    if (err) return console.log(err);

    res.json(result);
  })
});

app.post('/delete/:id', (req, res) => {
  db.collection('quotes').deleteOne({"_id": mongodb.ObjectID(req.params.id)}, (err, result) => {
    if (err) return console.log(err);

    console.log('Deleted', req.params.id, 'from database');
    // res.redirect('/');
  })
});

app.post('/api/update/:userid', (req, res) => {
  db.collection('usersNowPlaying').updateOne(
   { "_id": req.params.userid },
   { $set: req.body},
   { upsert: true },
   (err, result) => {
    if (err) return console.log(err);

    console.log('Saved to database', req.body);
  })
});


var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '1700dc4dc09346b086f2236271889cb8'; // Your client id
var client_secret = process.env.SPOTIFY_SECRET; // Your secret
let redirect_uri = process.env.REDIRECT_URI ||  'http://localhost:'+port+'/callback'

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));

});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        // res.json(access_token, refresh_token);
        let uri = process.env.FRONTEND_URI || 'http://localhost:3000';
        res.redirect(uri+'#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});
