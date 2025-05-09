import { Sequelize, DataTypes } from "sequelize";
import { OuvrageModel } from "../models/ouvrage.mjs";
import { ouvrages } from "./mock-ouvrages.mjs";
import { users } from "./mock-users.mjs";
import { UserModel } from "../models/User.mjs";
import { categories } from "./mock-categorie.mjs";
import { CategorieModel } from "../models/Categorie.mjs";
import { EcrivainModel } from "../models/ecrivain.mjs";
import { ecrivains } from "./mock-ecrivain.mjs";
import { evaluations } from "./mock-evaluer.mjs";
import { EvaluationModel } from "../models/evaluer.mjs";

const sequelize = new Sequelize(
  "db_gestionnaireLivre", // Nom de la DB qui doit exister
  "root", // Nom de l'utilisateur
  "root", // Mot de passe de l'utilisateur
  {
    host: "localhost",
    port: 6033,
    dialect: "mysql",
    logging: false,
  }
);
// Le modèle product
const Ouvrage = OuvrageModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Categorie = CategorieModel(sequelize, DataTypes);
const Ecrivain = EcrivainModel(sequelize, DataTypes);
const Evaluer = EvaluationModel(sequelize, DataTypes);
let initDb = () => {
  return sequelize
    .sync({ force: true }) // Force la synchro => donc supprime les données également
    .then((_) => {
      importOuvrages();
      importUser();
      importCategorie();
      importEcrivain();
      importEvaluer();
      console.log(
        "La base de données db_gestionnaireLivre a bien été synchronisée"
      );
    });
};

const importOuvrages = () => {
  // import tous les produits présents dans le fichier db/mock-product
  ouvrages.map((ouvrage) => {
    Ouvrage.create({
      titre: ouvrage.titre,
      nb_pages: ouvrage.nb_pages,
      extrait: ouvrage.extrait,
      categorie_fk: ouvrage.categorie_fk,
      resume: ouvrage.resume,
      annee_edition: ouvrage.annee_edition,
      image: ouvrage.image,
      nom_editeur: ouvrage.nom_editeur,
      user_fk: ouvrage.user_fk,
      ecrivain_fk: ouvrage.ecrivain_fk,
    }).then((ouvrage) => console.log(ouvrage.toJSON()));
  });
};

const importUser = () => {
  users.map((user) => {
    User.create({
      id: user.id,
      pseudo: user.pseudo,
      mdp: user.mdp,
      admin: user.admin,
    }).then((user) => console.log(user.toJSON()));
  });
};

const importEcrivain = () => {
  ecrivains.map((ecrivain) => {
    Ecrivain.create({
      ecrivain_id: ecrivain.id,
      nom: ecrivain.nom,
      prenom: ecrivain.prenom,
    }).then((ecrivain) => console.log(ecrivain.toJSON()));
  });
};

const importCategorie = () => {
  categories.map((categorie) => {
    Categorie.create({
      categorie_id: categorie.categorie_id,
      nom: categorie.nom,
    }).then((categorie) => console.log(categorie.toJSON()));
  });
};

const importEvaluer = () => {
  evaluations.map((evaluation) => {
    Evaluer.create({
      evaluation_id: evaluation.evaluation_id,
      ouvrage_fk: evaluation.ouvrage_fk,
      user_fk: evaluation.user_fk,
      commentaire: evaluation.commentaire,
      note: evaluation.note,
    }).then((categorie) => console.log(categorie.toJSON()));
  });
};

export { sequelize, initDb, Ouvrage, User, Categorie, Ecrivain, Evaluer };
