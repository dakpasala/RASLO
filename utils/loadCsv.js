import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, // Your Supabase URL from environment variables
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Your Supabase anon key from environment variables
);

export const loadCsvData = async () => {
  try {
    // Fetch data from Supabase
    const { data, error } = await supabase
      .from("speeds")
      .select("*");

    if (error) {
      console.error("Error fetching data from Supabase:", error.message);
      throw new Error("Failed to fetch data from Supabase");
    }

    // Process and clean the data (if necessary)
    const cleanedData = data.map((row) => ({
      Region: row.Region || "Unknown",
      Timestamp: row.Timestamp || "",
      Post_Time_Seconds: parseFloat(row.Post_Time_Seconds) || 0,
      Download_Time_Seconds: parseFloat(row.Download_Time_Seconds) || 0,
      Post_Rate_Files_per_Sec: parseFloat(row.Post_Rate_Files_per_Sec) || 0,
      Download_Rate_Files_per_Sec: parseFloat(row.Download_Rate_Files_per_Sec) || 0,
      Post_Rate_MB_per_Sec: parseFloat(row.Post_Rate_MB_per_Sec) || 0,
      Post_Rate_Mbits_per_Sec: parseFloat(row.Post_Rate_Mbits_per_Sec) || 0,
      Download_Rate_MB_per_Sec: parseFloat(row.Download_Rate_MB_per_Sec) || 0,
      Download_Rate_Mbits_per_Sec: parseFloat(row.Download_Rate_Mbits_per_Sec) || 0,
    }));

    return cleanedData;
  } catch (error) {
    console.error("Error querying data from Supabase:", error.message || error);
    throw new Error("Failed to load data from Supabase");
  }
};
