import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../src/theme";

type BossDef = {
  level: number;
  name: string;
  attack: string;
  desc: string;
  hp: number;
};

const BOSSES: BossDef[] = [
  { level: 5,  name: "THE CENSOR-IN-CHIEF", attack: "signs",     desc: "Throws BANNED signs at varying heights.",      hp: 4 },
  { level: 10, name: "THE BOARD CHAIR",     attack: "shockwave", desc: "Slams the ground and launches shockwaves.",   hp: 5 },
  { level: 15, name: "THE GRAND INQUISITOR", attack: "teleport", desc: "Warps across the library and hurls CENSOR signs.", hp: 6 },
  { level: 20, name: "THE CENSOR-IN-CHIEF II", attack: "signs",  desc: "Faster sign throws, tougher HP.",             hp: 6 },
  { level: 25, name: "THE BOARD CHAIR II",  attack: "shockwave", desc: "Relentless slam pattern at max difficulty.",  hp: 6 },
];

export default function BossTest() {
  const router = useRouter();
  const [character, setCharacter] = useState<"male" | "female">("female");

  const launchBoss = (level: number) => {
    router.push(`/game?character=${character}&startLevel=${level}`);
  };

  return (
    <SafeAreaView style={styles.safe} testID="boss-test-screen">
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>★ DEV MENU ★</Text>
        <Text style={styles.title}>BOSS TEST</Text>
        <Text style={styles.subtitle}>Jump directly into any boss fight</Text>

        {/* Character toggle */}
        <View style={styles.charRow}>
          <TouchableOpacity
            style={[styles.charPill, character === "male" && styles.charPillActive]}
            onPress={() => setCharacter("male")}
            activeOpacity={0.8}
            testID="boss-test-pick-marcus"
          >
            <Text style={[styles.charPillText, character === "male" && styles.charPillTextActive]}>MARCUS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.charPill, character === "female" && styles.charPillActive]}
            onPress={() => setCharacter("female")}
            activeOpacity={0.8}
            testID="boss-test-pick-maya"
          >
            <Text style={[styles.charPillText, character === "female" && styles.charPillTextActive]}>MAYA</Text>
          </TouchableOpacity>
        </View>

        {/* Boss list */}
        {BOSSES.map((b) => (
          <TouchableOpacity
            key={b.level}
            style={styles.bossCard}
            activeOpacity={0.85}
            onPress={() => launchBoss(b.level)}
            testID={`boss-test-launch-${b.level}`}
          >
            <View style={styles.bossCardHeader}>
              <Text style={styles.bossLevel}>LVL {b.level}</Text>
              <Text style={styles.bossAttack}>{b.attack.toUpperCase()}</Text>
            </View>
            <Text style={styles.bossName}>{b.name}</Text>
            <Text style={styles.bossDesc}>{b.desc}</Text>
            <View style={styles.hpRow}>
              {Array.from({ length: b.hp }).map((_, i) => (
                <View key={i} style={styles.hpPip} />
              ))}
              <Text style={styles.hpLabel}>{b.hp} HP</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
          testID="boss-test-back"
        >
          <Text style={styles.backBtnText}>◀ BACK</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBase },
  inner: { padding: 22, paddingBottom: 50, alignItems: "stretch" },
  kicker: { color: COLORS.muted, fontSize: 10, letterSpacing: 4, fontWeight: "700", textAlign: "center", marginTop: 8 },
  title: { color: COLORS.gold, fontSize: 34, fontWeight: "900", letterSpacing: 3, textAlign: "center", marginTop: 6, textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  subtitle: { color: COLORS.muted, fontSize: 12, letterSpacing: 2, textAlign: "center", marginTop: 4, marginBottom: 20 },

  charRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 22 },
  charPill: { paddingVertical: 10, paddingHorizontal: 22, borderWidth: 3, borderColor: COLORS.muted, backgroundColor: COLORS.bgSurface, minWidth: 120, alignItems: "center" },
  charPillActive: { borderColor: COLORS.gold, backgroundColor: COLORS.bgSurface },
  charPillText: { color: COLORS.muted, fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  charPillTextActive: { color: COLORS.gold },

  bossCard: { backgroundColor: COLORS.bgSurface, borderWidth: 3, borderColor: COLORS.ruby, padding: 14, marginBottom: 12 },
  bossCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  bossLevel: { color: COLORS.gold, fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  bossAttack: { color: COLORS.neonOrange, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  bossName: { color: COLORS.parchment, fontSize: 20, fontWeight: "900", letterSpacing: 1, marginBottom: 4 },
  bossDesc: { color: COLORS.muted, fontSize: 12, lineHeight: 16, marginBottom: 10 },
  hpRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  hpPip: { width: 14, height: 10, backgroundColor: COLORS.ruby, borderWidth: 1, borderColor: "#000" },
  hpLabel: { color: COLORS.muted, fontSize: 10, marginLeft: 6, letterSpacing: 1, fontWeight: "700" },

  backBtn: { marginTop: 20, alignSelf: "center", paddingVertical: 10, paddingHorizontal: 28, borderWidth: 2, borderColor: COLORS.muted },
  backBtnText: { color: COLORS.muted, fontSize: 12, fontWeight: "900", letterSpacing: 2 },
});
