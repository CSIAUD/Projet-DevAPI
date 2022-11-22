
// const token = require('../controllers/spotify'); // Import du controller
// token.getToken

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzOGY1MGE3YS1jOTY3LTQyYTUtYjdiZS1jMTBlODU4OTliODIiLCJpYXQiOjE2NjkxMDc5MDgsImV4cCI6MTY2OTExMTUwOH0.URRf4diYEW33-3dxRcLVe9YtM48RBxqv_OxL3fzRdg8

// 📚 Librairies
const fs = require('fs');
const { writeFile, readFileSync, readFile } = require('fs');
const axios = require('axios');
const jwt = require("jsonwebtoken");


var querystring = require('querystring');
var request = require('request'); // "Request" library
const file = '../api/data/users.json';

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
    let user;
    let tab = (req.headers.authorization).split(' ');
    if(tab[0] == "Bearer") {
      user = jwt.verify(tab[1], process.env.JWT_SECRET, (err, payload) => {
          if(err)
              return res.status(403).json("Le token d'accès est invalide.\nLe format suivant doit être respecté : Bearer <access-token>.");
          return payload.uid;
      })
    }else{
      user = false;
    }

    if(!user) {
      res.send("Invalid Header Authorization");
      return;
    }
    
    // getToken(user)
    let linked = await isLinked(user);
    if (linked) {
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
            state: user
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
  let uid = resp.config.state;
  try{
    const fileContent = readFileSync(file);
    let parsedData = JSON.parse(fileContent.toString());
    let users = parsedData.users;
    let user = users.find(u => u.uid === uid);

    if(!user) return false;
    let uIndex = users.indexOf(user);

    let links = {
        access: data.access_token,
        refresh: data.refresh_token
    }
    parsedData.users[uIndex].link = links;

    try{
      let toWrite = JSON.stringify(parsedData, null, 2)
      writeFile(file, toWrite, err => {
        if (err) {
          console.error(err);
        }
      });
      return true;
    } catch(err){
      console.error("Une erreur est survenue lors de la mise à jour du fichier users.json.");
      return false;
    }
  }catch(err){
      console.error("Erreur Lecture User.", err);
  }
}

isLinked = async (uid) => {
  try {
    const fileContent = readFileSync(file);
    const users = JSON.parse(fileContent.toString()).users;

    if(!users.length) return false;
    // ==============================
    const user = users.find(u => u.uid === uid);
    if(!user.link) return false;
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
  } catch(err) {
      console.log('error');
      console.log(err);
  } 
}

getToken = async (username) => {
  console.log("== getToken =====")
  // https://api.spotify.com/v1/me
  try {
    console.log("TRY")
    if(await isLinked(username)){
      console.log("Linked")
    }
  } catch(err) {
    console.log("CATCH", err);
    throw 'Unable to search users list.'
  }
}