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

// --- PROTESTER ENEMY (replaces monster) ---
// An angry pixel-person holding up a picket sign reading "BANNED" / "BAN BOOKS" / etc.
export function BannerEnemy({ width, height, variant = 0, sign = "BANNED" }: SpriteProps & { variant?: number; sign?: string }) {
  const skinTones = ["#D4A373", "#8B6F47", "#E8C39E", "#A67C52"];
  const shirtColors = ["#4A4E69", "#6B2737", "#2C5F2D", "#7D3C98"];
  const hairColors = ["#2B1810", "#5C3A21", "#1A1110", "#8B4513"];
  const skin = skinTones[variant % skinTones.length];
  const shirt = shirtColors[variant % shirtColors.length];
  const hair = hairColors[variant % hairColors.length];
  const pants = "#1A1110";
  const signBg = "#FDF0D5";
  const signStroke = "#1A0F08";
  return (
    <View style={{ width, height }} testID="sprite-protester">
      {/* Picket sign held up */}
      <View style={{ position: "absolute", left: width * 0.05, top: 0, width: width * 0.9, height: height * 0.3, backgroundColor: signBg, borderWidth: 2, borderColor: signStroke, justifyContent: "center", alignItems: "center", transform: [{ rotate: "-6deg" }] }}>
        <Text style={{ color: COLORS.ruby, fontSize: Math.max(7, width * 0.18), fontWeight: "900", letterSpacing: 1 }}>{sign}</Text>
      </View>
      {/* Sign stick */}
      <View style={{ position: "absolute", left: width * 0.48, top: height * 0.28, width: 4, height: height * 0.22, backgroundColor: "#3A1F12", transform: [{ rotate: "-4deg" }] }} />

      {/* Hair */}
      <View style={{ position: "absolute", left: width * 0.28, top: height * 0.34, width: width * 0.44, height: height * 0.1, backgroundColor: hair }} />
      {/* Face */}
      <View style={{ position: "absolute", left: width * 0.3, top: height * 0.42, width: width * 0.4, height: height * 0.17, backgroundColor: skin, borderRadius: 2 }} />
      {/* Angry eyebrows */}
      <View style={{ position: "absolute", left: width * 0.33, top: height * 0.46, width: width * 0.1, height: 2, backgroundColor: "#000", transform: [{ rotate: "10deg" }] }} />
      <View style={{ position: "absolute", right: width * 0.33, top: height * 0.46, width: width * 0.1, height: 2, backgroundColor: "#000", transform: [{ rotate: "-10deg" }] }} />
      {/* Eyes */}
      <View style={{ position: "absolute", left: width * 0.36, top: height * 0.5, width: 3, height: 3, backgroundColor: "#000" }} />
      <View style={{ position: "absolute", right: width * 0.36, top: height * 0.5, width: 3, height: 3, backgroundColor: "#000" }} />
      {/* Mouth (open shouting) */}
      <View style={{ position: "absolute", left: width * 0.42, top: height * 0.55, width: width * 0.16, height: 4, backgroundColor: "#000" }} />

      {/* Body / shirt */}
      <View style={{ position: "absolute", left: width * 0.24, top: height * 0.6, width: width * 0.52, height: height * 0.2, backgroundColor: shirt, borderWidth: 1, borderColor: "#000" }} />
      {/* Raised arm holding sign */}
      <View style={{ position: "absolute", left: width * 0.42, top: height * 0.3, width: width * 0.08, height: height * 0.3, backgroundColor: skin, borderWidth: 1, borderColor: "#000" }} />
      {/* Other arm */}
      <View style={{ position: "absolute", left: width * 0.12, top: height * 0.62, width: width * 0.14, height: height * 0.18, backgroundColor: skin, borderWidth: 1, borderColor: "#000" }} />

      {/* Legs */}
      <View style={{ position: "absolute", left: width * 0.3, top: height * 0.8, width: width * 0.16, height: height * 0.15, backgroundColor: pants }} />
      <View style={{ position: "absolute", right: width * 0.3, top: height * 0.8, width: width * 0.16, height: height * 0.15, backgroundColor: pants }} />
      {/* Shoes */}
      <View style={{ position: "absolute", left: width * 0.28, top: height * 0.94, width: width * 0.22, height: height * 0.06, backgroundColor: "#000" }} />
      <View style={{ position: "absolute", right: width * 0.28, top: height * 0.94, width: width * 0.22, height: height * 0.06, backgroundColor: "#000" }} />
    </View>
  );
}

// --- BOSS PROTESTER ---
// Bigger, meaner, holds a massive sign and wears a suit (politician vibe)
export type BossVariant = "censor" | "board" | "inquisitor";

