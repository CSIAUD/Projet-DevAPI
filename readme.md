# <strong>YSpotify API</strong>
# Service d’extensions de l’API Spotify

## <strong>L'équipe</strong> :

- LEPINAY Nicolas (FT-1, FT-2 & Swagger UI Doc)
- SIAUD Cyprien (FT-3 & FT-6)
- KIM Injin (FT-4, FT-5 & FT-7)
- PALMIERI Matéo (FT-8)
<br><br>

## <strong>Prérequis</strong>
1. Posséder un compte Spotify ;
2. Avoir créé un client Spotify sur votre espace développeur (Dashboard) (https://developer.spotify.com/dashboard/applications)
<br><br>

## <strong>Mise en route</strong>
<strong>1.</strong> Se placer dans le dossier /api et lancer la commande <strong>npm start</strong> pour lancer le service.<br>
<strong>2.</strong> Ouvrir un navigateur à l'adresse <strong>localhost:8080/api-docs</strong> pour accéder au SwaggerUI.<br>
<strong>3.</strong> Se créer un compte en testant l'endpoint <strong>POST /api/users</strong>. Cliquer sur le bouton <strong>Try It Out</strong> pour rentrer un username et un mot de passe.<br>
<strong>4.</strong> Une fois le compte créé, cliquer sur le bouton vert "Authorize" et rentrer ses identifiants (Basic Auth).<br>
<strong>5.</strong> Se connecter en testant l'endpoint <strong>GET /api/token</strong>. Copier le JWT Token retourné. Cliquer sur le bouton "Authorize" et copier le token dans le champ Bearer Token. Vous êtes authentifié et pouvez tester les autres endpoints de l'API : rejoindre un groupe, afficher la liste des groupes, lier son compte Spotify, créer une playlist.<br>

## <strong>Documentation</strong>
<strong>L’ensemble</strong> de l'API est documenté grâce à la spécification OpenAPI (dernière release). Un 
SwaggerUI est accessible à http://localhost:8080/api-docs.<br>

![Capture](https://user-images.githubusercontent.com/87578863/205856703-e5b22af6-a770-47d5-a0dd-a047f4f4652a.PNG)
<br><br>

Toutes les fonctionnalités de l’API peuvent être testées directement via le SwaggerUI généré.<br>

## <strong>Lexique</strong>
<strong>Service</strong> : Application exposant les fonctionnalités.<br>
<strong>Utilisateur</strong> : Utilisateur <strong>inscrit</strong> et <strong>authentifié</strong> sur le Service.<br>
<strong>Utilisateur anonyme</strong> : Utilisateur <strong>non-authentifié</strong> sur le Service.<br>
<strong>Groupe</strong> : Ensemble d’Utilisateurs.<br>
<strong>Chef</strong> : Utilisateur ayant des droits privilégiés sur son Groupe.<br><br>

## <strong>Fonctionnalités obligatoires</strong>
Cette section décrit l’ensemble des fonctionnalités <strong>obligatoires</strong> que le Service doit exposer.<br><br>

### <strong>FT-1 Inscription</strong>
L’Utilisateur anonyme peut s’inscrire sur le Service. Il doit alors fournir les informations suivantes :<br>
<ul>
    <li>Un nom d’utilisateur (pseudo) ;</li>
    <li>Un mot de passe.</li>
</ul>
Le nom d’utilisateur de chaque Utilisateur sert d’<strong>identifiant</strong> et doit donc être <strong>uniques</strong> au sein du Service.<br>
Autrement dit, deux Utilisateurs ne peuvent pas avoir le même pseudo.<br>
Quant au mot de passe, aucune contrainte n’est imposée.
<br><br>

### <strong>FT-2 Connexion</strong>
L’Utilisateur anonyme peut se connecter au Service en fournissant sont pseudo et mot de passe. Il 
obtient alors un token d’accès au Service, l’authentifiant pour toutes ses futures requêtes. Le token 
a une durée de validité d’<strong>une heure</strong>.
<br><br>

### <strong>FT-3 Liaison du compte Spotify</strong>
L’Utilisateur peut déléguer l’autorisation au Service d’utiliser les services (API) de Spotify en son 
nom.
Plus de détails sont donnés plus bas dans la section <a href="#Authentification">Authentification</a>.
<br><br>

### <strong>FT-4 Rejoindre un Groupe</strong>
L’Utilisateur peut rejoindre un Groupe. Les Groupes sont identifiés simplement par leur nom (chaîne de caractères).<br>

Si l’Utilisateur tente de rejoindre un Groupe qui n’existe pas, alors le Groupe est automatiquement créé et l’Utilisateur en devient le Chef.<br>

Si l’Utilisateur appartient déjà à un Groupe, alors il le quitte <strong>automatiquement</strong> avant de rejoindre le nouveau.
Si L’Utilisateur quittant le Groupe est le Chef, un nouveau Chef est aléatoirement assigné parmi les membres restants.
S’il ne reste plus personne dans le Groupe, le Groupe n'existe plus.<br>
N.B. : Par défaut (à l’inscription), un Utilisateur n’appartient à aucun Groupe.
<br><br>

### <strong>FT-5 Consultation des Groupes et Utilisateurs</strong>
<strong>Liste des Groupes :</strong>
L’Utilisateur peut consulter la liste de tous les Groupes existant sur le Service. Les informations 
retournées associées à chaque Groupe sont les suivantes :<br>
<ul>
    <li>Nom du groupe ;</li>
    <li>Nombre d’Utilisateurs dans le groupe.</li>
</ul>

<strong>Liste des membres du Groupe :</strong>
L’Utilisateurs peut également consulter la liste de tous les Utilisateurs appartenant à <strong>son</strong> Groupe. 
Les informations retournées associées à chaque Utilisateur sont les suivantes :<br>
<ul>
    <li>Nom d’utilisateur (pseudo) ;</li>
    <li>S’il est le Chef du Groupe ;</li>
    <li>Pseudo du compte Spotify associé (si liaison) ;</li>
    <li>Morceau en cours d’écoute (si liaison) ;</li>
    <li>Titre du morceau, nom de l’artiste, titre de l’album ;</li>
    <li>Nom de l’appareil d’écoute actif (si liaison).</li>
</ul>
Un Utilisateur n’appartenant à aucun Groupe n’est pas autorisé à effectuer cette requête.<br><br>

### <strong>FT-6 Personnalité de l’Utilisateur</strong>
Le Service doit être capable de déduire la personnalité de l’Utilisateur effectuant la requête en 
fonction de ses “Titres Likés”. Plus précisément, tous les “Titres Likés” sont analysés(1) pour générer 
un portrait de l’Utilisateur, contenant les informations suivantes (liste exhaustive) :<br>
<ul>
    <li>Attrait pour la dance (entier de 0 à 10) ;</li>
    <li>Agitation (tempo moyen écouté) ;</li>
    <li>Préférence entre les musiques vocales ou instrumentales ;</li>
    <li>Attitude plutôt positive ou négative (voir l’attribut “valence”).</li>
</ul>
Si l’Utilisateur ne dispose d’aucun titre dans ces “Titres Likés”, la ressource (personnalité de 
l’utilisateur) n’existe pas.<br><br>

### <strong>FT-7 Synchronisation</strong>
Le <strong>Chef</strong> peut synchroniser la musique qu’il est en train d’écouter sur tous les appareils actifs des 
autres Utilisateurs (Utilisateurs synchronisés) <strong>appartenant à son Groupe</strong>. Le périphérique actif de 
chaque Utilisateur synchronisé joue alors la musique exactement à la même position (temps) que 
l’Utilisateur synchronisant au moment où celui-ci a effectué la requête de synchronisation.<br><br>

### <strong>FT-8 Playlist</strong>
L’Utilisateur peut demander la création d’une playlist sur son compte Spotify contenant les 10
musiques préférées(2) d’un autre Utilisateur (qui peut être lui-même) passé en paramètre.
L’Utilisateur passé en paramètre doit appartenir au même Groupe que l’Utilisateur ayant effectué la 
requête.<br><br>

## <strong>Ressources</strong>
https://developer.spotify.com/dashboard/applications<br>
(1) : https://developer.spotify.com/documentation/web-api/reference/#/operations/get-several-audio-features<br>
(2) : https://developer.spotify.com/documentation/web-api/reference/#/operations/get-users-top-artists-and-tracks<br>
(3) : https://developer.spotify.com/documentation/general/guides/authorization/<br>
https://developer.spotify.com/documentation/general/guides/authorization/implicit-grant/<br><br>

## <strong>Spécifications optionnelles</strong>

### <strong>FT-9 Tests et qualité</strong>
Chaque fonctionnalités (FT-1 à FT-8) pouvant être testées doivent l’être par une batterie de tests 
unitaires et d’intégration.<br><br>

### <strong>FT-10 Conteneurisation</strong>
Le Service doit pouvoir être déployé dans un conteneur Docker.<br><br>

### <strong>FT-11 Reverse proxy</strong>
Une configuration doit être fournie permettant de faire tourner le Service derrière un reverse proxy.
Authentification
Les fonctionnalités offertes par notre service (application) utilisent des ressources possédées par 
l’Utilisateur (ressource owner). Afin que notre service puisse à accéder à ces ressources protégées, 
l’Utilisateur doit s’authentifier auprès de Spotify et déléguer l’autorisation au service pour 
effectivement l’autoriser à y accéder.
Heureusement, l’API de Spotify supporte OAuth 2.0 pour la délégation des autorisations(3).
N.B. : L’Utilisateur doit forcément, à un moment ou un autre, accéder à une URL dans son navigateur 
et effectuer une action manuelle afin d’autoriser notre service/client à accéder à ses ressources.<br><br>

## <strong>Authentification</strong>
Les fonctionnalités offertes par notre service (application) utilisent des ressources possédées par 
l’Utilisateur (ressource owner). Afin que notre service puisse à accéder à ces ressources protégées, 
l’Utilisateur doit s’authentifier auprès de Spotify et <strong>déléguer l’autorisation</strong> au service pour 
effectivement l’autoriser à y accéder. 
Heureusement, l’API de Spotify supporte OAuth 2.0 pour la délégation des autorisations(3). 
N.B. : L’Utilisateur doit forcément, à un moment ou un autre, accéder à une URL dans son navigateur 
et effectuer une action manuelle afin d’autoriser notre service/client à accéder à ses ressources.

## <strong>Autorisation</strong>
Les FT-1 et FT-2 sont les seules fonctionnalités accessibles par un Utilisateur anonyme.
Les FT-6, FT-7, FT-8 nécessitent que l’Utilisateur ait lié son compte Spotify, sans quoi l’accès lui est 
refusé.<br><br>

Un fichier <strong>README</strong> doit être présent à la racine de votre projet, décrivant toutes les procédures 
importantes pour faire fonctionner votre API (installation, lancement, …) ainsi que la <strong>composition de votre équipe</strong>.<br><br>

## <strong>Contraintes et détails techniques</strong>
Aucun framework, bibliothèque n’est imposé.

### <strong>Authentification</strong>
Le Service n’implémente pas OAuth 2.0 ! Aucun mécanisme propre à OAuth 2.0 (Refresh Token, ...) ne doit être mis en place.<br>
En revanche, vous avez le choix d’utiliser ou non les JWT pour les tokens émis.

### <strong>Persistance des données</strong>
La totalité des données nécessaires doit être stockée dans un seul fichier nommé “users.json”.<br>
Les mots de passes doivent être stockés hachés (SHA256).<br><br>

## <strong>Modalités d’évaluation</strong>
<br>
<table>
    <thead>
        <tr>
            <th colspan="3"></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Zone</td>
            <td>Détail</td>
          	<td>Coefficient</td>
        </tr>
        <tr>
            <td>Fonctionnel</td>
            <td>Respect des spécifications fonctionnelles</td>
          	<td>3</td>
        </tr>
        <tr>
            <td>Technique</td>
            <td>Respect des bonnes pratiques et des spécifications liées aux protocoles, standards et technologies utilisées pour ce projet</td>
          	<td>3</td>
        </tr>
        <tr>
            <td>Projet</td>
            <td>Bon déroulement du projet. Gestion des priorités, ressources, temps, ... </td>
          	<td></td>
        </tr>
        <tr>
            <td>Documentation</td>
            <td>Documentation claire, complète et fonctionnelle (SwaggerUI)</td>
          	<td>1</td>
        </tr>
    </tbody>
</table>
<br>

La note finale est commune à l’ensemble de l’équipe.

Les spécifications optionnelles, si bien implémentées, sont un <strong>bonus</strong> à la note. Autrement dit, il est possible d’avoir 20 même sans introduire ces fonctionnalités.

La note finale est plafonnée à 20/20.<br><br>

## <strong>Ressources utiles</strong>

<table>
    <thead>
        <tr>
            <th colspan="2"></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Description des endpoints</td>
            <td><a href="https://developer.spotify.com/documentation/web-api/reference/#/">https://developer.spotify.com/documentation/web-api/reference/#/</a></td>
        </tr>
        <tr>
            <td>Liste complète des scopes exposés par l’API Spotify</td>
            <td><a href="https://developer.spotify.com/documentation/general/guides/authorization/scopes/">https://developer.spotify.com/documentation/general/guides/authorization/scopes/</a></td>
        </tr>
        <tr>
            <td>Guide sur l’Authorization Code Flow de Spotify</td>
            <td><a href="https://developer.spotify.com/documentation/general/guides/authorization/code-flow/">https://developer.spotify.com/documentation/general/guides/authorization/code-flow/</a></td>
        </tr>
    </tbody>
</table>
<br>

# <strong>Installation</strong>

- Copie du repo : 'git clone https://github.com/CSIAUD/Projet-DevAPI.git'
- Changement de branche : 'git checkout <\nombranche>'
- Installation des Dépendances du Projet-DevAPI : 'npm install'
