import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

import { makeRedirectUri } from "expo-auth-session";

// Supabase configuration
const supabaseUrl = "https://xkrminakzvystwqxforu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrcm1pbmFrenZ5c3R3cXhmb3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njg5ODEsImV4cCI6MjA0MzI0NDk4MX0.2oUDPhemOjAqg5BJ2EWeRRklasp_Sa-SN3o882YzMAs"; // Ensure this key has the required permissions

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

    // const { error: profileError } = await supabase
    //   .from('account')
    //   .update({ full_name: full_name })
    //   .eq('user_id', user.id);

    // if (profileError) {
    //   console.error('Error saving profile:', profileError.message);
    //   return { error: profileError.message };
    // }

    console.log("User signed up and profile saved:", user);
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error("Error during sign up:", error);
    return { error: "An error occurred during sign up" };
  }
};

// Login function
export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Error logging in:", error.message);
      return { error };
    }
    if (data.session) {
      await storeData("userSession", JSON.stringify(data.session));
    } else {
      console.warn("No session found");
    }
    const { user } = data;
    const { data: profile, error: profileError } = await supabase
      .from("account")
      .select("full_name")
      .eq("user_id", user.id)
      .single();
    if (profileError) {
      throw profileError;
    }
    return { user: data.user, session: data.session, profile };
  } catch (error) {
    console.error("Error during login:", error);
    return { error };
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
    console.log("User logged out");
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
    console.error("Error retrieving session:", error);
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
    console.error("Error during game data recording:", error);
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

export default supabase;
