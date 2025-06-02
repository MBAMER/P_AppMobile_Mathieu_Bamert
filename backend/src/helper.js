import fs from "fs";

const success = (message, data) => {
  return {
    message: message,
    data: data,
  };
};

const handleEpubFile = async (filePath, title) => {
  try {
    const epubData = fs.readFileSync(filePath);
    return {
      title: title,
      epub: epubData,
    };
  } catch (error) {
    throw new Error(`Error reading EPUB file: ${error.message}`);
  }
};

const sendEpubResponse = (res, blob, title) => {
  res
    .header("Content-Type", "application/epub+zip")
    .header("Content-Disposition", `attachment; filename="${title}.epub"`)
    .header("Content-Length", blob.length)
    .send(blob);
};

export { success, handleEpubFile, sendEpubResponse };
