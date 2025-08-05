import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useContext } from "react";
import { CreateContext } from "@/context/Context";

const GameCardIntro = () => {
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");
  const { setCurrentOnboardingScreen } = useContext(CreateContext).onboarding;

  const SELECTION_BACKGROUND =
    "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeiaqhe26zritbjrhf7vaocixy22ep2ejxx6rawqlonjlqskywqcobu";

  return (
    <View className="flex-1 h-full w-full flex justify-end items-end">
      <ImageBackground
        source={{
          uri: "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeiaqhe26zritbjrhf7vaocixy22ep2ejxx6rawqlonjlqskywqcobu",
        }}
        resizeMode="cover"
        className="w-full flex-1 z-40"
        style={{
          height: SCREEN_HEIGHT * 1.3, // Use style prop for dynamic height
          width: "100%",
        }}
      >
        <View className="flex-1 justify-end">
          <View
            className="bg-[#663200] border-t-4 border-[#CA7422] w-full flex flex-row px-8"
            style={{
              height: 100,
              overflow: "visible", // Allow content to overflow
            }}
          >
            <View
              className="w-[20%] relative"
              style={{ overflow: "visible" }} // Also allow overflow on the image container
            >
              <Image
                source={{
                  uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753436774/Mask_group_ilokc7.png",
                }}
                className="w-[150px] h-[220px] relative z-20"
                style={{
                  position: "absolute",
                  top: -70, // Move the image up to stick out more
                  left: 0,
                }}
              />
            </View>
            <View className="flex-1 pt-2">
              <TouchableOpacity
                className="w-20 p-1 bg-[#CA7422] rounded-[20px]"
                style={{ marginTop: -20 }}
              >
                <Text className="text-white text-xs text-center font-bold">
                  ORACLE
                </Text>
              </TouchableOpacity>
              <Text className="text-white text-sm mt-1">
                Welcome, Alex. Before we begin, let me explain what lies
                ahead...
              </Text>
              <Text className="text-white text-sm">
                Your journey begins with forging your Sacred Game Card...
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setCurrentOnboardingScreen("game-card-carousel")}
              style={{ marginTop: -25 }}
            >
              <Text className="text-[#CA7422] font-semibold">Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default GameCardIntro;
