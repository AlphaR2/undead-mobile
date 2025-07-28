import React, { useState, useContext } from "react";
import { CreateContext } from "@/Context/Context";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  PanResponder,
  ImageBackground,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface Character {
  id: string;
  name: string;
  statRange: string;
  description: string;
  combatStyle: string;
  image: string;
}

const characters: Character[] = [
  {
    id: "2",
    name: "ORACLE",
    description: "Mystical warrior with a Mega brain, lineage of Satoshi",
    combatStyle: "High knowledge, moderate combat skills",
    statRange: "High KNOW, Moderate ATK/DEF",
    image:
      "https://res.cloudinary.com/deensvquc/image/upload/v1753652714/Subtract_2_r9qtjm.png",
  },
  {
    id: "3",
    name: "MYSTRAL",
    description: "Mystical warrior with a Mega brain, lineage of Satoshi",
    combatStyle: "High knowledge, moderate combat skills",
    statRange: "High KNOW, Moderate ATK/DEF",
    image:
      "https://res.cloudinary.com/deensvquc/image/upload/v1753652714/Subtract_1_zdw1kc.png",
  },
];

const GameCardCarousel: React.FC = () => {
  const { currentOnboardingScreen, setCurrentOnboardingScreen } =
    useContext(CreateContext).onboarding;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : characters.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < characters.length - 1 ? prev + 1 : 0));
  };

  const handleConfirm = () => {
    const selectedCharacter = characters[currentIndex];
    setCurrentOnboardingScreen("warrior-setup");
    console.log("Selected character:", selectedCharacter.name);
  };

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes
      return (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > 10
      );
    },
    onPanResponderRelease: (evt, gestureState) => {
      const swipeThreshold = 50;

      if (gestureState.dx > swipeThreshold) {
        // Swipe right - go to previous character
        handlePrevious();
      } else if (gestureState.dx < -swipeThreshold) {
        // Swipe left - go to next character
        handleNext();
      }
    },
  });

  const getVisibleCharacters = () => {
    const visibleChars = [];

    // Previous character (left side, smaller, darker)
    const prevIndex =
      currentIndex > 0 ? currentIndex - 1 : characters.length - 1;
    visibleChars.push({
      character: characters[prevIndex],
      index: prevIndex,
      isActive: false,
    });

    // Current character (right side, larger, active)
    visibleChars.push({
      character: characters[currentIndex],
      index: currentIndex,
      isActive: true,
    });

    return visibleChars;
  };

  const currentCharacter = characters[currentIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View className="h-[10%] w-full rounded-lg mt-1 flex flex-row gap-x-2 items-center text-wrap px-1 bg-[#CA742226]">
        <Image
          source={{
            uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753436774/Mask_group_ilokc7.png",
          }}
          resizeMode="contain"
          className=" h-full w-[5%]"
        />

        <Text className="text-sm font-light text-wrap text-clip w-[85%]">
          In this realm, your essence must be captured in a Sacred Game Card - a
          magical artifact that proves your identity and holds your power.
        </Text>
      </View>

      <View style={styles.mainContent} className="mt-[50px] border-red-300 ">
        {/* Left Side - Character Carousel */}
        <View style={styles.charactersSection} className="w-[65%]">
          {/* Navigation Arrows */}
          <TouchableOpacity
            style={[styles.navButton, styles.leftArrow]}
            className="mt-28"
            onPress={handlePrevious}
          >
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>

          {/* Characters Container */}
          <View
            style={styles.charactersContainer}
            {...panResponder.panHandlers}
            className="items-start"
          >
            {getVisibleCharacters().map(({ character, index, isActive }) => (
              <View
                key={character.id}
                style={[
                  styles.characterWrapper,
                  isActive ? styles.activeCharacter : styles.inactiveCharacter,
                ]}
                className="overflow-visible"
              >
                <Image
                  source={{ uri: character.image }}
                  style={[
                    styles.characterImage,
                    isActive ? styles.activeImage : styles.inactiveImage,
                  ]}
                  resizeMode="contain"
                  className="overflow-visible"
                />
                <TouchableOpacity
                  className={`${isActive ? "flex" : "hidden"}  relative  z-40  mt-[-60px] `}
                  onPress={handleConfirm}
                >
                  <ImageBackground
                    source={{
                      uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753433285/Frame_4_ppu88h.png",
                    }}
                    className="absolute z-40  mt-[-40px] opacity-20 h-[200px] w-[200px]"
                    resizeMode="contain"
                  >
                    <Text className="  py-2 px-8 text-white  z-40 relative">
                      Confirm
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.navButton, styles.rightArrow]}
            onPress={handleNext}
            className="mt-28"
          >
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Right Side - Character Info Card */}
        <View className="ml-auto w-[30%]">
          <ImageBackground
            source={{
              uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753427362/Group_1_khuulp.png",
            }}
            // style={styles.background}
            className=""
            resizeMode="contain"
          >
            <View style={styles.infoCard}>
              <Text style={styles.characterName}>{currentCharacter.name}</Text>
              <Text className="text-sm text-white font-light">
                {currentCharacter.description}
              </Text>

              <View>
                <Text className="text-white font-medium">Combat Style:</Text>
                <Text className="text-sm flex flex-col text-white font-light">
                  {currentCharacter.description}
                </Text>
              </View>

              <View>
                <Text className="text-white font-medium">Stat Range:</Text>
                <Text className="text-sm flex flex-col text-white font-light">
                  {currentCharacter.statRange}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
        <View></View>
      </View>

      {/* Confirm Button */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#1a1a1a',
    // paddingTop: 60,
    // paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerText: {
    color: "#D4AF37",
    fontSize: 18,
    textAlign: "center",
    // marginBottom: 40,
    fontWeight: "500",
  },
  mainContent: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  charactersSection: {
    // flex: 0.6,
    flexDirection: "row",
    alignItems: "flex-start",
    height: "100%",
    justifyContent: "center",
  },
  leftArrow: {
    position: "absolute",
    left: 0,
    zIndex: 10,
  },
  rightArrow: {
    position: "absolute",
    right: 0,
    zIndex: 10,
  },
  navButton: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  navButtonText: {
    color: "#D4AF37",
    fontSize: 28,
    fontWeight: "bold",
  },
  charactersContainer: {
    flex: 1,
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "space-around",
    height: 400,
    paddingHorizontal: 20,
  },
  characterWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeCharacter: {
    // Current character styling
  },
  inactiveCharacter: {
    // Previous character styling
    opacity: 0.5,
  },
  characterImage: {
    // borderRadius: 15,
    // borderWidth: 2,
    // borderColor: "#D4AF37",
  },
  activeImage: {
    display: "flex",
    width: 150,
    height: 250,
    borderColor: "#D4AF37",
  },
  inactiveImage: {
    width: 120,
    height: 200,
    marginTop: 20,
    borderColor: "rgba(212, 175, 55, 0.5)",
  },

  infoCard: {
    // backgroundColor: "rgba(139, 69, 19, 0.95)",
    // borderRadius: 15,
    padding: 30,
    // borderWidth: 3,
    minWidth: "100%",
    minHeight: 250,
    justifyContent: "space-between",
    // Custom border styling to match the ornate look
    // shadowColor: "#D4AF37",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  characterName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characterTitle: {
    color: "#D4AF37",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  characterDescription: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 10,
    textAlign: "left",
    marginBottom: 20,
    fontStyle: "italic",
  },
  recommendedSection: {
    marginTop: "auto",
  },
  recommendedLabel: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  recommendedText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#CD853F",
    borderRadius: 8,
    // paddingVertical: 15,
    // paddingHorizontal: 40,
    alignSelf: "center",
    // marginTop: 30,
    display: "absolute",
    borderWidth: 2,
    borderColor: "#D4AF37",
    minWidth: 120,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});

export default GameCardCarousel;
