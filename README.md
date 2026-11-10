# 🎣 JustFishing - 2D Hi-Bit Pixel Action Fishing RPG & Haven Tycoon

A high-fidelity 2D pixel open-water action-fishing RPG and haven tycoon web game.

## 🌟 Features & Specifications

### 🎮 Pixel Art Resolution Specifications:
- **16×16:** Base Tiles (Water, Grass, Sand, Stone, Wood Planks)
- **16×32:** Characters & Sprites (Player Fisherman, NPCs)
- **16×48 / 16×64:** Vertical Props (Pier Lantern Posts, Masts, Banners)
- **32×32:** 2×2 Tile Objects (Chests, Crates, Small Boats, Standard Fish)
- **32×48, 48×64+:** Large Objects (Boss Leviathans, Coral Shrines, Mega Aquarium)
- **Virtual Buffer:** Native 320×180 (16:9 aspect ratio)
- **Display Output:** Integer scaled to 1280×720 (4x) / 1920×1080 with crisp nearest-neighbor rendering (`image-rendering: pixelated`)

### ⚡ Gameplay Mechanics:
- **Tactical Tension Bar:** Stardew-style vertical tension gauge with fish stamina fatigue and buoyancy physics.
- **Line-Only Durability:** Rods never break; lines can snap under sustained red tension.
- **Difficulty Modes:** Easy, Normal, and Hard modifiers.
- **Boss Phase 2:** Mythic fish enter Rage Mode with altered swim patterns at low health.
- **1-Click Fillet Salvage:** Break down fish into crafting components (fins, teeth, scales, glands) or sell for Dev Gold.
- **Fishdex Encyclopedia:** Track caught records, weights, star ratings, and lore.
- **Day/Night & Weather Clock:** 24 real minutes equals 24 in-game hours with dynamic weather.
- **Client-Side Persistence:** LocalStorage auto-save with pure client-side JSON export/import.

---

## 🚀 Running on Lovable or Locally

### On Lovable:
1. Open [Lovable.dev](https://lovable.dev)
2. Click **"Import from GitHub"**
3. Select this repository: `nickadesa/justfishing`
4. Lovable will automatically launch the preview and let you publish!

### Locally with Vite:
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
