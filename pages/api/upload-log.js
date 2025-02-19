import formidable from "formidable"; 
import processLogFile from "./processLog"; 
import { createClient } from "@supabase/supabase-js"; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);

export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = formidable({
      keepExtensions: true, 
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing file:", err);
        return res.status(500).json({ message: "Error parsing file" });
      }

      console.log("Fields:", fields);
      console.log("Files:", files);

      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
      const uploadedFilePath = uploadedFile?.filepath;

      if (!uploadedFilePath) {
        console.error("No file uploaded or incorrect form field name");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("File uploaded successfully:", uploadedFilePath);

      try {
        // Process the uploaded log file
        let processedData = await processLogFile(uploadedFilePath);

        // ✅ Debugging: Check what is returned by processLogFile
        console.log("Processed Data Before Insert:", JSON.stringify(processedData, null, 2));

        // ✅ Ensure processedData is an array
        if (!Array.isArray(processedData) || processedData.length === 0) {
          console.error("Processed data is empty or not an array:", processedData);
          return res.status(400);
        }

        // ✅ Ensure timestamps are formatted correctly
        processedData = processedData.map(entry => ({
          ...entry,
          Timestamp: new Date(entry.Timestamp).toISOString(),
        }));

        // ✅ Insert into Supabase
        const { data, error } = await supabaseServer
          .from("speeds")
          .insert(processedData)
          .select("*"); 

        console.log("Supabase response:", { data, error });

        if (error) {
          console.error("Error inserting data into Supabase:", error);
          return res.status(500).json({ message: "Error saving data to database", error });
        }

        console.log("Data successfully saved to Supabase:", data);
        res.status(200).json({ message: "File processed and data saved successfully!", insertedData: data });

      } catch (error) {
        console.error("Error processing log file:", error);
        res.status(500).json({ message: "Error processing log file" });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}