# Librarian's Quest — Product Requirements

## Overview
A Super Mario Bros-style 2D side-scrolling endless runner mobile game celebrating African American librarians and Black literature. The Librarian runs through a never-ending library hallway collecting literary classics while dodging "Book Banner" enemies.

## Target Platform
- React Native + Expo (iOS, Android, Web)
- Portrait orientation, touch-first controls

## Core Loop
1. Pick character (Marcus / Maya — both African American librarian archetypes)
2. Librarian auto-runs through parallax library background
3. Tap screen to jump (double-tap for double-jump)
4. Collect floating books → +10 pts each
5. Jump on top of banner enemies → stomp for +50 pts
6. Hit a banner from the side → lose 1 of 3 hearts
7. Lose all 3 hearts → Game Over with final score & new high-score flag

## Screens
| Route | Purpose |
|---|---|
| `/` (index) | Title screen with high score, Start, How to Play |
| `/how-to-play` | Controls and rules explanation |
| `/character-select` | Pick Marcus or Maya |
| `/game` | Main gameplay (HUD, entities, overlays) |

## Key Features
- Pixel-art sprites built from React Native Views (no external assets needed)
- 3 parallax background layers: arches → bookshelves → card-catalog/desks
- Dynamic entity spawner with 3 book-height tiers + combo challenges
- Physics: gravity, single + double jump, stomp bounce
- Invincibility flicker frames after taking damage
- Local high-score persistence via AsyncStorage
- Pause, Resume, Retry, Return-to-Menu flows
- Floating "+10 / STOMP +50 / OUCH" score pop-ups
- Gradually increasing speed (difficulty ramp)

## No Backend
Scores saved locally. No authentication, no network calls.

## Design System
- Theme: Afrofuturist Retro Arcade (dark mode)
- Palette: mahogany #1A1110, gold #FFD700, neon orange #FF6B00, ruby #D90429
- Typography: bold letter-spaced headings evoking pixel arcade fonts

## Future Enhancements
- Sound effects (8-bit chime, jump sweep, stomp thud)
- Unlockable power-ups (reading glasses = slow time, library card = extra life)
- Daily-challenge seeds and online leaderboard
- More characters (head librarian, student assistant)
- Boss battle: "The Censor" at score milestones
