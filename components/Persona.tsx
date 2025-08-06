import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { CreateContext } from "@/context/Context";
// Types
enum UserPersona {
  TreasureHunter = "TreasureHunter",
  BoneSmith = "BoneSmith",
  ObsidianProphet = "ObsidianProphet",
  GraveBaron = "GraveBaron",
  Demeter = "Demeter",
  Collector = "Collector",
  CovenCaller = "CovenCaller",
  SeerOfAsh = "SeerOfAsh",
  Cerberus = "Cerberus",
}

interface PersonaInfo {
  title: string;
  icon: string;
  description: string;
  traits: string;
  color: string;
  glowColor: string;
}

// Data
const PERSONA_INFO: Record<UserPersona, PersonaInfo> = {
  [UserPersona.TreasureHunter]: {
    title: "Treasure Hunter",
    icon: "🏴‍☠️",
    description: "Spectator who watches and learns from the sidelines",
    traits: "Observant • Patient • Strategic",
    color: "from-amber-600 to-yellow-500",
    glowColor: "shadow-amber-500/30",
  },
  [UserPersona.BoneSmith]: {
    title: "Bone Smith",
    icon: "⚒️",
    description: "Builder and developer forging the future",
    traits: "Creative • Technical • Innovative",
    color: "from-blue-600 to-cyan-500",
    glowColor: "shadow-blue-500/30",
  },
  [UserPersona.ObsidianProphet]: {
    title: "Obsidian Prophet",
    icon: "🔮",
    description: "Ideologue spreading the blockchain vision",
    traits: "Visionary • Persuasive • Passionate",
    color: "from-purple-600 to-indigo-500",
    glowColor: "shadow-purple-500/30",
  },
  [UserPersona.GraveBaron]: {
    title: "Grave Baron",
    icon: "🏛️",
    description: "Institutional player with serious capital",
    traits: "Professional • Analytical • Influential",
    color: "from-gray-600 to-slate-500",
    glowColor: "shadow-gray-500/30",
  },
  [UserPersona.Demeter]: {
    title: "Demeter",
    icon: "🌾",
    description: "DeFi farmer cultivating yield across protocols",
    traits: "Strategic • Opportunistic • Calculating",
    color: "from-green-600 to-emerald-500",
    glowColor: "shadow-green-500/30",
  },
  [UserPersona.Collector]: {
    title: "Collector",
    icon: "💎",
    description: "NFT collector seeking rare digital artifacts",
    traits: "Discerning • Aesthetic • Passionate",
    color: "from-pink-600 to-rose-500",
    glowColor: "shadow-pink-500/30",
  },
  [UserPersona.CovenCaller]: {
    title: "Coven Caller",
    icon: "📢",
    description: "Key Opinion Leader influencing the masses",
    traits: "Charismatic • Connected • Influential",
    color: "from-orange-600 to-red-500",
    glowColor: "shadow-orange-500/30",
  },
  [UserPersona.SeerOfAsh]: {
    title: "Seer of Ash",
    icon: "📊",
    description: "Researcher and analyst diving deep into data",
    traits: "Analytical • Methodical • Insightful",
    color: "from-teal-600 to-cyan-500",
    glowColor: "shadow-teal-500/30",
  },
  [UserPersona.Cerberus]: {
    title: "Cerberus",
    icon: "🛡️",
    description: "Security guardian protecting the realm",
    traits: "Vigilant • Protective • Thorough",
    color: "from-red-600 to-crimson-500",
    glowColor: "shadow-red-500/30",
  },
};

// Helper function to convert Tailwind colors to React Native colors
const getGradientColors = (colorString: string): [string, string] => {
  const colorMap: Record<string, string> = {
    "amber-600": "#d97706",
    "yellow-500": "#eab308",
    "blue-600": "#2563eb",
    "cyan-500": "#06b6d4",
    "purple-600": "#9333ea",
    "indigo-500": "#6366f1",
    "gray-600": "#4b5563",
    "slate-500": "#64748b",
    "green-600": "#16a34a",
    "emerald-500": "#10b981",
    "pink-600": "#db2777",
    "rose-500": "#f43f5e",
    "orange-600": "#ea580c",
    "red-500": "#ef4444",
    "teal-600": "#0d9488",
    "red-600": "#dc2626",
    "crimson-500": "#dc143c",
  };

  const parts = colorString.split(" to-");
  const fromColor = parts[0].replace("from-", "");
  const toColor = parts[1];

  return [colorMap[fromColor] || "#6b7280", colorMap[toColor] || "#6b7280"];
};

