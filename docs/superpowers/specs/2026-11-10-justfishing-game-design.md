# JustFishing: Master Game Design & Architecture Document (GDD)

> **Game Title:** JustFishing  
> **Genre:** 2D Pixel Open-Water Adventure, Fishing RPG & Haven Tycoon  
> **Platform:** Web (HTML5 Canvas 2D / Pixi.js + Responsive Web DOM HUD / PWA)  
> **Target Audience:** Fans of *Dredge*, *Stardew Valley*, *Animal Crossing*, and *Dave the Diver*  
> **Date:** 2026-11-10  

---

## 1. Vision & Core Philosophy

### 1.1 The High Concept
**JustFishing** is an expansive 2D top-down pixel exploration and action-fishing RPG. Starting with a humble rowboat and a wooden rod on a cozy home island, the player navigates an ever-expanding ocean archipelago, delves into sunken skyscraper ruins, braves volcanic calderas, and discovers dimensional celestial rifts. 

There are **no idle clickers and no auto-fishing**—every catch requires player engagement, knowledge of fish behaviors, dietary preferences (bait), time/weather conditions, and skillful line control across three distinct difficulty modes (**Easy, Normal, Hard**).

### 1.2 Core Pillars
1. **Skill-Based & Tactical Fishing:** Dynamic tension-bar physics with distinct fish AI behaviors (darting, thrashing, ink-spraying, armor-diving).
2. **Deep Crafting & Fish Salvage:** Every catch is a decision: sell for gold, donate to the Grand Aquarium, or butcher for rare crafting parts (fins, scales, teeth, bioluminescent glands) to forge 60+ modular fishing rods.
3. **Expedition & Exploration:** Drive upgradable watercraft (Rowboat, Steam Cutter, Deep Submersible, Astral Skiff) through dynamic weather systems, day/night cycles, and tidal shifts to uncover 15+ mysterious biomes.
4. **Equipable Skill Loadouts:** Equip active abilities (Sonar Ping, Time Dilation, Chum Cannon) and passive charms (Iron Grip, Treasure Magnet, Night Hunter) to customize your fishing style.
5. **Island Haven Tycoon:** Build, decorate, and manage your personal Home Haven with 200+ furniture items, workshop stations, and a multi-tank Grand Aquarium where your prized catches swim.

---

## 2. World & Biome Architecture (16 Distinct Biomes)

The world map is divided into 4 major nautical zones, each with unique environmental hazards, weather patterns, and access requirements:

### Zone 1: The Tranquil Archipelago (Beginner - Early Game)
1. **Home Haven Bay:** Calm turquoise waters, sandy shores, tutorial fishing, player home & dock.
2. **Whispering Pine Brook:** Freshwater river surrounded by dense forest, fallen logs, freshwater bass & trout.
3. **Emerald Mangrove Shallows:** Labyrinth of twisted roots, brackish water, mud crabs, archerfish.
4. **Sunken Coral Shelf:** Vibrant 16-bit coral reef, sea turtles, colorful tropical reef fish, clam beds.

### Zone 2: The Industrial & Sunken Frontiers (Mid Game)
5. **Sunken Skyscraper Metropolis ("The Drowned City"):** Submerged modern skyscrapers with rooftops barely breaking water. Requires the *Ironclad Submersible* to descend between floors.
6. **Toxic Neon Canals:** Runoff from ancient factories; glowing green/purple sludge, chemical-mutated catfish, battery eels.
7. **The Mistveil Strait:** Permanent heavy fog; spectral ghost ships, phantom lanterns, ghost koi. (Requires *Fog Lamp*).
8. **Craggy Shipwreck Graveyard:** Treacherous sharp rocks, whirlpool currents, sunken pirate galleons, treasure chests.

