import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../src/theme";
import { BannerEnemy, CollectibleBook } from "../src/Sprites";

export default function HowToPlay() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} testID="how-to-play-screen">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>HOW TO PLAY</Text>
        <View style={styles.divider} />

        {/* === CORE CONTROLS === */}
        <Text style={styles.sectionTitle}>CORE CONTROLS</Text>
        <Row
          icon={<Text style={styles.bigEmoji}>👆</Text>}
          title="JUMP"
          desc="Tap the screen to leap over obstacles and enemy attacks. Tap again in mid-air for a double-jump."
        />
        <Row
          icon={<Text style={styles.bigEmoji}>📕</Text>}
          title="THROW BOOKS"
          desc="Tap the book button (bottom-right) to throw a book and damage enemies from a safe distance. Each throw uses one book."
        />
        <Row
          icon={<BannerEnemy width={40} height={50} />}
          title="STOMP"
          desc="Land on an enemy's head from above to deal damage — especially useful on bosses."
        />

        {/* === POWER-UPS === */}
        <Text style={styles.sectionTitle}>POWER-UPS</Text>
        <Row
          icon={<CollectibleBook width={40} height={50} color={COLORS.bookRed} />}
          title="📚  BOOK STACK"
          desc={"• Collect books to build your stack.\n• When you have books, you can throw them at enemies.\n• Each throw uses one book."}
        />
        <Row
          icon={<Text style={styles.bigEmoji}>🛡️</Text>}
          title="SHIELD BUBBLE"
          desc={"• Protects you from one hit.\n• Disappears after absorbing damage.\n• Glowing teal ring shows it's active."}
        />

        {/* === BOSS TIPS === */}
        <Text style={styles.sectionTitle}>BOSS TIPS</Text>
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>• Jump OVER ground attacks (signs and shockwaves).</Text>
          <Text style={styles.tipText}>• Time your jumps to STOMP the boss when it pauses.</Text>
          <Text style={styles.tipText}>• Use BOOKS for safer ranged attacks.</Text>
          <Text style={styles.tipText}>• Watch for the ⚠ DASH warning — get out of the way!</Text>
        </View>

        <TouchableOpacity
          testID="back-to-title-button"
          style={styles.btn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>◀  BACK</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBase },
  content: { padding: 24, paddingBottom: 60 },
  title: { color: COLORS.gold, fontSize: 28, fontWeight: "900", letterSpacing: 3, textAlign: "center", marginTop: 8 },
  divider: { height: 4, backgroundColor: COLORS.muted, marginVertical: 20, borderRadius: 2 },
  sectionTitle: { color: COLORS.neonOrange, fontSize: 14, fontWeight: "900", letterSpacing: 3, marginTop: 6, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 14, backgroundColor: COLORS.bgSurface, borderWidth: 2, borderColor: COLORS.muted, padding: 14 },
  iconWrap: { width: 60, height: 60, alignItems: "center", justifyContent: "center", marginRight: 14 },
  bigEmoji: { fontSize: 34 },
  rowText: { flex: 1 },
  rowTitle: { color: COLORS.gold, fontWeight: "900", fontSize: 14, letterSpacing: 2, marginBottom: 6 },
  rowDesc: { color: COLORS.parchment, fontSize: 13, lineHeight: 19 },
  tipBox: { backgroundColor: COLORS.bgSurface, borderWidth: 2, borderColor: COLORS.gold, padding: 14, marginBottom: 18 },
  tipText: { color: COLORS.parchment, fontSize: 13, lineHeight: 22 },
  btn: { marginTop: 14, alignSelf: "center", paddingVertical: 14, paddingHorizontal: 40, backgroundColor: COLORS.neonOrange, borderWidth: 4, borderColor: "#000" },
  btnText: { color: "#000", fontWeight: "900", fontSize: 15, letterSpacing: 2 },
});
