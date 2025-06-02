import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import AdmZip from "adm-zip";
import { handleEpubFile, sendEpubResponse } from "../helper.js";
import { Book } from "../db/sequelize.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get EPUB file
export const getEpub = async (req, res) => {
  try {
    const { bookId } = req.params;
    console.log(`[getEpub] Requested bookId: ${bookId}`);

    // Try to find the book in the database
    const book = await Book.findByPk(bookId);
    if (!book) {
      console.log(`[getEpub] Book with ID ${bookId} not found`);
      return res.status(404).json({ error: "Book not found" });
    }

    console.log(`[getEpub] Found book: ${book.titre}`);

    let epubPath;

    if (book && book.epub && typeof book.epub === "string") {
      // The epub field contains a path like "books/filename.epub"
      epubPath = path.join(__dirname, "../../", book.epub);
    } else if (book && book.epub && book.epub instanceof Buffer) {
      // Check if the Buffer contains a file path (small size) or actual EPUB data (large size)
      if (book.epub.length < 1000) {
        // Likely a file path stored as binary
        const epubPathFromBuffer = book.epub.toString("utf8");
        epubPath = path.join(__dirname, "../../", epubPathFromBuffer);
      } else {
        // Likely actual EPUB binary data - send directly
        try {
          sendEpubResponse(res, book.epub, bookId);
          console.log(
            `[getEpub] EPUB binary data sent successfully for: ${book.titre}`
          );
          return;
        } catch (error) {
          console.log(
            `[getEpub] Failed to send EPUB binary data: ${error.message}`
          );
          return res.status(500).json({ error: "Failed to send EPUB file." });
        }
      }
    } else {
      // Fallback: try the old logic
      epubPath = path.join(__dirname, "../../books", `${bookId}.epub`);
    }

    try {
      await fs.access(epubPath);
    } catch {
      console.log(`[getEpub] EPUB file not found: ${epubPath}`);
      return res.status(404).json({ error: "EPUB file not found" });
    }

    try {
      const { epub } = await handleEpubFile(epubPath, bookId);
      sendEpubResponse(res, epub, bookId);
      console.log(`[getEpub] EPUB file sent successfully for: ${book.titre}`);
    } catch (error) {
      console.log(`[getEpub] Failed to read EPUB file: ${error.message}`);
      return res.status(500).json({ error: "Failed to read EPUB file." });
    }
  } catch (error) {
    console.error("Error serving EPUB:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Upload EPUB file
export const uploadEpub = async (req, res) => {
  try {
    if (!req.files || !req.files.epub) {
      return res.status(400).json({ error: "No EPUB file uploaded" });
    }

    const epubFile = req.files.epub;
    const bookId = req.body.bookId || Date.now().toString();

    // MIME type check
    if (
      epubFile.mimetype !== "application/epub+zip" &&
      epubFile.mimetype !== "application/octet-stream"
    ) {
      return res
        .status(400)
        .json({ error: "Uploaded file is not an EPUB (bad MIME type)" });
    }

    // Ensure the books directory exists
    const booksDir = path.join(__dirname, "../../books");
    await fs.mkdir(booksDir, { recursive: true });

    // Save the file
    const epubPath = path.join(booksDir, `${bookId}.epub`);
    await epubFile.mv(epubPath);

    // Log file size
    const stats = await fs.stat(epubPath);
    console.log(`Uploaded file size: ${stats.size} bytes`);

    // Verify the file is a valid ZIP (EPUB)
    try {
      const zip = new AdmZip(epubPath);
      zip.getEntries(); // Will throw if not a valid zip
    } catch (zipError) {
      // Remove the corrupted file
      await fs.unlink(epubPath);
      return res
        .status(400)
        .json({ error: "Uploaded file is not a valid EPUB (ZIP) archive." });
    }

    res.status(200).json({
      message: "EPUB uploaded successfully",
      bookId: bookId,
      fileSize: stats.size,
    });
  } catch (error) {
    console.error("Error uploading EPUB:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
