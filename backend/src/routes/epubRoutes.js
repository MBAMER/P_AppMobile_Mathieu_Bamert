import { Router } from "express";
import { getEpub, uploadEpub } from "../controllers/epubController.js";

const router = Router();

// Route to get an EPUB file
router.get("/:bookId", getEpub);

// Route to upload an EPUB file
router.post("/upload", uploadEpub);

export default router;
