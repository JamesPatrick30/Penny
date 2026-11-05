import { StyleSheet, Text, TextProps } from "react-native";

import { fonts } from "@/theme/fonts";

export function AppText({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.default, style]} />;
}

const styles = StyleSheet.create({
  default: {
    fontFamily: fonts.regular,
    color: "#26364A",
  },
});
