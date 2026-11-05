import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { COLORS } from "../theme/colors";
import { setUser } from "../utils/user";

export default function Onboarding() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    // Validate input
    if (!trimmedName) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }

    if (trimmedName.length > 40) {
      Alert.alert("Name too long", "Your name must be 40 characters or fewer.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      // Save user to SQLite
      await setUser(db, trimmedName);

      // Navigate after successful persistence
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to save user:", error);

      Alert.alert(
        "Something went wrong",
        "We couldn't save your profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Penny</Text>
          <View style={styles.logoIcon}>
            <Text style={styles.logoHeart}>♡</Text>
          </View>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationCircle}>
              <Text style={styles.walletEmoji}>👛</Text>
            </View>

            <View style={styles.coin}>
              <Text style={styles.coinText}>₱</Text>
            </View>

            <View style={styles.sparkle}>
              <Text style={styles.sparkleText}>✦</Text>
            </View>
          </View>

          {/* Welcome text */}
          <View style={styles.headingContainer}>
            <Text style={styles.title}>Let's get started!</Text>

            <Text style={styles.subtitle}>
              A little space to manage your money, one day at a time.
            </Text>
          </View>

          {/* Name input */}
          <View style={styles.form}>
            <Text style={styles.label}>What should we call you?</Text>

            <View
              style={[styles.inputContainer, focused && styles.inputFocused]}
            >
              <Text style={styles.inputIcon}>♡</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.muted}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                maxLength={40}
                editable={!loading}
                onSubmitEditing={handleSubmit}
              />
            </View>

            <Text style={styles.helperText}>
              Don't worry, you can manage your money privately.
            </Text>
          </View>

          {/* Continue button */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Continue →</Text>
            )}
          </Pressable>

          {/* Footer */}
          <Text style={styles.footer}>Your money journey starts here ♡</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    fontFamily: "NunitoSans_800ExtraBold",
    fontSize: 27,
    color: COLORS.text,
    letterSpacing: -0.8,
  },

  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  logoHeart: {
    fontSize: 25,
    color: COLORS.primaryDark,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 30,
  },

  illustrationContainer: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 24,
  },

  illustrationCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  walletEmoji: {
    fontSize: 82,
  },

  coin: {
    position: "absolute",
    right: "23%",
    bottom: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  coinText: {
    fontSize: 22,
    fontFamily: "NunitoSans_800ExtraBold",
    color: COLORS.income,
  },

  sparkle: {
    position: "absolute",
    left: "22%",
    top: 24,
  },

  sparkleText: {
    fontSize: 27,
    color: COLORS.primary,
  },

  headingContainer: {
    alignItems: "center",
    marginBottom: 36,
  },

  title: {
    fontFamily: "NunitoSans_800ExtraBold",
    fontSize: 28,
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontFamily: "NunitoSans_400Regular",
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.muted,
    textAlign: "center",
    maxWidth: 280,
  },

  form: {
    marginBottom: 24,
  },

  label: {
    fontFamily: "NunitoSans_700Bold",
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 12,
  },

  inputContainer: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 17,
  },

  inputFocused: {
    borderColor: COLORS.primary,
  },

  inputIcon: {
    fontSize: 23,
    color: COLORS.primary,
    marginRight: 12,
  },

  input: {
    flex: 1,
    height: "100%",
    fontFamily: "NunitoSans_600SemiBold",
    fontSize: 16,
    color: COLORS.textDark,
    paddingVertical: 0,
  },

  helperText: {
    fontFamily: "NunitoSans_400Regular",
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 10,
  },

  button: {
    height: 58,
    backgroundColor: COLORS.primary,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    fontFamily: "NunitoSans_800ExtraBold",
    fontSize: 16,
    color: "#FFFFFF",
  },

  footer: {
    fontFamily: "NunitoSans_600SemiBold",
    fontSize: 12,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 28,
  },
});
