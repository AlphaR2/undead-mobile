import React, { useState, createContext } from "react";

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
      React.SetStateAction<"welcome" | "selection" | "name" | "game-card-intro" | "game-card-carousel" | "warrior-setup">
    >;
  };
}

export const CreateContext = createContext({} as ContextTypes);

const ContextProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [accessToken, setAccessToken] = useState<string | null>("");
  const [currentOnboardingScreen, setCurrentOnboardingScreen] = useState<
    "welcome" | "selection" | "name" | "game-card-intro" | "game-card-carousel" | "warrior-setup"
  >("welcome");
  const [isLoading, setIsLoading] = useState(false);

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
        },
      }}
    >
      {children}
    </CreateContext.Provider>
  );
};

export default ContextProvider;
