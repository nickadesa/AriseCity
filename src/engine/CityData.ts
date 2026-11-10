import { CityDistrict, AmbientNPC } from '../types/agent';

export const CITY_DISTRICTS: CityDistrict[] = [
  {
    id: 'downtown_waterfront',
    name: 'Downtown Waterfront & AI Core',
    nameThai: 'ย่านเทคโนโลยีและสำนักงานริมน้ำ',
    colorHex: '#38bdf8', // Cyan / Light Blue
    accentHex: '#f5ba31', // Catch Yellow
    description: 'ศูนย์กลางเทคโนโลยี สตูดิโอปัญญาประดิษฐ์ Arise HQ และอาคารตู้คอนเทนเนอร์ #BOXSPACES',
    centerPos: { x: 150, y: 150, z: 0 },
    icon: '🏢',
    landmarks: [
      {
        id: 'arise_hq',
        name: 'Arise Studio HQ (AI Core)',
        nameThai: 'สำนักงานใหญ่ Arise Studio',
        type: 'office_ai_hq',
        districtId: 'downtown_waterfront',
        worldPos: { x: 150, y: 150, z: 0 },
        icon: '🗽',
        description: 'ศูนย์รวม AI Agents (Orion, Antigravity, Nova, Cipher, Vortex) พร้อมห้อง Standup และ Catch Coworking 01',
        walkMinutesFromHQ: 0
      },
      {
        id: 'boxspaces_hub',
        name: '#BOXSPACES Tech Labs',
        nameThai: 'ศูนย์วิจัยตู้คอนเทนเนอร์ #BOXSPACES',
        type: 'modular_office',
        districtId: 'downtown_waterfront',
        worldPos: { x: 260, y: 190, z: 0 },
        icon: '📦',
        description: 'อาคารตู้คอนเทนเนอร์สีดำพร้อมบันไดเหล็กสีเหลือง Catch Yellow ศูนย์รวมสตาร์ทอัพเทคโนโลยี',
        walkMinutesFromHQ: 2
      },
      {
        id: 'catch_cafe_flagship',
        name: 'Catch Specialty Cafe',
        nameThai: 'คาเฟ่ Catch Specialty',
        type: 'cafe',
        districtId: 'downtown_waterfront',
        worldPos: { x: 90, y: 220, z: 0 },
        icon: '☕',
        description: 'คาเฟ่เอสเพรสโซและเบเกอรี่ริมทางเดินเท้า จุดพักผ่อนจิบกาแฟของ AI Agents',
        walkMinutesFromHQ: 1
      }
    ]
  },
  {
    id: 'civic_promenade',
    name: 'Civic Center & Greenway Promenade',
    nameThai: 'ศูนย์ราชการและสวนเลียบหาด Greenway',
    colorHex: '#10b981', // Emerald
    accentHex: '#38bdf8',
    description: 'ทางเดินสีเขียว Rose Kennedy Greenway จัตุรัสลานน้ำพุวงกลม ศาลาว่าการเมือง และหอศิลป์ริมน้ำ',
    centerPos: { x: 420, y: 150, z: 0 },
    icon: '⛲',
    landmarks: [
      {
        id: 'central_fountain_plaza',
        name: 'Circular Civic Fountain Plaza',
        nameThai: 'จัตุรัสลานน้ำพุวงกลมกลางเมือง',
        type: 'civic_square',
        districtId: 'civic_promenade',
        worldPos: { x: 420, y: 150, z: 0 },
        icon: '⛲',
        description: 'ลานหินแกรนิตวงกลม ลาย Concentric Paving พร้อมน้ำพุแสงสีเสียงและที่จอดรถร่มรื่น',
        walkMinutesFromHQ: 4
      },
      {
        id: 'city_hall_monolith',
        name: 'Municipal City Hall',
        nameThai: 'ศาลาว่าการเมืองชายฝั่ง',
        type: 'civic_government',
        districtId: 'civic_promenade',
        worldPos: { x: 460, y: 90, z: 0 },
        icon: '🏛️',
        description: 'อาคารทรงโมโนลิธมินิมอล ศูนย์บัญชาการข้อมูลและบริการสาธารณะของเมือง',
        walkMinutesFromHQ: 6
      },
      {
        id: 'rose_kennedy_greenway',
        name: 'Rose Kennedy Linear Greenway',
        nameThai: 'สวนริบบิ้นสีเขียวเลียบชายฝั่ง',
        type: 'linear_park',
        districtId: 'civic_promenade',
        worldPos: { x: 340, y: 200, z: 0 },
        icon: '🌳',
        description: 'แนวสวนสาธารณะยาวต่อเนื่องขนานชายหาด มีทางจักรยาน ช่องปลูกต้นสนทะเล และม้านั่งพักผ่อน',
        walkMinutesFromHQ: 3
      }
    ]
  },
  {
    id: 'port_maritime',
    name: 'Port Maritime & Fishermen\'s Wharf',
    nameThai: 'ท่าเรือพาณิชย์และสะพานปลาประมง',
    colorHex: '#1e293b', // Deep Navy / Slate
    accentHex: '#f59e0b',
    description: 'ท่าเทียบเรือเฟอร์รี่ สะพานไม้ยื่นลงสู่ทะเล ตลาดปลาสด อู่ต่อเรือ และโรงพลังงาน System 1.0 AIRMADE',
    centerPos: { x: 170, y: 440, z: 0 },
    icon: '⚓',
    landmarks: [
      {
        id: 'grand_ferry_terminal',
        name: 'Grand Ferry Terminal & Wharf',
        nameThai: 'ท่าเรือโดยสารเฟอร์รี่ข้ามฟาก',
        type: 'maritime_terminal',
        districtId: 'port_maritime',
        worldPos: { x: 150, y: 460, z: 0 },
        icon: '🚢',
        description: 'ท่าเทียบเรือโดยสารคาตามารัน เชื่อมต่อการเดินทางระหว่างเกาะและชายฝั่งใหญ่',
        walkMinutesFromHQ: 5
      },
      {
        id: 'fishermen_market_hall',
        name: 'Old Pier Fish Market',
        nameThai: 'ตลาดประมงสะพานปลา',
        type: 'market_hall',
        districtId: 'port_maritime',
        worldPos: { x: 260, y: 420, z: 0 },
        icon: '🐟',
        description: 'ตลาดปลาสดริมท่าเรือ เสิร์ฟอาหารทะเลสดใหม่พร้อมจุดจอดเรือประมงอวนลาก',
        walkMinutesFromHQ: 6
      },
      {
        id: 'airmade_energy_plant',
        name: 'System 1.0 AIRMADE Clean Energy',
        nameThai: 'โรงผลิตพลังงานสะอาด System 1.0',
        type: 'industrial_clean_tech',
        districtId: 'port_maritime',
        worldPos: { x: 60, y: 480, z: 0 },
        icon: '⚡',
        description: 'ต้นแบบโรงกลั่นน้ำจืดจากทะเลและกักเก็บพลังงานไฮโดรเจนสะอาดริมอ่าว',
        walkMinutesFromHQ: 7
      }
    ]
  },
  {
    id: 'sports_wellness',
    name: 'Sports Club & Eco-Beach',
    nameThai: 'สโมสรกีฬาพาเดลและชายหาดสุขภาพ',
    colorHex: '#ea580c', // Bright Orange / Coral
    accentHex: '#84cc16',
    description: 'สโมสร Arise Athletic Club มี 3 Padel Courts, สระว่ายน้ำเกลือ, สนามบาสเกตบอล และหาดทรายขาว',
    centerPos: { x: 480, y: 400, z: 0 },
    icon: '🎾',
    landmarks: [
      {
        id: 'padel_pickleball_club',
        name: 'Arise Waterfront Padel & Pickleball',
        nameThai: 'สโมสรพาเดลและพิเคิลบอลริมน้ำ',
        type: 'sports_complex',
        districtId: 'sports_wellness',
        worldPos: { x: 480, y: 390, z: 0 },
        icon: '🎾',
        description: 'คอร์ทพาเดลกระจก 3 คอร์ท, พิเคิลบอล 2 คอร์ท, สระว่ายน้ำโอลิมปิก และบาร์สมูทตี้',
        walkMinutesFromHQ: 6
      },
      {
        id: 'recreation_court_park',
        name: 'Active Curved Park & Red Court',
        nameThai: 'สวนกีฬาโค้งและคอร์ทบาสเกตบอลสีแดง',
        type: 'recreation_park',
        districtId: 'sports_wellness',
        worldPos: { x: 420, y: 330, z: 0 },
        icon: '🏀',
        description: 'สนามบาสเกตบอลสีส้มแดง ทางเดินโค้งฟรีฟอร์ม ลานสเก็ต และสนามเด็กเล่นลายดอกไม้',
        walkMinutesFromHQ: 5
      },
      {
        id: 'azure_eco_beach',
        name: 'Azure Sand Cove & Dunes',
        nameThai: 'อ่าวหาดทรายและเนินทรายอาบแดด',
        type: 'nature_beach',
        districtId: 'sports_wellness',
        worldPos: { x: 540, y: 450, z: 0 },
        icon: '🏖️',
        description: 'หาดทรายขาวละเอียด ทิวต้นปาล์ม และจุดเล่นวอลเลย์บอลชายหาด',
        walkMinutesFromHQ: 8
      }
    ]
  },
  {
    id: 'terrace_residential',
    name: 'Coastal Terrace Eco-Villas',
    nameThai: 'ย่านวิลล่าขั้นบันไดริมเนินผา',
    colorHex: '#607264', // Sage Olive Green
    accentHex: '#f8fafc',
    description: 'ที่พักอาศัยขั้นบันไดลดหลั่นตามแนวเขา ผนังไม้ระแนงสีดำและหลังคาคลุมหญ้าเขียว Sedum Roofs',
    centerPos: { x: 300, y: -60, z: 0 },
    icon: '🏡',
    landmarks: [
      {
        id: 'stepped_sedum_villas',
        name: 'Stepped Terrace Green-Roof Villas',
        nameThai: 'กลุ่มวิลล่าขั้นบันไดหลังคาหญ้า',
        type: 'residential_villas',
        districtId: 'terrace_residential',
        worldPos: { x: 300, y: -60, z: 0 },
        icon: '🏡',
        description: 'วิลล่าร่วมสมัยโมเดิร์น กระจกบานใหญ่ ระเบียงชมวิวทะเล และหลังคาหญ้าดูดซับคาร์บอน',
        walkMinutesFromHQ: 5
      },
      {
        id: 'hilltop_lookout',
        name: 'Ocean Vista Hilltop Lookout',
        nameThai: 'จุดชมวิวพาโนรามาบนยอดเขา',
        type: 'scenic_lookout',
        districtId: 'terrace_residential',
        worldPos: { x: 400, y: -120, z: 0 },
        icon: '🔭',
        description: 'จุดชมวิวสูงสุดของเมือง มองเห็นอ่าว ท่าเรือ และพระอาทิตย์ขึ้นยามเช้า',
        walkMinutesFromHQ: 9
      }
    ]
  }
];

