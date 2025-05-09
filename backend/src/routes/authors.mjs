import express from "express";
import { Ecrivain, Ouvrage } from "../db/sequelize.mjs";

const authorsRouter = express();

authorsRouter.get("/", (req, res) => {
  Ecrivain.findAll()
    .then((authors) => {
      if (authors == null) {
        return res
          .status(404)
          .json({ message: "Aucun écrivain n'a été trouvé!" });
      }
      res.status(200).json({
        message: "La liste d'écrivain a bien été trouvée",
        data: authors,
      });
    })
    .catch((error) =>
      res
        .status(404)
        .json({ message: "Une erreur s'est produite!", error: error })
    );
});

authorsRouter.get("/:id", (req, res) => {
  Ecrivain.findByPk(req.params.id)
    .then((author) => {
      if (author == null) {
        return res
          .status(404)
          .json({ message: "Aucun écrivain n'a été trouvé" });
      }
      res.status(200).json({
        message: "L'écrivain a bien été trouvée",
        data: author,
      });
    })
    .catch((error) => {
      res
        .status(404)
        .json({ message: "Une erreur s'est produite!", error: error });
    });
});

authorsRouter.get("/:id/books", (req, res) => {
  Ecrivain.findByPk(req.params.id)
    .then((author) => {
      if (author == null) {
        return res
          .status(404)
          .json({ message: "Aucun écrivain n'a été trouvé" });
      }
      return Ouvrage.findAll({ where: { ecrivain_fk: req.params.id } }).then(
        (books) => {
          console.log(books);
          if (books == "") {
            return res
              .status(404)
              .json({ message: "Cette écrivain n'a écrit aucun livre" });
          }
          res.status(200).json({
            message: `La liste de livre écrite par ${author.nom} ${author.prenom} a été trouvée!`,
            data: books,
          });
        }
      );
    })
    .catch((error) => {
      res
        .status(404)
        .json({ message: "Une erreur s'est produite!", error: error });
    });
});

export { authorsRouter };
