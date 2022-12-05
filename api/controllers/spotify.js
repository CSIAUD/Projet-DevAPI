// 📚 Librairies
const fs = require('fs');
const { writeFile, readFileSync } = require('fs');
const { formatWithOptions } = require('util');
const { response } = require('express');
const { Console } = require('console');
const axios = require('axios');
const jwt = require("jsonwebtoken");
const qs = require('qs');
var querystring = require('querystring');
var request = require('request'); // "Request" library

// 🕹️ Controllers
const usersController = require('../controllers/users');
const groupsController = require('../controllers/groups');

// Data file
const file = '../api/data/users.json';

// ⛰️ Environment variables :
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

// Lien avec le compte Spotify
// Header Authorization => Bearer + Token user
const link = async (req, res) => {
    /*  
        #swagger.summary = "Lier l'utilisateur à un compte Spotify (FT-3)"
        #swagger.description = "Lie l'utilisateur à un compte Spotify auquel il doit se connecter. Renvoie l'URL de connexion à Spotify."
        #swagger.responses[200] = { description: "Requête valide. Connectez-vous à Spotify." } 
    */
    const uid = req.user.uid;

    await getToken(uid)
    
    let linked = await isLinked(uid);
    if (linked) {
        return res.status(400).json("Ce compte a déjà été lié à Spotify.");
    } else { 
      // your application requests authorization
      const scopeArray = [
        'user-read-private',
        'user-read-email', 
        'user-read-playback-state', 
        'user-library-read', 
        'playlist-read-private', 
        'playlist-read-collaborative', 
        'playlist-modify-private', 
        'playlist-modify-public'
      ];

      const scope = scopeArray.join(' ');

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
const callback = async (req, res) => {
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

// Display user nickname from spotify
const getSpotifyUsername = async (userSpotifyToken) => {
    return axios.get('https://api.spotify.com/v1/me/', {
        headers : {
            Authorization : "Bearer " + userSpotifyToken,
            'accept-encoding': 'null'
        }
    })
    .then(function (response) {   
        return response.data.display_name;
    })
    .catch(async function (error) {
        console.log(error)
        return "ERROR : getSpotifyUsername";
    }) 
  }
  
// Display user's play song : Title, Artist name, Album title
const getUserPlayingSongInfo = async (userSpotifyToken) => {
return axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
    headers : {
        Authorization : "Bearer " + userSpotifyToken,
        'accept-encoding': 'null'
    }
})
.then(function (response) {
    return response.data;
})
.catch(async function (error) {
    console.log(error);
    return "ERROR : getUserPlayingSongInfo";
})
}
  
const getUserDeviceName = async (userSpotifyToken) => {
return axios.get('https://api.spotify.com/v1/me/player/devices', {
    headers : {
        Authorization : "Bearer " + userSpotifyToken,
        'accept-encoding': 'null'
    }
})
.then(function (response) {
    return response.data.devices[0];
})
.catch(async function (error) {
    console.log(error);
    return "ERROR : getUserDeviceName";
})
}

// Traitement de la connexion avec Spotify
const profile = async (req, res) => {
    /*  
        #swagger.summary = "Afficher la personnalité de l'utilisateur Spotify (FT-6)"
        #swagger.description = "Affiche la personnalité de l'utilisateur en fonction de ses titres likés sur Spotify."
        #swagger.responses[200] = { description: "Portrait généré avec succès." } 
    */

    console.log("== PROFILE =====")
    let access_token = await getToken(req.user.uid);
    if(!access_token) {
        console.log("Erreur TOKEN =====")
        return res.status(401).json("Access token invalide.");
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
        let count = 0;
        let str = "";
        
        total = resp.data.total;
        for (let item of resp.data.items) {
          str += item.track.id;
          if(((actual + count) % 100) + 1 != 0) 
            str += ",";
          actual++;
          count++;
        }
        return str;
      })
    .catch((err) => { 
        console.log("pas OK Tracks")
        console.log(err)
        return false;
    })
  
    if(ids != false) {
  
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

    return res.status(200).json(generalStats);
}

// Récupération d'un access_token valide de Spotify
const getToken = async (uid) => {
    try {
        let linked = await isLinked(uid);
        if(linked) {
          let user = usersController.findOneById(uid);
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
            console.log(err.response.status)
            if(err.response.status == 403 || err.response.status == 401) {
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
                setAcessToken(uid, token);
                return token;
              })
              .catch((err) => {
                console.log(err)
                return false;
              })
            }
          })
        } else if (!linked) { 
          return false;
        }
    } catch(err) {
        console.log(err.response);
    }
}

// Enregistremment des Acess_token et Refresh_token dans users.json
const setTokens = async (resp) => {
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
const setAcessToken = (uid, token) => {
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
  } catch(err){
      console.error("Erreur Lecture User.", err);
  }
}

// Vérification du lien avec Spotify basé sur users.json
const isLinked = async (uid) => {
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

module.exports = { 
    callback, 
    link,
    isLinked, 
    getToken, 
    getSpotifyUsername,
    getUserPlayingSongInfo,
    getUserDeviceName,
    profile
}