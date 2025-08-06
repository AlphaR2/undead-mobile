import { Stack } from "expo-router";
import { View } from "react-native";

const RootLayout = () => {
  return (
    <View className="flex-1 bg-[#1a1a1a]">
      {/* <Topbar/> */}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "#F6BE00",
          headerBackTitle: "",
          headerTitle: "",
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
};

export default RootLayout;
