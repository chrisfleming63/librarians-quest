import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../src/theme";
import { BannerEnemy, CollectibleBook } from "../src/Sprites";

// Size used to render the in-game power-up sprites in this menu so they match
// what the player actually sees on the field.
const PU_SIZE = 36;

/**
 * Visual replica of the in-game BOOK STACK power-up (game.tsx render branch
 * for kind === "powerup"). Same colors, same proportions, same glow halo —
 * helps players recognise it instantly while running.
 */
function BookStackPowerUp() {
  return (
    <View style={{ width: PU_SIZE + 16, height: PU_SIZE + 16, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: PU_SIZE, height: PU_SIZE }}>
        <View style={{ position: "absolute", left: -8, top: -8, width: PU_SIZE + 16, height: PU_SIZE + 16, backgroundColor: "rgba(255, 215, 0, 0.35)", borderRadius: PU_SIZE }} />
        <View style={{ position: "absolute", left: 4, top: 4, width: PU_SIZE - 8, height: 9, backgroundColor: COLORS.bookRed, borderWidth: 1, borderColor: "#000" }} />
        <View style={{ position: "absolute", left: 4, top: 14, width: PU_SIZE - 8, height: 9, backgroundColor: COLORS.bookGreen, borderWidth: 1, borderColor: "#000" }} />
        <View style={{ position: "absolute", left: 4, top: 24, width: PU_SIZE - 8, height: 9, backgroundColor: COLORS.bookYellow, borderWidth: 1, borderColor: "#000" }} />
        <Text style={{ position: "absolute", right: -4, top: -10, fontSize: 18, color: COLORS.gold }}>★</Text>
      </View>
    </View>
  );
}

/**
 * Visual replica of the in-game SHIELD BUBBLE power-up (game.tsx render
 * branch for kind === "shield"). Concentric teal rings + shield emoji.
 */
function ShieldBubblePowerUp() {
  return (
    <View style={{ width: PU_SIZE + 20, height: PU_SIZE + 20, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: PU_SIZE, height: PU_SIZE }}>
        <View style={{ position: "absolute", left: -10, top: -10, width: PU_SIZE + 20, height: PU_SIZE + 20, backgroundColor: "rgba(46, 196, 182, 0.30)", borderRadius: PU_SIZE }} />
        <View style={{ position: "absolute", left: -4, top: -4, width: PU_SIZE + 8, height: PU_SIZE + 8, borderWidth: 2, borderColor: "#2EC4B6", borderRadius: PU_SIZE }} />
        <View style={{ position: "absolute", left: 0, top: 0, width: PU_SIZE, height: PU_SIZE, backgroundColor: "#1B6E68", borderWidth: 2, borderColor: "#000" }} />
        <Text style={{ position: "absolute", left: 0, top: 4, width: PU_SIZE, textAlign: "center", fontSize: 18, fontWeight: "900", color: "#FFF" }}>🛡</Text>
        <Text style={{ position: "absolute", left: 0, bottom: 1, width: PU_SIZE, textAlign: "center", fontSize: 7, fontWeight: "900", letterSpacing: 1, color: COLORS.parchment }}>SHIELD</Text>
      </View>
    </View>
  );
}

export default function HowToPlay() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} testID="how-to-play-screen">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* === POWER-UPS === */}
        <Text style={styles.sectionTitle}>POWER-UPS</Text>
        <Text style={styles.sectionSub}>Watch for these glowing pickups along the floor.</Text>

        <Row
          icon={<BookStackPowerUp />}
          title="BOOK STACK"
          desc={"• A glowing stack of red, green, and yellow books inside a gold bubble.\n• Collect it to add 3 books to your throw stack.\n• Tap the book button (bottom-right) to throw — each throw uses one book."}
        />
        <Row
          icon={<ShieldBubblePowerUp />}
          title="SHIELD BUBBLE"
          desc={"• A teal shield emblem inside a glowing bubble with concentric rings.\n• Protects you from one hit.\n• Disappears after absorbing the damage — collect another to refresh it."}
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
  sectionTitle: { color: COLORS.neonOrange, fontSize: 14, fontWeight: "900", letterSpacing: 3, marginTop: 18, marginBottom: 4 },
  sectionSub: { color: COLORS.muted, fontSize: 11, marginBottom: 14, fontStyle: "italic" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 22, backgroundColor: COLORS.bgSurface, borderWidth: 2, borderColor: COLORS.muted, padding: 14 },
  iconWrap: { width: 60, height: 60, alignItems: "center", justifyContent: "center", marginRight: 14 },
  bigEmoji: { fontSize: 34 },
  rowText: { flex: 1 },
  rowTitle: { color: COLORS.gold, fontWeight: "900", fontSize: 14, letterSpacing: 2, marginBottom: 4 },
  rowDesc: { color: COLORS.parchment, fontSize: 13, lineHeight: 19 },
  btn: { marginTop: 20, alignSelf: "center", paddingVertical: 14, paddingHorizontal: 40, backgroundColor: COLORS.neonOrange, borderWidth: 4, borderColor: "#000" },
  btnText: { color: "#000", fontWeight: "900", fontSize: 15, letterSpacing: 2 },
});
