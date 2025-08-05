import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";

const WarriorProfileSetup = () => {
  const router = useRouter();
  const [warriorName, setWarriorName] = useState("");
  const [newWarriorDNA, setNewWarriorDNA] = useState<string>("");
  const generateRandomDNA = (): string => {
    const chars = "0123456789ABCDEF";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  return (
    <View className="flex-1 px-5">
      <View className="h-[10%] w-full rounded-lg mt-1 flex flex-row gap-x-2 items-center text-wrap px-1 bg-[#CA742226]">
        <Image
          source={{
            uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753436774/Mask_group_ilokc7.png",
          }}
          resizeMode="contain"
          className=" h-full w-[5%]"
        />

        <Text className="text-sm font-light text-white text-wrap text-clip w-[85%]">
          In this realm, your essence must be captured in a Sacred Game Card - a
          magical artifact that proves your identity and holds your power.
        </Text>
      </View>
      <View className="flex flex-row w-full gap-x-4 ">
        <View className=" w-[60%] flex flex-row justify-start items-center px-4 gap-x-4">
          <Image
            source={{
              uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753652714/Subtract_1_zdw1kc.png",
            }}
            resizeMode="contain"
            className="w-[40%] h-[70%] "
          />
          <View>
            <View className="flex gap-y-2">
              {/* Text input */}
              <View>
                <Text className="text-start text-white">Warrior Name</Text>

                <ImageBackground
                  source={{
                    uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446388/input-bg_vibbma.png",
                  }}
                  resizeMode="contain"
                >
                  <TextInput
                    value={warriorName}
                    onChangeText={setWarriorName}
                    placeholder="Enter a name"
                    placeholderTextColor="#D4AF37"
                    className="w-60  py-2 bg-transparent rounded-xl text-white text-center text-lg"
                    style={{
                      fontFamily: "System",
                      fontSize: 16,
                    }}
                    maxLength={20}
                  />
                </ImageBackground>
              </View>
              <View>
                <Text className="text-start text-white">
                  Unique DNA (click dice to randomize)
                </Text>
                <View className="flex flex-row items-center">
                  <ImageBackground
                    source={{
                      uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446388/input-bg_vibbma.png",
                    }}
                    className="flex flex-row"
                    resizeMode="contain"
                  >
                    <TextInput
                      value={newWarriorDNA}
                      onChangeText={setNewWarriorDNA}
                      placeholder="Enter a name"
                      placeholderTextColor="#D4AF37"
                      className="w-60  py-2 bg-transparent rounded-xl text-white text-center text-lg"
                      style={{
                        fontFamily: "System",
                        fontSize: 16,
                      }}
                      maxLength={20}
                    />
                  </ImageBackground>
                  <TouchableOpacity
                    onPress={() => setNewWarriorDNA(generateRandomDNA())}
                    className=""
                  >
                    <Text className="">🎲</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Continue button */}
            <ImageBackground
              source={{
                uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446242/button-bg_lwqals.png",
              }}
              className="w-20 pt-4"
            >
              <TouchableOpacity
                onPress={() => {
                  (router.push("/dashboard"), console.log("pop"));
                }}
                // disabled={!warriorName.trim()}
                className={`px-8 py-3 rounded-xl w-full pt-4`}
              >
                <Text
                  className={`text-center font-bold text-lg ${
                    warriorName.trim() ? "text-white" : "text-gray-300"
                  }`}
                >
                  Continue
                </Text>
              </TouchableOpacity>
            </ImageBackground>
          </View>
        </View>
        <View className=" w-[40%] justify-center">
          <Image
            source={{
              uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753697038/Group_9_wmbgfk.png",
            }}
            resizeMode="contain"
            className="w-[80%] h-[80%]"
          />
        </View>
      </View>
    </View>
  );
};

export default WarriorProfileSetup;
