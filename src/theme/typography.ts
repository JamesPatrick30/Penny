import { fonts } from "./fonts";

export const typography = {
  h1: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
  },
  h2: {
    fontFamily: fonts.bold,
    fontSize: 24,
  },
  h3: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  bodyMedium: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  button: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  amount: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
  },
} as const;
