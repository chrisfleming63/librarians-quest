import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { COLORS, BOOK_TITLES } from "../src/theme";
import { MaleLibrarian, FemaleLibrarian, BannerEnemy, BossProtester, CollectibleBook } from "../src/Sprites";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// World constants
const GROUND_H = 70;
const GROUND_Y = SCREEN_H - GROUND_H;
const PLAYER_W = 52;
const PLAYER_H = 78;
const PLAYER_X = Math.max(40, SCREEN_W * 0.18);
const GRAVITY = 1.1;
const JUMP_V = -18;
const DOUBLE_JUMP_V = -15;
const BANNER_W = 48;
const BANNER_H = 62;
const BOOK_SIZE = 32;
const SIGN_W = 34;
const SIGN_H = 28;
const BOSS_W = 120;
const BOSS_H = 170;
const BOSS_X = SCREEN_W - BOSS_W - 30;
const PLATFORM_H = 18;
const OBSTACLE_W = 40;
const OBSTACLE_H = 44;
const POWERUP_SIZE = 38;
const BOOK_PROJ_SIZE = 24;
const BOOK_PROJ_VX = 14;
const TICK_MS = 33;

const PROTEST_SIGNS = ["BANNED", "BAN BOOKS", "CENSOR", "NO READ", "BURN IT", "SILENCE"];
const BOOK_COLORS = [COLORS.bookRed, COLORS.bookGreen, COLORS.bookYellow];

// Level themes (4 visual sets cycling every 5 levels)
type Theme = {
  id: string;
  name: string;
  sky: string;
  floor: string;
  groundBorder: string;
  accent: string;
  shelfBack: string;
  shelfMid: string;
  bookSpines: string[];
  nearColor: string;
  lamp: string;
};
const THEMES: Theme[] = [
  {
    id: "library",
    name: "CLASSIC LIBRARY",
    sky: "#0F0807",
    floor: COLORS.floor,
    groundBorder: COLORS.shelfMid,
    accent: COLORS.muted,
    shelfBack: COLORS.shelfDark,
    shelfMid: COLORS.shelfMid,
    bookSpines: ["#8B1E3F", "#2A9D8F", "#E9C46A", "#5A3A22", "#D4A373", "#8B4513"],
    nearColor: COLORS.shelfMid,
    lamp: COLORS.lamp,
  },
  {
    id: "school",
    name: "SCHOOL LIBRARY",
    sky: "#0A1F2E",
    floor: "#1A3550",
    groundBorder: "#3D7AAA",
    accent: "#6AB3D4",
    shelfBack: "#1E3E5F",
    shelfMid: "#3D7AAA",
    bookSpines: ["#F4A261", "#E76F51", "#E9C46A", "#2A9D8F", "#457B9D", "#6AB3D4"],
    nearColor: "#2A5A7A",
    lamp: "#9BE1FF",
  },
  {
    id: "night",
    name: "NIGHT BRANCH",
    sky: "#0E0A20",
    floor: "#1B1438",
    groundBorder: "#5D3EAC",
    accent: "#9F7AEA",
    shelfBack: "#261B4A",
    shelfMid: "#3D2E6B",
    bookSpines: ["#9F7AEA", "#E63946", "#2A9D8F", "#FFB703", "#FB5607", "#FFD700"],
    nearColor: "#3D2E6B",
    lamp: "#E0AAFF",
  },
  {
    id: "digital",
    name: "DIGITAL ARCHIVE",
    sky: "#000814",
    floor: "#001E2F",
    groundBorder: "#00E5FF",
    accent: "#00E5FF",
    shelfBack: "#002838",
    shelfMid: "#005577",
    bookSpines: ["#00E5FF", "#FF006E", "#FFBE0B", "#8338EC", "#3A86FF", "#06FFA5"],
    nearColor: "#003344",
    lamp: "#00FFC6",
  },
];
const getTheme = (level: number): Theme => THEMES[Math.floor((level - 1) / 5) % THEMES.length];
const isBossLevel = (level: number) => level % 5 === 0;

// Per-level score targets (kept for HUD/back-compat; level-completion now driven by time).
const getLevelTarget = (level: number): number => {
  if (isBossLevel(level)) return 0;
  const table = [150, 300, 500, 750, 0, 1100, 1500, 2000, 2500, 0, 3100, 3800, 4600, 5400, 0];
  return table[level - 1] ?? 150 + 300 * (level - 1);
};

// Per-level real-time durations in milliseconds (boss levels = 0 → defeat-driven).
const getLevelDurationMs = (level: number): number => {
  if (isBossLevel(level)) return 0;
  const seconds = [25, 27, 30, 33, 0, 33, 35, 37, 40, 0, 40, 42, 44, 46, 0];
  const s = seconds[level - 1] ?? Math.min(60, 40 + (level - 11) * 2);
  return s * 1000;
};

// Difficulty scaling
const getBaseSpeed = (level: number) => Math.min(16, 6 + (level - 1) * 0.5);
const getSpawnDelay = (level: number) => {
  // average delay in frames, reduced with level
  const base = 70 - (level - 1) * 3;
  return Math.max(28, base);
};
const getBossHp = (level: number) => Math.min(6, 3 + Math.floor(level / 5)); // capped at 6

// Boss attack patterns per boss-level
type BossAttack = "signs" | "shockwave" | "teleport";
const getBossAttack = (level: number): BossAttack => {
  const idx = Math.floor((level - 5) / 5); // 0=L5, 1=L10, 2=L15
  return (["signs", "shockwave", "teleport"] as const)[idx % 3];
};
const getBossName = (level: number) => {
  const names = ["THE CENSOR-IN-CHIEF", "THE BOARD CHAIR", "THE GRAND INQUISITOR"];
  return names[Math.floor((level - 5) / 5) % names.length];
};

type Entity = {
  id: number;
  x: number;
  y: number;
  vy?: number;
  kind: "book" | "banner" | "sign" | "shockwave" | "platform" | "obstacle" | "powerup" | "playerBook";
  color?: string;
  title?: string;
  variant?: number;
  signText?: string;
  w?: number;
  rot?: number;
  dead?: boolean;
  stomped?: boolean;
};

let __idCtr = 1;
const nextId = () => __idCtr++;