const BOSS_VARIANTS: Record<BossVariant, {
  signText: string;
  signBg: string;
  signTextColor: string;
  signTilt: string;
  suit: string;
  suitTrim: string;
  skin: string;
  accent: string; // tie / sash / collar
  accentY: number; // top % for accent
  eye: string;
  hat?: { color: string; brim?: string };
  hood?: boolean;
  glasses?: boolean;
  badgeText?: string; // small badge color/text element
}> = {
  censor: {
    signText: "CENSOR!",
    signBg: "#FDF0D5",
    signTextColor: COLORS.ruby,
    signTilt: "-4deg",
    suit: "#1A1F3A",
    suitTrim: "#000",
    skin: "#C8956D",
    accent: COLORS.ruby,
    accentY: 0.52,
    eye: "#FF0000",
  },
  board: {
    signText: "BANNED!",
    signBg: "#FFF",
    signTextColor: "#3A1F12",
    signTilt: "5deg",
    suit: "#5A4632",
    suitTrim: "#1A0F08",
    skin: "#A77B55",
    accent: "#1F3F1A", // green tie
    accentY: 0.50,
    eye: "#FFD24A",
    glasses: true,
    hat: { color: "#1A0F08", brim: "#3A1F12" },
  },
  inquisitor: {
    signText: "FORBIDDEN!",
    signBg: "#1A0820",
    signTextColor: "#E63946",
    signTilt: "-8deg",
    suit: "#2A0F3A", // dark purple robe
    suitTrim: "#0A0010",
    skin: "#7A5A48", // shadowed
    accent: "#FFD24A", // gold cord
    accentY: 0.46,
    eye: "#FF2E63", // glowing red-pink
    hood: true,
  },
};

export function BossProtester({ width, height, hp, maxHp, variant = "censor" }: SpriteProps & { hp: number; maxHp: number; variant?: BossVariant }) {
  const v = BOSS_VARIANTS[variant];
  return (
    <View style={{ width, height }} testID={`sprite-boss-${variant}`}>
      {/* HP bar above head */}
      <View style={{ position: "absolute", left: 0, top: -14, width, height: 8, backgroundColor: "#000", borderWidth: 1, borderColor: COLORS.gold }}>
        <View style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%`, height: "100%", backgroundColor: COLORS.ruby }} />
      </View>
      {/* Huge picket sign */}
      <View style={{ position: "absolute", left: width * 0.02, top: 0, width: width * 0.96, height: height * 0.3, backgroundColor: v.signBg, borderWidth: 3, borderColor: "#1A0F08", justifyContent: "center", alignItems: "center", transform: [{ rotate: v.signTilt }] }}>
        <Text style={{ color: v.signTextColor, fontSize: Math.max(10, width * 0.13), fontWeight: "900", letterSpacing: 1 }}>{v.signText}</Text>
      </View>
      {/* Sign stick */}
      <View style={{ position: "absolute", left: width * 0.48, top: height * 0.28, width: 6, height: height * 0.2, backgroundColor: "#3A1F12" }} />
      {/* Suit jacket body */}
      <View style={{ position: "absolute", left: width * 0.2, top: height * 0.3, width: width * 0.6, height: height * 0.5, backgroundColor: v.suit, borderWidth: 2, borderColor: v.suitTrim }} />
      {/* Hood (inquisitor only) — drapes around the head */}
      {v.hood && (
        <View style={{ position: "absolute", left: width * 0.22, top: height * 0.28, width: width * 0.56, height: height * 0.32, backgroundColor: v.suit, borderWidth: 2, borderColor: v.suitTrim, borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
      )}
      {/* Head */}
      <View style={{ position: "absolute", left: width * 0.3, top: height * 0.32, width: width * 0.4, height: height * 0.2, backgroundColor: v.skin, borderWidth: 2, borderColor: "#000" }} />
      {/* Hat (board chair only) */}
      {v.hat && (
        <>
          <View style={{ position: "absolute", left: width * 0.26, top: height * 0.30, width: width * 0.48, height: 4, backgroundColor: v.hat.brim || v.hat.color }} />
          <View style={{ position: "absolute", left: width * 0.32, top: height * 0.24, width: width * 0.36, height: height * 0.07, backgroundColor: v.hat.color }} />
        </>
      )}
      {/* Glasses (board chair) */}
      {v.glasses && (
        <>
          <View style={{ position: "absolute", left: width * 0.34, top: height * 0.39, width: width * 0.1, height: 6, borderWidth: 1, borderColor: "#000", backgroundColor: "#FFF" }} />
          <View style={{ position: "absolute", right: width * 0.34, top: height * 0.39, width: width * 0.1, height: 6, borderWidth: 1, borderColor: "#000", backgroundColor: "#FFF" }} />
        </>
      )}
      {/* Accent (tie / sash / cord) */}
      <View style={{ position: "absolute", left: width * 0.46, top: height * v.accentY, width: width * 0.08, height: height * 0.2, backgroundColor: v.accent }} />
      {/* Eyes */}
      <View style={{ position: "absolute", left: width * 0.36, top: height * 0.4, width: 5, height: 5, backgroundColor: v.eye }} />
      <View style={{ position: "absolute", right: width * 0.36, top: height * 0.4, width: 5, height: 5, backgroundColor: v.eye }} />
      {/* Mouth */}
      <View style={{ position: "absolute", left: width * 0.4, top: height * 0.48, width: width * 0.2, height: 3, backgroundColor: "#000" }} />
      {/* Legs */}
      <View style={{ position: "absolute", left: width * 0.28, top: height * 0.8, width: width * 0.18, height: height * 0.18, backgroundColor: variant === "inquisitor" ? v.suit : "#0F0807" }} />
      <View style={{ position: "absolute", right: width * 0.28, top: height * 0.8, width: width * 0.18, height: height * 0.18, backgroundColor: variant === "inquisitor" ? v.suit : "#0F0807" }} />
      {/* Shoes */}
      <View style={{ position: "absolute", left: width * 0.26, top: height * 0.96, width: width * 0.24, height: height * 0.04, backgroundColor: "#000" }} />
      <View style={{ position: "absolute", right: width * 0.26, top: height * 0.96, width: width * 0.24, height: height * 0.04, backgroundColor: "#000" }} />
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
