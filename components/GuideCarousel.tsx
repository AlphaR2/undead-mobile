import { CreateContext } from "@/Context/Context";
import React, { useContext, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  recommendedFor: string;
  image?: string;
}

const characters: Character[] = [
  {
    id: "1",
    name: "JANUS THE BUILDER",
    title: "(Validator Master)",
    description:
      "I am Janus, Master of the Foundation. I build the very bedrock upon which this realm stands. Through me, you'll understand how consensus creates unshakeable truth.",
    recommendedFor: "Complete beginners",
  },
  {
    id: "2",
    name: "ORACLE MYSTRAL",
    title: "(Knowledge Specialist)",
    description:
      "I am Mystral, keeper of sacred knowledge. Through me, you'll learn the deepest secrets of this realm.",
    recommendedFor: "Intermediate users",
  },
  {
    id: "3",
    name: "GUARDIAN NEXUS",
    title: "(Combat Expert)",
    description:
      "I am Nexus, master of battle tactics. I will forge you into a formidable warrior of this digital realm.",
    recommendedFor: "Advanced users",
  },
  {
    id: "4",
    name: "BRIM THE DAEMON",
    title: "(Code Compiler)",
    description:
      "I am Brim, Flame of Efficiency. I transform raw code into blazing reality and optimize every process until it burns with perfect precision.",
    recommendedFor: "Developers",
  },
];

const CharacterSelection: React.FC = () => {
  const { currentOnboardingScreen, setCurrentOnboardingScreen } =
    useContext(CreateContext).onboarding;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleCharacterSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleConfirm = () => {
    const selectedCharacter = characters[selectedIndex];
    setCurrentOnboardingScreen("name");
    console.log("Selected character:", selectedCharacter.name);
  };

  const getCharacterIcon = (characterId: string) => {
    switch (characterId) {
      case "1":
        return "⚖️"; // Builder
      case "2":
        return "🔮"; // Oracle/Knowledge
      case "3":
        return "🛡️"; // Guardian/Combat
      case "4":
        return "⚡"; // Daemon
      default:
        return "⚡";
    }
  };

  return (
    <View style={styles.container}>
      {/* Character Cards Grid */}
      <View style={styles.cardsGrid}>
        {characters.map((character, index) => (
          <TouchableOpacity
            key={character.id}
            style={[
              styles.cardContainer,
              selectedIndex === index && styles.selectedCard,
            ]}
            onPress={() => handleCharacterSelect(index)}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.characterIcon}>
                  {getCharacterIcon(character.id)}
                </Text>
              </View>
              <Text style={styles.characterName}>{character.name}</Text>
              <Text style={styles.characterTitle}>{character.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Confirm Button */}
      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmButtonText}>CONFIRM SELECTION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  cardsGrid: {
    flexDirection: "row",
    // flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: 460,
    gap: 15,
  },
  cardContainer: {
    width: "42%",
    minWidth: 100,
    marginBottom: 20,
    opacity: 0.7,
    backgroundColor: "#CA742226",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 16,
  },
  selectedCard: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    backgroundColor: "#CA742290",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#CA742226",
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  characterIcon: {
    fontSize: 32,
  },
  characterName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characterTitle: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  confirmButtonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: "#121212",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#cd7f32",
    minWidth: 200,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#cd7f32",
    textAlign: "center",
    letterSpacing: 1,
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default CharacterSelection;
