import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getEpubPath = (epubFileName) => {
  // Look for books inside the backend directory
  const backendRoot = path.join(__dirname, "..", "..");
  return path.join(backendRoot, epubFileName);
};

export const readEpubFile = async (epubFileName) => {
  try {
    const epubPath = getEpubPath(epubFileName);
    if (!fs.existsSync(epubPath)) {
      throw new Error(`EPUB file not found: ${epubPath}`);
    }
    return fs.readFileSync(epubPath);
  } catch (error) {
    console.error(`Error reading EPUB file: ${error.message}`);
    throw error;
  }
};

export const saveEpubFile = async (epubFileName, epubData) => {
  try {
    const epubPath = getEpubPath(epubFileName);
    fs.writeFileSync(epubPath, epubData);
    return epubPath;
  } catch (error) {
    console.error(`Error saving EPUB file: ${error.message}`);
    throw error;
  }
};
