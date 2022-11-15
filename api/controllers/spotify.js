// 📚 Librairies
const fs = require('fs');
const { readFile } = require('fs/promises');
const asyncReadFile = readFile;
// const { writeFile, readFile } = require('fs');
const { writeFile } = require('fs');

var querystring = require('querystring');
var request = require('request'); // "Request" library
const file = '../api/data/users.json';

var stateKey = 'spotify_auth_state';

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

module.exports.refreshToken = (req, res) => {
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
}

module.exports.link = async (req, res) => {
    console.log("===== LINK =====")
    if (await isLinked(req.body.username)) {
        res.send("Compte déjà lié à Spotify");
    } else {
        console.log(req.params) 
        var state = generateRandomString(16);
        res.cookie(stateKey, state);
      
        // your application requests authorization
        var scope = 'user-read-private user-read-email';
        res.redirect(
            'https://accounts.spotify.com/authorize?' +
            querystring.stringify(
                {
                    response_type: 'code',
                    client_id: client_id,
                    scope: scope,
                    redirect_uri: redirect_uri,
                    state: state
                }
            )
        );
    }
}

module.exports.callback = async (req, res) => {
    console.log(req.cookie('user'))
    

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
        res.redirect('/#' +
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
}

async function isLinked(username) {
    try {
        return await asyncReadFile(file, 'utf-8')
        .then((data) => {
            const parsedData = JSON.parse(data);
            let users = parsedData.users;
            if(!users.length) return false;
            // ==============================
            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
            if(!user.link) return false;
            // ==============================
            if(user.link.length != 2){
                let index = users.indexOf(user);
                delete parsedData.users[index].link

                writeFile(file, JSON.stringify(parsedData, null, 2), (err) => {
                    if (err) {
                        console.log("Une erreur est survenue lors de la mise à jour du fichier users.json.");
                        return;
                    }
                    console.log("Le lien a été supprimé");
                });
    
                return false;
            } 
            // ==============================
            if(user.link[0] == "" || user.link[1] == ""){
                let index = users.indexOf(user);
                delete parsedData.users[index].link

                writeFile(file, JSON.stringify(parsedData, null, 2), (err) => {
                    if (err) {
                        console.log("Une erreur est survenue lors de la mise à jour du fichier users.json.");
                        return;
                    }
                    console.log("Le lien a été supprimé");
                });

                return false;
            }
            // ==============================
            return true;
        })
    } catch(err) {
        console.log(err);
        throw 'Unable to search users list.'
    }
}