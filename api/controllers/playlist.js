
// FT-8 Playlist | /me/top/{type}

/*
  {type}
  The type of entity to return. Valid values: 'artists' or 'tracks'
  type string
  Example value: "artists"
*/
module.exports.createPlaylist = async (req, res) => {
    try {

        // 'user' peut demander la création d’une playlist sur son compte Spotify contenant les 10 musiques préférées* d’un autre Utilisateur (qui peut être lui-même) passé en paramètre.
        // * : https://developer.spotify.com/documentation/web-api/reference/#/operations/get-users-top-artists-and-tracks

        // Récupération des données de l'URL

        // Création d'une playlist avec les données récupérées
        //"items": [ {} ],
        playlist = [];
        for (let i = 0; i < 10; i++) {
            playlist += playlist[i];
            // DEBUG
            // console.log(playlist);
        }


    } catch (err) {
        console.log(err)
        return res.status(500).json(err);
    }
}