import { sequelize, Book, Evaluate } from "../db/sequelize.js";
import { Op } from "sequelize";
import { success } from "../helper.js";
import { readEpubFile } from "../utils/epubHandler.js";
import path from "path";
import fs from "fs";

const bookController = {
  // Create a new book
  async createBook(req, res) {
    try {
      const book = await Book.create(req.body);
      res
        .status(201)
        .json(success(`Le livre ${book.titre} a bien été créé !`, book));
    } catch (error) {
      console.error("Error creating book:", error);
      res.status(500).json({
        message: "Erreur lors de la création du livre.",
        data: error.message,
      });
    }
  },

  // Get all books or search by title
  async getAllBooks(req, res) {
    try {
      console.log("Fetching all books...");
      const { name, limit = 3 } = req.query;
      let books;

      if (name && name.length >= 2) {
        console.log(`Searching books with name: ${name}`);
        books = await Book.findAndCountAll({
          where: { titre: { [Op.like]: `%${name}%` } },
          order: [["titre", "ASC"]],
          limit: parseInt(limit),
        });
        // Remove epub field from each book
        if (books.rows) {
          books.rows = books.rows.map((book) => {
            const b = book.toJSON();
            delete b.epub;
            return b;
          });
        }
        console.log(`Found ${books.count} books matching search`);
        return res.json(
          success(
            `Il y a ${books.count} livres correspondant à la recherche.`,
            books
          )
        );
      }

      books = await Book.findAll({
        order: [["livre_id", "ASC"]],
        include: ["category", "writer"], // Include related data
      });
      // Remove epub field from each book
      const booksNoEpub = books.map((book) => {
        const b = book.toJSON();
        delete b.epub;
        return b;
      });
      console.log(`Found ${books.length} total books`);
      res.json(success("Liste des livres récupérée avec succès.", booksNoEpub));
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({
        message: "Impossible de récupérer les livres.",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  // Get a book by ID
  async getBookById(req, res) {
    try {
      console.log(`Fetching book with ID: ${req.params.id}`);
      const book = await Book.findByPk(req.params.id, {
        include: ["category", "writer"], // Include related data
      });

      if (!book) {
        console.log(`Book with ID ${req.params.id} not found`);
        return res.status(404).json({ message: "Livre introuvable." });
      }

      console.log(`Found book: ${book.titre}`);
      const bookNoEpub = book.toJSON();
      delete bookNoEpub.epub;
      res.json(success(`Livre ${book.titre} trouvé.`, bookNoEpub));
    } catch (error) {
      console.error("Error fetching book by ID:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération du livre.",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  // Update a book
  async updateBook(req, res) {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Livre introuvable." });
      }

      await book.update(req.body);
      res.json(success("Livre mis à jour avec succès.", book));
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour.", data: error });
    }
  },

  // Delete a book
  async deleteBook(req, res) {
    const t = await sequelize.transaction();

    try {
      const bookId = req.params.id;

      // Check if user exists
      const book = await Book.findByPk(bookId);
      if (!book) {
        await t.rollback();
        return res.status(404).json({ message: "User not found" });
      }

      // Delete all evaluations by this user
      await Evaluate.destroy({
        where: { book_id: bookId },
        transaction: t,
      });
      // Delete the user
      await Book.destroy({
        where: { livre_id: bookId },
        transaction: t,
      });

      await t.commit();
      res.json({
        message: "Book and associated evaluations deleted successfully",
      });
    } catch (error) {
      await t.rollback();
      console.error("Error deleting book:", error);
      res.status(500).json({
        message: "Error deleting book",
        error: error.message,
      });
    }
  },

  // Get book's epub file
  async getBookEpub(req, res) {
    try {
      console.log(`Fetching epub for book ID: ${req.params.id}`);
      const book = await Book.findByPk(req.params.id);

      if (!book) {
        console.log(`Book with ID ${req.params.id} not found`);
        return res.status(404).json({ message: "Livre introuvable." });
      }

      if (!book.epub) {
        console.log(`No epub file found for book: ${book.titre}`);
        return res.status(404).json({ message: "Fichier EPUB non trouvé." });
      }

      res
        .header("Content-Type", "application/epub+zip")
        .header(
          "Content-Disposition",
          `attachment; filename="${book.titre}.epub"`
        )
        .header("Content-Length", book.epub.length)
        .send(book.epub);
    } catch (error) {
      console.error("Error fetching epub file:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération du fichier EPUB.",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  // Upload book's epub file
  async uploadBookEpub(req, res) {
    try {
      console.log(`Uploading epub for book ID: ${req.params.id}`);
      const book = await Book.findByPk(req.params.id);

      if (!book) {
        console.log(`Book with ID ${req.params.id} not found`);
        return res.status(404).json({ message: "Livre introuvable." });
      }

      if (!req.files || !req.files.epub) {
        return res.status(400).json({ message: "Aucun fichier EPUB fourni." });
      }

      const epubFile = req.files.epub;

      // Validate file type
      if (
        !epubFile.mimetype.includes("epub") &&
        !epubFile.name.endsWith(".epub")
      ) {
        return res
          .status(400)
          .json({ message: "Le fichier doit être au format EPUB." });
      }

      try {
        const epubData = fs.readFileSync(epubFile.tempFilePath);
        await book.update({ epub: epubData });

        // Clean up the temporary file
        if (fs.existsSync(epubFile.tempFilePath)) {
          fs.unlinkSync(epubFile.tempFilePath);
        }

        res.json(success(`EPUB uploadé avec succès pour ${book.titre}.`, book));
      } catch (readError) {
        console.error("Error reading EPUB file:", readError);
        return res.status(500).json({
          message: "Erreur lors de la lecture du fichier EPUB.",
          error: readError.message,
        });
      }
    } catch (error) {
      console.error("Error uploading epub file:", error);
      res.status(500).json({
        message: "Erreur lors de l'upload du fichier EPUB.",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },
};

export default bookController;
