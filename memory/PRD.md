# Librarian's Quest — Product Requirements

## Overview
A Super Mario Bros-style 2D side-scrolling platformer mobile game celebrating African American librarians and Black literature. The Librarian runs through evolving library environments collecting literary classics while jumping over and stomping book-banning protesters, with major boss fights every 5 levels.

## Target Platform
- React Native + Expo (iOS, Android, Web) — Expo SDK 54
- Portrait orientation, touch-first controls

## Core Loop
1. Pick character (Marcus / Maya — African American librarian archetypes)
2. Start at Level 1 in Classic Library theme
3. Auto-run through parallax library background; tap to jump (double-tap for double-jump)
4. Collect literary classics → +10 pts each
5. Stomp protesters from above → +50 pts each
6. Side-collide with protester or projectile sign → lose 1 of 3 hearts
7. Reach the level's score target → "LEVEL CLEARED!" → advance
8. Every 5th level → BOSS FIGHT (stomp boss until HP = 0)
9. Lose all 3 hearts → Game Over with final level + score + new high-score flag

## Levels & Progression
- 15 designed levels (extendable algorithmically beyond)
- Score targets: L1=150, L2=300, L3=500, L4=750, L5=BOSS, L6=1100, L7=1500…
- Lives carry over between levels
- Speed and spawn rate scale per level (speed caps at 16 px/frame)

## Themes (cycle every 5 levels)
| Levels | Theme | Vibe |
|---|---|---|
| 1–4 | CLASSIC LIBRARY | Mahogany, gold, vintage bookshelves |
| 6–9 | SCHOOL LIBRARY | Teal/blue, primary-color spines |
| 11–14 | NIGHT BRANCH | Deep purple, glowing lamps, neon spines |
| 16+ | DIGITAL ARCHIVE | Cyan/black, neon grid, holographic vibes |

## Bosses (every 5 levels)
| Level | Name | Skill |
|---|---|---|
| 5 | THE CENSOR-IN-CHIEF | Throws BANNED sign projectiles every ~2.5s |
| 10 | THE BOARD CHAIR | Slams ground → shockwave the player must jump over |
| 15 | THE GRAND INQUISITOR | Teleports across screen + throws signs |
- Boss HP = 3 + 2 × floor(level/5) (L5=3, L10=5, L15=7)
- Defeating boss = +500 × floor(level/5) bonus points

## Enemies & Obstacles
- **Protester** (replaces former monster): pixel-art African American/diverse person holding picket sign with text rotating between "BANNED", "BAN BOOKS", "CENSOR", "NO READ", "BURN IT", "SILENCE"
- **Sign projectile**: small flying picket sign (boss attack); jump over to avoid
- **Shockwave**: ground-hugging red wave (Boss 2 attack)
- **Stacked protesters** (L6+): require double-jump
- **Mid-air projectile signs** (L3+): require well-timed jumps in normal levels
- **Wooden barricades** (obstacles, L2+): X-cross signs with warning stripes — must be jumped over (do not die when hit, just damage player)

## Platforms & Power-Ups
- **Wooden ledge platforms**: spawn periodically at jumpable height; carry collectible books on top. Player can land on them (one-way collision — fall through from below).
- **Book Throw Power-up** (rare ~8% spawn): glowing stack of red/green/yellow books with golden aura and ★ sparkle. Collecting it gives +3 ammo (capped at 9) and +25 pts.
- **Throw button** in HUD: tap "📚 N" to fire a spinning book projectile rightward at 14 px/frame.
  - Hits a protester → both die, +30 pts
  - Hits a boss → -1 HP
  - Disabled when ammo = 0

## Screens
| Route | Purpose |
|---|---|
| `/` | Title with high score, Start, How-to-Play |
| `/how-to-play` | Controls and rules |
| `/character-select` | Pick Marcus or Maya |
| `/game` | Main gameplay (HUD, level intro, level-complete, game-over, pause overlays) |

## Audio
- 8-bit retro SFX (jump, hit/stomp, collect) bundled as local WAV files
- Looping chiptune background music
- Mute toggle in HUD
- Sounds generated locally with Python — no external dependencies

## Persistence
- High score: `@lq_high_score` in AsyncStorage
- No backend, no auth, no network — fully local game

## Design System
- Theme: Afrofuturist Retro Arcade (dark mode), with theme-swap by level
- Palette tokens in `/app/frontend/src/theme.ts`
- Pixel-art sprites built from React Native Views (no external assets)

## Future Enhancements
- Power-ups (reading glasses = slow time, library card = extra life)
- Online leaderboard (would need backend)
- More boss patterns and visual themes
- Achievement system tied to specific banned books rescued
- Share-card generator (PR-friendly screenshot for social)
