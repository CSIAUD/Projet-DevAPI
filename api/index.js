const express = require('express');
require('dotenv').config();

let app = express();
var port = process.env.PORT;
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

app.get('/', function(req, res) {
  res.send();
});

app.listen(port, () =>  {
    console.log('le serveur fonctionne sur le port ' + port)
})