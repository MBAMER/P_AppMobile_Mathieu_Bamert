import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../db/sequelize.mjs";
import { privateKey } from "../auth/private_key.mjs";

const loginRouter = express();

loginRouter.post("/", (req, res) => {
  User.findOne({ where: { pseudo: req.body.pseudo } })
    .then((user) => {
      if (!user) {
        const message = `L'utilisateur demandé n'existe pas`;
        return res.status(404).json({ message });
      }

      bcrypt.compare(req.body.mdp, user.mdp).then((isPasswordValid) => {
        console.log(req.body.mdp);
        console.log(user.mdp);
        if (!isPasswordValid) {
          const message = `Le mot de passe est incorrecte.`;
          return res.status(401).json({ message });
        } else {
          // JWT
          const token = jwt.sign(
            { userId: user.id, admin: user.admin },
            privateKey,
            {
              expiresIn: "1y",
            }
          );
          const message = `L'utilisateur a été connecté avec succès`;
          return res.status(200).json({ message, data: user, token });
        }
      });
    })
    .catch((error) => {
      const message = `L'utilisateur n'a pas pu être connecté. Réessayez dans quelques instants`;
      return res.status(500).json({ message, data: error });
    });
});

export { loginRouter };
