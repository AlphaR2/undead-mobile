import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

// Global toast state management
class ToastManager {
  private static instance: ToastManager;
  private listeners: ((messages: ToastMessage[]) => void)[] = [];
  private messages: ToastMessage[] = [];

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  subscribe(listener: (messages: ToastMessage[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  show(toast: Omit<ToastMessage, "id">) {
    const id = Date.now().toString();
    const newToast: ToastMessage = {
      id,
      duration: 4000,
      ...toast,
    };

    this.messages = [...this.messages, newToast];
    this.notifyListeners();

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.hide(id);
      }, newToast.duration);
    }
  }

  hide(id: string) {
    this.messages = this.messages.filter((m) => m.id !== id);
    this.notifyListeners();
  }

  clear() {
    this.messages = [];
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.messages));
  }
}

// Global toast functions
export const toast = {
  success: (title: string, message?: string) =>
    ToastManager.getInstance().show({ type: "success", title, message }),
  error: (title: string, message?: string) =>
    ToastManager.getInstance().show({ type: "error", title, message }),
  warning: (title: string, message?: string) =>
    ToastManager.getInstance().show({ type: "warning", title, message }),
  info: (title: string, message?: string) =>
    ToastManager.getInstance().show({ type: "info", title, message }),
};

// Individual toast component
function ToastItem({
  toast: toastData,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(-50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(onDismiss);
  };

  const getIcon = () => {
    switch (toastData.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <Animated.View
      style={[styles.toastItem, { opacity, transform: [{ translateY }] }]}
    >
      <TouchableOpacity
        style={styles.toastContent}
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        <Text style={styles.toastIcon}>{getIcon()}</Text>
        <View style={styles.toastText}>
          <Text style={styles.toastTitle}>{toastData.title}</Text>
          {toastData.message && (
            <Text style={styles.toastMessage}>{toastData.message}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Main toast container component
export function Toast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = ToastManager.getInstance().subscribe(setMessages);
    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    ToastManager.getInstance().hide(id);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { top: insets.top + 10 }]}>
      {messages.map((message) => (
        <ToastItem
          key={message.id}
          toast={message}
          onDismiss={() => handleDismiss(message.id)}
        />
      ))}
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    pointerEvents: "box-none",
  },
  toastItem: {
    marginBottom: 8,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333333",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  toastText: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 18,
  },
});
