
var request = require('request'); // "Request" library
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;

module.exports.refreshToken = function(req, res) {
    /*  
        #swagger.deprecated = true
    */
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