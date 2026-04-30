import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { COLORS, BOOK_TITLES } from "../src/theme";
import { MaleLibrarian, FemaleLibrarian, BannerEnemy, CollectibleBook } from "../src/Sprites";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// World constants
const GROUND_H = 70;
const GROUND_Y = SCREEN_H - GROUND_H; // top of ground
const PLAYER_W = 52;
const PLAYER_H = 78;
const PLAYER_X = Math.max(40, SCREEN_W * 0.18);
const GRAVITY = 1.1;
const JUMP_V = -18;
const DOUBLE_JUMP_V = -15;
const BANNER_W = 48;
const BANNER_H = 58;
const BOOK_SIZE = 32;
const TICK_MS = 33; // ~30 fps

type Entity = {
  id: number;
  x: number;
  y: number;
  kind: "book" | "banner";
  color?: string;
  title?: string;
  dead?: boolean;
  stomped?: boolean;
};

let __idCtr = 1;
const nextId = () => __idCtr++;

const BOOK_COLORS = [COLORS.bookRed, COLORS.bookGreen, COLORS.bookYellow];

export default function GameScreen() {
  const router = useRouter();
  const { character } = useLocalSearchParams<{ character?: string }>();
  const isFemale = character === "female";

  // Force re-render counter
  const [, setTick] = useState(0);
  const forceRender = useCallback(() => setTick((n) => n + 1), []);

  // Mutable game state in refs for perf
  const playerY = useRef(GROUND_Y - PLAYER_H);
  const velocityY = useRef(0);
  const onGround = useRef(true);
  const jumpsUsed = useRef(0);
  const entities = useRef<Entity[]>([]);
  const speed = useRef(6);
  const scrollX = useRef(0); // for parallax
  const spawnCooldown = useRef(90); // frames until next spawn
  const invincibleFrames = useRef(0);

  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const runningRef = useRef(true);
  const pausedRef = useRef(false);
  const gameOverRef = useRef(false);

  // --- AUDIO ---
  const jumpPlayer = useAudioPlayer(require("../assets/sounds/jump.wav"));
  const hitPlayer = useAudioPlayer(require("../assets/sounds/hit.wav"));
  const collectPlayer = useAudioPlayer(require("../assets/sounds/collect.wav"));
  const bgmPlayer = useAudioPlayer(require("../assets/sounds/bgm.wav"));
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  // Configure audio + start BGM loop
  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
      } catch {}
      try {
        bgmPlayer.loop = true;
        bgmPlayer.volume = 0.35;
        jumpPlayer.volume = 0.6;
        hitPlayer.volume = 0.7;
        collectPlayer.volume = 0.55;
        bgmPlayer.play();
      } catch {}
    })();
    return () => {
      try { bgmPlayer.pause(); } catch {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playSfx = (p: ReturnType<typeof useAudioPlayer>) => {
    if (mutedRef.current) return;
    try {
      p.seekTo(0);
      p.play();
    } catch {}
  };

  const toggleMute = () => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    try {
      if (mutedRef.current) bgmPlayer.pause();
      else bgmPlayer.play();
    } catch {}
  };

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [floatTexts, setFloatTexts] = useState<{ id: number; x: number; y: number; text: string; color: string; ttl: number }[]>([]);
  const floatTextsRef = useRef<typeof floatTexts>([]);

  // Load high score
  useEffect(() => {
    AsyncStorage.getItem("@lq_high_score").then((v) => {
      if (v) setHighScore(parseInt(v, 10) || 0);
    });
  }, []);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (!runningRef.current || pausedRef.current || gameOverRef.current) return;
      stepFrame();
    }, TICK_MS);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFloat = (x: number, y: number, text: string, color: string) => {
    const id = nextId();
    floatTextsRef.current = [...floatTextsRef.current, { id, x, y, text, color, ttl: 25 }];
  };

  const stepFrame = () => {
    // Physics
    velocityY.current += GRAVITY;
    playerY.current += velocityY.current;
    if (playerY.current >= GROUND_Y - PLAYER_H) {
      playerY.current = GROUND_Y - PLAYER_H;
      velocityY.current = 0;
      onGround.current = true;
      jumpsUsed.current = 0;
    } else {
      onGround.current = false;
    }

    // World scroll
    scrollX.current += speed.current;
    // Gradually speed up
    speed.current = Math.min(14, speed.current + 0.0025);

    // Spawn entities
    spawnCooldown.current -= 1;
    if (spawnCooldown.current <= 0) {
      spawnEntity();
      spawnCooldown.current = 45 + Math.floor(Math.random() * 50); // 45-95 frames (~1.5-3s)
    }

    // Move entities
    const playerRect = {
      x: PLAYER_X,
      y: playerY.current,
      w: PLAYER_W,
      h: PLAYER_H,
    };

    for (const e of entities.current) {
      if (e.dead) continue;
      e.x -= speed.current;

      // Collision check
      if (!e.stomped) {
        const eW = e.kind === "book" ? BOOK_SIZE : BANNER_W;
        const eH = e.kind === "book" ? BOOK_SIZE : BANNER_H;
        if (
          playerRect.x < e.x + eW &&
          playerRect.x + playerRect.w > e.x &&
          playerRect.y < e.y + eH &&
          playerRect.y + playerRect.h > e.y
        ) {
          // Overlap
          if (e.kind === "book") {
            e.dead = true;
            scoreRef.current += 10;
            setScore(scoreRef.current);
            addFloat(e.x, e.y, "+10", COLORS.gold);
            playSfx(collectPlayer);
          } else if (e.kind === "banner") {
            // Check stomp: player coming down onto banner
            const playerBottom = playerRect.y + playerRect.h;
            const bannerTop = e.y;
            if (velocityY.current > 0 && playerBottom - velocityY.current <= bannerTop + 8) {
              // STOMP!
              e.stomped = true;
              scoreRef.current += 50;
              setScore(scoreRef.current);
              addFloat(e.x, e.y, "STOMP +50", COLORS.neonOrange);
              velocityY.current = -12; // bounce
              onGround.current = false;
              playSfx(hitPlayer);
              // Banner will be cleaned up after short anim
              setTimeout(() => {
                e.dead = true;
              }, 200);
            } else {
              // Side hit
              if (invincibleFrames.current <= 0) {
                livesRef.current -= 1;
                setLives(livesRef.current);
                invincibleFrames.current = 45;
                addFloat(playerRect.x, playerRect.y, "OUCH!", COLORS.ruby);
                e.dead = true;
                playSfx(hitPlayer);
                if (livesRef.current <= 0) {
                  handleGameOver();
                }
              }
            }
          }
        }
      }
    }

    // Remove off-screen
    entities.current = entities.current.filter((e) => !e.dead && e.x + 60 > -20);

    // Distance points (1 point per frame roughly)
    if (Math.floor(scrollX.current) % 10 === 0) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }

    // Invincibility frames
    if (invincibleFrames.current > 0) invincibleFrames.current -= 1;

    // Update floating texts
    floatTextsRef.current = floatTextsRef.current
      .map((f) => ({ ...f, y: f.y - 2, ttl: f.ttl - 1 }))
      .filter((f) => f.ttl > 0);
    setFloatTexts(floatTextsRef.current);

    forceRender();
  };

  const spawnEntity = () => {
    const r = Math.random();
    const startX = SCREEN_W + 40;
    if (r < 0.45) {
      // spawn banner enemy
      entities.current.push({
        id: nextId(),
        x: startX,
        y: GROUND_Y - BANNER_H,
        kind: "banner",
      });
    } else if (r < 0.85) {
      // spawn book (floating at jumpable height)
      const yTier = Math.random();
      let y: number;
      if (yTier < 0.4) y = GROUND_Y - BOOK_SIZE - 10; // low
      else if (yTier < 0.8) y = GROUND_Y - BOOK_SIZE - 80; // mid (requires jump)
      else y = GROUND_Y - BOOK_SIZE - 140; // high (requires double jump)
      entities.current.push({
        id: nextId(),
        x: startX,
        y,
        kind: "book",
        color: BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)],
        title: BOOK_TITLES[Math.floor(Math.random() * BOOK_TITLES.length)],
      });
    } else {
      // combo: banner + book above it
      entities.current.push({
        id: nextId(),
        x: startX,
        y: GROUND_Y - BANNER_H,
        kind: "banner",
      });
      entities.current.push({
        id: nextId(),
        x: startX + 10,
        y: GROUND_Y - BANNER_H - BOOK_SIZE - 30,
        kind: "book",
        color: BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)],
        title: BOOK_TITLES[Math.floor(Math.random() * BOOK_TITLES.length)],
      });
    }
  };

  const handleJump = () => {
    if (pausedRef.current || gameOverRef.current) return;
    if (jumpsUsed.current === 0) {
      velocityY.current = JUMP_V;
      jumpsUsed.current = 1;
      onGround.current = false;
      playSfx(jumpPlayer);
    } else if (jumpsUsed.current === 1) {
      velocityY.current = DOUBLE_JUMP_V;
      jumpsUsed.current = 2;
      playSfx(jumpPlayer);
    }
  };

  const handleGameOver = async () => {
    gameOverRef.current = true;
    setGameOver(true);
    try { bgmPlayer.pause(); } catch {}
    const final = scoreRef.current;
    const saved = await AsyncStorage.getItem("@lq_high_score");
    const prev = saved ? parseInt(saved, 10) || 0 : 0;
    if (final > prev) {
      await AsyncStorage.setItem("@lq_high_score", String(final));
      setHighScore(final);
    } else {
      setHighScore(prev);
    }
  };

  const restart = () => {
    // reset all refs
    playerY.current = GROUND_Y - PLAYER_H;
    velocityY.current = 0;
    onGround.current = true;
    jumpsUsed.current = 0;
    entities.current = [];
    speed.current = 6;
    scrollX.current = 0;
    spawnCooldown.current = 90;
    invincibleFrames.current = 0;
    scoreRef.current = 0;
    livesRef.current = 3;
    pausedRef.current = false;
    gameOverRef.current = false;
    floatTextsRef.current = [];
    setScore(0);
    setLives(3);
    setPaused(false);
    setGameOver(false);
    setFloatTexts([]);
    if (!mutedRef.current) {
      try { bgmPlayer.seekTo(0); bgmPlayer.play(); } catch {}
    }
  };

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    try {
      if (pausedRef.current) bgmPlayer.pause();
      else if (!mutedRef.current) bgmPlayer.play();
    } catch {}
  };

  const goHome = () => {
    runningRef.current = false;
    router.replace("/");
  };

  // --- RENDER ---
  const PlayerSprite = isFemale ? FemaleLibrarian : MaleLibrarian;
  const flicker = invincibleFrames.current > 0 && invincibleFrames.current % 6 < 3;

  return (
    <View style={styles.root} testID="game-screen">
      {/* BACKGROUND: sky / dark library ceiling */}
      <View style={[styles.bgSky]} />

      {/* Parallax far layer - arches */}
      <View style={styles.parallaxLayer} pointerEvents="none">
        {renderParallaxTiles(SCREEN_W, scrollX.current * 0.15, "far")}
      </View>

      {/* Parallax mid layer - bookshelves */}
      <View style={styles.parallaxLayer} pointerEvents="none">
        {renderParallaxTiles(SCREEN_W, scrollX.current * 0.4, "mid")}
      </View>

      {/* Parallax near layer - desks/lamps */}
      <View style={styles.parallaxLayer} pointerEvents="none">
        {renderParallaxTiles(SCREEN_W, scrollX.current * 0.7, "near")}
      </View>

      {/* Ground / floor */}
      <View style={[styles.ground, { top: GROUND_Y }]}>
        {/* floor planks */}
        {Array.from({ length: 16 }).map((_, i) => {
          const offset = (i * 60 - (scrollX.current % 60));
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                left: offset,
                top: 0,
                width: 3,
                height: GROUND_H,
                backgroundColor: "#1A0F08",
                opacity: 0.6,
              }}
            />
          );
        })}
        {/* Floor top highlight */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: COLORS.muted, opacity: 0.5 }} />
      </View>

      {/* Entities */}
      {entities.current.map((e) => {
        if (e.dead) return null;
        if (e.kind === "book") {
          return (
            <View key={e.id} style={{ position: "absolute", left: e.x, top: e.y }}>
              <CollectibleBook width={BOOK_SIZE} height={BOOK_SIZE} color={e.color} />
            </View>
          );
        }
        return (
          <View
            key={e.id}
            style={{
              position: "absolute",
              left: e.x,
              top: e.stomped ? e.y + BANNER_H - 14 : e.y,
              transform: e.stomped ? [{ scaleY: 0.25 }] : undefined,
            }}
          >
            <BannerEnemy width={BANNER_W} height={BANNER_H} />
          </View>
        );
      })}

      {/* Player */}
      <View
        style={{
          position: "absolute",
          left: PLAYER_X,
          top: playerY.current,
          opacity: flicker ? 0.3 : 1,
        }}
        testID="player-sprite"
      >
        <PlayerSprite width={PLAYER_W} height={PLAYER_H} running={onGround.current} />
      </View>

      {/* Floating score texts */}
      {floatTexts.map((f) => (
        <Text
          key={f.id}
          style={{
            position: "absolute",
            left: f.x,
            top: f.y,
            color: f.color,
            fontWeight: "900",
            fontSize: 14,
            letterSpacing: 1,
            textShadowColor: "#000",
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 0,
            opacity: Math.min(1, f.ttl / 20),
          }}
        >
          {f.text}
        </Text>
      ))}

      {/* HUD */}
      <View style={styles.hud} pointerEvents="box-none">
        <View style={styles.hudLeft}>
          <Text style={styles.hudLabel}>SCORE</Text>
          <Text style={styles.hudScore} testID="score-value">
            {String(score).padStart(6, "0")}
          </Text>
          <Text style={styles.hudHi}>HI {String(Math.max(highScore, score)).padStart(6, "0")}</Text>
        </View>
        <View style={styles.hudRight}>
          <View style={styles.livesRow} testID="lives-row">
            {Array.from({ length: 3 }).map((_, i) => (
              <Text key={i} style={[styles.heart, { opacity: i < lives ? 1 : 0.2 }]}>♥</Text>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
            <TouchableOpacity
              testID="mute-toggle-button"
              onPress={toggleMute}
              style={styles.pauseBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.pauseTxt}>{muted ? "🔇" : "🔊"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="pause-game-button"
              onPress={togglePause}
              style={styles.pauseBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.pauseTxt}>{paused ? "▶" : "‖"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tap zone for jump (entire screen, but beneath HUD buttons) */}
      <Pressable
        testID="touch-zone-jump"
        onPress={handleJump}
        style={StyleSheet.absoluteFill}
      />

      {/* On-screen jump hint on start */}
      {score < 20 && !gameOver && !paused && (
        <View style={styles.hintBox} pointerEvents="none">
          <Text style={styles.hintText}>TAP SCREEN TO JUMP</Text>
          <Text style={styles.hintSub}>Tap twice for double jump</Text>
        </View>
      )}

      {/* Pause overlay */}
      {paused && !gameOver && (
        <View style={styles.overlay} testID="pause-overlay">
          <Text style={styles.overlayTitle}>PAUSED</Text>
          <TouchableOpacity testID="resume-button" style={styles.overlayBtn} onPress={togglePause} activeOpacity={0.8}>
            <Text style={styles.overlayBtnText}>▶  RESUME</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="quit-to-menu-button" style={[styles.overlayBtn, styles.overlayBtnAlt]} onPress={goHome} activeOpacity={0.8}>
            <Text style={styles.overlayBtnTextAlt}>◀  MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game Over overlay */}
      {gameOver && (
        <View style={styles.overlay} testID="game-over-overlay">
          <Text style={[styles.overlayTitle, { color: COLORS.ruby }]}>GAME OVER</Text>
          <Text style={styles.goSub}>The banners have won... this time.</Text>
          <View style={styles.goPanel}>
            <View style={styles.goRow}>
              <Text style={styles.goLabel}>SCORE</Text>
              <Text style={styles.goValue} testID="final-score">{String(score).padStart(6, "0")}</Text>
            </View>
            <View style={styles.goRow}>
              <Text style={styles.goLabel}>HI-SCORE</Text>
              <Text style={[styles.goValue, { color: COLORS.gold }]}>{String(highScore).padStart(6, "0")}</Text>
            </View>
            {score >= highScore && score > 0 && (
              <Text style={styles.newRecord}>★ NEW RECORD ★</Text>
            )}
          </View>
          <TouchableOpacity testID="retry-game-button" style={styles.overlayBtn} onPress={restart} activeOpacity={0.8}>
            <Text style={styles.overlayBtnText}>▶  TRY AGAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="go-home-button" style={[styles.overlayBtn, styles.overlayBtnAlt]} onPress={goHome} activeOpacity={0.8}>
            <Text style={styles.overlayBtnTextAlt}>◀  MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function renderParallaxTiles(screenW: number, offset: number, layer: "far" | "mid" | "near") {
  const TILE_W = 140;
  const tilesCount = Math.ceil(screenW / TILE_W) + 2;
  const baseOffset = -(offset % TILE_W);
  const tiles = [];
  for (let i = 0; i < tilesCount; i++) {
    const x = baseOffset + i * TILE_W;
    tiles.push(<ParallaxTile key={i} x={x} layer={layer} />);
  }
  return tiles;
}

function ParallaxTile({ x, layer }: { x: number; layer: "far" | "mid" | "near" }) {
  if (layer === "far") {
    // dark arches
    return (
      <View style={{ position: "absolute", left: x, top: 20, width: 140, height: GROUND_Y - 20 }}>
        <View style={{ position: "absolute", left: 10, top: 0, width: 120, height: 40, backgroundColor: COLORS.bgSurface, borderTopLeftRadius: 60, borderTopRightRadius: 60, opacity: 0.8 }} />
        <View style={{ position: "absolute", left: 30, top: 30, width: 80, height: 200, backgroundColor: "#241812", opacity: 0.6 }} />
      </View>
    );
  }
  if (layer === "mid") {
    // bookshelf with colored spines
    const spineColors = ["#8B1E3F", "#2A9D8F", "#E9C46A", "#5A3A22", "#D4A373", "#8B4513"];
    const shelfTop = GROUND_Y - 260;
    return (
      <View style={{ position: "absolute", left: x, top: shelfTop, width: 140, height: 260 }}>
        {/* shelf back */}
        <View style={{ position: "absolute", left: 0, top: 0, width: 140, height: 260, backgroundColor: COLORS.shelfDark, opacity: 0.9 }} />
        {/* shelves */}
        {[0, 1, 2].map((row) => (
          <View key={row} style={{ position: "absolute", left: 0, top: 20 + row * 80, width: 140, height: 70 }}>
            {/* books */}
            {Array.from({ length: 8 }).map((_, i) => {
              const w = 12 + (i % 3) * 3;
              return (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    left: 6 + i * 16,
                    bottom: 5,
                    width: w,
                    height: 55 - (i % 4) * 4,
                    backgroundColor: spineColors[(i + row) % spineColors.length],
                    borderWidth: 1,
                    borderColor: "#000",
                  }}
                />
              );
            })}
            {/* shelf plank */}
            <View style={{ position: "absolute", left: 0, bottom: 0, width: 140, height: 5, backgroundColor: COLORS.shelfMid }} />
          </View>
        ))}
      </View>
    );
  }
  // near: lamp + card catalog
  return (
    <View style={{ position: "absolute", left: x, top: GROUND_Y - 90, width: 140, height: 90 }}>
      {/* table */}
      <View style={{ position: "absolute", left: 10, top: 60, width: 120, height: 30, backgroundColor: COLORS.shelfMid, borderWidth: 2, borderColor: "#1A0F08" }} />
      {/* drawers */}
      <View style={{ position: "absolute", left: 18, top: 70, width: 20, height: 14, backgroundColor: COLORS.shelfDark, borderWidth: 1, borderColor: "#000" }} />
      <View style={{ position: "absolute", left: 45, top: 70, width: 20, height: 14, backgroundColor: COLORS.shelfDark, borderWidth: 1, borderColor: "#000" }} />
      <View style={{ position: "absolute", left: 72, top: 70, width: 20, height: 14, backgroundColor: COLORS.shelfDark, borderWidth: 1, borderColor: "#000" }} />
      <View style={{ position: "absolute", left: 99, top: 70, width: 20, height: 14, backgroundColor: COLORS.shelfDark, borderWidth: 1, borderColor: "#000" }} />
      {/* lamp stand */}
      <View style={{ position: "absolute", left: 100, top: 20, width: 3, height: 40, backgroundColor: "#111" }} />
      {/* lamp shade glow */}
      <View style={{ position: "absolute", left: 86, top: 10, width: 30, height: 16, backgroundColor: COLORS.lamp, borderRadius: 4, borderWidth: 2, borderColor: "#000" }} />
      <View style={{ position: "absolute", left: 80, top: 26, width: 42, height: 30, backgroundColor: "rgba(255, 200, 87, 0.15)", borderRadius: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgBase, overflow: "hidden" },
  bgSky: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0F0807" },
  parallaxLayer: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  ground: { position: "absolute", left: 0, right: 0, height: GROUND_H, backgroundColor: COLORS.floor, borderTopWidth: 4, borderTopColor: COLORS.shelfMid },
  hud: { position: "absolute", top: 40, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18, zIndex: 10 },
  hudLeft: {},
  hudRight: { alignItems: "flex-end" },
  hudLabel: { color: COLORS.muted, fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  hudScore: { color: COLORS.gold, fontSize: 22, fontWeight: "900", letterSpacing: 2, textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  hudHi: { color: COLORS.parchment, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  livesRow: { flexDirection: "row", gap: 4 },
  heart: { color: COLORS.ruby, fontSize: 26, textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  pauseBtn: { marginTop: 8, backgroundColor: COLORS.bgSurface, borderWidth: 2, borderColor: COLORS.muted, paddingHorizontal: 12, paddingVertical: 4, zIndex: 20 },
  pauseTxt: { color: COLORS.parchment, fontSize: 18, fontWeight: "900" },
  hintBox: { position: "absolute", left: 0, right: 0, top: SCREEN_H * 0.3, alignItems: "center" },
  hintText: { color: COLORS.gold, fontSize: 18, fontWeight: "900", letterSpacing: 3, textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  hintSub: { color: COLORS.parchment, fontSize: 12, letterSpacing: 1, marginTop: 4 },
  overlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: COLORS.overlay, alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 },
  overlayTitle: { color: COLORS.gold, fontSize: 40, fontWeight: "900", letterSpacing: 3, textShadowColor: "#000", textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0, marginBottom: 18 },
  goSub: { color: COLORS.muted, fontSize: 13, letterSpacing: 1, marginBottom: 16, textAlign: "center" },
  goPanel: { borderWidth: 3, borderColor: COLORS.gold, backgroundColor: COLORS.bgSurface, padding: 16, minWidth: 240, marginBottom: 18, alignItems: "center" },
  goRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginVertical: 4 },
  goLabel: { color: COLORS.muted, fontSize: 12, letterSpacing: 2, fontWeight: "700" },
  goValue: { color: COLORS.parchment, fontSize: 18, fontWeight: "900", letterSpacing: 2 },
  newRecord: { color: COLORS.neonOrange, fontSize: 14, fontWeight: "900", letterSpacing: 2, marginTop: 10 },
  overlayBtn: { marginTop: 10, backgroundColor: COLORS.neonOrange, paddingVertical: 14, paddingHorizontal: 40, borderWidth: 4, borderColor: "#000", minWidth: 240, alignItems: "center" },
  overlayBtnAlt: { backgroundColor: COLORS.bgSurface, borderColor: COLORS.muted },
  overlayBtnText: { color: "#000", fontWeight: "900", fontSize: 16, letterSpacing: 2 },
  overlayBtnTextAlt: { color: COLORS.parchment, fontWeight: "900", fontSize: 14, letterSpacing: 2 },
});
