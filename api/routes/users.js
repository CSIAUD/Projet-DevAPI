const router = require("express").Router();
const usersController = require("../controllers/users.js");

/**
 * @swagger
 * /api/users:
 *   post:
 * 
 *     # 🏷️ TAGS
 *     tags:
 *       - Users
 * 
 *     # 📝 SUMMARY
 *     summary: Inscrire un nouvel utilisateur (FT-1)
 * 
 *     # ❔ PARAMETERS
 *     parameters:
 *       - name: body
 *         in: body
 *         description: User JSON object
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             password:
 *               type: string
 * 
 *     # 🍔 REQUEST BODY
 *     requestBody:
 *       description: Un objet JSON contenant les identifiants de l'utilisateur à créer.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 in: path
 *                 type: string
 *                 example: Nicolas
 *               password:
 *                 type: string
 *                 example: Abcd1234
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
router.post("/", usersController.register);  // REGISTER NEW USER


module.exports = router