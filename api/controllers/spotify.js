// 📚 Librairies
const fs = require('fs');
// const { readFile } = require('fs/promises');
// const asyncReadFile = readFile;

const { writeFile, readFile } = require('fs');
// const { writeFile } = require('fs');
const axios = require('axios');


var querystring = require('querystring');
var request = require('request'); // "Request" library
const file = '../api/data/users.json';

var stateKey = 'spotify_auth_state';

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

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
    // if (false) {
    if (await isLinked(req.query.user)) {
        res.send("Compte déjà lié à Spotify");
    } else { 
      
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
                    state: req.query.user
                }
            )
        );
    }
}

module.exports.callback = async (req, res) => {
  //  console.log(req.query);
   
   const code = req.query.code || null;
   const client_secret = process.env.CLIENT_SECRET
   const state = req.query.state || null;
   console.log(state)
 
   if (state === null) {
     res.redirect('/#' +
       querystring.stringify({
         error: 'state_mismatch'
       }));
   } else {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
          'content-type': 'application/x-www-form-urlencoded'
        },
        json: true
      };
      // AXIOS :
      axios.post(authOptions.url, authOptions.form, {
          headers: authOptions.headers,
          state: state
      }).then(async response => { 
         if(await setTokens(response)){
           res.send("Compte lié");
         }else{
           res.send("Erreur");
         }
      })
   }

}

setTokens = async (resp) => {
  let data = resp.data;
  const username = resp.config.state;
  return readFile(file, (err, fileData) => {
    if (err) {
      console.log("Erreur Lecture User.", err);
      return;
    }
    const parsedData = JSON.parse(fileData);
    const users = parsedData.users;
    let user = users.find(u => (u.username).toLowerCase() === (username).toLowerCase());
    if(!user) return false;
    const uIndex = parsedData.users.indexOf(user);

    const links = {
        access: data.access_token,
        refresh: data.refresh_token
    }
    parsedData.users[uIndex].link = links;
    console.log(parsedData.users[uIndex])
    return writeFile(file, JSON.stringify(parsedData, null, 2), (err) => {
      if (err) {
        console.log("Une erreur est survenue lors de la mise à jour du fichier users.json.");
        return false;
      }
      return true;
    });
  });
}

isLinked = async (username) => {
  try {
    return await readFile(file, (err, fileData) => {
        const parsedData = JSON.parse(fileData);
        let users = parsedData.users;

        if(!users.length) return false;
        // ==============================
        const user = users.find(u => (u.username).toLowerCase() === (username).toLowerCase());
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
        if(user.link.access == "" || user.link.refresh == ""){
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