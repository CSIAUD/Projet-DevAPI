const router = require("express").Router();
const securityController = require("../controllers/auth.js");


/**
 * @swagger
 * /api/token:
 *   get:
 * 
 *     # 🔒 SECURITY
 *     security:
 *       - basicAuth: []
 * 
 *     # 🏷️ TAGS
 *     tags:
 *       - Token
 * 
 *     # 📝 SUMMARY
 *     summary: Se connecter (FT-2)
 * 
 *     # 📨 RESPONSES
 *     responses:
 *       '200':
 *         description: 'Inscription réussie.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uuid:
 *                   type: string
 *                   example: d29183fc-d82e-41b6-8b6a-4251a1dc432d
 *                 username:
 *                   type: string
 *                   example: Nicolas
 *       '400':
 *         description: "Aucun identifiant n'a été saisi."
 *       '422':
 *         description: "Ce nom d'utilisateur n'est pas disponible."
 *       '500':
 *         description: "Erreur serveur."
 * 
*/
router.get("/", securityController.getToken);  // GET A TOKEN FOR LOGGING IN

module.exports = router