const PersonaSelectionScreen: React.FC = () => {
  const {setCurrentOnboardingScreen} = useContext(CreateContext).onboarding
  const [selectedPersona, setSelectedPersona] = useState<UserPersona | null>(
    null
  );
  const { width, height } = Dimensions.get("window");

  const personas = Object.entries(PERSONA_INFO) as [UserPersona, PersonaInfo][];

  const handlePersonaSelect = (persona: UserPersona) => {
    setSelectedPersona(persona);
  };

  const handleConfirm = () => {
    if (selectedPersona) {
      setCurrentOnboardingScreen("name")
      // Handle persona selection confirmation
      console.log("Selected persona:", selectedPersona);
    }
  };

  const PersonaCard: React.FC<{
    persona: UserPersona;
    info: PersonaInfo;
    isSelected: boolean;
  }> = ({ persona, info, isSelected }) => {
    const [startColor] = getGradientColors(info.color);

    return (
      <TouchableOpacity
        onPress={() => handlePersonaSelect(persona)}
        className={`mb-2 px-3 py-3 rounded-lg transition-all duration-300 border ${
          isSelected
            ? "  border-[#cd7f32]"
            : "bg-[#1a1a1a] border border-gray-500"
        }`}
        style={{
          // backgroundColor: isSelected ? `${startColor}20` : undefined,
          // borderColor: isSelected ? `${startColor}80` : undefined,
          // shadowColor: isSelected ? startColor : 'transparent',
          // shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: isSelected ? 4 : 2,
        }}
      >
        <View className="flex-row items-center">
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{
              backgroundColor: `${startColor}30`,
              borderWidth: 1,
              borderColor: `${startColor}60`,
            }}
          >
            <Text className="text-lg">{info.icon}</Text>
          </View>
          <View className="flex-1">
            <Text
              className={`font-semibold text-sm ${
                isSelected ? "text-white" : "text-gray-400"
              }`}
            >
              {info.title}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={16} color={startColor} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

   const PreviewCard: React.FC<{ persona: UserPersona; info: PersonaInfo }> = ({
    persona,
    info,
  }) => {
    const [startColor, endColor] = getGradientColors(info.color);

    return (
      <View 
        className="rounded-2xl p-6 border border-[#cd7f32] ml-auto"
        style={{
          width: 340,
          height: 335,
          backgroundColor: "#1a1a1a", // BACKGROUND COLOR
        }}
      >
        <View className="items-center mb-4">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
            style={{
              shadowColor: startColor,
              // shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={[startColor, endColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 36 }}>{info.icon}</Text>
            </LinearGradient>
            
          </View>

          <Text className="text-white text-2xl font-bold text-center mb-2">
            {info.title}
          </Text>

          <Text className="text-gray-300 text-base text-center mb-4 leading-5">
            {info.description}
          </Text>

          <View className="bg-gray-800/50 rounded-xl p-3 mb-6 w-full">
            <Text className="text-gray-400 text-xs font-semibold mb-1 text-center">
              KEY TRAITS
            </Text>
            <Text className="text-white text-sm text-center font-medium">
              {info.traits}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          className="overflow-hidden rounded-xl"
        >

            <Text className="text-white text-base font-bold text-center bg-[#cd7f32] p-2">
              Choose This Persona
            </Text>
          {/* </LinearGradient> */}
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" />

      <View className="flex-1 flex-row p-6   pt-12">
        {/* Left Panel - Persona List */}
        <View style={{ width: width * 0.4 }} className="mr-4">
          <View className="mb-4">
            <Text className="text-white text-2xl font-bold mb-1">
              Choose Your Persona
            </Text>
            <Text className="text-gray-400 text-sm">
              Select the identity that best represents your Web3 journey
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {personas.map(([persona, info]) => (
              <PersonaCard
                key={persona}
                persona={persona}
                info={info}
                isSelected={selectedPersona === persona}
              />
            ))}
          </ScrollView>
        </View>

        {/* Right Panel - Preview */}
        <View className="flex-1 ">
          {selectedPersona ? (
            <PreviewCard
              persona={selectedPersona}
              info={PERSONA_INFO[selectedPersona]}
            />
          ) : (
            <View className="items-center justify-center bg-gray-900/30 rounded-2xl mt-20 border border-gray-700/30 border-dashed p-8 max-w-md mx-auto flex-1">
              <Ionicons name="person-outline" size={48} color="#6b7280" />
              <Text className="text-gray-400 text-lg font-medium mt-3 text-center">
                Select a persona to preview
              </Text>
              <Text className="text-gray-500 text-sm mt-2 text-center">
                Choose from the list to see detailed information
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default PersonaSelectionScreen;
