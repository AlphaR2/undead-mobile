import { CreateContext } from "@/Context/Context";
import React, { useContext, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CharacterIntroductionProps {
  character?: {
    name: string;
    image: string;
    greeting: string;
  };
  onContinue?: (playerName: string) => void;
}

const ChooseName = () => {
  const player = {
    character: {
      name: "Valdor",
      image:
        "https://res.cloudinary.com/deensvquc/image/upload/v1753436774/Mask_group_ilokc7.png",
      greeting:
        "Greetings, traveler. I am Valdor, and I shall be your guide through the mysteries of Solana. But first, tell me - what shall I call you on this journey?",
    },
  };
  const [playerName, setPlayerName] = useState("");
  const { setCurrentOnboardingScreen } = useContext(CreateContext).onboarding;

  const handleContinue = () => {
    if (playerName.trim()) {
      setCurrentOnboardingScreen("game-card-intro");
      console.log("Player name:", playerName.trim());
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-8">
      {/* Centered Dialog Card */}
      <View className="w-full max-w-md">
        <ImageBackground
          source={{
            uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753443982/Subtract_udkdcx.png",
          }}
          resizeMode="contain"
          className="w-full"
        >
          {/* Dialog content */}
          <View className="min-h-96 gap-y-8 flex items-center justify-center px-6 py-8">
            {/* Character's greeting */}
            <Text className="text-white text-base leading-6 text-center">
              {player.character.greeting}
            </Text>

            {/* Name input section */}
            <View className="flex items-center gap-y-4 w-full">
              {/* Text input */}
              <ImageBackground
                source={{
                  uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446388/input-bg_vibbma.png",
                }}
                className="w-full"
                resizeMode="stretch"
              >
                <TextInput
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholder="Enter a name"
                  placeholderTextColor="#D4AF37"
                  className="w-full px-6 py-4 bg-transparent text-white text-center text-lg"
                  style={{
                    fontFamily: "System",
                    fontSize: 16,
                  }}
                  maxLength={20}
                />
              </ImageBackground>

              {/* Continue button */}
              <ImageBackground
                source={{
                  uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446242/button-bg_lwqals.png",
                }}
                className="w-48"
                resizeMode="stretch"
              >
                <TouchableOpacity
                  onPress={handleContinue}
                  disabled={!playerName.trim()}
                  className="px-8 py-4 items-center justify-center"
                >
                  <Text
                    className={`text-center font-bold text-lg ${
                      playerName.trim() ? "text-white" : "text-gray-300"
                    }`}
                  >
                    Continue
                  </Text>
                </TouchableOpacity>
              </ImageBackground>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

export default ChooseName;