export default function GameScreen() {
  const router = useRouter();
  const { character, startLevel: startLevelParam } = useLocalSearchParams<{ character?: string; startLevel?: string }>();
  const isFemale = character === "female";

  // Dev / boss-test entry: ?startLevel=N allows jumping straight to any level.
  // Clamped to a sane range; falls back to 1 when missing/invalid.
  const initialLevel = Math.max(1, Math.min(99, parseInt(String(startLevelParam ?? "1"), 10) || 1));
  const initialIsBoss = initialLevel > 1 && isBossLevel(initialLevel);
  const initialBossHp = initialIsBoss ? getBossHp(initialLevel) : 0;

  // Character differentiation
  // Marcus (male):  slightly slower run, larger book projectile hitbox
  // Maya  (female): slightly faster run, higher jump
  const playerSpeedMult = isFemale ? 1.05 : 0.92;
  const playerJumpMult = isFemale ? 1.10 : 1.0;
  const playerBookSize = isFemale ? BOOK_PROJ_SIZE : BOOK_PROJ_SIZE + 8;

  const [, setTick] = useState(0);
  const forceRender = useCallback(() => setTick((n) => n + 1), []);

  // Game refs
  const playerY = useRef(GROUND_Y - PLAYER_H);
  const velocityY = useRef(0);
  const onGround = useRef(true);
  const jumpsUsed = useRef(0);
  const entities = useRef<Entity[]>([]);
  const speed = useRef(getBaseSpeed(initialLevel) * playerSpeedMult);
  const scrollX = useRef(0);
  const spawnCooldown = useRef(90);
  const lastSpawnTickRef = useRef(-9999);
  const distAccRef = useRef(0);
  const invincibleFrames = useRef(0);

  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const runningRef = useRef(true);
  const pausedRef = useRef(false);
  const gameOverRef = useRef(false);

  // Level state
  const levelRef = useRef(initialLevel);
  const levelStartScoreRef = useRef(0);
  const levelStartTimeRef = useRef(Date.now());
  const levelCompleteRef = useRef(false);

  // Boss state
  const bossActiveRef = useRef(initialIsBoss);
  const bossHpRef = useRef(initialBossHp);
  const bossMaxHpRef = useRef(initialBossHp);
  const bossX = useRef(BOSS_X);
  const bossY = useRef(GROUND_Y - BOSS_H);
  const bossVy = useRef(0);
  const bossAttackTimer = useRef(90);
  const bossInvincible = useRef(0);
  const bossDir = useRef(initialIsBoss ? -1 : 1); // for teleport/sway (start toward player on direct-boss entry)
  const bossPhaseRef = useRef<"pace" | "telegraph" | "dash" | "retreat">("pace");
  const bossPhaseTimerRef = useRef(180);

  // Exposed state for render
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(initialLevel);
  const [levelComplete, setLevelComplete] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [bossHp, setBossHp] = useState(initialBossHp);
  const [ammo, setAmmo] = useState(0);
  const ammoRef = useRef(0);

  const [floatTexts, setFloatTexts] = useState<{ id: number; x: number; y: number; text: string; color: string; ttl: number }[]>([]);
  const floatTextsRef = useRef<typeof floatTexts>([]);

  // Audio
  const jumpPlayer = useAudioPlayer(require("../assets/sounds/jump.wav"));
  const hitPlayer = useAudioPlayer(require("../assets/sounds/hit.wav"));
  const collectPlayer = useAudioPlayer(require("../assets/sounds/collect.wav"));
  const bgmPlayer = useAudioPlayer(require("../assets/sounds/bgm.wav"));
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  // Load high score
  useEffect(() => {
    AsyncStorage.getItem("@lq_high_score").then((v) => {
      if (v) setHighScore(parseInt(v, 10) || 0);
    });
  }, []);

  // Setup audio
  useEffect(() => {
    (async () => {
      try { await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }); } catch {}
      try {
        bgmPlayer.loop = true;
        bgmPlayer.volume = 0.35;
        jumpPlayer.volume = 0.6;
        hitPlayer.volume = 0.7;
        collectPlayer.volume = 0.55;
        bgmPlayer.play();
      } catch {}
    })();
    return () => { try { bgmPlayer.pause(); } catch {} };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intro dismisses after 1.8s
  useEffect(() => {
    if (showIntro) {
      const t = setTimeout(() => setShowIntro(false), 1800);
      return () => clearTimeout(t);
    }
  }, [showIntro]);

  const playSfx = (p: ReturnType<typeof useAudioPlayer>) => {
    if (mutedRef.current) return;
    try { p.seekTo(0); p.play(); } catch {}
  };

  const toggleMute = () => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    try {
      if (mutedRef.current) bgmPlayer.pause();
      else bgmPlayer.play();
    } catch {}
  };

  const addFloat = (x: number, y: number, text: string, color: string) => {
    floatTextsRef.current = [...floatTextsRef.current, { id: nextId(), x, y, text, color, ttl: 25 }];
  };

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (!runningRef.current || pausedRef.current || gameOverRef.current || levelCompleteRef.current || showIntro) return;
      stepFrame();
    }, TICK_MS);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIntro]);

  const stepFrame = () => {
    // Player physics
    const prevY = playerY.current;
    velocityY.current += GRAVITY;
    playerY.current += velocityY.current;

    // Platform-landing check (only when descending)
    let landedOnPlatform = false;
    if (velocityY.current >= 0) {
      for (const e of entities.current) {
        if (e.kind !== "platform" || e.dead) continue;
        const pw = e.w || 90;
        if (PLAYER_X + PLAYER_W > e.x + 4 && PLAYER_X < e.x + pw - 4) {
          const prevBottom = prevY + PLAYER_H;
          const newBottom = playerY.current + PLAYER_H;
          if (prevBottom <= e.y + 4 && newBottom >= e.y) {
            playerY.current = e.y - PLAYER_H;
            velocityY.current = 0;
            landedOnPlatform = true;
            break;
          }
        }
      }
    }

    if (playerY.current >= GROUND_Y - PLAYER_H) {
      playerY.current = GROUND_Y - PLAYER_H;
      velocityY.current = 0;
      onGround.current = true;
      jumpsUsed.current = 0;
    } else if (landedOnPlatform) {
      onGround.current = true;
      jumpsUsed.current = 0;
    } else {
      onGround.current = false;
    }

    scrollX.current += speed.current;

    if (bossActiveRef.current) {
      stepBoss();
    } else {
      stepNormal();
    }

    // Entity movement & collision (shared)
    const playerRect = { x: PLAYER_X, y: playerY.current, w: PLAYER_W, h: PLAYER_H };

    for (const e of entities.current) {
      if (e.dead) continue;

      // Movement
      if (e.kind === "playerBook") {
        const prevBookX = e.x;
        e.x += BOOK_PROJ_VX;
        e.rot = (e.rot || 0) + 28;
        if (e.x > SCREEN_W + 50) e.dead = true;
        // Swept-X: treat the book's horizontal hit range as [prevBookX, currentRight]
        const sweptLeft = prevBookX;
        const sweptRight = e.x + playerBookSize;
        // Collide with banners and boss
        for (const t of entities.current) {
          if (t === e || t.dead) continue;
          if (t.kind === "banner" && !t.stomped) {
            const td = entityDims(t);
            if (sweptLeft < t.x + td.w && sweptRight > t.x && e.y < t.y + td.h && e.y + playerBookSize > t.y) {
              t.dead = true;
              e.dead = true;
              scoreRef.current += 30;
              setScore(scoreRef.current);
              addFloat(t.x, t.y, "+30 BOOK!", COLORS.gold);
              playSfx(hitPlayer);
              break;
            }
          }
        }
        if (!e.dead && bossActiveRef.current && bossInvincible.current <= 0) {
          if (sweptLeft < bossX.current + BOSS_W && sweptRight > bossX.current && e.y < bossY.current + BOSS_H && e.y + playerBookSize > bossY.current) {
            bossHpRef.current -= 1;
            setBossHp(bossHpRef.current);
            bossInvincible.current = 15;
            e.dead = true;
            addFloat(bossX.current, bossY.current, "-1 HP", COLORS.gold);
            playSfx(hitPlayer);
            if (bossHpRef.current <= 0) defeatBoss();
          }
        }
        continue;
      }

      if (e.kind === "sign") {
        e.x -= 9;
      } else if (e.kind === "shockwave") {
        e.x -= 7;
      } else {
        e.x -= speed.current;
      }

      // Skip player-collision for platforms (handled in physics)
      if (e.kind === "platform") continue;

      if (!e.stomped) {
        const dims = entityDims(e);
        const overlap =
          playerRect.x < e.x + dims.w &&
          playerRect.x + playerRect.w > e.x &&
          playerRect.y < e.y + dims.h &&
          playerRect.y + playerRect.h > e.y;

        if (overlap) handleEntityCollision(e, playerRect);
      }
    }
    entities.current = entities.current.filter((e) => !e.dead && e.x + 80 > -50);

    // Distance score (accumulator — consistent at all speeds)
    distAccRef.current += speed.current;
    if (distAccRef.current >= 10) {
      const add = Math.floor(distAccRef.current / 10);
      distAccRef.current -= add * 10;
      scoreRef.current += add;
      setScore(scoreRef.current);
    }

    // Floats
    if (invincibleFrames.current > 0) invincibleFrames.current -= 1;
    floatTextsRef.current = floatTextsRef.current.map((f) => ({ ...f, y: f.y - 2, ttl: f.ttl - 1 })).filter((f) => f.ttl > 0);
    setFloatTexts(floatTextsRef.current);

    // Check level-complete (non-boss levels — driven by real time)
    if (!bossActiveRef.current) {
      const dur = getLevelDurationMs(levelRef.current);
      if (dur > 0 && Date.now() - levelStartTimeRef.current >= dur) {
        triggerLevelComplete();
      }
    }

    forceRender();
  };

  const entityDims = (e: Entity) => {
    if (e.kind === "book") return { w: BOOK_SIZE, h: BOOK_SIZE };
    if (e.kind === "banner") return { w: BANNER_W, h: BANNER_H };
    if (e.kind === "sign") return { w: SIGN_W, h: SIGN_H };
    if (e.kind === "platform") return { w: e.w || 90, h: PLATFORM_H };
    if (e.kind === "obstacle") return { w: OBSTACLE_W, h: OBSTACLE_H };
    if (e.kind === "powerup") return { w: POWERUP_SIZE, h: POWERUP_SIZE };
    if (e.kind === "playerBook") return { w: playerBookSize, h: playerBookSize };
    return { w: 60, h: 16 };
  };

  const handleEntityCollision = (e: Entity, playerRect: { x: number; y: number; w: number; h: number }) => {
    if (e.kind === "book") {
      e.dead = true;
      scoreRef.current += 10;
      setScore(scoreRef.current);
      addFloat(e.x, e.y, "+10", COLORS.gold);
      playSfx(collectPlayer);
      return;
    }
    if (e.kind === "banner") {
      const playerCenterY = playerRect.y + PLAYER_H * 0.6;
      const top = e.y;
      if (velocityY.current >= 0 && playerCenterY < top + 6) {
        e.stomped = true;
        scoreRef.current += 50;
        setScore(scoreRef.current);
        addFloat(e.x, e.y, "STOMP +50", COLORS.neonOrange);
        velocityY.current = -12;
        onGround.current = false;
        playSfx(hitPlayer);
        setTimeout(() => { e.dead = true; }, 200);
      } else {
        takeDamage(playerRect.x, playerRect.y);
        e.dead = true;
      }
      return;
    }
    if (e.kind === "sign" || e.kind === "shockwave") {
      takeDamage(playerRect.x, playerRect.y);
      e.dead = true;
      return;
    }
    if (e.kind === "obstacle") {
      takeDamage(playerRect.x, playerRect.y);
      // Obstacle stays — player must learn to jump it
      return;
    }
    if (e.kind === "powerup") {
      e.dead = true;
      ammoRef.current = Math.min(9, ammoRef.current + 3);
      setAmmo(ammoRef.current);
      scoreRef.current += 25;
      setScore(scoreRef.current);
      addFloat(e.x, e.y, "+3 BOOKS!", COLORS.neonOrange);
      playSfx(collectPlayer);
      return;
    }
  };

  const takeDamage = (x: number, y: number) => {
    if (invincibleFrames.current > 0) return;
    livesRef.current -= 1;
    setLives(livesRef.current);
    invincibleFrames.current = 45;
    addFloat(x, y, "OUCH!", COLORS.ruby);
    playSfx(hitPlayer);
    if (livesRef.current <= 0) handleGameOver();
  };

  // === Normal level spawn ===
  const stepNormal = () => {
    speed.current = Math.min(16, speed.current + 0.002);
    spawnCooldown.current -= 1;
    if (spawnCooldown.current <= 0) {
      spawnNormal();
      const base = getSpawnDelay(levelRef.current);
      spawnCooldown.current = Math.floor(base * 0.7 + Math.random() * base * 0.6);
    }
  };

  const spawnNormal = () => {
    // Enforce minimum spawn gap (prevents unavoidable walls)
    const minGapPx = 140 + speed.current * 6;
    if (scrollX.current - lastSpawnTickRef.current < minGapPx) return;
    lastSpawnTickRef.current = scrollX.current;

    const startX = SCREEN_W + 40;
    const lvl = levelRef.current;
    const r = Math.random();
    const variant = Math.floor(Math.random() * 4);
    const sign = PROTEST_SIGNS[Math.floor(Math.random() * PROTEST_SIGNS.length)];

    if (r < 0.08) {
      // POWER-UP (rare): glowing book stack at jumpable height
      entities.current.push({
        id: nextId(), x: startX, y: GROUND_Y - POWERUP_SIZE - 30, kind: "powerup",
      });
    } else if (r < 0.21) {
      // PLATFORM with books on top
      const platW = 100 + Math.random() * 70;
      const platY = GROUND_Y - 95 - Math.random() * 55;
      entities.current.push({ id: nextId(), x: startX, y: platY, kind: "platform", w: platW });
      // Books on platform
      const bookCount = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < bookCount; i++) {
        entities.current.push({
          id: nextId(), x: startX + 20 + i * 36, y: platY - BOOK_SIZE - 4, kind: "book",
          color: BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)],
          title: BOOK_TITLES[Math.floor(Math.random() * BOOK_TITLES.length)],
        });
      }
    } else if (r < 0.3 && lvl >= 2) {
      // OBSTACLE (barricade) — must be jumped over
      entities.current.push({ id: nextId(), x: startX, y: GROUND_Y - OBSTACLE_H, kind: "obstacle" });
    } else if (r < 0.55) {
      // protester
      entities.current.push({ id: nextId(), x: startX, y: GROUND_Y - BANNER_H, kind: "banner", variant, signText: sign });
    } else if (r < 0.85) {
      // book
      const t = Math.random();
      let y: number;
      if (t < 0.4) y = GROUND_Y - BOOK_SIZE - 10;
      else if (t < 0.8) y = GROUND_Y - BOOK_SIZE - 80;
      else y = GROUND_Y - BOOK_SIZE - 140;
      entities.current.push({
        id: nextId(), x: startX, y, kind: "book",
        color: BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)],
        title: BOOK_TITLES[Math.floor(Math.random() * BOOK_TITLES.length)],
      });
    } else {
      // combo: protester + book above
      entities.current.push({ id: nextId(), x: startX, y: GROUND_Y - BANNER_H, kind: "banner", variant, signText: sign });
      entities.current.push({
        id: nextId(), x: startX + 10, y: GROUND_Y - BANNER_H - BOOK_SIZE - 30, kind: "book",
        color: BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)],
      });
      if (lvl >= 3 && Math.random() < 0.35) {
        entities.current.push({ id: nextId(), x: startX + 250, y: GROUND_Y - BANNER_H - 20, kind: "sign", signText: "BAN" });
      }
    }

    if (lvl >= 6 && Math.random() < 0.18) {
      entities.current.push({ id: nextId(), x: startX + 40, y: GROUND_Y - BANNER_H * 2 + 6, kind: "banner", variant: (variant + 1) % 4, signText: "NO READ" });
    }
  };

  // === Boss level ===
  const stepBoss = () => {
    // Boss physics (gravity + occasional jump)
    bossVy.current += GRAVITY * 0.9;
    bossY.current += bossVy.current;
    if (bossY.current >= GROUND_Y - BOSS_H) {
      bossY.current = GROUND_Y - BOSS_H;
      bossVy.current = 0;
    }
    // Boss phase machine: pace → telegraph → dash → retreat → pace
    const BOSS_MIN_X = 22;
    const BOSS_MAX_X = SCREEN_W - BOSS_W - 30;
    const DASH_TARGET_X = 30;
    bossPhaseTimerRef.current -= 1;
    if (bossPhaseRef.current === "pace") {
      bossX.current += bossDir.current * 2.2;
      if (bossX.current >= BOSS_MAX_X) { bossX.current = BOSS_MAX_X; bossDir.current = -1; }
      if (bossX.current <= BOSS_MIN_X) { bossX.current = BOSS_MIN_X; bossDir.current = 1; }
      if (bossPhaseTimerRef.current <= 0) {
        bossPhaseRef.current = "telegraph";
        bossPhaseTimerRef.current = 45;
        addFloat(bossX.current + 30, bossY.current - 18, "⚠ DASH!", COLORS.ruby);
      }
    } else if (bossPhaseRef.current === "telegraph") {
      // freeze in place, brief warning window for the player to react
      if (bossPhaseTimerRef.current <= 0) {
        bossPhaseRef.current = "dash";
        bossPhaseTimerRef.current = 35;
      }
    } else if (bossPhaseRef.current === "dash") {
      bossX.current -= 6;
      if (bossX.current <= DASH_TARGET_X || bossPhaseTimerRef.current <= 0) {
        bossX.current = Math.max(DASH_TARGET_X, bossX.current);
        bossPhaseRef.current = "retreat";
        bossPhaseTimerRef.current = 80;
      }
    } else if (bossPhaseRef.current === "retreat") {
      bossX.current += 3;
      if (bossX.current >= BOSS_MAX_X || bossPhaseTimerRef.current <= 0) {
        bossX.current = Math.min(BOSS_MAX_X, bossX.current);
        bossPhaseRef.current = "pace";
        bossPhaseTimerRef.current = 180;
        bossDir.current = -1;
      }
    }
    // Decrease attack timer (only counts down during pace — no attacks while dashing/telegraphing)
    if (bossPhaseRef.current === "pace") bossAttackTimer.current -= 1;
    if (bossInvincible.current > 0) bossInvincible.current -= 1;

    const attack = getBossAttack(levelRef.current);
    // All projectiles roll along the ground (low, jumpable)
    const signY = () => GROUND_Y - 28;

    if (bossAttackTimer.current <= 0) {
      if (attack === "signs") {
        // throw a sign at varying height
        entities.current.push({
          id: nextId(),
          x: bossX.current,
          y: signY(),
          kind: "sign",
          signText: "BANNED",
        });
        bossAttackTimer.current = 80;
        // occasional jump
        if (Math.random() < 0.3 && bossY.current >= GROUND_Y - BOSS_H - 1) {
          bossVy.current = -14;
        }
      } else if (attack === "shockwave") {
        // slam and spawn shockwave
        bossVy.current = -12;
        entities.current.push({
          id: nextId(),
          x: bossX.current - 20,
          y: GROUND_Y - 18,
          kind: "shockwave",
        });
        bossAttackTimer.current = 100;
      } else {
        // teleport
        const newX = 160 + Math.random() * (SCREEN_W - 300);
        bossX.current = Math.min(SCREEN_W - BOSS_W - 20, Math.max(SCREEN_W * 0.4, newX));
        // throw sign too at varying height
        entities.current.push({
          id: nextId(),
          x: bossX.current,
          y: signY(),
          kind: "sign",
          signText: "CENSOR",
        });
        bossAttackTimer.current = 90;
      }
    }

    // Player-boss collision
    const playerBottom = playerY.current + PLAYER_H;
    const overlap =
      PLAYER_X < bossX.current + BOSS_W &&
      PLAYER_X + PLAYER_W > bossX.current &&
      playerY.current < bossY.current + BOSS_H &&
      playerY.current + PLAYER_H > bossY.current;

    if (overlap && bossInvincible.current <= 0) {
      const top = bossY.current;
      // Stomp detection works in ALL boss phases — player can always safely jump on boss's head
      if (velocityY.current > 0 && playerBottom - velocityY.current <= top + 20) {
        // hit boss
        bossHpRef.current -= 1;
        setBossHp(bossHpRef.current);
        addFloat(bossX.current + 40, bossY.current, "-1 HP", COLORS.gold);
        velocityY.current = -15;
        onGround.current = false;
        bossInvincible.current = 15;
        playSfx(hitPlayer);
        if (bossHpRef.current <= 0) {
          defeatBoss();
        }
      } else if (bossPhaseRef.current === "dash") {
        // Only deal contact damage when the boss is actively attacking (dashing).
        // During pace / telegraph / retreat phases, the player can safely
        // approach and position without taking damage.
        takeDamage(PLAYER_X, playerY.current);
      }
    }
  };

  const defeatBoss = () => {
    const lvl = levelRef.current;
    const bonus = 500 * Math.floor(lvl / 5);
    scoreRef.current += bonus;
    setScore(scoreRef.current);
    addFloat(bossX.current, bossY.current, `+${bonus} BOSS`, COLORS.gold);
    bossActiveRef.current = false;
    triggerLevelComplete();
  };

  const triggerLevelComplete = () => {
    if (levelCompleteRef.current) return;
    levelCompleteRef.current = true;
    setLevelComplete(true);
  };

  const advanceLevel = () => {
    const next = levelRef.current + 1;
    levelRef.current = next;
    setLevel(next);
    levelStartScoreRef.current = scoreRef.current;
    levelStartTimeRef.current = Date.now();
    entities.current = [];
    scrollX.current = 0;
    speed.current = getBaseSpeed(next) * playerSpeedMult;
    spawnCooldown.current = 60;
    lastSpawnTickRef.current = -9999;
    distAccRef.current = 0;
    playerY.current = GROUND_Y - PLAYER_H;
    velocityY.current = 0;
    onGround.current = true;
    jumpsUsed.current = 0;
    invincibleFrames.current = 60;

    if (isBossLevel(next)) {
      bossActiveRef.current = true;
      const hp = getBossHp(next);
      bossHpRef.current = hp;
      bossMaxHpRef.current = hp;
      setBossHp(hp);
      bossX.current = BOSS_X;
      bossY.current = GROUND_Y - BOSS_H;
      bossVy.current = 0;
      bossAttackTimer.current = 120;
      bossInvincible.current = 0;
      bossDir.current = -1; // start moving toward player
      bossPhaseRef.current = "pace";
      bossPhaseTimerRef.current = 180;
    } else {
      bossActiveRef.current = false;
    }

    levelCompleteRef.current = false;
    setLevelComplete(false);
    setShowIntro(true);
  };

  const handleJump = () => {
    if (showIntro) { setShowIntro(false); return; }
    if (pausedRef.current || gameOverRef.current || levelCompleteRef.current) return;
    if (jumpsUsed.current === 0) {
      velocityY.current = JUMP_V * playerJumpMult;
      jumpsUsed.current = 1;
      onGround.current = false;
      playSfx(jumpPlayer);
    } else if (jumpsUsed.current === 1) {
      velocityY.current = DOUBLE_JUMP_V * playerJumpMult;
      jumpsUsed.current = 2;
      playSfx(jumpPlayer);
    }
  };

  const throwBook = () => {
    if (ammoRef.current <= 0) return;
    if (pausedRef.current || gameOverRef.current || levelCompleteRef.current || showIntro) return;
    ammoRef.current -= 1;
    setAmmo(ammoRef.current);
    entities.current.push({
      id: nextId(),
      x: PLAYER_X + PLAYER_W,
      y: playerY.current + PLAYER_H * 0.35,
      kind: "playerBook",
      color: BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)],
      rot: 0,
    });
    playSfx(jumpPlayer);
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
    playerY.current = GROUND_Y - PLAYER_H;
    velocityY.current = 0;
    onGround.current = true;
    jumpsUsed.current = 0;
    entities.current = [];
    speed.current = getBaseSpeed(1) * playerSpeedMult;
    scrollX.current = 0;
    spawnCooldown.current = 90;
    lastSpawnTickRef.current = -9999;
    distAccRef.current = 0;
    invincibleFrames.current = 0;
    scoreRef.current = 0;
    livesRef.current = 3;
    pausedRef.current = false;
    gameOverRef.current = false;
    floatTextsRef.current = [];
    levelRef.current = 1;
    levelStartScoreRef.current = 0;
    levelStartTimeRef.current = Date.now();
    bossActiveRef.current = false;
    levelCompleteRef.current = false;
    setScore(0);
    setLives(3);
    setPaused(false);
    setGameOver(false);
    setFloatTexts([]);
    setLevel(1);
    setLevelComplete(false);
    setBossHp(0);
    setShowIntro(true);
    ammoRef.current = 0;
    setAmmo(0);
    if (!mutedRef.current) { try { bgmPlayer.seekTo(0); bgmPlayer.play(); } catch {} }
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

  // Render helpers
  const theme = getTheme(level);
  const PlayerSprite = isFemale ? FemaleLibrarian : MaleLibrarian;
  const flicker = invincibleFrames.current > 0 && invincibleFrames.current % 6 < 3;

  return (
    <View style={[styles.root, { backgroundColor: theme.sky }]} testID="game-screen">
      {/* Sky gradient area — subtle accent strip */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 30, backgroundColor: theme.shelfBack, opacity: 0.5 }} />

      {/* Parallax layers */}
      <View style={styles.parallaxLayer} pointerEvents="none">
        {renderParallaxTiles(scrollX.current * 0.15, "far", theme)}
      </View>
      <View style={styles.parallaxLayer} pointerEvents="none">
        {renderParallaxTiles(scrollX.current * 0.4, "mid", theme)}
      </View>
      <View style={styles.parallaxLayer} pointerEvents="none">
        {renderParallaxTiles(scrollX.current * 0.7, "near", theme)}
      </View>

      {/* Ground */}
      <View style={[styles.ground, { top: GROUND_Y, backgroundColor: theme.floor, borderTopColor: theme.groundBorder }]}>
        {Array.from({ length: 16 }).map((_, i) => {
          const offset = i * 60 - (scrollX.current % 60);
          return (
            <View key={i} style={{ position: "absolute", left: offset, top: 0, width: 3, height: GROUND_H, backgroundColor: "#000", opacity: 0.4 }} />
          );
        })}
      </View>

      {/* Boss */}
      {bossActiveRef.current && (
        <View style={{ position: "absolute", left: bossX.current, top: bossY.current, opacity: bossInvincible.current > 0 && bossInvincible.current % 4 < 2 ? 0.4 : 1 }}>
          <BossProtester width={BOSS_W} height={BOSS_H} hp={bossHp} maxHp={bossMaxHpRef.current} />
        </View>
      )}

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
        if (e.kind === "banner") {
          return (
            <View key={e.id} style={{ position: "absolute", left: e.x, top: e.stomped ? e.y + BANNER_H - 14 : e.y, transform: e.stomped ? [{ scaleY: 0.25 }] : undefined }}>
              <BannerEnemy width={BANNER_W} height={BANNER_H} variant={e.variant || 0} sign={e.signText || "BANNED"} />
            </View>
          );
        }
        if (e.kind === "sign") {
          return (
            <View key={e.id} style={{ position: "absolute", left: e.x, top: e.y, width: SIGN_W, height: SIGN_H, backgroundColor: "#FDF0D5", borderWidth: 2, borderColor: "#1A0F08", justifyContent: "center", alignItems: "center", transform: [{ rotate: "-8deg" }] }}>
              <Text style={{ color: COLORS.ruby, fontSize: 9, fontWeight: "900" }}>{e.signText || "BAN"}</Text>
            </View>
          );
        }
        if (e.kind === "shockwave") {
          return (
            <View key={e.id} style={{ position: "absolute", left: e.x, top: e.y, width: 60, height: 16, borderRadius: 30, backgroundColor: COLORS.ruby, opacity: 0.6 }} />
          );
        }
        if (e.kind === "platform") {
          const w = e.w || 90;
          return (
            <View key={e.id} style={{ position: "absolute", left: e.x, top: e.y, width: w, height: PLATFORM_H + 6 }}>
              <View style={{ position: "absolute", left: 0, top: 0, width: w, height: PLATFORM_H, backgroundColor: theme.shelfMid, borderWidth: 2, borderColor: "#000" }} />
              <View style={{ position: "absolute", left: 0, top: 0, width: w, height: 3, backgroundColor: theme.accent, opacity: 0.7 }} />
              <View style={{ position: "absolute", left: 6, top: PLATFORM_H, width: 4, height: 6, backgroundColor: theme.shelfBack }} />
              <View style={{ position: "absolute", right: 6, top: PLATFORM_H, width: 4, height: 6, backgroundColor: theme.shelfBack }} />
            </View>
          );
        }
        if (e.kind === "obstacle") {
          return (
            <View key={e.id} style={{ position: "absolute", left: e.x, top: e.y, width: OBSTACLE_W, height: OBSTACLE_H }}>
              <View style={{ position: "absolute", left: 0, bottom: 0, width: OBSTACLE_W, height: OBSTACLE_H * 0.55, backgroundColor: "#6B3F1F", borderWidth: 2, borderColor: "#000" }} />
              <View style={{ position: "absolute", left: 2, top: 4, width: OBSTACLE_W - 4, height: 4, backgroundColor: "#3A1F12", transform: [{ rotate: "20deg" }] }} />
              <View style={{ position: "absolute", left: 2, top: 4, width: OBSTACLE_W - 4, height: 4, backgroundColor: "#3A1F12", transform: [{ rotate: "-20deg" }] }} />
              <View style={{ position: "absolute", left: 0, top: OBSTACLE_H * 0.4, width: OBSTACLE_W, height: 4, backgroundColor: COLORS.gold }} />
              <View style={{ position: "absolute", left: 0, top: OBSTACLE_H * 0.5, width: OBSTACLE_W, height: 4, backgroundColor: "#000" }} />
            </View>
          );
        }
        if (e.kind === "powerup") {
          return (
            <View key={e.id} style={{ position: "absolute", left: e.x, top: e.y, width: POWERUP_SIZE, height: POWERUP_SIZE }}>
              <View style={{ position: "absolute", left: -8, top: -8, width: POWERUP_SIZE + 16, height: POWERUP_SIZE + 16, backgroundColor: "rgba(255, 215, 0, 0.35)", borderRadius: POWERUP_SIZE }} />
              <View style={{ position: "absolute", left: 4, top: 4, width: POWERUP_SIZE - 8, height: 9, backgroundColor: COLORS.bookRed, borderWidth: 1, borderColor: "#000" }} />
              <View style={{ position: "absolute", left: 4, top: 14, width: POWERUP_SIZE - 8, height: 9, backgroundColor: COLORS.bookGreen, borderWidth: 1, borderColor: "#000" }} />
              <View style={{ position: "absolute", left: 4, top: 24, width: POWERUP_SIZE - 8, height: 9, backgroundColor: COLORS.bookYellow, borderWidth: 1, borderColor: "#000" }} />
              <Text style={{ position: "absolute", right: -4, top: -10, fontSize: 18, color: COLORS.gold }}>★</Text>
            </View>
          );
        }
        if (e.kind === "playerBook") {
          return (
            <View key={e.id} style={{ position: "absolute", left: e.x, top: e.y, width: playerBookSize, height: playerBookSize, transform: [{ rotate: `${e.rot || 0}deg` }] }}>
              <View style={{ width: playerBookSize, height: playerBookSize, backgroundColor: e.color || COLORS.bookRed, borderWidth: 2, borderColor: "#000" }} />
              <View style={{ position: "absolute", left: 0, top: 0, width: 3, height: playerBookSize, backgroundColor: COLORS.gold }} />
              <View style={{ position: "absolute", left: 6, top: playerBookSize * 0.35, width: playerBookSize - 10, height: 2, backgroundColor: COLORS.gold }} />
            </View>
          );
        }
        return null;
      })}

      {/* Player */}
      <View style={{ position: "absolute", left: PLAYER_X, top: playerY.current, opacity: flicker ? 0.3 : 1 }} testID="player-sprite">
        <PlayerSprite width={PLAYER_W} height={PLAYER_H} running={onGround.current} />
      </View>

      {/* Floating score texts */}
      {floatTexts.map((f) => (
        <Text key={f.id} style={{ position: "absolute", left: f.x, top: f.y, color: f.color, fontWeight: "900", fontSize: 13, textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0, opacity: Math.min(1, f.ttl / 20) }}>
          {f.text}
        </Text>
      ))}

      {/* HUD */}
      <View style={styles.hud} pointerEvents="box-none">
        <View>
          <Text style={[styles.hudLabel, { color: theme.accent }]}>LEVEL {level}{isBossLevel(level) ? " — BOSS" : ""}</Text>
          <Text style={styles.hudScore} testID="score-value">{String(score).padStart(6, "0")}</Text>
          {!isBossLevel(level) && (
            <Text style={styles.hudHi}>
              {Math.max(0, Math.ceil((getLevelDurationMs(level) - (Date.now() - levelStartTimeRef.current)) / 1000))}s LEFT
            </Text>
          )}
          {isBossLevel(level) && bossActiveRef.current && (
            <Text style={[styles.hudHi, { color: COLORS.ruby }]}>{getBossName(level)}</Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <View style={styles.livesRow} testID="lives-row">
            {Array.from({ length: 3 }).map((_, i) => (
              <Text key={i} style={[styles.heart, { opacity: i < lives ? 1 : 0.2 }]}>♥</Text>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
            <TouchableOpacity testID="mute-toggle-button" onPress={toggleMute} style={styles.pauseBtn} activeOpacity={0.7}>
              <Text style={styles.pauseTxt}>{muted ? "🔇" : "🔊"}</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="pause-game-button" onPress={togglePause} style={styles.pauseBtn} activeOpacity={0.7}>
              <Text style={styles.pauseTxt}>{paused ? "▶" : "‖"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tap zone (offset below HUD and excluding bottom-right throw button area) */}
      <Pressable testID="touch-zone-jump" onPress={handleJump} style={{ position: "absolute", left: 0, right: 0, top: 130, bottom: 0 }} />

      {/* Throw button (bottom-right, thumb-reachable, rendered AFTER jump zone so taps are captured first) */}
      <Pressable
        testID="throw-book-button"
        onPressIn={throwBook}
        style={({ pressed }) => [
          styles.throwFab,
          {
            opacity: ammo > 0 ? 1 : 0.5,
            borderColor: ammo > 0 ? COLORS.gold : COLORS.muted,
            transform: [{ scale: pressed ? 0.9 : 1 }],
          },
        ]}
      >
        <Text style={styles.throwFabText}>📚</Text>
        <Text style={styles.throwFabAmmo}>{ammo}</Text>
      </Pressable>

      {/* Level intro overlay */}
      {showIntro && !gameOver && (
        <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]} testID="level-intro" pointerEvents="none">
          <Text style={[styles.overlayTitle, { color: theme.accent, fontSize: 28 }]}>LEVEL {level}</Text>
          <Text style={[styles.overlayTitle, { color: COLORS.gold, fontSize: 20, marginTop: 6 }]}>{isBossLevel(level) ? `BOSS — ${getBossName(level)}` : theme.name}</Text>
          {!isBossLevel(level) && (
            <Text style={styles.goSub}>SURVIVE: {Math.round(getLevelDurationMs(level) / 1000)} SECONDS</Text>
          )}
        </View>
      )}

      {/* Pause */}
      {paused && !gameOver && !levelComplete && (
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

      {/* Level complete */}
      {levelComplete && !gameOver && (
        <View style={styles.overlay} testID="level-complete-overlay">
          <Text style={[styles.overlayTitle, { color: COLORS.gold }]}>LEVEL {level}</Text>
          <Text style={[styles.overlayTitle, { color: theme.accent, fontSize: 28, marginTop: -4 }]}>CLEARED!</Text>
          <View style={styles.goPanel}>
            <View style={styles.goRow}>
              <Text style={styles.goLabel}>SCORE</Text>
              <Text style={styles.goValue}>{String(score).padStart(6, "0")}</Text>
            </View>
            <Text style={{ color: COLORS.muted, fontSize: 10, letterSpacing: 2, marginTop: 4 }}>
              NEXT: {isBossLevel(level + 1) ? `BOSS — ${getBossName(level + 1)}` : getTheme(level + 1).name}
            </Text>
          </View>
          <TouchableOpacity testID="next-level-button" style={styles.overlayBtn} onPress={advanceLevel} activeOpacity={0.8}>
            <Text style={styles.overlayBtnText}>▶  NEXT LEVEL</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="quit-to-menu-button-2" style={[styles.overlayBtn, styles.overlayBtnAlt]} onPress={goHome} activeOpacity={0.8}>
            <Text style={styles.overlayBtnTextAlt}>◀  MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game over */}
      {gameOver && (
        <View style={styles.overlay} testID="game-over-overlay">
          <Text style={[styles.overlayTitle, { color: COLORS.ruby }]}>GAME OVER</Text>
          <Text style={styles.goSub}>Reached Level {level}. The censors won... this time.</Text>
          <View style={styles.goPanel}>
            <View style={styles.goRow}>
              <Text style={styles.goLabel}>SCORE</Text>
              <Text style={styles.goValue} testID="final-score">{String(score).padStart(6, "0")}</Text>
            </View>
            <View style={styles.goRow}>
              <Text style={styles.goLabel}>LEVEL</Text>
              <Text style={styles.goValue}>{level}</Text>
            </View>
            <View style={styles.goRow}>
              <Text style={styles.goLabel}>HI-SCORE</Text>
              <Text style={[styles.goValue, { color: COLORS.gold }]}>{String(highScore).padStart(6, "0")}</Text>
            </View>
            {score >= highScore && score > 0 && <Text style={styles.newRecord}>★ NEW RECORD ★</Text>}
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

function renderParallaxTiles(offset: number, layer: "far" | "mid" | "near", theme: Theme) {
  const TILE_W = 200;
  const tilesCount = Math.ceil(SCREEN_W / TILE_W) + 1;
  const baseOffset = -(offset % TILE_W);
  const tiles = [];
  for (let i = 0; i < tilesCount; i++) {
    tiles.push(<ParallaxTile key={i} x={baseOffset + i * TILE_W} layer={layer} theme={theme} />);
  }
  return tiles;
}

function ParallaxTileImpl({ x, layer, theme }: { x: number; layer: "far" | "mid" | "near"; theme: Theme }) {
  if (layer === "far") {
    return (
      <View style={{ position: "absolute", left: x, top: 20, width: 140, height: GROUND_Y - 20 }}>
        <View style={{ position: "absolute", left: 10, top: 0, width: 120, height: 40, backgroundColor: theme.shelfBack, borderTopLeftRadius: 60, borderTopRightRadius: 60, opacity: 0.8 }} />
        <View style={{ position: "absolute", left: 30, top: 30, width: 80, height: 200, backgroundColor: theme.shelfBack, opacity: 0.4 }} />
      </View>
    );
  }
  if (layer === "mid") {
    const shelfTop = GROUND_Y - 260;
    return (
      <View style={{ position: "absolute", left: x, top: shelfTop, width: 140, height: 260 }}>
        <View style={{ position: "absolute", left: 0, top: 0, width: 140, height: 260, backgroundColor: theme.shelfBack, opacity: 0.9 }} />
        {[0, 1, 2].map((row) => (
          <View key={row} style={{ position: "absolute", left: 0, top: 20 + row * 80, width: 140, height: 70 }}>
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
                    backgroundColor: theme.bookSpines[(i + row) % theme.bookSpines.length],
                    borderWidth: 1,
                    borderColor: "#000",
                  }}
                />
              );
            })}
            <View style={{ position: "absolute", left: 0, bottom: 0, width: 140, height: 5, backgroundColor: theme.shelfMid }} />
          </View>
        ))}
      </View>
    );
  }
  // near
  return (
    <View style={{ position: "absolute", left: x, top: GROUND_Y - 90, width: 140, height: 90 }}>
      <View style={{ position: "absolute", left: 10, top: 60, width: 120, height: 30, backgroundColor: theme.nearColor, borderWidth: 2, borderColor: "#000" }} />
      <View style={{ position: "absolute", left: 18, top: 70, width: 20, height: 14, backgroundColor: theme.shelfBack, borderWidth: 1, borderColor: "#000" }} />
      <View style={{ position: "absolute", left: 45, top: 70, width: 20, height: 14, backgroundColor: theme.shelfBack, borderWidth: 1, borderColor: "#000" }} />
      <View style={{ position: "absolute", left: 72, top: 70, width: 20, height: 14, backgroundColor: theme.shelfBack, borderWidth: 1, borderColor: "#000" }} />
      <View style={{ position: "absolute", left: 99, top: 70, width: 20, height: 14, backgroundColor: theme.shelfBack, borderWidth: 1, borderColor: "#000" }} />
      <View style={{ position: "absolute", left: 100, top: 20, width: 3, height: 40, backgroundColor: "#111" }} />
      <View style={{ position: "absolute", left: 86, top: 10, width: 30, height: 16, backgroundColor: theme.lamp, borderRadius: 4, borderWidth: 2, borderColor: "#000" }} />
      <View style={{ position: "absolute", left: 80, top: 26, width: 42, height: 30, backgroundColor: theme.lamp, opacity: 0.15, borderRadius: 20 }} />
    </View>
  );
}

const ParallaxTile = React.memo(ParallaxTileImpl, (prev, next) => prev.x === next.x && prev.layer === next.layer && prev.theme === next.theme);

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  parallaxLayer: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  ground: { position: "absolute", left: 0, right: 0, height: GROUND_H, borderTopWidth: 4 },
  hud: { position: "absolute", top: 40, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18, zIndex: 10 },
  hudLabel: { fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  hudScore: { color: COLORS.gold, fontSize: 22, fontWeight: "900", letterSpacing: 2, textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0, marginTop: 2 },
  hudHi: { color: COLORS.parchment, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  livesRow: { flexDirection: "row", gap: 4 },
  heart: { color: COLORS.ruby, fontSize: 26, textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  pauseBtn: { backgroundColor: COLORS.bgSurface, borderWidth: 2, borderColor: COLORS.muted, paddingHorizontal: 12, paddingVertical: 4 },
  pauseTxt: { color: COLORS.parchment, fontSize: 18, fontWeight: "900" },
  overlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: COLORS.overlay, alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 },
  overlayTitle: { color: COLORS.gold, fontSize: 40, fontWeight: "900", letterSpacing: 3, textShadowColor: "#000", textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0, marginBottom: 10 },
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
  throwFab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.bgSurface,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
  },
  throwFabText: { fontSize: 28, lineHeight: 30 },
  throwFabAmmo: { color: COLORS.gold, fontSize: 12, fontWeight: "900", letterSpacing: 1, marginTop: -2 },
});
