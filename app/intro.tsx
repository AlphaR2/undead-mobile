import { useToast } from "@/components/modal/Toast";
import { GameFonts } from "@/constants/GameFonts";
import { useDynamic } from "@/Context/wallet";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const dynamicClient = useDynamic();
  const { showSuccess, showError, showInfo, showWarning, ToastComponent } =
    useToast();

  // Memoize event handlers to prevent infinite re-renders
  const handleAuthInit = useCallback(() => {
    console.log("Authentication started");
    showInfo(
      "Connecting to Realm",
      "Establishing your connection to the undead realm...",
      3000
    );
  }, [showInfo]);

  const handleAuthSuccess = useCallback(
    (user: any) => {
      console.log("Authentication successful:", user);
      setIsAuthenticating(false);

      showSuccess(
        "Welcome to Rust Undead!",
        "Your journey into the undead realm begins now!",
        3000
      );

      // Navigate after showing success message
      setTimeout(() => {
        router.replace("/guide");
      }, 3000);
    },
    [showSuccess]
  );

  const handleAuthFailed = useCallback(
    (error: any) => {
      console.log("Authentication failed:", error);
      setIsAuthenticating(false);

      showError(
        "Authentication Failed",
        "The realm gates remain closed. Try again or enter as a guest.",
        5000
      );
    },
    [showError]
  );

  const handleAuthFlowCancelled = useCallback(() => {
    console.log("Authentication flow cancelled");
    setIsAuthenticating(false);

    showWarning(
      "Authentication Cancelled",
      "You cancelled the connection. You can try again or continue as guest.",
      4000
    );
  }, [showWarning]);

  const handleAuthFlowClosed = useCallback(() => {
    console.log("Authentication flow closed");
    setIsAuthenticating(false);
  }, []);

  const handleAuthFlowOpened = useCallback(() => {
    console.log("Authentication flow opened");
    showInfo(
      "Realm Portal Opening",
      "Choose your preferred method to enter the undead realm.",
      3000
    );
  }, [showInfo]);

  useEffect(() => {
    StatusBar.setHidden(true);

    // Check if user is already authenticated
    if (dynamicClient.auth.authenticatedUser?.email) {
      // Show welcome back message and navigate
      showSuccess(
        "Welcome Back, Warrior!",
        "Returning to your undead realm...",
        2000
      );

      setTimeout(() => {
        router.replace("/guide");
      }, 2000);
      return;
    }

    // Add event listeners
    dynamicClient.auth.on("authInit", handleAuthInit);
    dynamicClient.auth.on("authSuccess", handleAuthSuccess);
    dynamicClient.auth.on("authFailed", handleAuthFailed);
    dynamicClient.ui.on("authFlowCancelled", handleAuthFlowCancelled);
    dynamicClient.ui.on("authFlowClosed", handleAuthFlowClosed);
    dynamicClient.ui.on("authFlowOpened", handleAuthFlowOpened);

    // Start animations
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

      // Clean up event listeners
      dynamicClient.auth.off("authInit", handleAuthInit);
      dynamicClient.auth.off("authSuccess", handleAuthSuccess);
      dynamicClient.auth.off("authFailed", handleAuthFailed);
      dynamicClient.ui.off("authFlowCancelled", handleAuthFlowCancelled);
      dynamicClient.ui.off("authFlowClosed", handleAuthFlowClosed);
      dynamicClient.ui.off("authFlowOpened", handleAuthFlowOpened);
    };
  }, [
    dynamicClient,
    handleAuthInit,
    handleAuthSuccess,
    handleAuthFailed,
    handleAuthFlowCancelled,
    handleAuthFlowClosed,
    handleAuthFlowOpened,
    showSuccess,
  ]);

  const onContinue = () => {
    triggerAuthentication();
  };

  const onSkipAuth = useCallback(() => {
    showInfo(
      "Entering as Guest",
      "Welcome, anonymous traveler. Your progress won't be saved.",
      3000
    );

    setTimeout(() => {
      router.push("/guide");
    }, 3000);
  }, [showInfo]);

  const triggerAuthentication = useCallback(async () => {
    try {
      setIsAuthenticating(true);

      // Use Dynamic's UI for authentication
      dynamicClient.ui.auth.show();
    } catch (error) {
      console.error("Failed to show Dynamic auth UI:", error);
      setIsAuthenticating(false);

      showError(
        "Portal Error",
        "Failed to open the realm portal. The ancient magic seems to be disrupted.",
        5000
      );
    }
  }, [dynamicClient, showError]);

  const onButtonPressIn = () => {
    if (isAuthenticating) return;

    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onButtonPressOut = () => {
    if (isAuthenticating) return;

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
              style={[
                styles.continueButton,
                isAuthenticating && styles.disabledButton,
              ]}
              onPress={onContinue}
              onPressIn={onButtonPressIn}
              onPressOut={onButtonPressOut}
              activeOpacity={0.85}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#cd7f32" />
                  <Text
                    style={[
                      styles.buttonText,
                      GameFonts.button,
                      styles.loadingText,
                    ]}
                  >
                    OPENING PORTAL...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, GameFonts.button]}>
                  BEGIN YOUR JOURNEY
                </Text>
              )}
            </TouchableOpacity>

            {/* Guest Mode Button */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={onSkipAuth}
              disabled={isAuthenticating}
            >
              <Text style={[styles.guestButtonText, GameFonts.epic]}>
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>

      {/* Custom Toast Modal */}
      <ToastComponent />
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
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cd7f32",
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 8,
  },
  guestButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  guestButtonText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});

export default Intro;
