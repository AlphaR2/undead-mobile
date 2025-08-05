import { CreateContext } from "@/Context/Context";
import ChooseName from "@/components/ChooseName";
import GameCardCarousel from "@/components/GameCard/GameCardCarousel";
import GameCardIntro from "@/components/GameCard/Intro";
import CharacterCarousel from "@/components/GuideCarousel";
import PersonaSelectionScreen from "@/components/Persona";
import WarriorProfileSetup from "@/components/warrior/WarriorProfileSetup";
import { GameFonts } from "@/constants/GameFonts";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
//bg
const WELCOME_BACKGROUND =
  "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeie3ioopzpq2s5z45csnm4comlrhjxzziislwxyfawz5cjzdh6smx4";

const SELECTION_BACKGROUND =
  "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeiaqhe26zritbjrhf7vaocixy22ep2ejxx6rawqlonjlqskywqcobu";

// Guide data
const GUIDES = [
  {
    id: 1,
    name: "JANUS THE BUILDER",
    title: "Validator Master",
    type: "Balanced",
    description:
      "I am Janus, Master of the Foundation. I build the very bedrock upon which this realm stands. Through me, you'll understand how consensus creates unshakeable truth.",
    specialty: "Validators, consensus, foundation concepts",
    recommendedFor: "Complete beginners who want solid fundamentals",
    learningStyle: "Step-by-step, methodical building of knowledge",
    color: "#cd7f32",
  },
  {
    id: 2,
    name: "JACOB THE ORACLE",
    title: "Knowledge Keeper",
    type: "Advanced",
    description:
      "I am Jacob, Keeper of Ancient Wisdom. The deepest secrets of this realm flow through my consciousness like rivers of pure knowledge.",
    specialty: "Advanced concepts, technical deep-dives, ecosystem insights",
    recommendedFor:
      "Technical backgrounds who want comprehensive understanding",
    learningStyle:
      "Mystical wisdom, interconnected learning, big picture thinking",
    color: "#4169E1",
  },
  {
    id: 3,
    name: "GUILLAUME THE GUARDIAN",
    title: "Protector of Assets",
    type: "Security",
    description:
      "I am Guillaume, Shield of the Realm. I guard against the dark forces that would steal your digital treasures and corrupt your transactions.",
    specialty: "Security, wallets, protection strategies, best practices",
    recommendedFor: "Security-conscious learners who want to stay safe",
    learningStyle: "Protective approach, risk awareness, practical safety",
    color: "#228B22",
  },
  {
    id: 4,
    name: "BRIM THE DAEMON",
    title: "Code Compiler",
    type: "Technical",
    description:
      "I am Brim, Flame of Efficiency. I transform raw code into blazing reality and optimize every process until it burns with perfect precision.",
    specialty: "Technical implementation, smart contracts, development",
    recommendedFor: "Developers and power users who want to build",
    learningStyle:
      "Aggressive optimization, technical precision, implementation focus",
    color: "#DC143C",
  },
];

