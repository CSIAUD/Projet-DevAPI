// 📚 Librairies
const express = require('express');
require('dotenv').config();

// 🚗 Routes
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");

let app = express();
var port = process.env.PORT;
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

app.use(express.json()); // Body parser for POST requests

app.use("/api/token", authRoute);
app.use("/api/users", usersRoute);

app.listen(port, () =>  {
    console.log('le serveur fonctionne sur le port ' + port)
})