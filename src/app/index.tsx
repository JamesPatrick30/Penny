import { AppText } from "@/components/ui/AppText";
import { COLORS } from "@/theme/colors";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { getUser } from "../utils/user";

export default function Opening() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const router = useRouter();

  const db = useSQLiteContext();

  useEffect(() => {
    const userCheck = async () => {
      const user = await getUser(db);
      if (user) {
        const timeout = setTimeout(() => {
          router.replace("/opening");
        }, 1500); // 2.5 seconds

        clearTimeout(timeout);
        router.replace("/(tabs)");
      } else {
        const timeout = setTimeout(() => {
          router.replace("/opening");
        }, 2500); // 2.5 seconds

        clearTimeout(timeout);
        router.replace("/onboarding");
      }
    };

    userCheck();
  }, []);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    scale.value = withSpring(1, {
      damping: 14,
      stiffness: 100,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <AppText style={styles.logo}>Penny</AppText>

        <AppText style={styles.tagline}>Every peso counts.</AppText>
      </Animated.View>

      <View style={styles.footer}>
        <AppText style={styles.footerText}>Made with love ♡</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    alignItems: "center",
  },

  logo: {
    fontSize: 48,
    fontFamily: "NunitoBold",
    color: COLORS.textDark,
    letterSpacing: -1.5,
  },

  tagline: {
    fontSize: 14,
    fontFamily: "NunitoRegular",
    color: COLORS.muted,
    marginTop: 6,
    letterSpacing: 0.5,
  },

  footer: {
    position: "absolute",
    bottom: 35,
  },

  footerText: {
    fontSize: 12,
    fontFamily: "NunitoRegular",
    color: COLORS.muted,
  },
});
