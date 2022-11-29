// const token = require('../controllers/spotify'); // Import du controller
// token.getToken

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzOGY1MGE3YS1jOTY3LTQyYTUtYjdiZS1jMTBlODU4OTliODIiLCJpYXQiOjE2NjkxMDc5MDgsImV4cCI6MTY2OTExMTUwOH0.URRf4diYEW33-3dxRcLVe9YtM48RBxqv_OxL3fzRdg8

// 📚 Librairies
const fs = require('fs');
const { writeFile, readFileSync } = require('fs');
const axios = require('axios');
const jwt = require("jsonwebtoken");

const usersController = require('../controllers/users');

var querystring = require('querystring');
var request = require('request'); // "Request" library
const file = '../api/data/users.json';

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

// Refresh du access_token de Spotify
module.exports.refreshToken = (req, res) => {
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
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
            setAcessToken(access_token);
        }
    });
}

// Lien avec le compte Spotify
// Header Authorization => Bearer + Token user
module.exports.link = async (req, res) => {
    /*  
        #swagger.summary = "Lier l'utilisateur à un compte Spotify (FT-3)"
        #swagger.description = "Lie l'utilisateur à un compte Spotify auquel il doit se connecter. Renvoie l'URL de connexion à Spotify."
        #swagger.responses[200] = { description: "Requête valide. Connectez-vous à Spotify." } 
    */
    const uid = req.user.uid;

    getToken(uid)
    
    let linked = await isLinked(uid);
    if (!linked) {
        return res.status(400).json("Ce compte a déjà été lié à Spotify.");
    } else { 
      // your application requests authorization
      const scope = 'user-read-private user-read-email user-read-playback-state';

      const url = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify(
            {
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: uid
            }
        )

        res.status(200);
        return res.send(`Suivez le lien suivant pour vous identifier à Spotify :\n\n${url} \n\n`);
    }
}

// Traitement de la connexion avec Spotify
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
    axios.post(authOptions.url, authOptions.form, {headers: authOptions.headers, state: state})
      .then(async response => { 
          if(await setTokens(response)){
            returnres.send("Votre compte a été lié à Spotify ✔️");
          }else{
            res.send("⚠️ Une erreur est survenue lors de la liaison à Spotify.");
          }
      })
   }
}

// Enregistremment des Acess_token et Refresh_token dans users.json
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
// Enregistremment des Acess_token et Refresh_token dans users.json
setAcessToken = async (uid, token) => {
  try{
    const fileContent = readFileSync(file);
    let parsedData = JSON.parse(fileContent.toString());
    let users = parsedData.users;
    let user = users.find(u => u.uid === uid);

    if(!user) return false;
    let uIndex = users.indexOf(user);

    let links = {
        access: token,
        refresh: user.link.refresh
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

// Vérification du lien avec Spotify basé sur users.json
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

// Récupération d'un access_token valide de Spotify
getToken = async (uid) => {
  let user = usersController.findOneById(uid)
  try {
    if(await isLinked(uid)){
      let access = user.link.access
      let refresh = user.link.refresh

      const authOptions = {
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access
        }
      };
        
      return axios.get(authOptions.url, {
        headers: authOptions.headers
      })
      .then((resp) => { 
        return access;
      })
      .catch((err) => {
        err = err.response.data.error;
        if(err.status == 401){
          console.log("== invalid token ==========\n");

          var refresh_token = refresh;
          var authOptions = {
              url: 'https://accounts.spotify.com/api/token',
              headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
              form: {
                  grant_type: 'refresh_token',
                  refresh_token: refresh_token
              },
              json: true
          };
        
          request.post(authOptions, function(error, response, body) {
              if (!error && response.statusCode === 200) {
                  var access_token = body.access_token;
                  setAcessToken(uid, access_token);
                  return access_token;
              }else{
                console.log(error)
                console.log(response)
              }
          });
        }
      })

    }
  } catch(err) {
    
    // console.log(err.response);
  }
}