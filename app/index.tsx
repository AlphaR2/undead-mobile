import "react-native-crypto-js";
import "react-native-get-random-values";

import { router } from "expo-router";
import React, { useEffect } from "react";
import { Image, StatusBar, StyleSheet, View } from "react-native";

export default function SplashScreen() {
  useEffect(() => {
    // Navigate to trailer after 10 seconds
    const timer = setTimeout(() => {
      router.replace("/trailer");
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Splash Image */}
      <Image
        source={require("../assets/images/splash.png")}
        style={styles.splashImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  splashImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
  },
});
