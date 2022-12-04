// const token = require('../controllers/spotify'); // Import du controller
// token.getToken

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzOGY1MGE3YS1jOTY3LTQyYTUtYjdiZS1jMTBlODU4OTliODIiLCJpYXQiOjE2NjkxMDc5MDgsImV4cCI6MTY2OTExMTUwOH0.URRf4diYEW33-3dxRcLVe9YtM48RBxqv_OxL3fzRdg8

// 📚 Librairies
const fs = require('fs');
const { writeFile, readFileSync } = require('fs');
const axios = require('axios');
const jwt = require("jsonwebtoken");
const qs = require('qs');

const usersController = require('../controllers/users');
const groupsController = require('../controllers/groups');

var querystring = require('querystring');
var request = require('request'); // "Request" library
const { formatWithOptions } = require('util');
const { response } = require('express');
const { Console } = require('console');
const file = '../api/data/users.json';

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

// Refresh du access_token de Spotify
module.exports.refreshToken = (req, res) => {
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
          'accept-encoding': 'null'
        },
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

    getTokenFunction(uid)
    
    let linked = await isLinked(uid);
    if (linked) {
        return res.status(400).json("Ce compte a déjà été lié à Spotify.");
    } else { 
      // your application requests authorization
      const scope = 'user-read-private user-read-email user-read-playback-state user-library-read';

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

// Récupération d'un access_token valide de Spotify
module.exports.getToken = async (uid) => {
  getTokenFunction(uid);
}

// Traitement de la connexion avec Spotify
module.exports.callback = async (req, res) => {
  //  console.log(req.query);
   
   const code = req.query.code || null;
   console.log(code)
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
          'content-type': 'application/x-www-form-urlencoded',
          'accept-encoding': 'null'
        },
        json: true
    };
    // AXIOS :
    axios.post(authOptions.url, authOptions.form, {headers: authOptions.headers, state: state})
      .then(async response => { 
          if(await setTokens(response)){
            return res.send("Votre compte a été lié à Spotify ✔️");
          }else{
            res.send("⚠️ Une erreur est survenue lors de la liaison à Spotify.");
          }
      })
   }
}