### Zone 3: Extreme Elemental Realms (Late Game)
9. **Overclocked Magma Caldera:** Active volcanic crater filled with bubbling lava; requires *Molten Core Rod* and heat-shielded hull. Magma carp, obsidian rays.
10. **Glacial Frost Fjord:** Ice floes, floating icebergs, sub-zero water; requires icebreaker prow. Glacial salmon, mammoth shrimp.
11. **Electric Storm Shoals:** Continuous thunderstorms, violent waves; lightning rod vehicle upgrade required. Volt-sharks, storm eels.
12. **The Abyssal Trench (Midnight Zone):** 10,000 meters deep, pitch black, extreme hydrostatic pressure; bioluminescent anglerfish, giant isopods, colossal squid.

### Zone 4: The Mythical & Dimensional Seas (Endgame & Secrets)
13. **Starlight Nebula Sea:** An ethereal oceanic rift where water reflects galaxies; celestial rays, star-dusted guppies.
14. **The Void Rift (Event Horizon):** Cosmic abyss defying gravity; void wyrms, eldritch leviathans.
15. **Twilight Skyfall (Floating Sky Isles):** Floating sky waterfalls in the clouds reached via sky-skiff balloon; cloud fins, feather rays.
16. **Eclipse Sanctuary:** A secret hidden lagoon that only surfaces during the in-game Lunar Eclipse / Blood Moon. Home to the legendary world boss *Ouroboros Leviathan*.

---

## 3. Dynamic Environment & Weather System

```
[Day / Night Cycle: 24 mins real-time = 24 in-game hours]
Dawn (05:00 - 08:00) ──> Day (08:00 - 17:00) ──> Dusk (17:00 - 20:00) ──> Night (20:00 - 05:00)
```

### Weather Types & Fish Affinities:
- **Clear Sun:** Optimal for shallow reef and surface predators. High water visibility.
- **Overcast Rain:** +30% fish bite speed; river and lake trout become hyperactive.
- **Thunderstorm:** Extreme waves; spawns electric and apex predator fish. Chance of lightning strikes on ungrounded vessels.
- **Dense Sea Fog:** Visibility reduced to 3 tiles around boat; reveals phantom spectral fish and floating mystery crates.
- **Acid Mist:** Damages basic boats over time; exclusively spawns toxic mutant species in industrial zones.
- **Meteor Shower (Rare Event):** Cosmic dust falls into the water; turns common waters into celestial waters for 1 in-game night.

---

## 4. Fishing Mechanics & Tension Physics

### 4.1 Difficulty Modes (Selected at Start / Configurable in Settings)
- **Easy:** Tension bar width is 150% standard. Fish movement is smoothed. Line breaks require 4 continuous seconds in the red zone.
- **Normal:** Standard authentic tension physics. Fish feature bursts of speed and minor counter-movement.
- **Hard:** Tension bar is 75% standard. Sudden erratic fish movement (feints, dives, thrashes). Line breaks in 1.2 seconds of over-tension. Elite fish require active counter-tilting.

### 4.2 The 4-Phase Catch Sequence
1. **Cast Phase:** Hold space/mouse to charge casting distance gauge. Target ripple rings on water for bonus rarity multiplier (+25% Lucky Bite).
2. **Lure & Nibble Phase:** Bobber rests on water. Fish shadow approaches based on equipped bait affinity. Water splashes (`!`) sound cues indicate bites.
3. **The Strike:** Tap immediately on bite to set the hook. A "Perfect Strike" grants +15% initial catch meter.
4. **Tension Reel Battle:**
   - A vertical UI gauge displays the **Catch Progress (0-100%)**, **Line Tension (Green -> Yellow -> Red)**, and the **Catch Sweet-Spot Bar**.
   - Hold/release to manipulate the green bar's buoyancy, keeping the fish inside the bar.
   - **Fish AI Fighting Archetypes:**
     - *Steady Swimmer:* Smooth sinusoidal movement.
     - *Darting Sprinter:* Rapid vertical bursts, pauses, then plunges.
     - *Bottom Diver:* Drags heavily downwards; requires aggressive tapping to keep afloat.
     - *Thrashing Apex:* Shakes violently, making the sweet-spot bounce.
     - *Trickster (Octopus/Squid):* Sprays ink across the player's gauge for 2 seconds.

