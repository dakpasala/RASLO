import formidable from "formidable"; // Import the formidable package to handle file uploads
import processLogFile from "./processLog"; // Import a custom function that processes the uploaded log file
import { createClient } from "@supabase/supabase-js"; // Import the Supabase client to interact with the database

// Define Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Public Supabase URL (safe to expose)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Secret key (should only be used on the server)

// Initialize a Supabase client to interact with the database
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);

// Configure API settings
export const config = {
  api: {
    bodyParser: false, // Disable automatic request body parsing since we are handling file uploads manually
  },
};

// Define the API route handler function
export default async function handler(req, res) {
  // Check if the request method is POST (we only accept file uploads via POST)
  if (req.method === "POST") {
    const form = formidable({
      keepExtensions: true, // Ensure uploaded files retain their original extensions
    });

    // Parse the incoming request to extract file data
    form.parse(req, async (err, fields, files) => {
      if (err) { // If there's an error while parsing
        console.error("Error parsing file:", err); // Log the error to the server console
        return res.status(500).json({ message: "Error parsing file" }); // Respond with a 500 Internal Server Error
      }

      console.log("Fields:", fields); // Log any additional fields that were sent with the request
      console.log("Files:", files); // Log the uploaded file details

      // Extract the uploaded file path
      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file; // Handle cases where multiple files might be uploaded
      const uploadedFilePath = uploadedFile?.filepath; // Get the file path where the uploaded file is stored temporarily

      // Check if a file was actually uploaded
      if (!uploadedFilePath) {
        console.error("No file uploaded or incorrect form field name"); // Log an error if no file is found
        return res.status(400).json({ message: "No file uploaded" }); // Respond with a 400 Bad Request
      }

      console.log("File uploaded successfully:", uploadedFilePath); // Log the successful file upload

      try {
        // Call a function to process the uploaded log file and extract relevant data
        const processedData = await processLogFile(uploadedFilePath);

        // Insert the processed data into the "speeds" table in Supabase
        const { data, error } = await supabaseServer
          .from("speeds") // Target the "speeds" table
          .insert(processedData); // Insert the extracted data

        // Check if there was an error inserting the data into the database
        if (error) {
          console.error("Error inserting data into Supabase:", error); // Log the error
          return res.status(500).json({ message: "Error saving data to database" }); // Respond with a 500 Internal Server Error
        }

        console.log("Data successfully saved to Supabase:", data); // Log success message
        res.status(200).json({ message: "File processed and data saved successfully!" }); // Respond with success message
      } catch (error) {
        console.error("Error processing log file:", error); // Log error if something goes wrong during file processing
        res.status(500).json({ message: "Error processing log file" }); // Respond with an error message
      }
    });
  } else {
    // If the request method is not POST, respond with a 405 Method Not Allowed
    res.setHeader("Allow", ["POST"]); // Inform the client that only POST requests are allowed
    res.status(405).json({ message: `Method ${req.method} not allowed` }); // Respond with an error message
  }
}