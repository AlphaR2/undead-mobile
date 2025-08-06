import { GameFonts } from "@/constants/GameFonts";
import {
  WalletApp,
  getInstalledWallets,
  openWalletDownload,
  useMWA,
} from "@/context/mwa";
import { useDynamic } from "@/context/wallet";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface WalletSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onWalletConnected: (walletType: "dynamic" | "mwa") => void;
}

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
  visible,
  onClose,
  onWalletConnected,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [installedWallets, setInstalledWallets] = useState<WalletApp[]>([]);
  const [isCheckingWallets, setIsCheckingWallets] = useState(true);

  // MWA context
  const {
    connect: connectMWA,
    isConnecting: isConnectingMWA,
    hasWalletsInstalled,
  } = useMWA();

  // Dynamic context
  const dynamicClient = useDynamic();
  const [isConnectingDynamic, setIsConnectingDynamic] = useState(false);

  useEffect(() => {
    if (visible) {
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Check for installed wallets
      checkInstalledWallets();
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const checkInstalledWallets = async () => {
    try {
      setIsCheckingWallets(true);
      const wallets = await getInstalledWallets();
      setInstalledWallets(wallets);
    } catch (error) {
      console.error("Failed to check installed wallets:", error);
      setInstalledWallets([]);
    } finally {
      setIsCheckingWallets(false);
    }
  };

  const handleMWAConnect = async () => {
    try {
      await connectMWA();
      onWalletConnected("mwa");
    } catch (error) {
      console.error("MWA connection failed:", error);
      // Error is handled by MWA context
    }
  };

  const handleDynamicConnect = async () => {
    try {
      setIsConnectingDynamic(true);
      dynamicClient.ui.auth.show();
      onWalletConnected("dynamic");
    } catch (error) {
      console.error("Dynamic connection failed:", error);
      setIsConnectingDynamic(false);
    }
  };

  const handleDownloadWallet = (wallet: WalletApp) => {
    const platform = Platform.OS as "android" | "ios";
    openWalletDownload(wallet, platform);
  };

  const renderWalletOption = (wallet: WalletApp) => (
    <TouchableOpacity
      key={wallet.name}
      style={styles.installedWalletItem}
      onPress={handleMWAConnect}
      disabled={isConnectingMWA}
    >
      <View style={styles.walletInfo}>
        <View style={styles.walletIcon}>
          <Text style={styles.walletIconText}>{wallet.name[0]}</Text>
        </View>
        <Text style={[styles.walletName, GameFonts.body]}>{wallet.name}</Text>
      </View>
      {isConnectingMWA && <ActivityIndicator size="small" color="#cd7f32" />}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, GameFonts.title]}>
              Choose Your Path
            </Text>
            <Text style={[styles.subtitle, GameFonts.body]}>
              Enter the undead realm with your preferred wallet
            </Text>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* MWA Wallets Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, GameFonts.caption]}>
                🔗 Connect Existing Wallet
              </Text>
              <Text style={[styles.sectionDescription, GameFonts.body]}>
                Use your existing Solana wallet app
              </Text>

              {isCheckingWallets ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#cd7f32" />
                  <Text style={[styles.loadingText, GameFonts.body]}>
                    Checking for wallets...
                  </Text>
                </View>
              ) : installedWallets.length > 0 ? (
                <View style={styles.installedWallets}>
                  {installedWallets.map(renderWalletOption)}
                </View>
              ) : (
                <View style={styles.noWalletsContainer}>
                  <Text style={[styles.noWalletsText, GameFonts.body]}>
                    No Solana wallets detected
                  </Text>
                  <Text style={[styles.suggestionText, GameFonts.caption]}>
                    Install a wallet app to connect:
                  </Text>

                  {/* Popular wallet download options */}
                  <View style={styles.downloadWallets}>
                    {[
                      { name: "Phantom", icon: "👻" },
                      { name: "Solflare", icon: "🔥" },
                      { name: "Glow", icon: "✨" },
                    ].map((wallet) => (
                      <TouchableOpacity
                        key={wallet.name}
                        style={styles.downloadWalletButton}
                        onPress={() =>
                          handleDownloadWallet(
                            installedWallets.find(
                              (w) => w.name === wallet.name
                            ) ||
                              ({
                                name: wallet.name,
                                scheme: `${wallet.name.toLowerCase()}://`,
                                downloadUrl: {
                                  android: `https://play.google.com/store/apps/details?id=app.${wallet.name.toLowerCase()}`,
                                  ios: `https://apps.apple.com/app/${wallet.name.toLowerCase()}-solana-wallet`,
                                },
                              } as WalletApp)
                          )
                        }
                      >
                        <Text style={styles.downloadWalletIcon}>
                          {wallet.icon}
                        </Text>
                        <Text
                          style={[styles.downloadWalletText, GameFonts.caption]}
                        >
                          {wallet.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={[styles.dividerText, GameFonts.caption]}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Dynamic Embedded Wallet Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, GameFonts.caption]}>
                ⚡ Create New Wallet
              </Text>
              <Text style={[styles.sectionDescription, GameFonts.body]}>
                Get started instantly with a secure embedded wallet
              </Text>

              <TouchableOpacity
                style={styles.dynamicButton}
                onPress={handleDynamicConnect}
                disabled={isConnectingDynamic}
              >
                {isConnectingDynamic ? (
                  <View style={styles.buttonLoadingContainer}>
                    <ActivityIndicator size="small" color="#121212" />
                    <Text style={[styles.dynamicButtonText, GameFonts.button]}>
                      Opening Portal...
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text style={[styles.dynamicButtonText, GameFonts.button]}>
                      Create Wallet
                    </Text>
                    <Text
                      style={[styles.dynamicButtonSubtext, GameFonts.caption]}
                    >
                      Email, Google, Apple, or Phone
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Benefits list */}
              <View style={styles.benefitsList}>
                <Text style={[styles.benefitItem, GameFonts.caption]}>
                  ✅ No app installation required
                </Text>
                <Text style={[styles.benefitItem, GameFonts.caption]}>
                  ✅ Secured by advanced cryptography
                </Text>
                <Text style={[styles.benefitItem, GameFonts.caption]}>
                  ✅ Easy social login options
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeButtonText, GameFonts.body]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cd7f32",
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#cd7f32",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#cd7f32",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 16,
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingText: {
    color: "#888",
    marginLeft: 8,
  },
  installedWallets: {
    gap: 8,
  },
  installedWalletItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2a2a2a",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#cd7f32",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  walletIconText: {
    color: "#121212",
    fontSize: 14,
    fontWeight: "bold",
  },
  walletName: {
    color: "#fff",
    fontSize: 16,
  },
  noWalletsContainer: {
    alignItems: "center",
    padding: 16,
  },
  noWalletsText: {
    color: "#888",
    textAlign: "center",
    marginBottom: 8,
  },
  suggestionText: {
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  downloadWallets: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  downloadWalletButton: {
    alignItems: "center",
    padding: 8,
  },
  downloadWalletIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  downloadWalletText: {
    color: "#cd7f32",
    fontSize: 12,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  dividerText: {
    color: "#666",
    marginHorizontal: 12,
  },
  dynamicButton: {
    backgroundColor: "#cd7f32",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dynamicButtonText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  dynamicButtonSubtext: {
    color: "#333",
    fontSize: 12,
  },
  benefitsList: {
    gap: 4,
  },
  benefitItem: {
    color: "#888",
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
    alignItems: "center",
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: "#888",
    textDecorationLine: "underline",
  },
});
