import express from "express";
import { Ecrivain, Ouvrage, Categorie, Evaluer } from "./../db/sequelize.mjs";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import { privateKey } from "../auth/private_key.mjs";

const booksRouter = express();

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Récupérer tous les ouvrages
 *     description: Retourne la liste des ouvrages avec des filtres optionnels (titre, nom_editeur).
 *     responses:
 *       200:
 *         description: Liste des ouvrages.
 */

booksRouter.get("/", (req, res) => {
  let whereClause = {};

  if (req.query.titre) {
    if (req.query.titre.length > 2) {
      whereClause.titre = { [Op.like]: `%${req.query.titre}%` };
    } else {
      return res
        .status(400)
        .json(
          "Vous devez entrer au moins deux caractères pour filtrer sur le nom"
        );
    }
  }
  if (req.query.categorie) {
    whereClause.categorie_fk = { [Op.like]: `%${req.query.categorie}%` };
  }
  if (req.query.nom_editeur) {
    whereClause.nom_editeur = { [Op.like]: `%${req.query.nom_editeur}%` };
  }
  Ouvrage.findAll({ where: whereClause }).then((ouvrages) => {
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
            écrivain: ecri.prenom + " " + ecri.nom,
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
        .catch((error) => {
          res.status(500).json({
            message: "Erreur lors de la récupération des ouvrages",
            error: error.message,
          });
        });
    }
  });
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Récupère un ouvrage par ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'ouvrage à récupérer
 *     responses:
 *       200:
 *         description: Ouvrage récupéré avec succès.
 *       404:
 *         description: Ouvrage introuvable.
 */
booksRouter.get("/:id", (req, res) => {
  const ouvragesId = req.params.id;
  Ouvrage.findByPk(ouvragesId)
    .then((ouvrage) =>
      Categorie.findByPk(ouvrage.categorie_fk).then((cat) => {
        Ecrivain.findByPk(ouvrage.ecrivain_fk).then((ecri) => {
          res.status(200).json({
            ouvrage: ouvrage,
            categories: cat.nom,
            écrivain: ecri.prenom + " " + ecri.nom,
          });
        });
      })
    )
    .catch((error) =>
      res.status(404).json({
        message: `L'ouvrage dont l'id vaut ${ouvragesId} n'existe pas`,
        error: error,
      })
    );
});

/**
 * @swagger
 * /api/books/{id}/evaluations:
 *   get:
 *     summary: Récupère les évaluations d'un ouvrage par ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'ouvrage pour lequel récupérer les évaluations.
 *     responses:
 *       200:
 *         description: Évaluations récupérées avec succès.
 *       404:
 *         description: Ouvrage ou évaluations introuvables.
 */
booksRouter.get("/:id/evaluations", (req, res) => {
  const ouvragesId = req.params.id;
  Ouvrage.findByPk(ouvragesId)
    .then((ouvrage) => {
      Evaluer.findAll({ where: { ouvrage_fk: ouvrage.ouvrage_id } }).then(
        (eva) => {
          const commentaire = eva.map((p) => p.commentaire);
          const note = eva.map((p) => p.note);
          const evalue = [{ commentaire: commentaire, note: note }];
          res.status(200).json({
            message: `Voici les évaluations de l'ouvrage ${ouvrage.titre}`,
            data: evalue,
          });
        }
      );
    })
    .catch((error) =>
      res.status(404).json({
        message: `Il n'y a pas d'évaluations pour l'ouvrage`,
        error: error,
      })
    );
});

booksRouter.post("/:id/evaluations", (req, res) => {
  Evaluer.create({
    ouvrage_fk: req.params.id,
    user_fk: req.body.user_fk,
    commentaire: req.body.commentaire,
    note: req.body.note,
  })
    .then((createComments) => {
      // Définir un message pour le consommateur de l'API REST
      const message = `Le commentaire a bien été créé !`;
      // Retourner la réponse HTTP en json avec le msg et le produit créé
      res.status(200).json({ message: message, data: createComments });
    })
    .catch((error) => {
      const message =
        "Le produit n'a pas pu être ajouté. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

booksRouter.post("/", (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader.split(" ")[1];
  const decodedToken = jwt.verify(token, privateKey, (error, decodedToken) => {
    decodedToken.userId;
    Ouvrage.create({
      titre: req.body.titre,
      nb_pages: req.body.nb_pages,
      extrait: req.body.extrait,
      categorie_fk: req.body.categorie_fk,
      resume: req.body.resume,
      annee_edition: req.body.annee_edition,
      image: req.body.image,
      nom_editeur: req.body.nom_editeur,
      user_fk: decodedToken.userId,
      ecrivain_fk: req.body.ecrivain_fk,
    })
      .then((createdOuvrage) => {
        // Définir un message pour le consommateur de l'API REST
        const message = `Le produit ${createdOuvrage.titre} a bien été créé !`;
        // Retourner la réponse HTTP en json avec le msg et le produit créé
        res.status(200).json({ message: message, data: createdOuvrage });
      })
      .catch((error) => {
        const message =
          "Le produit n'a pas pu être ajouté. Merci de réessayer dans quelques instants.";
        res.status(500).json({ message, data: error });
      });
  });
});

booksRouter.put("/:id", (req, res) => {
  const ouvrageId = req.params.id;
  Ouvrage.update(req.body, { where: { ouvrage_id: ouvrageId } })
    .then((_) => {
      return Ouvrage.findByPk(ouvrageId).then((updatedOuvrage) => {
        if (updatedOuvrage === null) {
          const message =
            "Le produit demandé n'existe pas. Merci de réessayer avec un autre identifiant.";
          // A noter ici le return pour interrompre l'exécution du code
          return res.status(404).json({ message });
        }
        // Définir un message pour l'utilisateur de l'API REST
        const message = `Le produit ${updatedOuvrage.titre} dont l'id vaut ${updatedOuvrage.ouvrage_id} a été mis à jour avec succès`;
        // Retourner la réponse HTTP en json avec le msg et le produit créé
        res.status(200).json({ message: message, data: updatedOuvrage });
      });
    })
    .catch((error) => {
      const message =
        "L'ouvrage n'a pas pu être mis à jour. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

booksRouter.delete("/:id", (req, res) => {
  Ouvrage.findByPk(req.params.id)
    .then((deletedOuvrage) => {
      if (deletedOuvrage === null) {
        const message =
          "L'ouvrage demandé n'existe pas. Merci de réessayer avec un autre identifiant.";
        return res.status(404).json({ message });
      }
      return Ouvrage.destroy({
        where: { ouvrage_id: deletedOuvrage.ouvrage_id },
      }).then((_) => {
        const message = `L'ouvrage ${deletedOuvrage.titre} a bien été supprimé !`;
        res.status(200).json({ message: message, data: deletedOuvrage }); // Retourne un message de succès avec le produit supprimé
      });
    })

    .catch((error) => {
      const message =
        "L'ouvrage n'a pas pu être supprimé. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error }); // Gestion des erreurs en cas de problème lors de la suppression
    });
});

export { booksRouter };
