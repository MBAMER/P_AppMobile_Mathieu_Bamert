import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize, Book, Writer } from "../db/sequelize.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const booksDirectory = path.join(__dirname, "../../../books");

async function importEpubFiles() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Read all files from the books directory
    const files = fs.readdirSync(booksDirectory);
    console.log(`Found ${files.length} files in the books directory.`);

    for (const file of files) {
      if (file.endsWith(".epub")) {
        try {
          const filePath = path.join(booksDirectory, file);
          console.log(`Processing file: ${file}`);

          const epubData = fs.readFileSync(filePath);

          // Extract title and author from filename (format: "Author - Title.epub")
          const [authorName, title] = file.replace(".epub", "").split(" - ");

          // Find or create writer
          const [writerFirstName, writerLastName] = authorName
            .split(", ")
            .reverse();
          let writer = await Writer.findOne({
            where: {
              prenom: writerFirstName,
              nom_de_famille: writerLastName,
            },
          });

          if (!writer) {
            writer = await Writer.create({
              prenom: writerFirstName,
              nom_de_famille: writerLastName,
            });
            console.log(
              `Created new writer: ${writerFirstName} ${writerLastName}`
            );
          }

          // Try to find existing book
          let book = await Book.findOne({
            where: {
              titre: title,
            },
          });

          if (book) {
            // Update existing book with EPUB data
            await book.update({
              epub: epubData,
              writer_id: writer.ecrivain_id,
            });
            console.log(`Updated EPUB for book: ${title}`);
          } else {
            // Create new book entry
            book = await Book.create({
              titre: title,
              annee_edition: new Date().getFullYear(), // Default to current year
              nombre_de_page: 0, // This will need to be updated manually
              category_id: 1, // Default category, should be updated
              writer_id: writer.ecrivain_id,
              epub: epubData,
            });
            console.log(`Created new book: ${title}`);
          }
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError);
          continue; // Continue with next file even if one fails
        }
      }
    }

    console.log("EPUB import completed successfully");
  } catch (error) {
    console.error("Error importing EPUB files:", error);
  } finally {
    await sequelize.close();
  }
}

// Run the import
importEpubFiles();
