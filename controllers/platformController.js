// Utilisez require pour importer le service d'authentification
const usePlarform = require("../services/platformService");

// Importez la méthode d'inscription depuis le service d'authentification
const { getData } = usePlarform();
console.log("jusqu ici ça marche");
// Contrôleur pour gérer l'inscription des utilisateurs
const getGetData = async (req, res) => {
  try {
    const tempv = await getData(req.headers["x-api-key"]);

    res.status(200).json({ message: tempv });
  } catch (error) {
    // Gérez les erreurs et renvoyez un code d'erreur
    res.status(500).json({
      message: "Erreur lors de l'get data bitpanda : ",
      error: "check you API key validity",
    });
  }
};

// Exportez le contrôleur pour l'utilisation dans d'autres fichiers
module.exports = {
  getGetData,
};
