import express from "express";
import { Ouvrage, Categorie, Ecrivain, User } from "./../db/sequelize.mjs";
import jwt from "jsonwebtoken";
import { privateKey } from "../auth/private_key.mjs";

const userRouter = express();

userRouter.get("/", (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader.split(" ")[1];
  const decodedToken = jwt.verify(token, privateKey, (error, decodedToken) => {
    if (error) {
      return res.status(401).json({ message: "Token invalide" });
    }
    if (decodedToken.admin == true) {
      User.findAll()
        .then((users) => {
          if (users.length === 0) {
            res
              .status(404)
              .json({ error: "Aucun utilisateurs n'a été trouvé" });
          } else {
            res.status(200).json({
              message: "La liste des utilisateurs a été trouvée",
              data: users,
            });
          }
        })
        .catch((_) => {
          res.status(500).json({
            message: "Erreur lors de la récupération des utilisateurs",
          });
        });
    } else {
      return res.status(403).json("Tu n'es pas autorisé a venir ici");
    }
  });
});

userRouter.get("/:id", (req, res) => {
  const userId = req.params.id;
  User.findByPk(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: `L'utilisateur dont l'id vaut ${userId} n'existe pas`,
        });
      }
      res.status(200).json({
        utilisateur: user,
      });
    })
    .catch((_) =>
      res.status(500).json({
        message: `Erreur lors de la récupération de l'utilisateur! Veuillez réessayer dans quelques instants!`,
      })
    );
});

userRouter.get("/:id/books", (req, res) => {
  const userId = req.params.id;
  User.findByPk(userId).then((user) => {
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    Ouvrage.findAll({ where: { user_fk: userId } }).then((ouvrages) => {
      if (ouvrages.length === 0) {
        res.status(404).json({ error: "Aucun ouvrages n'a été trouvé" });
      } else {
        const books = Promise.all(
          ouvrages.map(async (ouvrage) => {
            const cat = await Categorie.findByPk(ouvrage.categorie_fk);
            const ecri = await Ecrivain.findByPk(ouvrage.ecrivain_fk);
            return {
              ouvrage: ouvrage,
              categorie: cat.nom,
              écrivain: ecri.nom + " " + ecri.prenom,
            };
          })
        );
        books
          .then((result) => {
            res.status(200).json({
              message: "La liste des ouvrages a été trouvée",
              data: result,
            });
          })
          .catch((_) => {
            res.status(500).json({
              message:
                "Erreur lors de la récupération des ouvrages! Veuillez réessayer dans quelques instants!",
            });
          });
      }
    });
  });
});

export { userRouter };
