// Basic Supabase usage example
import supabase from "../lib/supabase.js";

// Simple example to test the connection
async function testConnection() {
  try {
    // Test basic query - this will test if the client is configured correctly
    const { data, error } = await supabase
      .from("users") // Replace 'users' with your actual table name
      .select("count", { count: "exact" });

    if (error) {
      console.log(
        "Supabase client configured, but table query failed:",
        error.message,
      );
      console.log("This is normal if you haven't created tables yet.");
    } else {
      console.log("Supabase connection successful! Table count:", data);
    }
  } catch (error) {
    console.error("Error testing connection:", error.message);
  }
}

// Run the test
testConnection();
