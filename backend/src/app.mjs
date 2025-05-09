import express from "express";
import cors from "cors";
import { auth } from "./auth/auth.mjs";
import swaggerUi from "swagger-ui-express";

const app = express();

// Configuration de CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Autoriser uniquement cette origine
    methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes autorisées
    credentials: true, // Si vous utilisez des cookies ou des headers d'authentification
  })
);

//Middleware pour convertir le JSON en un objet JavaScript, pour analyser le corps des requêtes JSON
// Avant : message est : "Le produit undefined a bien été créé !"
// Après : message est : "Le produit hamburger a bien été créé !"
app.use(express.json());

const port = 3000;

import { loginRouter } from "./routes/login.mjs";
app.use("/api/login", loginRouter);

import { booksRouter } from "./routes/books.mjs";
app.use("/api/books", auth, booksRouter);

import { userRouter } from "./routes/users.mjs";
app.use("/api/users", auth, userRouter);

import { categoriesRouter } from "./routes/categories.mjs";
app.use("/api/categories", auth, categoriesRouter);

import { authorsRouter } from "./routes/authors.mjs";
app.use("/api/authors", auth, authorsRouter);

import { evaluerRouter } from "./routes/evaluer.mjs";
app.use("/api/evaluations", auth, evaluerRouter);

import { swaggerSpec } from "./swagger.mjs";
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

import { sequelize, initDb } from "./db/sequelize.mjs";
sequelize
  .authenticate()
  .then((_) =>
    console.log("La connexion à la base de données a bien été établie")
  )
  .catch((error) => console.error("Impossible de se connecter à la DB"));
initDb();

app.use(({ res }) => {
  const message =
    "Impossible de trouver la ressource demandée ! Vous pouvez essayer une autre URL.";
  res.status(404).json(message);
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
