import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, Image } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../src/theme";

export default function Title() {
  const router = useRouter();
  const [highScore, setHighScore] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const { width } = Dimensions.get("window");

  // 5-tap unlock on the title logo -> hidden Boss Test menu.
  // Counter resets automatically after 1.5s of inactivity.
  const tapTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSecretTap = React.useCallback(() => {
    setTapCount((n) => {
      const next = n + 1;
      if (next >= 5) {
        if (tapTimer.current) clearTimeout(tapTimer.current);
        router.push("/boss-test");
        return 0;
      }
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapTimer.current = setTimeout(() => setTapCount(0), 1500);
      return next;
    });
  }, [router]);

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem("@lq_high_score").then((v) => {
        if (v) setHighScore(parseInt(v, 10) || 0);
      });
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe} testID="title-screen">
      {/* Decorative shelf stripes in background */}
      <View style={styles.bgStripes} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.shelfLine, { top: 40 + i * 70 }]} />
        ))}
      </View>

      <View style={styles.inner}>
        {/* Cover art — replaces text title and char preview row */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleSecretTap}
          testID="secret-logo-tap"
        >
          <Image
            source={require("../assets/images/cover.png")}
            style={styles.cover}
            resizeMode="contain"
          />
        </TouchableOpacity>
        {tapCount > 0 && tapCount < 5 && (
          <Text style={styles.tapHint}>{"•".repeat(tapCount)}{"◦".repeat(5 - tapCount)}</Text>
        )}

        <View style={styles.scorePanel}>
          <Text style={styles.scoreLabel}>HIGH SCORE</Text>
          <Text style={styles.scoreVal} testID="high-score-value">
            {String(highScore).padStart(6, "0")}
          </Text>
        </View>

        <TouchableOpacity
          testID="start-game-button"
          style={[styles.btn, styles.btnPrimary]}
          activeOpacity={0.8}
          onPress={() => router.push("/character-select")}
        >
          <Text style={styles.btnTextPrimary}>▶  START GAME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="how-to-play-button"
          style={[styles.btn, styles.btnSecondary]}
          activeOpacity={0.8}
          onPress={() => router.push("/how-to-play")}
        >
          <Text style={styles.btnTextSecondary}>HOW TO PLAY</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Celebrating Black Literature ✊🏾📚</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBase },
  bgStripes: { ...StyleSheet.absoluteFillObject, opacity: 0.15 },
  shelfLine: { position: "absolute", left: 0, right: 0, height: 28, backgroundColor: COLORS.shelfDark, borderBottomWidth: 4, borderBottomColor: COLORS.shelfMid },
  inner: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  cover: { width: Dimensions.get("window").width - 32, height: undefined, aspectRatio: 9 / 16, maxHeight: Dimensions.get("window").height * 0.62 },
  kicker: { color: COLORS.muted, fontSize: 11, letterSpacing: 4, marginBottom: 6, fontWeight: "700" },
  title: { color: COLORS.parchment, fontSize: 44, fontWeight: "900", letterSpacing: 2, lineHeight: 48, textShadowColor: "#000", textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 },
  titleAccent: { color: COLORS.gold, marginTop: 2 },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 14, letterSpacing: 2, textAlign: "center" },
  charRow: { flexDirection: "row", alignItems: "center", marginTop: 28, gap: 16 },
  charBox: { padding: 10, borderWidth: 3, borderColor: COLORS.muted, backgroundColor: COLORS.bgSurface },
  vsBadge: { backgroundColor: COLORS.ruby, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 3, borderColor: "#000" },
  vsText: { color: "#FFF", fontWeight: "900", fontSize: 16, letterSpacing: 2 },
  scorePanel: { marginTop: 28, paddingHorizontal: 26, paddingVertical: 12, backgroundColor: COLORS.bgSurface, borderWidth: 3, borderColor: COLORS.gold, alignItems: "center" },
  scoreLabel: { color: COLORS.muted, fontSize: 10, letterSpacing: 3, fontWeight: "700" },
  scoreVal: { color: COLORS.gold, fontSize: 28, fontWeight: "900", letterSpacing: 3, marginTop: 2 },
  btn: { marginTop: 18, paddingVertical: 14, paddingHorizontal: 40, borderWidth: 4, borderColor: "#000", minWidth: 240, alignItems: "center" },
  btnPrimary: { backgroundColor: COLORS.neonOrange },
  btnSecondary: { backgroundColor: COLORS.bgSurface, borderColor: COLORS.muted },
  btnTextPrimary: { color: "#000", fontWeight: "900", fontSize: 16, letterSpacing: 2 },
  btnTextSecondary: { color: COLORS.parchment, fontWeight: "900", fontSize: 14, letterSpacing: 2 },
  footer: { color: COLORS.muted, fontSize: 11, marginTop: 28, letterSpacing: 1 },
  tapHint: { color: COLORS.gold, fontSize: 14, letterSpacing: 4, marginTop: 8, fontWeight: "900" },
});
