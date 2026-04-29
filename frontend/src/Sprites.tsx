import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "./theme";

/**
 * Pixel-art style sprites built from colored Views.
 * Each sprite receives its size via props.
 */

type SpriteProps = { width: number; height: number };

// --- LIBRARIAN (Male) ---
export function MaleLibrarian({ width, height, running = true }: SpriteProps & { running?: boolean }) {
  // Scaled body proportions
  const skin = "#6B3F23";
  const hair = "#1A0F08";
  const shirt = "#E8C547"; // yellow cardigan
  const pants = "#2C1E16";
  const bowtie = COLORS.ruby;
  return (
    <View style={{ width, height }} testID="sprite-male-librarian">
      {/* Hair */}
      <View style={{ position: "absolute", left: width * 0.25, top: 0, width: width * 0.5, height: height * 0.14, backgroundColor: hair, borderRadius: 2 }} />
      {/* Face */}
      <View style={{ position: "absolute", left: width * 0.28, top: height * 0.1, width: width * 0.44, height: height * 0.2, backgroundColor: skin, borderRadius: 3 }} />
      {/* Glasses */}
      <View style={{ position: "absolute", left: width * 0.3, top: height * 0.18, width: width * 0.4, height: 3, backgroundColor: "#111" }} />
      <View style={{ position: "absolute", left: width * 0.32, top: height * 0.15, width: width * 0.14, height: height * 0.08, borderWidth: 2, borderColor: "#111", backgroundColor: "rgba(255,255,255,0.25)" }} />
      <View style={{ position: "absolute", left: width * 0.54, top: height * 0.15, width: width * 0.14, height: height * 0.08, borderWidth: 2, borderColor: "#111", backgroundColor: "rgba(255,255,255,0.25)" }} />
      {/* Bowtie */}
      <View style={{ position: "absolute", left: width * 0.38, top: height * 0.32, width: width * 0.24, height: height * 0.06, backgroundColor: bowtie }} />
      {/* Body / cardigan */}
      <View style={{ position: "absolute", left: width * 0.2, top: height * 0.38, width: width * 0.6, height: height * 0.3, backgroundColor: shirt, borderRadius: 3 }} />
      {/* Cardigan trim */}
      <View style={{ position: "absolute", left: width * 0.48, top: height * 0.38, width: 3, height: height * 0.3, backgroundColor: "#8B4513" }} />
      {/* Arms */}
      <View style={{ position: "absolute", left: width * 0.08, top: height * 0.42, width: width * 0.15, height: height * 0.22, backgroundColor: shirt, borderRadius: 2 }} />
      <View style={{ position: "absolute", left: width * 0.77, top: height * 0.42, width: width * 0.15, height: height * 0.22, backgroundColor: shirt, borderRadius: 2 }} />
      {/* Legs */}
      <View style={{ position: "absolute", left: width * 0.25, top: height * 0.68, width: width * 0.22, height: height * 0.28, backgroundColor: pants, transform: running ? [{ rotate: "8deg" }] : [] }} />
      <View style={{ position: "absolute", left: width * 0.53, top: height * 0.68, width: width * 0.22, height: height * 0.28, backgroundColor: pants, transform: running ? [{ rotate: "-8deg" }] : [] }} />
      {/* Shoes */}
      <View style={{ position: "absolute", left: width * 0.22, top: height * 0.93, width: width * 0.28, height: height * 0.07, backgroundColor: "#111" }} />
      <View style={{ position: "absolute", left: width * 0.5, top: height * 0.93, width: width * 0.28, height: height * 0.07, backgroundColor: "#111" }} />
    </View>
  );
}

