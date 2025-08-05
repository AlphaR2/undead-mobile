import { GameFonts } from "@/constants/GameFonts";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface ToastConfig {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  onDismiss?: () => void;
}

interface ToastModalProps {
  visible: boolean;
  config: ToastConfig | null;
  onDismiss: () => void;
}

export const ToastModal: React.FC<ToastModalProps> = ({
  visible,
  config,
  onDismiss,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible && config) {
      setIsVisible(true);
      showToast();

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        hideToast();
      }, config.duration || 4000);

      return () => clearTimeout(timer);
    }
  }, [visible, config]);

  const showToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onDismiss();
      if (config?.onDismiss) {
        config.onDismiss();
      }
    });
  };

  // Pan responder for swipe to dismiss
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy < 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy < -50) {
        hideToast();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const getToastColors = (type: ToastConfig["type"]) => {
    switch (type) {
      case "success":
        return {
          background: "#1a4d3a",
          border: "#22c55e",
          icon: "✅",
          text: "#22c55e",
        };
      case "error":
        return {
          background: "#4d1a1a",
          border: "#ef4444",
          icon: "❌",
          text: "#ef4444",
        };
      case "warning":
        return {
          background: "#4d3a1a",
          border: "#f59e0b",
          icon: "⚠️",
          text: "#f59e0b",
        };
      case "info":
      default:
        return {
          background: "#1a3a4d",
          border: "#3b82f6",
          icon: "ℹ️",
          text: "#3b82f6",
        };
    }
  };

  if (!isVisible || !config) return null;

  const colors = getToastColors(config.type);

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              transform: [{ translateY }],
              opacity,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Toast Content */}
          <View style={styles.toastContent}>
            <View style={styles.toastHeader}>
              <Text style={styles.toastIcon}>{colors.icon}</Text>
              <Text
                style={[
                  styles.toastTitle,
                  GameFonts.button,
                  { color: colors.text },
                ]}
              >
                {config.title}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={hideToast}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {config.message && (
              <Text style={[styles.toastMessage, GameFonts.epic]}>
                {config.message}
              </Text>
            )}

            {config.action && (
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.border }]}
                onPress={() => {
                  config.action?.onPress();
                  hideToast();
                }}
              >
                <Text
                  style={[
                    styles.actionText,
                    GameFonts.button,
                    { color: colors.text },
                  ]}
                >
                  {config.action.label}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Swipe indicator */}
          <View style={styles.swipeIndicator}>
            <View
              style={[styles.swipeBar, { backgroundColor: colors.border }]}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((config: Omit<ToastConfig, "id">) => {
    const toastWithId: ToastConfig = {
      ...config,
      id: Date.now().toString(),
    };
    setToastConfig(toastWithId);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setToastConfig(null);
    }, 300);
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: "success", title, message, duration });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: "error", title, message, duration });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: "info", title, message, duration });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: "warning", title, message, duration });
    },
    [showToast]
  );

  const ToastComponent = useCallback(
    () => (
      <ToastModal
        visible={visible}
        config={toastConfig}
        onDismiss={hideToast}
      />
    ),
    [visible, toastConfig, hideToast]
  );

  return {
    toastConfig,
    visible,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    ToastComponent,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 60,
    backgroundColor: "transparent",
  },
  toastContainer: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastContent: {
    flex: 1,
  },
  toastHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  toastIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  toastTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
  },
  toastMessage: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  swipeIndicator: {
    alignItems: "center",
    marginTop: 8,
  },
  swipeBar: {
    width: 40,
    height: 3,
    borderRadius: 2,
    opacity: 0.5,
  },
});