const GuideSelection = () => {
  const { currentOnboardingScreen, setCurrentOnboardingScreen } =
    useContext(CreateContext).onboarding;

  console.log(currentOnboardingScreen);
  const [selectedGuide, setSelectedGuide] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [textDelayAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    StatusBar.setHidden(true);
    startWelcomeAnimation();
    return () => StatusBar.setHidden(false);
  }, []);

  useEffect(() => {
    if (currentOnboardingScreen === "selection") {
      startSelectionAnimation();
    }
  }, [currentOnboardingScreen]);

  const startWelcomeAnimation = () => {
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
    textDelayAnim.setValue(0);

    // Delay text by 5 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textDelayAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);
  };

  const startSelectionAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    setCurrentOnboardingScreen("selection");
  };

  const handleGuideSelect = (index: number) => {
    setSelectedGuide(index);
  };

  const handleConfirm = () => {
    router.push(`/warrior-creation?guide=${GUIDES[selectedGuide].id}`);
  };

  const renderWelcomeScreen = () => (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={{ uri: WELCOME_BACKGROUND }}
        style={styles.backgroundImage}
        resizeMode="contain"
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.content}>
          <View style={styles.welcomeWrapper}>
            <Animated.View
              style={[
                styles.welcomeContainer,
                {
                  opacity: textDelayAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.titleContainer}>
                <Text style={[styles.welcomeTitle, GameFonts.epic]}>
                  CHOOSE YOUR GUIDE
                </Text>
                <View style={styles.titleUnderline} />
              </View>

              <View style={styles.welcomeTextContainer}>
                <Text style={[styles.welcomeText, GameFonts.bodyMedium]}>
                  Four legendary undead masters await to guide you through the
                  mysteries of blockchain.
                </Text>
              </View>
            </Animated.View>

            <Animated.View
              style={[styles.buttonContainer, { opacity: textDelayAnim }]}
            >
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={[styles.buttonText, GameFonts.button]}>
                  MEET THE GUIDES
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );

  const renderGuideSelection = () => (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={{ uri: SELECTION_BACKGROUND }}
        style={styles.backgroundImage}
        resizeMode="contain"
      >
        <SafeAreaView style={styles.content}>
          <View className="flex-1  text-center">
            <Animated.View
              style={[
                styles.selectionHeader,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
              className="border border-red-400"
            >
              <Text className="text-center text-white">
                Select a tour guide
              </Text>
            </Animated.View>

            <CharacterCarousel />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
  const renderPersonaScreen = () => {
    return (
      <View style={styles.container}>
        <PersonaSelectionScreen />
      </View>
    );
  };

  const renderInputScreen = () => {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <ImageBackground
          source={{ uri: SELECTION_BACKGROUND }}
          style={styles.backgroundImage}
          resizeMode="contain"
          className=""
        >
          <SafeAreaView style={styles.content}>
            <Animated.View
              style={[
                styles.selectionHeader,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            ></Animated.View>

            <ChooseName />
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  };
  const renderGameCardIntroScreen = () => {
    return <GameCardIntro />;
  };
  const renderGameCardCarouselScreen = () => {
    return <GameCardCarousel />;
  };
  const renderWarriorProfileSetupScreen = () => {
    return (
      <ImageBackground
        source={{
          uri: "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeiaqhe26zritbjrhf7vaocixy22ep2ejxx6rawqlonjlqskywqcobu",
        }}
        resizeMode="cover"
        className="w-full  z-40"
        style={{
          height: SCREEN_HEIGHT * 1.3, // Use style prop for dynamic height
          width: "100%",
        }}
      >
        <View className="absolute inset-0 bg-black opacity-50"></View>
        <WarriorProfileSetup />
      </ImageBackground>
    );
  };

  return currentOnboardingScreen === "welcome"
    ? renderWelcomeScreen()
    : currentOnboardingScreen === "selection"
      ? renderGuideSelection()
      : currentOnboardingScreen === "persona"
        ? renderPersonaScreen()
        : currentOnboardingScreen === "name"
          ? renderInputScreen()
          : currentOnboardingScreen === "game-card-intro"
            ? renderGameCardIntroScreen()
            : currentOnboardingScreen === "game-card-carousel"
              ? renderGameCardCarouselScreen()
              : renderWarriorProfileSetupScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    width: "100%",
    height: SCREEN_HEIGHT * 1.3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 2,
  },

  // Welcome Screen Styles
  welcomeWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeContainer: {
    alignItems: "center",
    paddingHorizontal: 2,
    marginBottom: 30, // Reduced space between text and button
  },
  titleContainer: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 35,
    color: "#cd7f32",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  titleUnderline: {
    width: SCREEN_WIDTH * 0.8,
    height: 3,
    backgroundColor: "#cd7f32",
    marginTop: 15,
    shadowColor: "#cd7f32",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  welcomeTextContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: "#E0E0E0",
    textAlign: "center",
    lineHeight: 24,
  },

  // Selection Screen Styles
  selectionHeader: {
    alignItems: "center",
    paddingVertical: 5,
  },
  headerTitle: {
    fontSize: 24,
    color: "#E0E0E0",
    textAlign: "center",
  },
  selectionContent: {
    flex: 1,
  },
  carouselContainer: {
    height: 200,
    marginBottom: 20,
  },
  carousel: {
    flex: 1,
  },
  guideCard: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  guideAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    marginBottom: 20,
  },
  guideInitial: {
    fontSize: 48,
  },
  guideName: {
    fontSize: 18,
    color: "#E0E0E0",
    textAlign: "center",
  },

  // Details Panel
  detailsPanel: {
    flex: 1,
    paddingHorizontal: 10,
  },
  detailsCard: {
    backgroundColor: "rgba(205, 127, 50, 0.1)",
    borderWidth: 2,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 10,
    marginBottom: 20, // Space for button below
  },
  detailsTitle: {
    fontSize: 20,
    color: "#cd7f32",
    textAlign: "center",
    marginBottom: 5,
  },
  detailsType: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  detailsDescription: {
    fontSize: 14,
    color: "#E0E0E0",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    fontStyle: "italic",
  },
  detailsLabel: {
    fontSize: 14,
    color: "#cd7f32",
    marginBottom: 5,
  },
  detailsValue: {
    fontSize: 14,
    color: "#C0C0C0",
    lineHeight: 18,
  },

  // Buttons
  buttonContainer: {
    alignItems: "center",
    paddingVertical: 10, // Reduced padding
  },
  nextButton: {
    backgroundColor: "#121212",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#cd7f32",
    minWidth: 200,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#121212",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#cd7f32",
    textAlign: "center",
    letterSpacing: 1,
  },
});

export default GuideSelection;