---

## 5. Fish Species Classification & Economy (300+ Species)

### 5.1 Rarity Tiers
- **Common (40%):** Bass, Guppy, Carp, Mackerel, Anchovy.
- **Uncommon (30%):** Red Snapper, Rainbow Trout, Catfish, Flying Fish, Mud Crab.
- **Rare (18%):** Anglerfish, Golden Dorado, Electric Eel, Swordfish, Pufferfish.
- **Epic (8%):** Coelacanth, Great White Shark, Giant Oarfish, Magma Ray, Ghost Koi.
- **Legendary (3.5%):** Bioluminescent Kraken, Abyssal Maw, Cyber Glitch Leviathan, Frost Wyrm.
- **Mythic Apex Bosses (0.5% - One per Biome):** *The World Eater, Solar Flare Drake, Starlight Behemoth*. (Require specific weather, max-tier rods, and boss bait).

### 5.2 Fish Utilization: Three Distinct Pathways
Every caught fish presents an immediate 3-way decision in your inventory:
1. **Sell to Market:** Generates **Dev Gold 🪙** (scales by weight, length, and freshness quality: Bronze, Silver, Gold, Platinum stars).
2. **Fillet & Salvage (Butchery Bench):** Destroys the fish in exchange for crafting components:
   - *Fins & Tails:* Used for rod flexibility & sweet-spot widening.
   - *Jawbones & Teeth:* Used to craft heavy-duty hooks with bite-retention perks.
   - *Scales & Carapaces:* Forged into boat hulls and elemental line coatings.
   - *Organs & Glands:* Bioluminescent ink, venom sacks, and pheromone oils for high-tier bait craft.
3. **Donate / Stock to Haven Grand Aquarium:** Keep alive in your personal multi-story aquarium to generate passive Daily Admission Tourism Revenue and admire them swimming in real-time.

---

## 6. Modular Rod & Tackle Crafting (75+ Rod Combinations)

Instead of static pre-made rods, rods are crafted from 5 modular slots:

| Component | Description | Stat Influenced |
|---|---|---|
| **Blank (Rod Shaft)** | Bamboo, Ironwood, Carbon Fiber, Magma Steel, Celestial Bone | Base Durability, Max Weight Class |
| **Reel** | Wooden Spool, Geared Brass, High-Torque Titanium, Cyber Dynamo | Reel-in Speed & Recovery Acceleration |
| **Line** | Monofilament, Braided Silk, Steel Wire, Astral Thread | Line Snap Resistance & Tension Forgiveness |
| **Hook** | Barbed Iron, Circle Gold, Diamond Point, Magnetic Sinker | Catch Rate & Treasure Chest Hook Chance |
| **Charm / Relic** | Elemental Runes, Lucky Four-Leaf, Shark Tooth, Chrono Crystal | Special Passive or Active Perk |

### Sample Specialty Rods:
- **The Scavenger's Magnet Rod:** +50% chance to hook Sunken Treasure Chests instead of fish.
- **The Vulcan Core Rod:** Immune to lava line-melt; required to fish in Zone 3 Magma Calderas.
- **The Chrono-Weave Rod:** Passive 15% slow-motion on fish darting speeds.
- **The Deep-Diver Harpoon Rod:** +100% effectiveness against heavy-weight armored species.

---

## 7. Equipable Skills & Character Loadout System

The player has **3 Active Skill Slots** and **4 Passive Charm Slots** unlocked as their Fishing Mastery rank advances.

