import { createClient } from "@supabase/supabase-js";

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing.");
  throw new Error("Supabase environment variables are missing.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
