import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toast } from "@/components/ui/Toast";
// import { PrivyProvider } from "@privy-io/expo";
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
import { ThemeProvider } from "./providers/ThemeProvider";
import ContextProvider from "@/Context/Context";

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

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ContextProvider>
        <SafeAreaProvider>
          {/* <PrivyProvider
          appId={Constants.expoConfig?.extra?.privyAppId}
          clientId={Constants.expoConfig?.extra?.privyClientId}
        > */}
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
                <Stack.Screen name="intro" />
                <Stack.Screen name="guide" />
                <Stack.Screen name="warrior-creation" />
                {/* Main app tabs */}
                <Stack.Screen name="(tabs)" />
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
          {/* </PrivyProvider> */}
        </SafeAreaProvider>
      </ContextProvider>
    </GestureHandlerRootView>
  );
}
