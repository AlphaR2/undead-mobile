import "@getpara/react-native-wallet/shim";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toast } from "@/components/ui/Toast";
import { PrivyProvider } from "@privy-io/expo";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
// Theme provider
import ContextProvider from "@/Context/Context";
import { ThemeProvider } from "./providers/ThemeProvider";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Cinzel-Regular": require("../assets/fonts/Cinzel-Regular.ttf"),
    "Cinzel-SemiBold": require("../assets/fonts/Cinzel-SemiBold.ttf"),
    "Cinzel-Bold": require("../assets/fonts/Cinzel-Bold.ttf"),
    "Cinzel-Black": require("../assets/fonts/Cinzel-Black.ttf"),
    "Orbitron-Regular": require("../assets/fonts/Orbitron-Regular.ttf"),
    "Orbitron-Medium": require("../assets/fonts/Orbitron-Medium.ttf"),
    "Orbitron-Bold": require("../assets/fonts/Orbitron-Bold.ttf"),
    "Orbitron-Black": require("../assets/fonts/Orbitron-Black.ttf"),
    "MedievalSharp-Regular": require("../assets/fonts/MedievalSharp-Regular.ttf"),
    "UnifrakturCook-Bold": require("../assets/fonts/UnifrakturCook-Bold.ttf"),
  });

  // Get Privy configuration from environment variables
  const privyAppId =
    Constants.expoConfig?.extra?.privyAppId ||
    process.env.EXPO_PUBLIC_PRIVY_APP_ID;
  const privyClientId =
    Constants.expoConfig?.extra?.privyClientId ||
    process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID;

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Add error handling for missing Privy configuration
  useEffect(() => {
    if (!privyAppId) {
      console.error(
        "Privy App ID is missing. Please check your environment variables."
      );
    }
    if (!privyClientId) {
      console.error(
        "Privy Client ID is missing. Please check your environment variables."
      );
    }
  }, [privyAppId, privyClientId]);

  if (!fontsLoaded) {
    return null;
  }

  // Don't render if essential Privy config is missing
  if (!privyAppId || !privyClientId) {
    console.error("Missing required Privy configuration");
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ContextProvider>
        <SafeAreaProvider>
          <PrivyProvider
            appId={privyAppId}
            clientId={privyClientId}
            config={{
              embedded: {
                solana: {
                  createOnLogin: "users-without-wallets",
                },
              },
            }}
          >
            <ThemeProvider>
              <ErrorBoundary>
                <Stack screenOptions={{ headerShown: false }}>
                  {/* Splash screen (entry point) */}
                  <Stack.Screen
                    name="index"
                    options={{
                      gestureEnabled: false,
                      animation: "none",
                    }}
                  />
                  {/* Onboarding flow */}
                  <Stack.Screen
                    name="trailer"
                    options={{
                      gestureEnabled: false,
                      animation: "fade",
                      presentation: "fullScreenModal",
                    }}
                  />
                  <Stack.Screen
                    name="intro"
                    options={{
                      animation: "slide_from_right",
                    }}
                  />
                  <Stack.Screen
                    name="guide"
                    options={{
                      animation: "slide_from_right",
                    }}
                  />
                  <Stack.Screen
                    name="warrior-creation"
                    options={{
                      animation: "slide_from_right",
                    }}
                  />
                  {/* Main app tabs */}
                  <Stack.Screen
                    name="(tabs)"
                    options={{
                      animation: "fade",
                    }}
                  />
                  {/* 404 page */}
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar
                  style="light"
                  backgroundColor="#000000"
                  translucent={false}
                />

                {/* Global toast notifications */}
                <Toast />
              </ErrorBoundary>
            </ThemeProvider>
          </PrivyProvider>
        </SafeAreaProvider>
      </ContextProvider>
    </GestureHandlerRootView>
  );
}