### 7.1 Active Skills (Triggered via Number Keys `1`, `2`, `3` / Space)
1. **Sonar Pulse (Cooldown: 12s):** Emits a circular wave from the boat, revealing underwater fish silhouettes, size rings, and golden sparkle markers for rare species.
2. **Focus Time-Dilation (Cooldown: 45s):** Enters a hyper-focus state for 4 seconds, slowing minigame fish movement by 50%. Essential for Legendary Apex catches.
3. **Chum Cannon (Cooldown: 30s):** Launches compressed bait into the target water tile, immediately spawning 3-5 fish silhouettes with elevated rarity odds.
4. **Line Reinforce / Shield (Cooldown: 40s):** Prevents line snapping for 3 seconds even if line tension spikes into maximum red.
5. **Magnetic Grapple (Cooldown: 20s):** Instantly reels in floating crates, ship debris, and sea debris without initiating a fish battle.

### 7.2 Passive Charms (Equipped at the Home Haven Mirror)
1. **Iron Wrists:** Increases sweet-spot bar size by 12%.
2. **Night Owl:** +25% bite frequency between 20:00 and 05:00.
3. **Bargain Hunter:** Increases fish sell price at the town market by 15%.
4. **Treasure Hunter:** Sunken chests yield +1 additional rare crafting blueprint.
5. **Weathered Sailor:** Immune to boat rocking and storm wave pushbacks.
6. **Master Butcher:** 30% chance to double salvaged crafting components when filleting fish.

---

## 8. Nautical Vessels & Land Gathering

### 8.1 Upgradable Fleet
1. **Tier 1: Weathered Dinghy (Rowboat):** Slow, manual paddling, limited to Zone 1 inshore waters.
2. **Tier 2: Outboard Motorboat:** High speed, battery headlamp, allows crossing Zone 1 into Zone 2.
3. **Tier 3: Armored Steam Cutter:** Reinforced steel hull, fog-piercing searchlights, onboard mini-workbench.
4. **Tier 4: Deep Submersible ("Nautilus"):** Submarine capable of diving beneath surface waters to reach submerged building interiors and the Abyssal Trench.
5. **Tier 5: Astral Skiff:** Levitating vessel capable of sailing across both celestial water rifts and sky island waterfalls.

### 8.2 Island Gathering & Survival Elements
When mooring at uncharted islands or sunken rooftops:
- **Chopping:** Collect Driftwood, Ancient Cedar, and Petrified Wood.
- **Mining:** Crack open geode rocks on beaches for Quartz, Obsidian, and Star Fragments.
- **Foraging:** Wild sea grapes, bioluminescent algae, night-blooming lotus for bait fermentation.
- **Excavation:** Shovel buried 'X' marks for treasure maps and antique relics.

---

## 9. Haven Tycoon & Decoration (200+ Furnishings)

Your Home Haven starts as an abandoned boathouse and can be transformed into a thriving Fisherman's Lodge:
- **Interior & Exterior Tile Grid:** Freely place wooden flooring, wallpapers, docks, outdoor lanterns, and campfires.
- **Functional Workstations:**
  - *Butchery & Fillet Counter:* For breaking down catches into materials.
  - *Tackle Forge:* For assembling modular rods and boiling custom baits.
  - *Research Desk:* Where you turn in artifacts to unlock new biomes and vehicle upgrades.
- **The Grand Public Aquarium:**
  - Build custom glass habitats (Freshwater Basin, Coral Reef Tank, Abyssal Dark Sphere, Lava Glass Cauldron).
  - Stock your caught fish. Island tourists visit and drop coins into donation boxes daily.

---

## 10. Technical Architecture & Engine Stack

## 11. Finalized Product Decisions (User Q&A Record)

The following 35 design parameters have been locked into the specification:

