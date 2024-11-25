import formidable from "formidable";
import path from "path";
import processLogFile from "./processLog";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle multipart form data
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = formidable({
      keepExtensions: true, // Keep file extensions
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing file:", err);
        return res.status(500).json({ message: "Error parsing file" });
      }

      console.log("Fields:", fields);
      console.log("Files:", files);

      // Access the file path correctly
      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
      const uploadedFilePath = uploadedFile?.filepath;

      if (!uploadedFilePath) {
        console.error("No file uploaded or incorrect form field name");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("File uploaded successfully:", uploadedFilePath);

      try {
        // Use the processLogFile function to handle the uploaded log file
        await processLogFile(uploadedFilePath);
        res.status(200).json({ message: "File processed successfully!" });
      } catch (error) {
        console.error("Error processing log file:", error);
        res.status(500).json({ message: "Error processing log file" });
      }
    });
  } else {
    // If method is not POST, return 405 (Method Not Allowed)
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}