
// FT-7 Synchronisation | /audio-features
module.exports.getSynchro = async (req, res) => {
    try {

        // If 'user' = chef
        // Peut synchroniser musique qu’il écoute sur tous les appareils actifs des autres 'user' (Utilisateurs synchronisés) appartenant à son Groupe

        // Le périphérique actif de chaque 'user' synchronisé joue alors la musique à la même position (temps) que le 'user' synchronisant au moment où celui-ci a effectué la requête de synchronisation.

    } catch (err) {
        console.log(err)
        return res.status(500).json(err);
    }
}