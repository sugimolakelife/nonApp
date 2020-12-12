import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
//Screens.tsでまとめたものをimport
import {
  ProfileScreen,
  ProfileEditScreen,
  AddScreen,
  HomeScreen,
  SigninScreen,
  SignupScreen,
} from "./src/Screens/Screens";
import "./src/Fire";

import { Provider } from "react-redux";
import { createAppContainer } from "react-navigation";


const Stack = createStackNavigator<RootStackParamList>();

export default function App() {

  
  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName="SignIn">
          <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} />
          <Stack.Screen
            name="Edit"
            component={ProfileEditScreen}
            //上の表示を消すやつ
            //options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            //options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Add"
            component={AddScreen}
            //options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignIn"
            component={SigninScreen}
            //options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignupScreen}
            //options={{ headerShown: false }}
          />
        </Stack.Navigator>
    </NavigationContainer>
  );
}
