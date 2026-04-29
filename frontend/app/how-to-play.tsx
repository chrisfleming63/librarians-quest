import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../src/theme";
import { BannerEnemy, CollectibleBook } from "../src/Sprites";

export default function HowToPlay() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} testID="how-to-play-screen">
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>HOW TO PLAY</Text>
        <View style={styles.divider} />

        <Row
          icon={<Text style={styles.bigEmoji}>👆</Text>}
          title="TAP TO JUMP"
          desc="Tap anywhere on the screen to make your librarian leap. Double-tap for a higher jump arc."
        />
        <Row
          icon={<CollectibleBook width={40} height={50} color={COLORS.bookRed} />}
          title="COLLECT BOOKS"
          desc="Grab floating literary classics for +10 points each. Save the stories!"
        />
        <Row
          icon={<BannerEnemy width={40} height={50} />}
          title="DODGE BANNERS"
          desc="Jump OVER book banner enemies to avoid them, or STOMP on them from above for +50 bonus points."
        />
        <Row
          icon={<Text style={styles.bigEmoji}>❤️</Text>}
          title="3 LIVES"
          desc="Get hit from the side and lose a heart. Lose all three and it's game over!"
        />
        <Row
          icon={<Text style={styles.bigEmoji}>⚡</Text>}
          title="SPEED UP"
          desc="The library hallway gets faster the longer you survive. Stay sharp!"
        />

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
  row: { flexDirection: "row", alignItems: "center", marginBottom: 22, backgroundColor: COLORS.bgSurface, borderWidth: 2, borderColor: COLORS.muted, padding: 14 },
  iconWrap: { width: 60, height: 60, alignItems: "center", justifyContent: "center", marginRight: 14 },
  bigEmoji: { fontSize: 34 },
  rowText: { flex: 1 },
  rowTitle: { color: COLORS.gold, fontWeight: "900", fontSize: 14, letterSpacing: 2, marginBottom: 4 },
  rowDesc: { color: COLORS.parchment, fontSize: 13, lineHeight: 18 },
  btn: { marginTop: 20, alignSelf: "center", paddingVertical: 14, paddingHorizontal: 40, backgroundColor: COLORS.neonOrange, borderWidth: 4, borderColor: "#000" },
  btnText: { color: "#000", fontWeight: "900", fontSize: 15, letterSpacing: 2 },
});
