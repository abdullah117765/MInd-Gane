import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

import { makeRedirectUri } from "expo-auth-session";

// Supabase configuration
const supabaseUrl = "https://kljnqgerjajubfnnkfrq.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsam5xZ2VyamFqdWJmbm5rZnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzNzg2NTYsImV4cCI6MjA0MDk1NDY1Nn0.GUCFMybASIOeaiqFc84WSF80HbtPknbr62Vp8578IhQ"; // Ensure this key has the required permissions

let loginUserEmail = "";
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

// Function to store data
const storeData = async (key, value) => {
  if (value === undefined || value === null) {
    console.error(`Cannot store undefined or null value for key: ${key}`);
    return;
  }
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Error saving data", error);
  }
};

// Function to retrieve data
const retrieveData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  } catch (error) {
    console.error("Error retrieving data", error);
  }
  return null;
};

// Sign-up function
export const signup = async (
  email,
  password,
  full_name,
  username,
  nationality,
  age,
  gender,
  education,
  employment,
  maritalStatus,
  residence
) => {
  // Check for empty fields
  if (
    !email ||
    !password ||
    !full_name ||
    !username ||
    !nationality ||
    !age ||
    !gender ||
    !education ||
    !employment ||
    !maritalStatus ||
    !residence
  ) {
    return { error: "Please fill the required fields." }; // Return an error object
  }

  try {
    const redirectTo = makeRedirectUri();

    console.log("Redirect URL:", redirectTo);

    console.log(
      "Signing up user:",
      email,
      password,
      full_name,
      username,
      nationality,
      age,
      gender,
      education,
      employment,
      maritalStatus,
      residence
    );
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          email: email,
          username: username,
          full_name: full_name,
          nationality: nationality,
          age: age,
          gender: gender,
          education: education,
          employment: employment,
          marital_status: maritalStatus,
          residence: residence,
        },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      console.error("Error signing up:", error.message);
      return { error: error.message };
    }

    const { user } = data;

    // Insert user data into the profiles table
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        email: email,
        full_name: full_name,
        username: username,
        nationality: nationality,
        age: age,
        gender: gender,
        education: education,
        employment: employment,
        marital_status: maritalStatus,
        residence: residence,
      },
    ]);

    if (insertError) {
      console.error("Error saving profile:", insertError.message);
      return { error: insertError.message };
    }

    console.log("User signed up and profile saved:", user);
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error("Error during sign up:", error.message);
    return { error: error.message };
  }
};

// Login function
export const login = async (email, password) => {
  try {
    if (!email || !password) {
      return { error: "Please fill the required fields." };
    }

    // Attempt to sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle any errors during sign-in
    if (error) {
      console.error("Error logging in:", error);
      return { error: error.message };
    }

    // Check if a session was created
    if (data.session) {
      await storeData("userSession", JSON.stringify(data.session));
      console.log("User logged in:", data.session);
    } else {
      console.warn("No session found");
    }

    const { user } = data;
    console.log("User Email:", user.email);

    // Check if the profile exists based on the email
    const { data: profileCheck, error: checkError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email) // Check for a matching profile by email
      .single();

    if (checkError) {
      console.error("Error checking profile existence:", checkError.message);
      return { error: checkError.message };
    } else {
      loginUserEmail = profileCheck.email;
      console.log("Profile found for email:", profileCheck.email);
    }

    if (!profileCheck) {
      console.warn("Profile not found for email:", user.email);
      return { error: "Profile not found." };
    }

    // Retrieve the user profile from the profiles table based on email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", user.email) // Ensure you are using the correct email field
      .single();

    // Handle any errors during profile retrieval
    if (profileError) {
      console.error("Error retrieving profile:", profileError.message);
      return { error: profileError.message };
    }

    // Now you can safely access full_name
    return { user: data.user, session: data.session, profile };
  } catch (error) {
    return { error: error.message };
  }
};

// Logout function
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
      return { error };
    }

    // Update the is_boring field to true for the user in the profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_boring: true }) // Set is_boring to true
      .eq("email", loginUserEmail); // Filter by user ID

    if (updateError) {
      console.error("Error updating is_boring field:", updateError.message);
      return { error: updateError };
    }

    console.log("User logged out and is_boring updated to true");
    await AsyncStorage.removeItem("userSession");
    return {};
  } catch (error) {
    console.error("Error during logout:", error);
    return { error };
  }
};

// Get session function
export const getSession = async () => {
  try {
    const session = await retrieveData("userSession");
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error("Error retrieving session:", error.message);
    return null;
  }
};

// Game data management functions
export const recordGameData = async (userId, gameData) => {
  try {
    const { data, error } = await supabase
      .from("game_stats")
      .insert([{ user_id: userId, ...gameData }]);
    if (error) {
      console.error("Error recording game data:", error.message);
      return;
    }
    console.log("Game data recorded:", data);
  } catch (error) {
    console.error("Error during game data recording:", error.message);
  }
};

export const cacheGameData = async (gameData) => {
  try {
    await storeData("gameData", JSON.stringify(gameData));
  } catch (error) {
    console.error("Error caching game data:", error);
  }
};

export const syncGameData = async () => {
  try {
    const gameData = await retrieveData("gameData");
    if (gameData) {
      const parsedData = JSON.parse(gameData);
      const session = await getSession();
      if (session && session.user) {
        const userId = session.user.id;
        await recordGameData(userId, parsedData);
        await AsyncStorage.removeItem("gameData");
      } else {
        console.warn("No user session found");
      }
    }
  } catch (error) {
    console.error("Error syncing game data:", error);
  }
};

export const saveGameStatsFunction = async (stats) => {
  const {
    user,
    user_email,
    incomplete,
    wins,
    losses,
    total_clicks,
    time_between_clicks,
    click_order,
    game_duration,
  } = stats;

  // Format game_duration to a suitable format for INTERVAL (e.g., 'HH:MM:SS')

  const gameStats = {
    user: user,
    user_email,
    incomplete,
    wins,
    losses,
    total_clicks,
    time_between_clicks, // Assuming this is an array of numbers
    click_order, // Assuming this is an array of strings
    game_duration,
  };

  const { data, error } = await supabase.from("game_stats").insert([gameStats]);

  if (error) {
    console.error("Error saving game stats:", error);
    return new Error("Error saving game stats:", error);
  } else {
    console.log("Game stats saved:");
    return "Game stats saved";
  }
};

// Get game statistics for the current user

export const getGameStatsByEmail = async () => {
  const { data, error } = await supabase
    .from("game_stats")
    .select("*")
    .eq("user_email", loginUserEmail); // Filter by user_email

  if (error) {
    console.error("Error fetching game stats:", error);
    return new Error("Error fetching game stats:", error);
  } else {
    console.log("Fetched game stats:");
    return data; // Return the fetched data
  }
};

export default supabase;
