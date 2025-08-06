import { WalletSelectionModal } from "@/components/modal/Walletselectionmodal";
import { toast } from "@/components/ui/Toast";
import { GameFonts } from "@/constants/GameFonts";
import { useDynamic } from "@/context/wallet";
import { useMWA } from "@/context/mwa";
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
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Contexts
  const dynamicClient = useDynamic();
  const mwa = useMWA();

  // Check if any wallet is already connected
  const isAnyWalletConnected = 
    dynamicClient.auth.authenticatedUser?.email || 
    mwa.isConnected;

  // Memoize event handlers for Dynamic wallet
  const handleAuthInit = useCallback(() => {
    console.log("Dynamic authentication started");
    toast.info(
      "Connecting to Realm",
      "Establishing your connection to the undead realm..."
    );
  }, []);

  const handleAuthSuccess = useCallback(
    (user: any) => {
      console.log("Dynamic authentication successful:", user);
      setIsConnecting(false);
      setShowWalletModal(false);

      toast.success(
        "Welcome to Rust Undead!",
        "Your journey into the undead realm begins now!"
      );

      // Navigate after showing success message
      setTimeout(() => {
        router.replace("/guide");
      }, 3000);
    },
    []
  );

  const handleAuthFailed = useCallback(
    (error: any) => {
      console.log("Dynamic authentication failed:", error);
      setIsConnecting(false);

      toast.error(
        "Authentication Failed",
        "The realm gates remain closed. Try again or enter as a guest."
      );
    },
    []
  );

  const handleAuthFlowCancelled = useCallback(() => {
    console.log("Dynamic authentication flow cancelled");
    setIsConnecting(false);

    toast.warning(
      "Authentication Cancelled",
      "You cancelled the connection. You can try again or continue as guest."
    );
  }, []);

  const handleAuthFlowClosed = useCallback(() => {
    console.log("Dynamic authentication flow closed");
    setIsConnecting(false);
  }, []);

  const handleAuthFlowOpened = useCallback(() => {
    console.log("Dynamic authentication flow opened");
    toast.info(
      "Realm Portal Opening",
      "Choose your preferred method to enter the undead realm."
    );
  }, []);

  useEffect(() => {
    StatusBar.setHidden(true);

    // Check if user is already authenticated with either wallet type
    if (isAnyWalletConnected) {
      const walletType = mwa.isConnected ? 'MWA wallet' : 'Dynamic wallet';
      
      toast.success(
        "Welcome Back, Warrior!",
        `Returning to your undead realm with your ${walletType}...`
      );

      setTimeout(() => {
        router.replace("/guide");
      }, 2000);
      return;
    }

    // Add Dynamic event listeners
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

      // Clean up Dynamic event listeners
      dynamicClient.auth.off("authInit", handleAuthInit);
      dynamicClient.auth.off("authSuccess", handleAuthSuccess);
      dynamicClient.auth.off("authFailed", handleAuthFailed);
      dynamicClient.ui.off("authFlowCancelled", handleAuthFlowCancelled);
      dynamicClient.ui.off("authFlowClosed", handleAuthFlowClosed);
      dynamicClient.ui.off("authFlowOpened", handleAuthFlowOpened);
    };
  }, [
    dynamicClient,
    isAnyWalletConnected,
    mwa.isConnected,
    handleAuthInit,
    handleAuthSuccess,
    handleAuthFailed,
    handleAuthFlowCancelled,
    handleAuthFlowClosed,
    handleAuthFlowOpened,
  ]);

  // Handle MWA connection success
  useEffect(() => {
    if (mwa.isConnected && mwa.wallet) {
      setIsConnecting(false);
      setShowWalletModal(false);
      
      toast.success(
        "MWA Wallet Connected!",
        `Connected to ${mwa.wallet.label || 'Solana wallet'}`
      );

      setTimeout(() => {
        router.replace("/guide");
      }, 2000);
    }
  }, [mwa.isConnected, mwa.wallet]);

  // Handle MWA connection errors
  useEffect(() => {
    if (mwa.error) {
      setIsConnecting(false);
      toast.error(
        "Wallet Connection Failed",
        mwa.error
      );
    }
  }, [mwa.error]);

  const onContinue = () => {
    setShowWalletModal(true);
  };

  const onSkipAuth = useCallback(() => {
    toast.info(
      "Entering as Guest",
      "Welcome, anonymous traveler. Your progress won't be saved."
    );

    setTimeout(() => {
      router.push("/guide");
    }, 2000);
  }, []);

  const handleWalletConnected = useCallback((walletType: 'dynamic' | 'mwa') => {
    setIsConnecting(true);
    
    if (walletType === 'dynamic') {
      // Dynamic connection is handled by the modal itself
      // The actual connection happens when Dynamic auth flow completes
      toast.info(
        "Opening Dynamic Portal",
        "Choose your login method to create your embedded wallet..."
      );
    } else if (walletType === 'mwa') {
      // MWA connection is handled by the modal's MWA hook
      // Success/error handling is done in useEffect above
      toast.info(
        "Connecting to Wallet",
        "Please approve the connection in your wallet app..."
      );
    }
  }, []);

  const handleCloseWalletModal = useCallback(() => {
    setShowWalletModal(false);
    setIsConnecting(false);
  }, []);

  const onButtonPressIn = () => {
    if (isConnecting) return;

    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onButtonPressOut = () => {
    if (isConnecting) return;

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
                isConnecting && styles.disabledButton,
              ]}
              onPress={onContinue}
              onPressIn={onButtonPressIn}
              onPressOut={onButtonPressOut}
              activeOpacity={0.85}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#cd7f32" />
                  <Text
                    style={[
                      styles.buttonText,
                      GameFonts.button,
                      styles.loadingText,
                    ]}
                  >
                    CONNECTING...
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
              disabled={isConnecting}
            >
              <Text style={[styles.guestButtonText, GameFonts.epic]}>
                Continue as Guest
              </Text>
            </TouchableOpacity>
            
            {/* Connection Status Indicator */}
            {(mwa.isCheckingWallets || mwa.isConnecting) && (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="small" color="#cd7f32" />
                <Text style={[styles.statusText, GameFonts.caption]}>
                  {mwa.isCheckingWallets ? 'Checking wallets...' : 'Connecting...'}
                </Text>
              </View>
            )}
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>

      {/* Wallet Selection Modal */}
      <WalletSelectionModal
        visible={showWalletModal}
        onClose={handleCloseWalletModal}
        onWalletConnected={handleWalletConnected}
      />
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusText: {
    color: "#666",
    marginLeft: 8,
    fontSize: 12,
  },
});

export default Intro;