// Additional Ambient Coastal Citizens
export const EXTRA_COASTAL_CITIZENS: AmbientNPC[] = [
  {
    id: 'npc_captain_jack',
    name: 'Captain Jack (Harbor Master)',
    type: 'technician',
    position: { x: 160, y: 440, z: 0 },
    facing: 'se',
    schedule: 'always',
    dialogueLines: [
      'The tide is rising nicely in Upper Arise Bay! Trawlers are arriving on time.',
      'Always keep an eye on the breakwater beacons when sailing at dusk.',
      'Fresh Atlantic cod and oysters arrived at Wharf 4 this morning!'
    ],
    thought: 'Inspecting mooring cleats on Jetty B.',
    interactionCount: 0,
    walkSpeed: 1.1
  },
  {
    id: 'npc_barista_maya',
    name: 'Maya (Catch Barista)',
    type: 'client',
    position: { x: 100, y: 220, z: 0 },
    facing: 'sw',
    schedule: 'day',
    dialogueLines: [
      'Double espresso ready for Orion and the Antigravity dev cluster!',
      'We roast our beans using clean power from the AIRMADE plant.',
      'Care for an iced oat latte while you review pull requests?'
    ],
    thought: 'Steaming silky milk for a flat white.',
    interactionCount: 0,
    walkSpeed: 1.3
  },
  {
    id: 'npc_fisher_sam',
    name: 'Sam (Wharf Fisherman)',
    type: 'cleaner',
    position: { x: 260, y: 450, z: 0 },
    facing: 'se',
    schedule: 'always',
    dialogueLines: [
      'Quiet morning by the pier. Caught three mackerel already!',
      'The water quality has been fantastic since the sponge city bioswales opened.',
      'Patience is key—both in deep sea fishing and distributed computing.'
    ],
    thought: 'Watching the red bobber float on tidal ripples.',
    interactionCount: 0,
    walkSpeed: 0.9
  },
  {
    id: 'npc_padel_coach_elena',
    name: 'Elena (Padel Coach)',
    type: 'security',
    position: { x: 470, y: 380, z: 0 },
    facing: 'nw',
    schedule: 'day',
    dialogueLines: [
      'Bandeja practice starts at 17:00! Court 1 has the best ocean breeze.',
      'Playing padel after a long coding sprint clears the mind completely.',
      'Ready for a match against Orion and Nova?'
    ],
    thought: 'Warming up with a carbon fiber padel racket.',
    interactionCount: 0,
    walkSpeed: 1.5
  },
  {
    id: 'npc_jogger_leo',
    name: 'Leo (Greenway Runner)',
    type: 'courier',
    position: { x: 340, y: 190, z: 0 },
    facing: 'ne',
    schedule: 'day',
    dialogueLines: [
      'Running the 5K loop along the Rose Kennedy Greenway is the highlight of my morning!',
      'The seaside air feels crisp and refreshing today.',
      'Heading toward the Civic Plaza for a cooldown stretch.'
    ],
    thought: 'Pacing at 4:30 min/km along the shaded path.',
    interactionCount: 0,
    walkSpeed: 1.8
  }
];
