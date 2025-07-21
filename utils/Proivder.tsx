import { PrivyProvider } from "@privy-io/expo";

import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <PrivyProvider
      appId="your-privy-app-id"
      clientId="your-privy-app-client-id"
    >
      <Slot />
    </PrivyProvider>
  );
}
