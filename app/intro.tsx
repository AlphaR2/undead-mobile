import { GameFonts } from "@/constants/GameFonts";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BACKGROUND_IMAGE =
  "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeigrhentsbwqvi7rf5hfnxeduteggpiln6zq67rzubub6o5hyf46u4";

const Intro: React.FC = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [textPulse] = useState(new Animated.Value(1));
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    StatusBar.setHidden(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      startTextPulsing();
    });

    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  const onContinue = () => {
    router.push("/guide");
  };

  const onButtonPressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onButtonPressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const startTextPulsing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(textPulse, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(textPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={{ uri: BACKGROUND_IMAGE }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.content}>
          <Animated.View
            style={[
              styles.mainContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/log33.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.titleText, GameFonts.title]}>RUST UNDEAD</Text>

            <Animated.Text
              style={[
                styles.pulsingText,
                GameFonts.epic,
                {
                  transform: [{ scale: textPulse }],
                },
              ]}
            >
              JOURNEY TO THE UNDEAD!!
            </Animated.Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
              onPressIn={onButtonPressIn}
              onPressOut={onButtonPressOut}
              activeOpacity={0.85}
            >
              <Text style={[styles.buttonText, GameFonts.button]}>
                BEGIN YOUR JOURNEY
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: SCREEN_WIDTH * 4,
    height: 140,
    marginBottom: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  titleText: {
    fontSize: 55,
    fontWeight: "400",
    color: "#cd7f32",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pulsingText: {
    fontSize: 15,
    fontStyle: "italic",
    fontWeight: "600",
    color: "#cd7f32",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 5,
  },
  buttonContainer: {
    paddingBottom: 40,
    width: "100%",
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: "#121212",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#cd7f32",
    shadowColor: "#cd7f32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 220,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cd7f32",
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase",
  },
});

export default Intro;
