import express from "express";
import bookController from "../../controllers/booksController.js";
import fileUpload from "express-fileupload";
import path from "path";
import os from "os";
import { getEpub } from "../../controllers/epubController.js";

const router = express.Router();

// Configure file upload middleware
router.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
    useTempFiles: true,
    tempFileDir: path.join(os.tmpdir(), "epub-uploads"),
    createParentPath: true,
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
  })
);

/**
 * @swagger
 * /api/books:
 *   post:
 *     tags: [Books]
 *     summary: Create a new book
 *     description: Add a new book to the library
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - annee_edition
 *               - nombre_de_page
 *               - category_id
 *               - writer_id
 *             properties:
 *               titre:
 *                 type: string
 *                 description: The book's title
 *               annee_edition:
 *                 type: integer
 *                 description: Publication year
 *                 maximum: 2025
 *               lien_image:
 *                 type: string
 *                 description: URL to book cover image
 *               lien_pdf:
 *                 type: string
 *                 description: URL to PDF version
 *               resume:
 *                 type: string
 *                 description: Book summary
 *               editeur:
 *                 type: string
 *                 description: Publisher name
 *               nombre_de_page:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of pages
 *               category_id:
 *                 type: integer
 *                 description: Category ID reference
 *               writer_id:
 *                 type: integer
 *                 description: Writer ID reference
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", bookController.createBook);

/**
 * @swagger
 * /api/books:
 *   get:
 *     tags: [Books]
 *     summary: Get all books
 *     description: Retrieve a list of all books in the library
 *     responses:
 *       200:
 *         description: List of books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 */
router.get("/", bookController.getAllBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Get a book by ID
 *     description: Retrieve a specific book by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book found and returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get("/:id", bookController.getBookById);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     tags: [Books]
 *     summary: Update a book
 *     description: Update an existing book's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               annee_edition:
 *                 type: integer
 *                 maximum: 2025
 *               lien_image:
 *                 type: string
 *               lien_pdf:
 *                 type: string
 *               resume:
 *                 type: string
 *               editeur:
 *                 type: string
 *               nombre_de_page:
 *                 type: integer
 *                 minimum: 1
 *               category_id:
 *                 type: integer
 *               writer_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.put("/:id", bookController.updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     tags: [Books]
 *     summary: Delete a book
 *     description: Remove a book from the library
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", bookController.deleteBook);

/**
 * @swagger
 * /api/books/{id}/epub:
 *   get:
 *     tags: [Books]
 *     summary: Get book's EPUB file
 *     description: Download the EPUB version of a book
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: EPUB file downloaded successfully
 *         content:
 *           application/epub+zip:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Book or EPUB file not found
 *       500:
 *         description: Server error
 */
// router.get('/:id/epub', bookController.getBookEpub); // Removed to use robust getEpub only

/**
 * @swagger
 * /api/books/{id}/epub:
 *   post:
 *     tags: [Books]
 *     summary: Upload book's EPUB file
 *     description: Upload an EPUB file for a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               epub:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: EPUB file uploaded successfully
 *       400:
 *         description: No file provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.post("/:id/epub", bookController.uploadBookEpub);

router.get("/:bookId/epub", getEpub);

export default router;
