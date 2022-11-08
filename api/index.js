// 📚 Librairies
const express = require('express');
require('dotenv').config();
var request = require('request'); // "Request" library

// 🚗 Routes
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");

let app = express();

app.use(express.json()); // Body parser for POST requests

var port = process.env.PORT;
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

app.get('/api/refresh_token', function(req, res) {
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
  

app.use("/api/token", authRoute);
app.use("/api/users", usersRoute);

app.listen(port, () =>  {
    console.log('le serveur fonctionne sur le port ' + port)
})