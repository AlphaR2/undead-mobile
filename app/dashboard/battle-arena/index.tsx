import CreateBattleRoomModal from "@/components/battle-room/CreateBattleRoomModal";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  primary?: boolean;
  gradient?: string;
  hoverGradient?: string;
}

const BattleArenaMobile = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMode, setSelectedMode] = useState(null);
  const [showCreateBattleRoomModal, setShowCreateBattleRoomModal] =
    useState(false);

  const playerStats = {
    name: "WarriorKing",
    level: 45,
    rank: "Steel Legion",
    tier: "S4",
    battles: 0,
    victories: 0,
    defeats: 0,
    winRate: "0%",
    points: 200,
    coins: 6840,
    gems: 13671,
  };

  const quickActions: QuickAction[] = [
    {
      id: "create-room",
      label: "Forge Battle",
      description: "Create your own arena and invite warriors",
      onClick: () => {
        router.push("/dashboard/battle-arena/create-room");
      },
      icon: () => (
        <MaterialCommunityIcons name="sword-cross" size={48} color="#cd7f32" />
      ),
      primary: true,
      gradient: "from-[#cd7f32] via-[#ff8c42] to-[#ffa500]",
      hoverGradient: "from-[#ff8c42] via-[#ffa500] to-[#cd7f32]",
    },
    {
      id: "join-room",
      label: "Enter Battle",
      description: "Join an existing arena and prove your worth",
      onClick: () => {
        router.push("/dashboard/battle-arena/join-room");
      },
      icon: () => (
        <MaterialCommunityIcons name="shield" size={48} color="#cd7f32" />
      ),
      gradient: "from-[#4a5568] via-[#2d3748] to-[#1a202c]",
      hoverGradient: "from-[#2d3748] via-[#4a5568] to-[#718096]",
    },
  ];

  return (
    <View className="flex-1 bg-[#1a1a1a] w-full">
      {/* Top Status Bar */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-[#1a1a1a] border-b border-[#cd7f32]/20 ">
        <View className="flex-row items-center gap-x-2">
          <View className="w-10 h-10 rounded-full bg-[#cd7f32] items-center justify-center">
            <Ionicons name="flame" size={20} color="white" />
          </View>
          <View>
            <Text className="text-lg font-bold text-[#cd7f32]">
              BATTLE ARENA
            </Text>
            <Text className="text-xs text-gray-400">
              Warriors Online: 1,247
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-x-4">
          <View className="flex-row items-center gap-2 space-x-2 bg-yellow-600/20 px-3 py-1 rounded-full">
            <View className="w-3 h-3 bg-yellow-500 rounded-full" />
            <Text className="text-sm font-semibold text-white">
              {playerStats.coins.toLocaleString()}
            </Text>
          </View>
          <View className="flex-row items-center gap-2 space-x-2 bg-blue-600/20 px-3 py-1 rounded-full">
            <View className="w-3 h-3 bg-blue-500 rounded-full" />
            <Text className="text-sm font-semibold text-white">
              {playerStats.gems.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity>
            <AntDesign name="plus" size={24} color="#fb923c" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="w-full flex-row p-8">
        <View className="flex flex-row gap-4 mb-16 w-full">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.id}
                onPress={action.onClick}
                className="relative overflow-hidden bg-[#1a1a1a] border border-[#cd7f32]/30 rounded-lg p-8 w-[50%]"
                activeOpacity={0.8}
              >
                {/* Content */}
                <View className="flex flex-col items-center text-center space-y-4">
                  <View
                    className={`p-4 rounded-xl mb-4 ${
                      action.primary ? "bg-[#cd7f32]/10" : "bg-[#cd7f32]/10"
                    }`}
                  >
                    <Icon className="w-12 h-12 text-[#cd7f32]" />
                  </View>

                  <View className="w-full text-center">
                    <Text className="w-full text-center text-2xl font-black mb-2 text-[#cd7f32]">
                      {action.label}
                    </Text>
                    <Text className="w-full text-center text-sm text-gray-400 max-w-xs">
                      {action.description}
                    </Text>
                  </View>

                  <View className="flex flex-row items-center gap-2 mt-4 opacity-75">
                    <Text className="text-sm font-bold text-[#cd7f32]">
                      Enter Arena
                    </Text>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={14}
                      color={"#cd7f32"}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <CreateBattleRoomModal
        visible={showCreateBattleRoomModal}
        onClose={() => setShowCreateBattleRoomModal(false)}
      />
    </View>
  );
};

export default BattleArenaMobile;