// Traitement de la connexion avec Spotify
module.exports.profile = async (req, res) => {
  console.log("== PROFILE =====")
  let access_token = await getTokenFunction(req.user.uid);
  if(!access_token){
    console.log("Erreur TOKEN =====")
    res.send();
    return;
  }
  let idLists = [];
  let total = 0;
  let actual = 0;
  let generalStats = {
    danceability: 0,
    energy: 0,
    key: 0,
    loudness: 0,
    mode: 0,
    speechiness: 0,
    acousticness: 0,
    instrumentalness: 0,
    liveness: 0,
    valence: 0,
    tempo: 0,
    duration_ms: 0,
    time_signature: 0
  }
  
  const headers = {
    'Authorization': 'Bearer ' + access_token,
    'accept-encoding': 'null'
  };
  
  let ids = await axios.get('https://api.spotify.com/v1/me/tracks?limit=50', {
    headers: headers
  })
  .then((resp) => { 
    let str = "";
    
    total = resp.data.total;
    for (let item of resp.data.items) {
      str += item.track.id;
      actual++;
    }
    return str;
  })
  .catch((err) => { 
    console.log("pas OK Tracks")
    // console.log(err.response)
    console.log(err.response.data)
    return false;
  })

  if(ids != false){

    while(actual < total){
      let datas = await axios.get(`https://api.spotify.com/v1/me/tracks?limit=50&offset=${actual}`, {
        headers: headers
      })
      .then((resp) => { 
        let count = 0;
        let str = "";

        total = resp.data.total;
        for (let item of resp.data.items) {
          str += item.track.id;
          if(((actual + count) % 100) + 1 != 0) str += ",";
          count++;
        }
        return [str, count];
      })
      .catch((err) => { 
        console.log("pas OK Tracks 2")
        console.log(err)
        // console.log(err.response.data)
      })
      actual += datas[1];
      ids += datas[0];
      if(actual % 100 == 0){
        idLists.push(ids.substring(0, ids.length - 1));
        ids = "";
      }
    }

    console.log("total : ", total, "\nactual : ", actual)

    if(ids != "") idLists.push(ids.substring(0, ids.length - 1));
    
    for (let list of idLists) {
      let stats = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${list}`, {
        headers: headers
      })
      .then((resp) => {
        return resp.data;
      })
      .catch((err) => { 
        console.log("pas OK Tracks 3")
        console.log(err.response.data)
        return false;
      })

      if(!stats) break;

      for (const stat of stats.audio_features) {
        if(!stat) continue;
        for (const key in stat) {
          if(key == "type" || key == "id" || key == "uri" || key == "track_href" || key == "analysis_url") continue;
          
          generalStats[key] += stat[key];
        }
      }
    }
    for (const key in generalStats) {
      let val = generalStats[key];
      if(key == "duration_ms")
        val = Math.round((val / total));
      else
        val = Math.round((val / total) * 100) / 100;
      generalStats[key] = val
    }
  }
  res.send(generalStats);
}


// Display user nickname from spotify
module.exports.getSpotifyUsername = async (userSpotifyToken) => {
    return axios.get('https://api.spotify.com/v1/me/', {
      headers : {
        Authorization : "Bearer " + userSpotifyToken
      }
    })
    .then(function (response) {    
      return response.data.display_name;
    })
    .catch(async function (error) {
      return "ERROR : getSpotifyUsername";
    }) 
}

//Sync
module.exports.synchronisation = async (req, res) => {
  let uid = req.user.uid;

  let user = await groupsController.getUserWithUid(uid);

  if (user.group == undefined || user.group == "") {
    return res.send("L'utilisateur n'a pas de groupe.");
  }

  let isChiefOfGroup = await groupsController.isUserChiefGroupController(user.group, user.username);

  if( isChiefOfGroup == false ) {
    return res.send("L'utilisateur n'est pas le chef du groupe.");
  }

  if (user.link != undefined) {

    /*
    * GET OR REFRESH USER.LINK.ACCESS IN USERS.JSON DATA FILE :
    */
    await getTokenFunction(uid); //! important

    let link = user.link

    if (link.access != undefined && link.access != "") {
      console.log("Chief linked spotify")
    }

  }


  console.log(uid);

  return res.send(user);
}
  
// Display user's play song : Title, Artist name, Album title
module.exports.getUserPlayingSongInfo = async (userSpotifyToken) => {
  return axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers : {
      Authorization : "Bearer " + userSpotifyToken
      }
  }).then((responseCurrentPlaying) => {
    // If user is currently playing
    if (responseCurrentPlaying.data.device.is_active) {
      return responseCurrentPlaying;
    }
    
  })
  .catch(async function (error) {
      return "ERROR : getUserPlayingSongInfo";
  })
}
  
  
module.exports.getUserDeviceName = async (userSpotifyToken) => {
  return axios.get('https://api.spotify.com/v1/me/player/devices', {
      headers : {
      Authorization : "Bearer " + userSpotifyToken
      }
  })
  .then(function (response) {
      return response.data.devices[0];
  })
  .catch(async function (error) {
      return "ERROR : getUserDeviceName";
  })
}

getTokenFunction = async(uid) => {
  console.log("== GET TOKEN ========")
  try {
    let linked = await isLinked(uid);
    if(linked){
      let user = await usersController.findOneById(uid);
      let access = user.link.access;
      let refresh = user.link.refresh;
      
      return axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': 'Bearer ' + access,
          "Accept": "application/json",
          "Content-Type":"application/json",
          'accept-encoding': 'null'
        }
      })
      .then((resp) => { 
        return access;
      })
      .catch(async (err) => {
        err = err.response.data.error;
        if(err.status == 401){
          var refresh_token = refresh;

          const data = qs.stringify({
            'grant_type':'refresh_token',
            'refresh_token': refresh_token
          });
          return await axios.post('https://accounts.spotify.com/api/token', data, {
            headers: { 
              'Authorization': `Basic ${(new Buffer.from(client_id + ':' + client_secret).toString('base64'))}`,
              'Content-Type': 'application/x-www-form-urlencoded',
              "accept-encoding": 'null'
            }
          })
          .then((resp) => {
            let token = resp.data.access_token;
            setAcessToken(token);
            return resp.data.access_token
          })
          .catch((err) => {
            console.log(err)
            return false;
          })
        }
      })

    }else{ 
      return false;
    }
  } catch(err) {
    console.log(err.response);
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
// Enregistremment de Acess_token dans users.json
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
    if(!user) return false;
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