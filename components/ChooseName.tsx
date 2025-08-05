import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
import { CreateContext } from "@/Context/Context";

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
    // onContinue
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
    <View
      className={`flex-1 relative items-center justify-center max-h-${SCREEN_HEIGHT}`}
    >
      {/* Background */}
      <View className="flex-1">
        {/* Dark overlay */}

        {/* Main Content */}
        <View className="flex-1 flex-row items-start justify-between px-16  border-red-400">
          {/* Left Side - Character Image */}
          <View className="w-2/5 items-start flex h-full">
            <Image
              source={{ uri: player.character.image }}
              className="w-80 h-96 rounded-2xl  mt-28"
              resizeMode="contain"
            />
          </View>

          {/* Right Side - Dialog Box */}
          <View className="w-[60%] flex pl-8 py-auto  h-full px-4 items-end justify-end">
            {/* Ornate Dialog Box */}
            <View className="relative  h-full">
              {/* Main dialog container with ornate border effect */}
              <ImageBackground
                source={{
                  uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753443982/Subtract_udkdcx.png",
                }}
                resizeMode="contain"
                className="bg-amber-800 rounded-2xl border-4 border-yellow-500  h-full w-full relative"
              >
                {/* Corner decorations */}

                {/* Dialog content */}
                <View className="min-h-full gap-y-8 flex items-center justify-center p-8">
                  {/* Character's greeting */}
                  <Text className="text-white text-xs   text-center">
                    {player.character.greeting}
                  </Text>

                  {/* Name input section */}
                  <View className="flex items-center gap-y-2">
                    {/* Text input */}
                    <ImageBackground
                      source={{
                        uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446388/input-bg_vibbma.png",
                      }}
                    >
                      <TextInput
                        value={playerName}
                        onChangeText={setPlayerName}
                        placeholder="Enter a name"
                        placeholderTextColor="#D4AF37"
                        className="w-80 px-4 py-2 bg-transparent rounded-xl text-white text-center text-lg"
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
                    >
                      <TouchableOpacity
                        onPress={handleContinue}
                        disabled={!playerName.trim()}
                        className={`px-8 py-3 rounded-xl min-w-32 `}
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
        </View>
      </View>
    </View>
  );
};

export default ChooseName;
