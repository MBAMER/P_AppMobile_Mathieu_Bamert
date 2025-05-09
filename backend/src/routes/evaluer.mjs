import express from "express";
import { Ouvrage, Evaluer } from "../db/sequelize.mjs";

const evaluerRouter = express();

evaluerRouter.get("/", (req, res) => {
  Evaluer.findAll()
    .then((evaluer) => {
      if (evaluer == null) {
        res.status(404).json({
          message: "Aucune evaluations n'a été trouvé!",
        });
      } else {
        const evals = Promise.all(
          evaluer.map(async (evalue) => {
            const ouvrage = await Ouvrage.findByPk(evalue.ouvrage_fk);
            console.log(ouvrage.titre);
            return {
              evaluations: evalue,
              ouvrage: ouvrage.titre,
            };
          })
        );
        evals.then((result) => {
          res.status(200).json({
            message: "La liste des evaluations a été trouvée",
            data: result,
          });
        });
      }
    })
    .catch((_) => {
      res.status(500).json({
        message:
          "Une erreur est survenu ! Veuillez réessayer dans quelques instants!",
      });
    });
});

evaluerRouter.get("/:id", (req, res) => {
  const evaluerId = req.params.id;
  Evaluer.findByPk(evaluerId)
    .then((evals) => {
      if (evals == null) {
        return res.status(404).json({
          message: "Aucune évaluation trouvée pour cet identifiant.",
        });
      }
      return Ouvrage.findByPk(evals.ouvrage_fk).then((ouvrage) => {
        res.status(200).json({
          évalutations: evals,
          ouvrage: ouvrage.titre,
        });
      });
    })
    .catch((_) => {
      res.status(500).json({
        message:
          "Une erreur est survenu ! Veuillez réessayer dans quelques instants!",
      });
    });
});

evaluerRouter.delete("/:id", (req, res) => {
  Evaluer.findByPk(req.params.id)
    .then((deletedEvaluations) => {
      if (deletedEvaluations === null) {
        const message =
          "L'evaluations demandé n'existe pas. Merci de réessayer avec un autre identifiant.";
        return res.status(404).json({ message });
      }
      return Evaluer.destroy({
        where: { evaluation_id: deletedEvaluations.evaluation_id },
      }).then((_) => {
        const message = `L'évaluation dont l'id vaut ' ${deletedEvaluations.evaluation_id} a bien été supprimé !`;
        res.status(200).json({ message: message, data: deletedEvaluations }); // Retourne un message de succès avec le produit supprimé
      });
    })

    .catch((error) => {
      const message =
        "L'évaluation n'a pas pu être supprimé. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error }); // Gestion des erreurs en cas de problème lors de la suppression
    });
});

export { evaluerRouter };
