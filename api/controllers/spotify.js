
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

module.exports.link = function(req, res) {
    try {
        // Hashage du mot de passe :
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    
        // Vérification que l'utilisateur n'existe pas déjà :
        if(findOne(req.body.username)) {
            return res.status(400).json("Ce nom d'utilisateur existe déjà.");
        }
    
        // Création du nouvel utilisateur :
        const user = {
            uid: uuid(),
            username: req.body.username,
            password: hashedPassword
        };
    
        addUser(user);
    
        // ✔️ Requête valide :
        res.status(200).json({ uid: user.uid, username: user.username });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err);
    }
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    // your application requests authorization
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
}