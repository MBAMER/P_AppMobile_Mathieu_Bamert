import express from "express";
import { Categorie, Ouvrage } from "../db/sequelize.mjs";

const categoriesRouter = express();

categoriesRouter.get("/", (req, res) => {
  Categorie.findAll()
    .then((categories) => {
      if (categories == null) {
        return res.status(404).json({
          message: "Aucune catégorie n'a été trouvé!",
        });
      }
      res.status(200).json({
        message: "La liste de catégorie a été trouvé",
        data: categories,
      });
    })
    .catch((_) =>
      res.status(500).json({
        message:
          "Une erreur est survenu!, veuillez réessayer dans quelques instants",
      })
    );
});

categoriesRouter.get("/:id", (req, res) => {
  Categorie.findByPk(req.params.id)
    .then((categorie) => {
      if (categorie == null) {
        return res.status(404).json({
          message: "Aucune catégorie à cette id n'a été trouvé!",
        });
      } else {
        return res
          .status(200)
          .json({ message: "La catégorie a été trouvé", data: categorie });
      }
    })
    .catch((_) =>
      res.status(500).json({
        message:
          "Une erreur est survenu!, veuillez réessayer dans quelques instants",
      })
    );
});

categoriesRouter.get("/:id/books", (req, res) => {
  Categorie.findByPk(req.params.id)
    .then((categorie) => {
      if (categorie == null) {
        return res
          .status(404)
          .json({ message: "La catégorie n'a pas pu être trouvé" });
      }
      return Ouvrage.findAll({ where: { categorie_fk: req.params.id } }).then(
        (ouvrages) => {
          if (ouvrages == null) {
            return res
              .status(404)
              .json({ message: "Aucun livre n'est associé à cette catégorie" });
          }
          res.status(200).json({
            message: `La liste des livres correspondant à ${categorie.nom} à été trouvée`,
            data: ouvrages,
          });
        }
      );
    })
    .catch((_) =>
      res.status(500).json({
        message:
          "Une erreur est survenu!, veuillez réessayer dans quelques instants",
      })
    );
});

export { categoriesRouter };
