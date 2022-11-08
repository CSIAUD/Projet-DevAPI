// 📚 Librairies
const fs = require('fs');
const { writeFile, readFile } = require('fs');
var request = require('request'); // "Request" library

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;

module.exports.refreshToken = function(req, res) {
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

module.exports.link = async function(req, res) {
    if(await isLinked(req.body.username)){
        res.send("Compte déjà lié à Spotify")
    } else {
        res.send("Lien en cours")
    }
}

isLinked = async (username) => {
    try {
        const file = '../api/data/users.json';
        readFile(file, (err, data) => {
            if (err) {
                console.log("Erreur : ", err);
                return;
            }
            const parsedData = JSON.parse(data);
            let users = parsedData.users;

            if(!users.length) return false;

            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
            if(!user.link) return false;
            console.log("link");
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
            console.log("length");
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
            console.log("content");
            return true;
        });
    } catch(err) {
        console.log(err);
        throw 'Unable to search users list.'
    }
}

count = (tab) => {
    let count = 0;
    for (const key in tab) {
        count++;
    }
    return count;
}