1. **Controls & Platforms:** Dual input support (Mouse click/hold/drag & Keyboard Space/WASD). Responsive mobile web support with automatic landscape lock and full-screen toggle.
2. **Fish Stamina:** Implemented; fish experience fatigue cycles where movement slows temporarily.
3. **Catch Failure:** Progress bar decreases to 0% before fish escapes.
4. **Durability Model:** Only the fishing line can snap under extreme tension. Rod, reel, and other gear never break (zero tedious repairs).
5. **Casting & Junk Catches:** Bait consumed on every cast. Water bodies have loot tables for non-fish items (sunken crates, algae, message bottles, treasure chests, ancient relics).
6. **Cast Aiming:** Seamless direct casting—no timing mini-game to cast. Click near water to cast.
7. **Boss Battles:** Mythic/Apex fish feature **Phase 2 (Rage Mode)** with altered swim patterns, ink bursts, or rapid dives.
8. **Perspective & Movement:** Stardew-inspired top-down 2D view with 4/8-directional movement and smooth camera following.
9. **Vessel Fuel:** Free navigation; no fuel restrictions.
10. **Sea Hazards:** Minimal hazards (whirlpools, shallow reef rocks) present for atmosphere without punishing navigation.
11. **Day/Night Duration:** 24 minutes real-time equals 24 in-game hours (1 min = 1 hr).
12. **Fast Travel:** Station-based (Harbors and Lighthouses unlock fast-travel beacons; remote wilderness requires sailing).
13. **Sunken Metropolis:** Atmospheric flooded high-rise towers; dive beneath the surface to explore waterlogged lobbies and atriums.
14. **Environmental Puzzles:** Island puzzles (ancient sun dials, elemental beacons, tide locks) required to access secret fishing grottos.
15. **Progression:** Unified Character EXP leveling system; earning mastery levels grants Talent/Skill points.
16. **Skill Slots:** Progression-based slot capacity; start with 1 Active / 1 Passive, expanding to 3 Active / 4 Passive.
17. **Cooking System:** Kitchen stove in Haven; prepare fish recipes for temporary stat buffs (night vision, bar width, luck, swim speed).
18. **Bait Alchemy:** Mortar & pestle station to brew specialized baits combining herbs, minerals, and fish parts.
19. **Apparel & Gear:** Cosmetic & functional outfits (Rain slickers, diving masks, wading boots) granting minor passive perks.
20. **Land Mounts:** Streamlined land mobility (e.g., a folding bike and coastal giant turtle mount).
21. **Fish Butchery:** Instant 1-click salvage at the butchery table (no repetitive minigame).
22. **Market Economics:** Seasonal price cycles (Spring, Summer, Autumn, Winter shift demand and values).
23. **Quests & Bounties:** Localized town quest boards with location-specific requests and high-yield bounty targets.
24. **Fish Breeding:** Outdoor breeding ponds on Home Haven to multiply rare catches over time.
25. **Aquarium Capacity:** Realistic volume limits per tank based on physical dimensions and habitat tier.
26. **Hired Island Helpers:** Recruitable island NPCs (aquarium ticket clerk, bait scavenger, garden tender).
27. **Island Expansion:** Land deed purchase system to expand home island footprint and dock area.
28. **Art Style:** High-fidelity "Hi-Bit" modern pixel art with rich dynamic lighting, water caustics, and smooth particle effects (Stardew charm with modern polish).
29. **Audio:** Phased for later polish; initial milestones prioritize visual and interactive mechanics.
30. **Haptics & Screen Shake:** Visual screen shake on tension spikes and boss strikes, with a Settings toggle.
31. **Save Architecture:** Dual system—Auto-save upon docking/entering buildings + Manual Save anytime via menu.
32. **Data Export/Import:** Pure client-side local save (IndexedDB / LocalStorage) with JSON file download/upload.
33. **Photo Trophy Mode:** High-score capture screen generating a sharable pixel polaroid with player, catch stats, and date.
34. **Mobile Controls:** Dynamic on-screen virtual joystick and action touch buttons for mobile viewports.
35. **Localization:** Multi-language architecture starting with English (EN) core strings, structured for future Thai (TH) addition.

---
