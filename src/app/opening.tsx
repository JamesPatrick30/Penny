import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";

import { AppText } from "@/components/ui/AppText";
import { COLORS } from "@/theme/colors";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const welcomeIcon = require("../../assets/wellcome_icon.png");

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(25);
  const imageScale = useSharedValue(0.85);
  const buttonScale = useSharedValue(0.95);

  const router = useRouter();
  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.ease),
    });

    translateY.value = withSpring(0, {
      damping: 16,
      stiffness: 100,
    });

    imageScale.value = withSpring(1, {
      damping: 12,
      stiffness: 90,
    });

    buttonScale.value = withDelay(
      350,
      withSpring(1, {
        damping: 14,
        stiffness: 100,
      }),
    );
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const imageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: imageScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.illustrationContainer, imageStyle]}>
        <Animated.Image
          source={welcomeIcon}
          style={styles.illustration}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.content, contentStyle]}>
        <AppText style={styles.title}>Welcome to Penny!</AppText>

        <AppText style={styles.subtitle}>
          Your little companion for managing money. Track your daily allowance,
          record expenses, and stay on top of your spending.
        </AppText>
      </Animated.View>

      <Animated.View style={[styles.footer, buttonStyle]}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/onboarding")}
        >
          <AppText style={styles.buttonText}>Get Started</AppText>
        </Pressable>

        <AppText style={styles.footerText}>
          Every peso counts. Spend wisely!
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 28,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: "space-between",
  },

  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  illustration: {
    width: "100%",
    height: 260,
  },

  content: {
    alignItems: "center",
    marginBottom: 35,
  },

  title: {
    fontSize: 30,
    fontFamily: "NunitoBold",
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 15,
    fontFamily: "NunitoRegular",
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },

  footer: {
    width: "100%",
    alignItems: "center",
  },

  button: {
    width: "100%",
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    fontSize: 17,
    fontFamily: "NunitoBold",
    color: COLORS.surface,
  },

  footerText: {
    marginTop: 18,
    fontSize: 12,
    fontFamily: "NunitoRegular",
    color: COLORS.muted,
  },
});
