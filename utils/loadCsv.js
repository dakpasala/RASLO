// Import the Supabase client creation utility
import { createClient } from "@supabase/supabase-js";

// Debug logging to verify environment variables are properly loaded
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate that required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing.");
  throw new Error("Supabase environment variables are missing.");
}

// Initialize Supabase client with URL and anonymous key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Main function to load and process data from Supabase
export const loadCsvData = async () => {
  try {
    // Query all records from the "speeds" table in Supabase
    const { data, error } = await supabase
      .from("speeds")
      .select("*");

    // Handle any errors that occurred during the query
    if (error) {
      console.error("Error fetching data from Supabase:", error.message);
      throw new Error("Failed to fetch data from Supabase");
    }

    // Transform and clean the raw data from Supabase
    // - Provide default values for missing fields
    // - Convert string numbers to floats
    // - Ensure consistent data structure
    const cleanedData = data.map((row) => ({
      Region: row.Region || "Unknown",  // Default region to "Unknown" if missing
      Timestamp: row.Timestamp || "",   // Empty string for missing timestamps
      // Convert string numbers to floats, default to 0 if invalid
      Post_Time_Seconds: parseFloat(row.Post_Time_Seconds) || 0,
      Download_Time_Seconds: parseFloat(row.Download_Time_Seconds) || 0,
      Post_Rate_Files_per_Sec: parseFloat(row.Post_Rate_Files_per_Sec) || 0,
      Download_Rate_Files_per_Sec: parseFloat(row.Download_Rate_Files_per_Sec) || 0,
      Post_Rate_MB_per_Sec: parseFloat(row.Post_Rate_MB_per_Sec) || 0,
      Post_Rate_Mbits_per_Sec: parseFloat(row.Post_Rate_Mbits_per_Sec) || 0,
      Download_Rate_MB_per_Sec: parseFloat(row.Download_Rate_MB_per_Sec) || 0,
      Download_Rate_Mbits_per_Sec: parseFloat(row.Download_Rate_Mbits_per_Sec) || 0,
    }));

    // Return the cleaned and processed data
    return cleanedData;
  } catch (error) {
    // Log and re-throw any errors that occur during data loading
    console.error("Error querying data from Supabase:", error.message || error);
    throw new Error("Failed to load data from Supabase");
  }
};