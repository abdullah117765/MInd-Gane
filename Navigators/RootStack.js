import React from "react";
import { Colors } from "../components/styles";
const { primary, tertiary } = Colors;

// React navigation
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import Game from "../screens/Game";
import Login from "../screens/Login";
import Signup from "../screens/Signup";
import Verified from "../screens/Verified";
import Welcome from "../screens/Welcome";

const Stack = createNativeStackNavigator();

const RootStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerTintColor: tertiary,
          headerTransparent: true,
          headerTitle: "",
          headerLeftContainerStyle: {
            paddingLeft: 20,
          },
        }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Game" component={Game} />
        <Stack.Screen name="Verified" component={Verified} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;
