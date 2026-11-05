import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { CalendarDays, CirclePlus, Wallet } from "lucide-react-native";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// apptext has components for text with custom fonts and styles
import { AppText } from "../../components/ui/AppText";

import { COLORS } from "../../theme/colors";

import {
    getAllAllowancesForToday,
    getTodayTotalAllowance,
} from "../../utils/allowances";
import { getTotalExpensesToday } from "../../utils/expenses";
import { getUser } from "../../utils/user";
getTodayTotalAllowance;
type Activity = { id: number; description: string; amount: number };

const CARD_BG = "#B8D8F4";

const formatPeso = (value: number | null) =>
  `₱ ${(value ?? 0).toLocaleString("en-PH")}`;

/* ---------- Small animation helpers ---------- */

// Fades in and slides up on mount. Stagger with `delay`.
function FadeInUp({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 450,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Pressable that springs down slightly when pressed.
function PressableScale({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number, bounciness: number) =>
    Animated.spring(scale, {
      toValue,
      speed: 40,
      bounciness,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={[{ flex: 1, transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.94, 0)}
        onPressOut={() => animateTo(1, 10)}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* ---------- Screen ---------- */

export default function Dashboard() {
  const router = useRouter();
  const db = useSQLiteContext();

  const [user, setUser] = useState<{ name: string } | null>(null);
  const [remainingBalance, setRemainingBalance] = useState<number | null>(null);
  const [totalExpenses, setTotalExpenses] = useState<number | null>(null);
  const [todayAllowance, setTodayAllowance] = useState<number | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser(db);
      setUser(userData);
    };

    const fetchTotalExpenses = async (): Promise<number> => {
      // TODO: replace with your actual database query
      const total = await getTotalExpensesToday(db);
      setTotalExpenses(total);
      return total;
    };

    const fetchRemainingBalance = async () => {
      // TODO: replace with your actual database query
      const totalExpenses = await fetchTotalExpenses();
      const todayAllowance = await fetchTodayAllowance();
      const remaining = (todayAllowance ?? 0) - totalExpenses;
      setRemainingBalance(remaining);
    };

    const fetchTodayAllowance = async (): Promise<number | null> => {
      const allowance = await getTodayTotalAllowance(db);
      setTodayAllowance(allowance);
      return allowance;
    };

    const fetchRecentActivities = async () => {
      // TODO: replace with your actual database query
      const allowances = await getAllAllowancesForToday(db);

      setRecentActivities([
        { id: 1, description: "Grocery shopping", amount: 50 },
        { id: 2, description: "Dinner", amount: 30 },
        { id: 3, description: "Transportation", amount: 20 },
      ]);
    };

    fetchUser();
    fetchRemainingBalance();
    fetchRecentActivities();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const percentRemaining =
    todayAllowance && remainingBalance !== null && todayAllowance > 0
      ? Math.max(0, Math.round((remainingBalance / todayAllowance) * 100))
      : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FadeInUp delay={0}>
          <AppText style={styles.greeting}>
            Hello, {user?.name ?? "there"}
          </AppText>
          <AppText style={styles.subtitle}>
            Let's manage your money today
          </AppText>
          <View style={styles.dateRow}>
            <CalendarDays size={12} color={COLORS.savings} />
            <AppText style={styles.dateText}>{today}</AppText>
          </View>
        </FadeInUp>

        {/* Balance card */}
        <FadeInUp delay={120} style={styles.card}>
          <AppText style={styles.cardLabel}>REMAINING BALANCE</AppText>
          <AppText style={styles.balance}>
            {formatPeso(remainingBalance)}
          </AppText>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View>
              <AppText style={styles.statLabel}>Today's allowance</AppText>
              <AppText style={styles.statValue}>
                {formatPeso(todayAllowance)}
              </AppText>
            </View>
            <View style={styles.statRight}>
              <AppText style={styles.statLabel}>Spent today</AppText>
              <AppText style={styles.statValue}>
                {formatPeso(totalExpenses)}
              </AppText>
            </View>
          </View>

          <AppText style={styles.percentText}>
            {percentRemaining}% of your allowance remaining
          </AppText>
        </FadeInUp>

        {/* Quick actions */}
        <FadeInUp delay={240}>
          <AppText style={styles.sectionTitle}>Quick Actions</AppText>
          <View style={styles.actionsRow}>
            <PressableScale
              style={[styles.actionButton, styles.expenseButton]}
              onPress={() => router.push("/add-expense" as any)} // adjust route
            >
              <CirclePlus size={30} color="#DCE8F8" strokeWidth={1.75} />
              <AppText style={[styles.actionLabel, { color: "#DCE8F8" }]}>
                Add Expense
              </AppText>
            </PressableScale>

            <PressableScale
              style={[styles.actionButton, styles.allowanceButton]}
              onPress={() => router.push("/add-allowance" as any)} // adjust route
            >
              <Wallet size={30} color={COLORS.savings} strokeWidth={1.75} />
              <AppText style={[styles.actionLabel, { color: COLORS.savings }]}>
                Add Allowance
              </AppText>
            </PressableScale>
          </View>
        </FadeInUp>

        {/* Recent activity */}
        <FadeInUp delay={360}>
          <AppText style={styles.sectionTitle}>Recent Activity</AppText>
        </FadeInUp>
        {recentActivities.map((item, index) => (
          <FadeInUp key={item.id} delay={440 + index * 80}>
            <View style={styles.activityItem}>
              <AppText style={styles.activityDesc}>{item.description}</AppText>
              <AppText style={styles.activityAmount}>
                -₱{item.amount.toLocaleString("en-PH")}
              </AppText>
            </View>
          </FadeInUp>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Header
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textDark,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.savings,
  },

  // Card
  card: {
    marginTop: 14,
    backgroundColor: CARD_BG,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.textDark,
    letterSpacing: 0.3,
  },
  balance: {
    fontSize: 48,
    fontWeight: "800",
    color: COLORS.textDark,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.textDark,
    opacity: 0.5,
    marginTop: 8,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statRight: {
    alignItems: "flex-end",
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textDark,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  percentText: {
    fontSize: 12,
    color: COLORS.textDark,
    marginTop: 8,
  },

  // Sections
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginTop: 22,
    marginBottom: 10,
  },

  // Quick actions
  actionsRow: {
    flexDirection: "row",
    gap: 20,
  },
  actionButton: {
    height: 78,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  expenseButton: {
    backgroundColor: COLORS.savings,
  },
  allowanceButton: {
    backgroundColor: "#DDEBFD",
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "700",
  },

  // Recent activity
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityDesc: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.expense,
  },
});
