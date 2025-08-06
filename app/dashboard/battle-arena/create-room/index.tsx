// import { useGameData } from "@/hooks/useGameData";
// import { ImageRarity, Warrior, WarriorClass } from "@/types/undead";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// import { createBattleRoom } from "@/hooks/useGameActions";
// import {
//   usePDAs,
//   useUndeadProgram,
//   useWalletInfo,
// } from "@/hooks/useUndeadProgram";
// import { PublicKey } from "@solana/web3.js";
// import toast from "react-hot-toast";

interface RoomCreationProps {
  gameMode: string;
  setGameMode: React.Dispatch<React.SetStateAction<string>>;
}

const RoomCreation: React.FC = () => {
  const [selectedWarrior, setSelectedWarrior] = useState<Warrior | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewingWarrior, setViewingWarrior] = useState<Warrior | null>(null);
  const [conceptsData, setConceptsData] = useState<any[]>([]);
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);
  const [conceptsError, setConceptsError] = useState<string | null>(null);
  const [conceptsLoaded, setConceptsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  // const { userWarriors } = useGameData();
  const router = useRouter();

  /// hooks ////
  // const { publicKey, isConnected } = useWalletInfo();
  // const program = useUndeadProgram();
  // const { getWarriorPda } = usePDAs(publicKey);

  // Enhanced concept loading function with better UX
  const loadConcepts = async () => {
    if (isLoadingConcepts) return; // Prevent multiple simultaneous requests

    setIsLoadingConcepts(true);
    setConceptsError(null);
    setLoadingProgress("Initializing...");

    const isRetry = retryCount > 0;
    const estimatedTime = isRetry ? "15-45" : "30-60";

    // Show enhanced loading toast
    // toast.loading(
    //   `🚀 ${
    //     isRetry ? "Retrying..." : "Waking up server"
    //   }\n⏱️ This may take ${estimatedTime} seconds${
    //     isRetry ? " (retry " + retryCount + ")" : ""
    //   }`,
    //   {
    //     id: "load-concepts",
    //     duration: 60000, // 1 minute timeout for display
    //     style: {
    //       maxWidth: "500px",
    //     },
    //   }
    // );

    try {
      // console.log(
      //   `🔄 Loading concepts from server... (attempt ${retryCount + 1})`
      // );
      setLoadingProgress("Connecting to server...");

      // Create timeout promise
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 50000) // 50 second timeout
      );

      // Create fetch promise with progress updates
      const fetchPromise = fetch(
        `https://poynt-sever.onrender.com/api/v1/concept`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      ).then(async (response) => {
        setLoadingProgress("Server responded, processing data...");

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        return responseData;
      });

      // Race between fetch and timeout
      const responseData = await Promise.race([fetchPromise, timeoutPromise]);

      if (!responseData.data || !Array.isArray(responseData.data)) {
        throw new Error("Invalid response format from server");
      }

      if (responseData.data.length === 0) {
        throw new Error("No concepts returned from server");
      }

      // Success!
      setConceptsData(responseData.data);
      setConceptsLoaded(true);
      setConceptsError(null);
      setRetryCount(0); // Reset retry count on success
      setLoadingProgress("Complete!");

      // console.log("✅ Concepts loaded successfully:", responseData.data.length);

      // Show success toast with details
      // toast.success(
      //   ` Successfully loaded ${responseData.data.length} quiz concepts!\n Ready to create battle rooms`,
      //   {
      //     id: "load-concepts",
      //     duration: 4000,
      //     style: {
      //       maxWidth: "500px",
      //     },
      //   }
      // );
    } catch (error: any) {
      console.error("❌ Failed to load concepts:", error);
      setConceptsData([]);
      setConceptsLoaded(false);
      setRetryCount((prev) => prev + 1);

      let errorMessage = "Failed to load quiz concepts";
      let suggestion = "Please try again in a moment.";

      if (error.message === "TIMEOUT") {
        errorMessage = "Server is taking too long to respond";
        suggestion =
          "The server is likely sleeping. Try again - it should be faster now.";
      } else if (error.message.includes("500")) {
        errorMessage = "Server error occurred";
        suggestion =
          "The service may be restarting. Please wait a moment and try again.";
      } else if (
        error.message.includes("503") ||
        error.message.includes("502")
      ) {
        errorMessage = "Server is temporarily unavailable";
        suggestion =
          "The service is starting up. Please try again in a few seconds.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage = "Network connection issue";
        suggestion = "Check your internet connection and try again.";
      } else if (error.message.includes("Invalid response")) {
        errorMessage = "Server returned invalid data";
        suggestion = "There may be an issue with the API. Please try again.";
      }

      setConceptsError(errorMessage);
      setLoadingProgress("Failed");

      // toast.error(`❌ ${errorMessage}\n💡 ${suggestion}`, {
      //   id: "load-concepts",
      //   duration: 6000,
      //   style: {
      //     maxWidth: "500px",
      //   },
      // });
    } finally {
      setIsLoadingConcepts(false);
    }
  };

  // Show wallet connection status toasts
  // useEffect(() => {
  //   if (isConnected === false) {
  //     toast.error("Please connect your wallet to create battle rooms");
  //   } else if (isConnected === true && !conceptsLoaded) {
  //     toast.success("Wallet connected! Load concepts to create battle rooms.");
  //   }
  // }, [isConnected, conceptsLoaded]);

  // Enhanced concepts status component with better visual feedback
  const ConceptsStatus: React.FC = () => {
    if (isLoadingConcepts) {
      return (
        <View className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 relative overflow-hidden">
          {/* Animated background */}
          <View className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-blue-400/10 to-blue-500/5 animate-pulse"></View>

          <View className="relative">
            <View className="flex items-center gap-2 mb-3">
              {/* <Loader2 className="w-5 h-5 text-blue-400 animate-spin" /> */}
              <MaterialCommunityIcons
                name="loading"
                size={48}
                color="#cd7f32"
                lassName="w-5 h-5"
              />
              <Text className="text-blue-300 font-medium">
                Loading concepts...
              </Text>
              {retryCount > 0 && (
                <Text className="text-blue-200 text-sm">
                  (Retry {retryCount})
                </Text>
              )}
            </View>
            <View className="space-y-2">
              <Text className="text-blue-200 text-sm">{loadingProgress}</Text>
              <View className="flex items-center gap-2 text-xs text-blue-300">
                {/* <Clock className="w-3 h-3" /> */}
                <MaterialCommunityIcons
                  name="clock"
                  size={48}
                  color="#cd7f32"
                  className="w-3 h-3"
                />
                <Text>
                  Server may be sleeping - this can take 30-60 seconds
                </Text>
              </View>
              {retryCount > 0 && (
                <View className="flex items-center gap-2 text-xs text-blue-300">
                  {/* <RefreshCw className="w-3 h-3" /> */}
                  <MaterialCommunityIcons
                    name="refresh"
                    size={48}
                    color="#cd7f32"
                    lassName="w-3 h-3"
                  />
                  <Text>Subsequent attempts are usually faster</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    }

    if (conceptsLoaded) {
      return (
        <View className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 relative overflow-hidden">
          <View className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-green-400/10 to-green-500/5"></View>
          <View className="relative">
            <View className="flex items-center gap-2 mb-2">
              {/* <CheckCircle className="w-5 h-5 text-green-400" /> */}
              <MaterialCommunityIcons
                name="check-circle"
                size={14}
                color="#cd7f32"
                className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"
              />
              <Text className="text-green-300 font-medium">
                {conceptsData.length} concepts loaded!
              </Text>
            </View>
            <Text className="text-green-200 text-sm">
              Ready to create battle rooms
            </Text>
            <View className="flex items-center gap-2 text-xs text-green-300 mt-2">
              {/* <Zap className="w-3 h-3" /> */}
              <MaterialCommunityIcons
                name="play"
                size={24}
                color="#cd7f32"
                className="w-3 h-3"
              />
              <Text>
                Questions will be randomly selected during battle creation
              </Text>
            </View>
          </View>
        </View>
      );
    }

    if (conceptsError) {
      return (
        <View className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 relative">
          <View className="flex items-center gap-2 mb-2">
            {/* <AlertTriangle className="w-5 h-5 text-red-400" /> */}
            <MaterialCommunityIcons
              name="alert"
              size={48}
              color="#cd7f32"
              className="w-5 h-5 text-red-400"
            />
            <Text className="text-red-300 font-medium">
              Failed to load concepts
            </Text>
            {retryCount > 0 && (
              <Text className="text-red-200 text-sm">
                (Failed {retryCount} times)
              </Text>
            )}
          </View>
          <Text className="text-red-200 text-sm mb-3">{conceptsError}</Text>
          <View className="space-y-2">
            <TouchableOpacity
              onPress={loadConcepts}
              disabled={isLoadingConcepts}
              className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-2 w-full justify-center"
            >
              {/* <RefreshCw className="w-4 h-4" /> */}
              <MaterialCommunityIcons
                name="refresh"
                size={48}
                color="#cd7f32"
                lassName="w-4 h-4"
              />
              Try Again {retryCount > 0 ? `(${retryCount + 1})` : ""}
            </TouchableOpacity>
            {retryCount > 2 && (
              <View className="bg-red-500/10 rounded-lg p-2">
                <View className="flex items-start gap-2">
                  {/* <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /> */}
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={14}
                    color="#cd7f32"
                    className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"
                  />
                  <View className="text-xs text-red-300">
                    <Text className="font-medium mb-1">
                      Still having trouble?
                    </Text>
                    <View className="space-y-1 text-red-200">
                      <Text>• Server might be experiencing issues</Text>
                      <Text>• Check your internet connection</Text>
                      <Text>• Try again in a few minutes</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      );
    }

    // Default state - show load TouchableOpacity
    return (
      <View className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 relative overflow-hidden">
        <View className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5"></View>
        <View className="relative">
          <View className="flex items-center gap-2 mb-2">
            {/* <Server className="w-5 h-5 text-blue-400" /> */}
            <MaterialCommunityIcons
              name="server"
              size={48}
              color="text-blue-400"
              lassName="w-5 h-5"
            />
            <Text className="text-blue-300 font-medium">
              Battle concepts needed
            </Text>
          </View>
          <Text className="text-blue-200 text-sm mb-3">
            Load quiz concepts from server to create battle rooms
          </Text>
          <TouchableOpacity
            onPress={loadConcepts}
            disabled={isLoadingConcepts}
            className="bg-gradient-to-r from-[#cd7f32] to-[#ff8c42] text-black font-bold px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
          >
            {/* <Download className="w-4 h-4" /> */}
            <MaterialCommunityIcons
              name="download"
              size={48}
              color="#cd7f32"
              className="w-4 h-4"
            />
            <Text>Load Battle Concepts</Text>
          </TouchableOpacity>
          <View className="flex items-center gap-2 text-xs text-blue-300 mt-2">
            {/* <Wifi className="w-3 h-3" /> */}
            <MaterialCommunityIcons
              name="wifi"
              size={48}
              color="#cd7f32"
              className="w-3 h-3"
            />
            <Text>First load may take 30+ seconds if server is sleeping</Text>
          </View>
        </View>
      </View>
    );
  };

  // const generateRoomId = (): {
  //   battleRoomId: Uint8Array;
  //   displayId: string;
  //   battleRoomPda: PublicKey;
  // } => {
  //   if (!program?.programId) {
  //     throw new Error("Program not initialized");
  //   }

  //   const battleRoomId = crypto.getRandomValues(new Uint8Array(32));
  //   const displayId = btoa(String.fromCharCode(...battleRoomId))
  //     .replace(/[+/]/g, (c) => (c === "+" ? "-" : "_"))
  //     .replace(/=+$/, "");

  //   // Generate battle room PDA
  //   const pdaroomid = Array.from(battleRoomId);
  //   const [battleRoomPda] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("battleroom"), Buffer.from(pdaroomid)],
  //     program.programId
  //   );

  //   return { battleRoomId, displayId, battleRoomPda };
  // };

  // const handleCreateRoom = async () => {
  //   if (
  //     !selectedWarrior ||
  //     !publicKey ||
  //     !getWarriorPda ||
  //     !program ||
  //     !isConnected
  //   ) {
  //     console.error("Missing requirements:", {
  //       selectedWarrior: !!selectedWarrior,
  //       publicKey: !!publicKey,
  //       program: !!program,
  //       isConnected,
  //       getWarriorPda: !!getWarriorPda,
  //     });
  //     toast.error("Please ensure wallet is connected and warrior is selected");
  //     return;
  //   }

  //   if (!conceptsLoaded || conceptsData.length === 0) {
  //     toast.error(
  //       "⚠️ Please load battle concepts first by clicking 'Load Battle Concepts'"
  //     );
  //     return;
  //   }

  //   setIsCreating(true);
  //   toast.loading("🏗️ Creating battle room on blockchain...", {
  //     id: "create-room",
  //     duration: 10000,
  //   });

  //   try {
  //     const roomData = generateRoomId();
  //     const warriorPda = getWarriorPda(selectedWarrior.name.trim());

  //     // console.log("warrior pda:", warriorPda);

  //     // Generate quiz data from concepts
  //     const quizData = generateBattleQuiz(conceptsData);

  //     // console.log("Creating battle room with data:", {
  //     //   warrior: selectedWarrior.name,
  //     //   roomId: roomData.displayId,
  //     //   concepts: quizData.selectedConceptIds.length,
  //     //   topics: quizData.selectedTopicIds.length,
  //     //   questions: quizData.selectedQuestionIds.length,
  //     //   totalConceptsAvailable: conceptsData.length,
  //     // });

  //     // Use createBattleRoom function
  //     const result = await createBattleRoom({
  //       program,
  //       playerPublicKey: publicKey,
  //       warriorPda,
  //       battleRoomPda: roomData.battleRoomPda,
  //       roomId: roomData.battleRoomId,
  //       warriorName: selectedWarrior.name,
  //       selectedConcepts: quizData.selectedConceptIds,
  //       selectedTopics: quizData.selectedTopicIds,
  //       selectedQuestions: quizData.selectedQuestionIds,
  //       correctAnswers: quizData.correctAnswers,
  //     });

  //     if (result.success) {
  //       // console.log("✅ Battle room created successfully:", result.signature);
  //       toast.success(
  //         `🎉 Battle room created successfully!\n🏠 Room ID: ${roomData.displayId.slice(
  //           0,
  //           8
  //         )}...`,
  //         {
  //           id: "create-room",
  //           duration: 4000,
  //         }
  //       );

  //       // Store warrior info in sessionStorage for the lobby to access
  //       sessionStorage.setItem(
  //         "selectedWarrior",
  //         JSON.stringify(selectedWarrior)
  //       );

  //       // Navigate to the new shared lobby route
  //       // router.push(
  //       //   `/headquarters/battle-arena/lobby/${
  //       //     roomData.displayId
  //       //   }?battleRoom=${roomData.battleRoomPda.toString()}&creator=true`
  //       // );
  //     } else {
  //       console.error("❌ Failed to create battle room:", result.error);
  //       toast.error(`❌ ${result.error || "Failed to create battle room"}`, {
  //         id: "create-room",
  //         duration: 5000,
  //       });
  //     }
  //   } catch (error: any) {
  //     console.error("Error creating battle room:", error);
  //     toast.error(`❌ ${error.message || "Unknown error occurred"}`, {
  //       id: "create-room",
  //       duration: 5000,
  //     });
  //   } finally {
  //     setIsCreating(false);
  //   }
  // };

  // Rest of your helper functions remain the same...
  const getClassIcon = (warriorClass: WarriorClass | string | any) => {
    let classValue: string;
    if (typeof warriorClass === "object" && warriorClass !== null) {
      const keys = Object.keys(warriorClass);
      classValue = keys.length > 0 ? keys[0] : "unknown";
    } else {
      classValue = String(warriorClass || "unknown");
    }

    const classLower = classValue.toLowerCase();
    switch (classLower) {
      case "validator":
        return "⚖️ - validator";
      case "oracle":
        return "🔮 - oracle";
      case "guardian":
        return "🛡️ - guardian";
      case "daemon":
        return "⚔️ - daemon";
      default:
        return "💻";
    }
  };

  const getClassDescription = (warriorClass: WarriorClass | string | any) => {
    let classValue: string;
    if (typeof warriorClass === "object" && warriorClass !== null) {
      const keys = Object.keys(warriorClass);
      classValue = keys.length > 0 ? keys[0] : "unknown";
    } else {
      classValue = String(warriorClass || "unknown");
    }

    const classLower = classValue.toLowerCase();
    switch (classLower) {
      case "validator":
        return "Balanced fighter with steady performance";
      case "oracle":
        return "Knowledge specialist with high wisdom";
      case "guardian":
        return "Tank with exceptional defense";
      case "daemon":
        return "Glass cannon with devastating attacks";
      default:
        return "Mysterious warrior class";
    }
  };

  const getRarityString = (imageRarity: ImageRarity | any): string => {
    if (typeof imageRarity === "string") {
      return imageRarity;
    }
    if (typeof imageRarity === "object" && imageRarity !== null) {
      const keys = Object.keys(imageRarity);
      if (keys.length > 0) {
        const result = keys[0].charAt(0).toUpperCase() + keys[0].slice(1);
        return result;
      }
    }
    return "Common";
  };

  const safeToNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "object" && value.toNumber) {
      return value.toNumber();
    }
    return Number(value) || 0;
  };

  const getWarriorClassString = (
    warriorClass: WarriorClass | string | any
  ): string => {
    if (typeof warriorClass === "object" && warriorClass !== null) {
      const keys = Object.keys(warriorClass);
      const result = keys.length > 0 ? keys[0] : "unknown";
      return result;
    }
    const result = String(warriorClass || "unknown");
    return result;
  };

  const safeRenderString = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return String(value);
    if (typeof value === "object" && value !== null) {
      if (value.toNumber && typeof value.toNumber === "function") {
        return String(value.toNumber());
      }
      const keys = Object.keys(value);
      if (keys.length > 0) {
        const result = keys[0].charAt(0).toUpperCase() + keys[0].slice(1);
        return result;
      }
      console.warn("safeRenderString: Unexpected object structure:", value);
      return JSON.stringify(value);
    }
    const result = String(value);
    return result;
  };

  // Warrior Details Modal (keeping your existing implementation)
  const WarriorDetailsModal: React.FC<{ warrior: Warrior }> = ({ warrior }) => {
    const safeWarrior = {
      name: String(warrior?.name || "Unknown Warrior"),
      imageUri: String(warrior?.imageUri || ""),
      level: safeToNumber(warrior?.level),
      warriorClass: warrior?.warriorClass,
      baseAttack: safeToNumber(warrior?.baseAttack),
      baseDefense: safeToNumber(warrior?.baseDefense),
      baseKnowledge: safeToNumber(warrior?.baseKnowledge),
      currentHp: safeToNumber(warrior?.currentHp),
      battlesWon: safeToNumber(warrior?.battlesWon),
      battlesLost: safeToNumber(warrior?.battlesLost),
      experience: safeToNumber(warrior?.experiencePoints),
      dna: Array.isArray(warrior?.dna) ? warrior.dna : [],
      imageRarity: getRarityString(warrior?.imageRarity),
    };

    const totalBattles = safeWarrior.battlesWon + safeWarrior.battlesLost;
    let performanceRank = "Untested";
    if (totalBattles > 0) {
      const winRate = safeWarrior.battlesWon / totalBattles;
      if (winRate >= 0.7) performanceRank = "Elite Warrior";
      else if (winRate >= 0.5) performanceRank = "Veteran Fighter";
      else performanceRank = "Rising Challenger";
    }

    return (
      <View className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <View className="bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0f0f0f] border-2 border-[#cd7f32]/50 rounded-3xl p-8 w-full max-h-[90vh] shadow-2xl relative">
          <View className="absolute inset-0 bg-gradient-to-br from-[#cd7f32]/5 via-transparent to-[#ff8c42]/5 rounded-3xl" />

          <View className="relative">
            {/* Header */}
            <View className="flex flex-row items-center justify-between mb-8">
              <View className="flex flex-row items-center gap-4">
                <TouchableOpacity
                  onPress={() => setViewingWarrior(null)}
                  className="text-gray-400 hover:text-[#cd7f32] transition-colors p-2 hover:bg-[#cd7f32]/10 rounded-xl"
                >
                  {/* <ChevronLeft size={24} color="#cd7f32" /> */}
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={24}
                    color="#cd7f32"
                  />
                </TouchableOpacity>
                <Text className="text-3xl font-bold bg-gradient-to-r from-[#cd7f32] to-[#ff8c42] bg-clip-text text-transparent">
                  Warrior Details
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setViewingWarrior(null)}
                className="text-gray-400 hover:text-[#cd7f32] transition-colors p-3 hover:bg-[#cd7f32]/10 rounded-xl"
              >
                {/* <X size={24} color="#cd7f32" /> */}
                <MaterialCommunityIcons
                  name="cancel"
                  size={24}
                  color="#cd7f32"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: Dimensions.get("window").height * 0.8 }}
            >
              <View className="flex flex-col lg:flex-row gap-8">
                {/* Left: Warrior Image */}
                <View className="space-y-6 flex-1">
                  <View className="relative">
                    <Image
                      source={{ uri: safeRenderString(safeWarrior.imageUri) }}
                      alt={safeRenderString(safeWarrior.name)}
                      className="w-full h-80 rounded-2xl border-2 border-[#cd7f32]/30"
                      resizeMode="cover"
                    />
                    <View className="absolute top-4 right-4 bg-[#cd7f32]/90 px-3 py-1 rounded-full">
                      <Text className="text-black font-bold text-sm">
                        Level {safeWarrior.level}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right: Stats */}
                <View className="space-y-6 flex-1">
                  {/* Basic Info */}
                  <View className="bg-[#0f0f0f]/50 rounded-2xl p-6 border border-[#cd7f32]/20">
                    <Text className="text-2xl font-bold text-[#cd7f32] mb-4 flex flex-row items-center gap-3">
                      {getClassIcon(safeWarrior.warriorClass)}{" "}
                      {safeRenderString(safeWarrior.name)}
                    </Text>

                    <View className="space-y-3">
                      <View className="flex flex-row justify-between">
                        <Text className="text-gray-400">Class:</Text>
                        <Text className="text-white font-bold capitalize">
                          {safeRenderString(
                            getWarriorClassString(safeWarrior.warriorClass)
                          )}
                        </Text>
                      </View>

                      <Text className="text-sm text-gray-400 italic">
                        {safeRenderString(
                          getClassDescription(safeWarrior.warriorClass)
                        )}
                      </Text>

                      <View className="flex flex-row justify-between">
                        <Text className="text-gray-400">Battles Won:</Text>
                        <Text className="text-[#cd7f32] font-bold">
                          {safeWarrior.battlesWon}
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between">
                        <Text className="text-gray-400">Battles Lost:</Text>
                        <Text className="text-red-400 font-bold">
                          {safeWarrior.battlesLost}
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between">
                        <Text className="text-gray-400">Experience:</Text>
                        <Text className="text-purple-400 font-bold">
                          {safeWarrior.experience} XP
                        </Text>
                      </View>

                      {/* Performance Rank */}
                      <View className="flex flex-row justify-between">
                        <Text className="text-sm font-bold text-[#cd7f32]">
                          Performance Rank:
                        </Text>
                        <Text className="text-lg font-bold text-white">
                          {safeRenderString(performanceRank)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action TouchableOpacitys */}
                  <View className="grid grid-cols-2 gap-4">
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedWarrior(safeWarrior);
                        setViewingWarrior(null);
                        // toast.success(
                        //   `Selected ${safeWarrior.name} as your champion!`
                        // );
                      }}
                      className="bg-gradient-to-r from-[#cd7f32] to-[#ff8c42] py-3 px-4 rounded-lg flex flex-row items-center justify-center gap-2"
                    >
                      {/* <Crown size={16} color="black" /> */}
                      <MaterialCommunityIcons
                        name="crown"
                        size={16}
                        color="black"
                      />
                      <Text className="text-black font-bold">
                        Select Warrior
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setViewingWarrior(null)}
                      className="bg-[#2a2a2a] border border-[#cd7f32]/30 py-3 px-4 rounded-lg"
                    >
                      <Text className="text-[#cd7f32] font-bold text-center">
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };

  // Helper for rendering stats
  const renderStat = (label: any, value: any, maxValue: any, color: any) => {
    const percentage = Math.min((safeToNumber(value) / maxValue) * 100, 100);
    return (
      <View className={`p-2 rounded-lg bg-${color}-500/5`}>
        <View className="flex flex-row items-center mb-1">
          <Text className="text-xs font-medium text-gray-300">{label}</Text>
          <Text className={`ml-auto text-sm font-bold text-${color}-400`}>
            {safeToNumber(value)}
          </Text>
        </View>
        <View className="w-full bg-gray-700 rounded-full h-1.5">
          <View
            className={`bg-gradient-to-r from-${color}-500 to-${color}-400 h-1.5 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Toast Container - Ultra-High Z-Index */}
      {/* <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            zIndex: 999999,
            background: "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)",
            color: "#ffffff",
            border: "1px solid #cd7f32",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(205, 127, 50, 0.3)",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "400px",
          },
          success: {
            iconTheme: {
              primary: "#cd7f32",
              secondary: "#ffffff",
            },
            style: {
              border: "1px solid #cd7f32",
              background: "linear-gradient(135deg, #1a4a2a 0%, #1a1a1a 100%)",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
            style: {
              border: "1px solid #ef4444",
              background: "linear-gradient(135deg, #4a1a1a 0%, #1a1a1a 100%)",
            },
          },
          loading: {
            iconTheme: {
              primary: "#cd7f32",
              secondary: "#ffffff",
            },
            style: {
              border: "1px solid #cd7f32",
              background: "linear-gradient(135deg, #2a2a1a 0%, #1a1a1a 100%)",
            },
          },
        }}
        containerStyle={{
          zIndex: 999999,
        }}
      /> */}

      {
        <>
          {/* Warrior Details Modal */}
          {viewingWarrior && <WarriorDetailsModal warrior={viewingWarrior} />}(
          <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2">
            <View className="bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0f0f0f] border-2 border-[#cd7f32]/50 rounded-3xl p-8 md:p-10 w-full max-h-[96vh] max-w-6xl shadow-2xl relative">
              <View className="absolute inset-0 bg-gradient-to-br from-[#cd7f32]/5 via-transparent to-[#ff8c42]/5 rounded-3xl" />

              <View className="relative h-full flex flex-col">
                {/* Header */}
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#cd7f32] to-[#ff8c42] text-[#cd7f32] bg-clip-text flex flex-row items-center gap-3">
                    {/* <Zap size={32} color="#cd7f32" /> */}
                    <MaterialCommunityIcons
                      name="play"
                      size={32}
                      color="#cd7f32"
                    />
                    Create a battle room
                  </Text>
                  <TouchableOpacity
                    // onPress={() => setGameMode("")}
                    className="p-3 rounded-xl"
                  >
                    {/* <X size={28} color="#cd7f32" /> */}
                    <MaterialCommunityIcons
                      name="cancel"
                      size={24}
                      color="#cd7f32"
                    />
                  </TouchableOpacity>
                </View>

                <View className="flex flex-row gap-8 flex-1 overflow-hidden mt-4">
                  {/* Left: Form */}
                  <View className="w-[40%] flex flex-col">
                    <View className="space-y-6 flex-1">
                      {/* Concepts Status */}
                      <View>
                        <ConceptsStatus />
                      </View>

                      {/* Warrior List */}
                      <View className="flex-1 flex flex-col min-h-0">
                        <Text className="text-white text-lg font-medium mb-4 flex-shrink-0">
                          Choose a warrior
                        </Text>
                        {/* <ScrollView
                          className="space-y-4 pr-1 py-5 max-h-64"
                          showsVerticalScrollIndicator={false}
                        >
                          {userWarriors?.length > 0 ? (
                            userWarriors.map((warrior, i) => {
                              const safeWarrior = {
                                name: String(warrior?.name || "Unknown"),
                                imageUri: String(warrior?.imageUri || ""),
                                level: safeToNumber(warrior?.level),
                                warriorClass: getWarriorClassString(
                                  warrior?.warriorClass
                                ),
                                warriorRarity: getRarityString(
                                  warrior?.imageRarity
                                ),
                              };

                              return (
                                <View
                                  key={i}
                                  className={`flex flex-row border p-2 gap-x-2 items-center rounded-2xl bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] ${
                                    selectedWarrior?.name === warrior.name
                                      ? "border-[#cd7f32] bg-[#cd7f32]/5"
                                      : "border-[#cd7f32]/30"
                                  }`}
                                >
                                  <View className="w-12 h-12 rounded-full overflow-hidden">
                                    <Image
                                      source={{
                                        uri: safeRenderString(
                                          safeWarrior.imageUri
                                        ),
                                      }}
                                      className="w-full h-full"
                                    />
                                  </View>
                                  <View className="flex-1 min-w-0">
                                    <View className="flex flex-row items-center gap-2 mb-1">
                                      <Text className="text-white font-medium">
                                        {safeRenderString(safeWarrior.name)}
                                      </Text>
                                      <Text className="text-xs text-gray-400">
                                        Lv.{safeWarrior.level}
                                      </Text>
                                      <Text className="text-xs text-gray-400">
                                        {safeRenderString(
                                          safeWarrior.warriorRarity
                                        )}
                                      </Text>
                                    </View>
                                  </View>
                                  <View className="flex flex-row gap-2">
                                    <TouchableOpacity
                                      onPress={() => setViewingWarrior(warrior)}
                                      className="p-2 bg-[#cd7f32]/20 rounded-lg"
                                    >
                                      <Eye size={16} color="#cd7f32" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                      onPress={() => {
                                        if (
                                          selectedWarrior?.name === warrior.name
                                        ) {
                                          setSelectedWarrior(null);
                                        } else {
                                          setSelectedWarrior(warrior);
                                          toast.success(
                                            `Selected ${warrior.name} as your champion!`
                                          );
                                        }
                                      }}
                                      className={`px-3 py-2 rounded-lg text-xs font-medium ${
                                        selectedWarrior?.name === warrior.name
                                          ? "bg-[#cd7f32] text-black"
                                          : "bg-[#cd7f32]/20 text-[#cd7f32]"
                                      }`}
                                    >
                                      {selectedWarrior?.name === warrior.name
                                        ? "Selected"
                                        : "Select"}
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              );
                            })
                          ) : (
                            <View className="text-center py-8">
                              <Text className="text-gray-400">
                                No warriors available
                              </Text>
                              <Text className="text-sm text-gray-500">
                                Create your first warrior to start battling!
                              </Text>
                            </View>
                          )}
                        </ScrollView> */}
                      </View>
                    </View>
                  </View>

                  {/* Right: Preview */}
                  <View className="w-[60%] flex flex-col">
                    <View className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] border border-[#cd7f32]/30 rounded-2xl p-6 relative flex flex-col h-full">
                      <View className="absolute inset-0 bg-gradient-to-br from-[#cd7f32]/5 to-transparent" />
                      {selectedWarrior ? (
                        <View className="flex flex-col flex-1">
                          {/* Card */}
                          <View className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 border-[#cd7f32]/30 rounded-2xl p-4 mb-4 relative">
                            {/* Class Badge */}
                            <View className="bg-gradient-to-r from-[#cd7f32] to-[#ff8c42] text-black px-3 py-1 rounded-full font-bold text-sm flex flex-row items-center gap-2">
                              {getClassIcon(selectedWarrior?.warriorClass)}
                            </View>

                            <View className="flex flex-row gap-4 mt-4">
                              {/* Warrior Image */}
                              <View className="w-1/2">
                                <Image
                                  source={{
                                    uri: safeRenderString(
                                      selectedWarrior?.imageUri
                                    ),
                                  }}
                                  className="w-full aspect-square rounded-xl border border-[#cd7f32]/20"
                                />
                              </View>

                              {/* Stats */}
                              <View className="w-1/2 space-y-2">
                                {renderStat(
                                  "ATK",
                                  selectedWarrior?.baseAttack,
                                  140,
                                  "red"
                                )}
                                {renderStat(
                                  "DEF",
                                  selectedWarrior?.baseDefense,
                                  140,
                                  "blue"
                                )}
                                {renderStat(
                                  "KNW",
                                  selectedWarrior?.baseKnowledge,
                                  140,
                                  "purple"
                                )}
                                {renderStat(
                                  "HP",
                                  selectedWarrior?.currentHp,
                                  100,
                                  "green"
                                )}
                              </View>
                            </View>
                          </View>

                          {/* Create Room TouchableOpacity */}
                          {/* <TouchableOpacity
                            onPress={handleCreateRoom}
                            disabled={
                              isCreating ||
                              !selectedWarrior ||
                              !isConnected ||
                              !conceptsLoaded
                            }
                            className="w-full bg-gradient-to-r from-[#cd7f32] to-[#ff8c42] py-3 rounded-xl flex flex-row items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isCreating ? (
                              <>
                                <Loader2
                                  size={16}
                                  color="black"
                                  className="animate-spin"
                                />
                                <Text className="text-black font-bold">
                                  Creating Battle Room...
                                </Text>
                              </>
                            ) : (
                              <>
                                <Shield size={16} color="black" />
                                <Text className="text-black font-bold">
                                  {!isConnected
                                    ? "Connect Wallet to Create Room"
                                    : !conceptsLoaded
                                      ? "Load Concepts First"
                                      : "Create Battle Room"}
                                </Text>
                              </>
                            )}
                          </TouchableOpacity> */}
                        </View>
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <View className="w-16 h-16 bg-[#cd7f32]/20 rounded-full items-center justify-center mb-4">
                            {/* <Star size={32} color="#cd7f32" /> */}
                            <MaterialCommunityIcons
                              name="star"
                              size={32}
                              color="#cd7f32"
                            />
                          </View>
                          <Text className="text-xl font-bold text-gray-400 mb-2">
                            Select Your Champion
                          </Text>
                          <Text className="text-sm text-gray-500">
                            Choose a warrior to see their stats and create a
                            battle room
                          </Text>
                          {!conceptsLoaded && (
                            <Text className="text-xs text-gray-500 mt-2">
                              💡 Don't forget to load battle concepts first!
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
          );
        </>
      }
    </>
  );
};

export default RoomCreation;
