import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { COLORS } from "./theme";

/**
 * RewardedAdOverlay — MOCKED simulated rewarded-ad experience.
 *
 * Does NOT integrate with a real ad SDK. When the user opts-in, a full-screen
 * countdown plays for `duration` seconds, then `onComplete` fires (which is
 * where the reward should be granted). `onSkip` (optional) lets the caller
 * let users bail out early (used for the optional pre-run bonus flow).
 *
 * Swap this component for a real SDK (AdMob, Applovin, IronSource, etc.) by
 * keeping the same `visible` / `onComplete` / `onSkip` props.
 */
export function RewardedAdOverlay({
  visible,
  duration = 3,
  skippable = false,
  onComplete,
  onSkip,
  title = "REWARDED AD",
  subtitle = "Thanks for supporting the library!",
}: {
  visible: boolean;
  duration?: number;
  skippable?: boolean;
  onComplete: () => void;
  onSkip?: () => void;
  title?: string;
  subtitle?: string;
}) {
  const [remaining, setRemaining] = useState(duration);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    firedRef.current = false;
    setRemaining(duration);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const left = Math.max(0, Math.ceil(duration - elapsed));
      setRemaining(left);
      if (elapsed >= duration && !firedRef.current) {
        firedRef.current = true;
        clearInterval(interval);
        onComplete();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [visible, duration, onComplete]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop} testID="rewarded-ad-overlay">
        <View style={styles.panel}>
          <Text style={styles.adTag}>AD</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.countdownBox}>
            <Text style={styles.countdown}>{remaining}</Text>
            <Text style={styles.countdownLabel}>seconds remaining</Text>
          </View>

          <Text style={styles.mock}>(simulated — no real ad network)</Text>

          {skippable && onSkip && remaining > 0 && (
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={onSkip}
              activeOpacity={0.8}
              testID="rewarded-ad-skip"
            >
              <Text style={styles.skipTxt}>SKIP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center", padding: 24 },
  panel: { width: "100%", maxWidth: 360, borderWidth: 4, borderColor: COLORS.gold, backgroundColor: COLORS.bgSurface, padding: 22, alignItems: "center" },
  adTag: { position: "absolute", top: 8, right: 10, color: COLORS.bgSurface, backgroundColor: COLORS.gold, paddingHorizontal: 8, paddingVertical: 2, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  title: { color: COLORS.gold, fontSize: 22, fontWeight: "900", letterSpacing: 3, marginTop: 10, textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  subtitle: { color: COLORS.muted, fontSize: 11, letterSpacing: 2, textAlign: "center", marginTop: 10, marginBottom: 18, lineHeight: 16 },
  countdownBox: { width: 96, height: 96, borderWidth: 3, borderColor: COLORS.neonOrange, borderRadius: 48, alignItems: "center", justifyContent: "center", marginVertical: 8 },
  countdown: { color: COLORS.neonOrange, fontSize: 40, fontWeight: "900" },
  countdownLabel: { color: COLORS.muted, fontSize: 8, letterSpacing: 1.5, fontWeight: "700" },
  mock: { color: COLORS.muted, fontSize: 9, fontStyle: "italic", marginTop: 14, letterSpacing: 1 },
  skipBtn: { marginTop: 18, paddingHorizontal: 22, paddingVertical: 8, borderWidth: 2, borderColor: COLORS.muted },
  skipTxt: { color: COLORS.parchment, fontSize: 11, fontWeight: "900", letterSpacing: 3 },
});
