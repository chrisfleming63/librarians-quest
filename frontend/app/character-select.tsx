import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../src/theme";
import { MaleLibrarian, FemaleLibrarian } from "../src/Sprites";

export default function CharacterSelect() {
  const router = useRouter();
  const [selected, setSelected] = useState<"male" | "female" | null>(null);

  const startGame = () => {
    if (!selected) return;
    router.replace({ pathname: "/intro", params: { character: selected } });
  };

  return (
    <SafeAreaView style={styles.safe} testID="character-select-screen">
      <Text style={styles.title}>CHOOSE YOUR</Text>
      <Text style={styles.titleAccent}>LIBRARIAN</Text>

      <View style={styles.row}>
        <TouchableOpacity
          testID="select-male-librarian-button"
          style={[styles.card, selected === "male" && styles.cardSelected]}
          activeOpacity={0.85}
          onPress={() => setSelected("male")}
        >
          <View style={styles.spriteWrap}>
            <MaleLibrarian width={100} height={150} />
          </View>
          <Text style={styles.charName}>MARCUS</Text>
          <Text style={styles.charDesc}>The Archivist</Text>
          <View style={styles.statsBox}>
            <Stat label="JUMP" value="HIGH" />
            <Stat label="STYLE" value="CLASSIC" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          testID="select-female-librarian-button"
          style={[styles.card, selected === "female" && styles.cardSelected]}
          activeOpacity={0.85}
          onPress={() => setSelected("female")}
        >
          <View style={styles.spriteWrap}>
            <FemaleLibrarian width={100} height={150} />
          </View>
          <Text style={styles.charName}>MAYA</Text>
          <Text style={styles.charDesc}>The Curator</Text>
          <View style={styles.statsBox}>
            <Stat label="JUMP" value="HIGH" />
            <Stat label="STYLE" value="BOLD" />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        testID="confirm-character-button"
        style={[styles.startBtn, !selected && styles.startBtnDisabled]}
        onPress={startGame}
        disabled={!selected}
        activeOpacity={0.8}
      >
        <Text style={styles.startBtnText}>{selected ? "▶  LET'S GO!" : "PICK A HERO"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-button">
        <Text style={styles.backText}>◀ back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBase, padding: 20 },
  title: { color: COLORS.parchment, fontSize: 22, fontWeight: "900", letterSpacing: 2, textAlign: "center", marginTop: 12 },
  titleAccent: { color: COLORS.gold, fontSize: 36, fontWeight: "900", letterSpacing: 3, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 28, flex: 1, alignItems: "center" },
  card: { flex: 1, backgroundColor: COLORS.bgSurface, borderWidth: 3, borderColor: COLORS.muted, padding: 14, alignItems: "center" },
  cardSelected: { borderColor: COLORS.gold, backgroundColor: "#3a2a1e", transform: [{ scale: 1.02 }] },
  spriteWrap: { height: 160, justifyContent: "flex-end", alignItems: "center", marginBottom: 12 },
  charName: { color: COLORS.gold, fontSize: 22, fontWeight: "900", letterSpacing: 2 },
  charDesc: { color: COLORS.muted, fontSize: 12, letterSpacing: 1, marginBottom: 10 },
  statsBox: { width: "100%", borderTopWidth: 2, borderTopColor: COLORS.muted, paddingTop: 8, gap: 4 },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
  statLabel: { color: COLORS.muted, fontSize: 10, letterSpacing: 1, fontWeight: "700" },
  statVal: { color: COLORS.parchment, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  startBtn: { marginTop: 12, alignSelf: "center", backgroundColor: COLORS.neonOrange, paddingVertical: 16, paddingHorizontal: 50, borderWidth: 4, borderColor: "#000" },
  startBtnDisabled: { backgroundColor: "#555", opacity: 0.6 },
  startBtnText: { color: "#000", fontWeight: "900", fontSize: 16, letterSpacing: 2 },
  backBtn: { alignSelf: "center", marginTop: 14, padding: 8 },
  backText: { color: COLORS.muted, fontSize: 13, letterSpacing: 1 },
});
