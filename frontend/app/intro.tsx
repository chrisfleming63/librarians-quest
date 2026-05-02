import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Pressable, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "../src/theme";

const PANELS = [
  {
    kicker: "THE YEAR IS NOW",
    body: "Across the nation, book banners march on libraries — hauling away stories, silencing voices.",
  },
  {
    kicker: "ONE LIBRARY STANDS",
    body: "Its shelves still burn bright with the words of ancestors. Their stories must survive.",
  },
  {
    kicker: "YOU ARE THE KEEPER",
    body: "Collect the books. Dodge the banners. Defend the library at all costs.",
  },
];

// Delay before the "TAP TO CONTINUE" hint becomes available — gives the
// player a moment to read before the screen invites them onward.
const HINT_DELAY_MS = 700;

export default function Intro() {
  const router = useRouter();
  const { character, bonus } = useLocalSearchParams<{ character?: string; bonus?: string }>();
  const [idx, setIdx] = useState(0);
  const [canTap, setCanTap] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const hintBlink = useRef(new Animated.Value(0.35)).current;
  const advancingRef = useRef(false);

  const goNext = React.useCallback(() => {
    setIdx((i) => i + 1);
  }, []);

  // Fade in. NO auto-advance — the player must tap to continue.
  useEffect(() => {
    advancingRef.current = false;
    setCanTap(false);
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    const enable = setTimeout(() => setCanTap(true), HINT_DELAY_MS);
    return () => clearTimeout(enable);
  }, [idx, fade]);

  // When we run past the last panel, replace into /game
  useEffect(() => {
    if (idx >= PANELS.length) {
      router.replace({
        pathname: "/game",
        params: bonus
          ? { character: character || "female", bonus }
          : { character: character || "female" },
      });
    }
  }, [idx, character, bonus, router]);

  // Subtle blinking "TAP TO CONTINUE" hint — only animates when canTap is true.
  useEffect(() => {
    if (!canTap) {
      hintBlink.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hintBlink, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(hintBlink, { toValue: 0.25, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [canTap, hintBlink]);

  // Player-controlled pacing: tap to advance, ignored until the hint is shown
  // so a stray tap during the fade-in doesn't blow past the panel.
  const handleTap = () => {
    if (!canTap || advancingRef.current) return;
    advancingRef.current = true;
    Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      goNext();
    });
  };

  const panel = PANELS[Math.min(idx, PANELS.length - 1)];
  const isLast = idx === PANELS.length - 1;

  return (
    <SafeAreaView style={styles.safe} testID="intro-screen">
      <Pressable style={styles.tapArea} onPress={handleTap} testID="intro-tap-area">
        <Animated.View style={[styles.inner, { opacity: fade }]}>
          <Text style={styles.kicker}>{panel.kicker}</Text>
          <Text style={styles.body}>{panel.body}</Text>
        </Animated.View>

        <View style={styles.footer} pointerEvents="none">
          <View style={styles.dots}>
            {PANELS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === idx && styles.dotActive]}
              />
            ))}
          </View>
          <Animated.Text style={[styles.hint, { opacity: hintBlink }]}>
            {isLast ? "TAP TO BEGIN  ▶" : "TAP TO CONTINUE  ▶"}
          </Animated.Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBase },
  tapArea: { flex: 1 },
  inner: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  kicker: { color: COLORS.gold, fontSize: 14, letterSpacing: 4, fontWeight: "900", marginBottom: 18, textAlign: "center" },
  body: { color: COLORS.parchment, fontSize: 26, lineHeight: 34, fontWeight: "900", letterSpacing: 1, textAlign: "center", textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 36, alignItems: "center" },
  dots: { flexDirection: "row", gap: 8, marginBottom: 14 },
  dot: { width: 10, height: 10, backgroundColor: COLORS.muted, borderWidth: 2, borderColor: "#000" },
  dotActive: { backgroundColor: COLORS.gold },
  hint: { color: COLORS.gold, fontSize: 12, letterSpacing: 3, fontWeight: "900" },
});
