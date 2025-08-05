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
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
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
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
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
          tension: 100,
          friction: 8,
        }).start();
      }
    },
  });

  const getToastStyles = (type: ToastConfig["type"]) => {
    const baseColor = "#cd7f32"; // Your bronze color
    
    switch (type) {
      case "success":
        return {
          backgroundColor: "#1a1612", // Very dark bronze
          borderColor: baseColor,
          accentColor: "#a86829", // Slightly darker bronze
          icon: "⚡",
          iconBg: "rgba(205, 127, 50, 0.15)",
        };
      case "error":
        return {
          backgroundColor: "#1c1410", // Dark bronze with red undertone
          borderColor: "#b5702c", // Darker bronze
          accentColor: "#9d5f26", // Much darker bronze
          icon: "⚠",
          iconBg: "rgba(181, 112, 44, 0.15)",
        };
      case "warning":
        return {
          backgroundColor: "#1b1511", // Dark bronze
          borderColor: "#d6883a", // Lighter bronze
          accentColor: "#b87230", // Medium bronze
          icon: "⚡",
          iconBg: "rgba(214, 136, 58, 0.15)",
        };
      case "info":
      default:
        return {
          backgroundColor: "#191613", // Dark bronze base
          borderColor: baseColor,
          accentColor: "#b5702c", // Darker bronze
          icon: "ℹ",
          iconBg: "rgba(205, 127, 50, 0.15)",
        };
    }
  };

  if (!isVisible || !config) return null;

  const styles = getToastStyles(config.type);

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      statusBarTranslucent
    >
      <View style={toastStyles.overlay}>
        <Animated.View
          style={[
            toastStyles.toastContainer,
            {
              backgroundColor: styles.backgroundColor,
              borderColor: styles.borderColor,
              transform: [{ translateY }, { scale }],
              opacity,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Glowing border effect */}
          <View 
            style={[
              toastStyles.glowBorder, 
              { shadowColor: styles.borderColor }
            ]} 
          />

          {/* Toast Content */}
          <View style={toastStyles.toastContent}>
            {/* Header with icon and title */}
            <View style={toastStyles.toastHeader}>
              <View 
                style={[
                  toastStyles.iconContainer, 
                  { backgroundColor: styles.iconBg }
                ]}
              >
                <Text style={toastStyles.toastIcon}>{styles.icon}</Text>
              </View>
              
              <View style={toastStyles.textContainer}>
                <Text
                  style={[
                    toastStyles.toastTitle,
                    { color: "#cd7f32" }, // Main bronze color for title
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {config.title}
                </Text>
                
                {config.message && (
                  <Text 
                    style={[
                      toastStyles.toastMessage,
                      { color: "#a0844a" }, // Lighter bronze for message
                    ]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {config.message}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={toastStyles.closeButton}
                onPress={hideToast}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={toastStyles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Action button */}
            {config.action && (
              <TouchableOpacity
                style={[
                  toastStyles.actionButton, 
                  { 
                    borderColor: styles.borderColor,
                    backgroundColor: styles.iconBg,
                  }
                ]}
                onPress={() => {
                  config.action?.onPress();
                  hideToast();
                }}
              >
                <Text
                  style={[
                    toastStyles.actionText,
                    { color: "#cd7f32" },
                  ]}
                >
                  {config.action.label}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Swipe indicator */}
          <View style={toastStyles.swipeIndicator}>
            <View 
              style={[
                toastStyles.swipeBar, 
                { backgroundColor: styles.accentColor }
              ]} 
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Toast Manager Hook (unchanged)
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

const toastStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 50,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
  },
  toastContainer: {
    width: SCREEN_WIDTH - 32,
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  toastContent: {
    padding: 16,
    zIndex: 1,
  },
  toastHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  toastIcon: {
    fontSize: 18,
    textAlign: "center",
  },
  textContainer: {
    flex: 1,
    paddingTop: 2,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    lineHeight: 20,
    fontFamily: 'Orbitron-Bold', // Using your game font
  },
  toastMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    fontFamily: 'Cinzel-Regular', // Using your game font
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  closeText: {
    color: "#666",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: 'Orbitron-Medium',
  },
  swipeIndicator: {
    alignItems: "center",
    paddingBottom: 8,
  },
  swipeBar: {
    width: 50,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
});