// --- LIBRARIAN (Female) ---
export function FemaleLibrarian({ width, height, running = true }: SpriteProps & { running?: boolean }) {
  const skin = "#6B3F23";
  const hair = "#1A0F08";
  const sweater = COLORS.bookGreen; // emerald
  const skirt = "#5A1E2E";
  const lips = "#C1416B";
  return (
    <View style={{ width, height }} testID="sprite-female-librarian">
      {/* Afro puff - wider than head */}
      <View style={{ position: "absolute", left: width * 0.12, top: -height * 0.04, width: width * 0.76, height: height * 0.22, backgroundColor: hair, borderRadius: width * 0.4 }} />
      {/* Face */}
      <View style={{ position: "absolute", left: width * 0.28, top: height * 0.12, width: width * 0.44, height: height * 0.2, backgroundColor: skin, borderRadius: 3 }} />
      {/* Cat-eye glasses */}
      <View style={{ position: "absolute", left: width * 0.3, top: height * 0.2, width: width * 0.4, height: 2, backgroundColor: "#111" }} />
      <View style={{ position: "absolute", left: width * 0.3, top: height * 0.16, width: width * 0.17, height: height * 0.08, borderWidth: 2, borderColor: "#111", borderBottomRightRadius: 8, backgroundColor: "rgba(255,255,255,0.2)" }} />
      <View style={{ position: "absolute", left: width * 0.53, top: height * 0.16, width: width * 0.17, height: height * 0.08, borderWidth: 2, borderColor: "#111", borderBottomLeftRadius: 8, backgroundColor: "rgba(255,255,255,0.2)" }} />
      {/* Lips */}
      <View style={{ position: "absolute", left: width * 0.42, top: height * 0.28, width: width * 0.16, height: 3, backgroundColor: lips }} />
      {/* Sweater */}
      <View style={{ position: "absolute", left: width * 0.2, top: height * 0.38, width: width * 0.6, height: height * 0.28, backgroundColor: sweater, borderRadius: 3 }} />
      {/* Arms */}
      <View style={{ position: "absolute", left: width * 0.08, top: height * 0.42, width: width * 0.15, height: height * 0.22, backgroundColor: sweater, borderRadius: 2 }} />
      <View style={{ position: "absolute", left: width * 0.77, top: height * 0.42, width: width * 0.15, height: height * 0.22, backgroundColor: sweater, borderRadius: 2 }} />
      {/* Book stack in hand */}
      <View style={{ position: "absolute", left: width * 0.82, top: height * 0.58, width: width * 0.14, height: 4, backgroundColor: COLORS.bookRed }} />
      <View style={{ position: "absolute", left: width * 0.82, top: height * 0.62, width: width * 0.14, height: 4, backgroundColor: COLORS.bookYellow }} />
      {/* Skirt */}
      <View style={{ position: "absolute", left: width * 0.18, top: height * 0.66, width: width * 0.64, height: height * 0.22, backgroundColor: skirt }} />
      {/* Legs */}
      <View style={{ position: "absolute", left: width * 0.3, top: height * 0.86, width: width * 0.14, height: height * 0.1, backgroundColor: skin, transform: running ? [{ rotate: "6deg" }] : [] }} />
      <View style={{ position: "absolute", left: width * 0.56, top: height * 0.86, width: width * 0.14, height: height * 0.1, backgroundColor: skin, transform: running ? [{ rotate: "-6deg" }] : [] }} />
      {/* Shoes */}
      <View style={{ position: "absolute", left: width * 0.28, top: height * 0.95, width: width * 0.2, height: height * 0.05, backgroundColor: "#111" }} />
      <View style={{ position: "absolute", left: width * 0.52, top: height * 0.95, width: width * 0.2, height: height * 0.05, backgroundColor: "#111" }} />
    </View>
  );
}

// --- BOOK BANNER ENEMY ---
export function BannerEnemy({ width, height }: SpriteProps) {
  return (
    <View style={{ width, height }} testID="sprite-banner-enemy">
      {/* Book body */}
      <View style={{ position: "absolute", width, height, backgroundColor: COLORS.enemyDark, borderWidth: 2, borderColor: "#000", borderRadius: 2 }} />
      {/* Pages */}
      <View style={{ position: "absolute", left: 2, top: 3, width: 3, height: height - 6, backgroundColor: "#BBB" }} />
      {/* BANNED stamp */}
      <View style={{ position: "absolute", left: width * 0.1, top: height * 0.35, width: width * 0.8, height: height * 0.3, borderWidth: 2, borderColor: COLORS.enemyStamp, transform: [{ rotate: "-8deg" }], justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: COLORS.enemyStamp, fontSize: Math.max(8, width * 0.18), fontWeight: "900", letterSpacing: 1 }}>BANNED</Text>
      </View>
      {/* Angry eyes */}
      <View style={{ position: "absolute", left: width * 0.2, top: height * 0.1, width: 5, height: 5, backgroundColor: "#FF2B2B", borderRadius: 1 }} />
      <View style={{ position: "absolute", left: width * 0.7, top: height * 0.1, width: 5, height: 5, backgroundColor: "#FF2B2B", borderRadius: 1 }} />
      {/* Feet */}
      <View style={{ position: "absolute", left: width * 0.1, top: height - 4, width: width * 0.3, height: 4, backgroundColor: "#000" }} />
      <View style={{ position: "absolute", left: width * 0.6, top: height - 4, width: width * 0.3, height: 4, backgroundColor: "#000" }} />
    </View>
  );
}

// --- COLLECTIBLE BOOK ---
export function CollectibleBook({ width, height, color = COLORS.bookRed }: SpriteProps & { color?: string }) {
  return (
    <View style={{ width, height }} testID="sprite-book">
      {/* Glow halo */}
      <View style={{ position: "absolute", left: -4, top: -4, width: width + 8, height: height + 8, backgroundColor: "rgba(244, 162, 97, 0.35)", borderRadius: 8 }} />
      {/* Book cover */}
      <View style={{ position: "absolute", width, height, backgroundColor: color, borderWidth: 2, borderColor: "#2A1810", borderRadius: 2 }} />
      {/* Gold spine */}
      <View style={{ position: "absolute", left: 0, top: 0, width: 3, height, backgroundColor: COLORS.gold }} />
      {/* Gold detail lines */}
      <View style={{ position: "absolute", left: 6, top: height * 0.3, width: width - 10, height: 2, backgroundColor: COLORS.gold }} />
      <View style={{ position: "absolute", left: 6, top: height * 0.6, width: width - 10, height: 2, backgroundColor: COLORS.gold }} />
      {/* Star sparkle */}
      <View style={{ position: "absolute", right: -2, top: -2, width: 6, height: 6, backgroundColor: "#FFF", transform: [{ rotate: "45deg" }] }} />
    </View>
  );
}

export const styles = StyleSheet.create({});
