import React, { useState, createContext } from "react";

// Guide interface
interface Guide {
  id: string;
  name: string;
  title: string;
  description: string;
  recommendedFor: string;
}

// Persona enum
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

interface ContextTypes {
  auth: {
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  };

  loader: {
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  };

  onboarding: {
    currentOnboardingScreen: string;
    setCurrentOnboardingScreen: React.Dispatch<
      React.SetStateAction<"welcome" | "selection" | "name" | "game-card-intro" | "game-card-carousel" | "warrior-setup" | "persona">
    >;
    
    // Guide selection
    selectedGuide: Guide | null;
    setSelectedGuide: React.Dispatch<React.SetStateAction<Guide | null>>;
    
    // Persona selection
    selectedPersona: UserPersona | null;
    setSelectedPersona: React.Dispatch<React.SetStateAction<UserPersona | null>>;
    
    // Player name
    playerName: string;
    setPlayerName: React.Dispatch<React.SetStateAction<string>>;
    
    // Utility functions
    getOnboardingData: () => {
      selectedGuide: Guide | null;
      selectedPersona: UserPersona | null;
      playerName: string;
    };
    
    resetOnboarding: () => void;
  };
}

export const CreateContext = createContext({} as ContextTypes);

const ContextProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // Auth state
  const [accessToken, setAccessToken] = useState<string | null>("");
  
  // Loader state
  const [isLoading, setIsLoading] = useState(false);
  
  // Onboarding screen state
  const [currentOnboardingScreen, setCurrentOnboardingScreen] = useState<
    "welcome" | "selection" | "name" | "game-card-intro" | "game-card-carousel" | "warrior-setup" | "persona"
  >("welcome");
  
  // Onboarding data state - THE MISSING PIECES
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<UserPersona | null>(null);
  const [playerName, setPlayerName] = useState<string>("");

  // Utility functions
  const getOnboardingData = () => ({
    selectedGuide,
    selectedPersona,
    playerName,
  });

  const resetOnboarding = () => {
    setCurrentOnboardingScreen("welcome");
    setSelectedGuide(null);
    setSelectedPersona(null);
    setPlayerName("");
  };

  return (
    <CreateContext.Provider
      value={{
        auth: { accessToken, setAccessToken },
        loader: {
          isLoading,
          setIsLoading,
        },
        onboarding: {
          currentOnboardingScreen,
          setCurrentOnboardingScreen,
          selectedGuide,
          setSelectedGuide,
          selectedPersona,
          setSelectedPersona,
          playerName,
          setPlayerName,
          getOnboardingData,
          resetOnboarding,
        },
      }}
    >
      {children}
    </CreateContext.Provider>
  );
};

export default ContextProvider;
export { UserPersona };