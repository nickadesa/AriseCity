# visual/ASSET_PIPELINE.md — กระบวนการผลิตและส่งออกชิ้นงานภาพ (Asset Production & Export Pipeline)

> **อ้างอิงจาก:** `arisecityplan.md` ข้อ 11 และข้อกำหนดด้านความหลากหลายในข้อ 10  
> **หลักการ:** กำหนดขั้นตอนมาตรฐานตั้งแต่การร่างแบบ การแยกเลเยอร์สถาปัตยกรรมเพื่อการตัดขวาง (Cutaway) การสร้าง Texture Atlas และการแปลงเข้าสู่ฐานข้อมูล JSON

---

## 1. วงจรการผลิตองค์ประกอบเมือง (Asset Lifecycle Overview)

```
[1. ร่างแบบ 2.5D] ===> [2. แยกเลเยอร์ 4 ชั้น] ===> [3. กำหนด Color Variants] ===> [4. ส่งออก Texture] ===> [5. บันทึก JSON Catalog]
   Vector Draft            Base / Walls / Roof         3+ สไตล์สี/วัสดุ                WebP Spritesheet         data/catalog/*.json
```

---

## 2. โครงสร้างการแยกเลเยอร์ของอาคาร 1 หลัง (Building Layer Deconstruction)

อาคารทุกหลังในเมืองต้องถูกสร้างและบันทึกแยกเป็น 4 ชิ้นส่วนอิสระ เพื่อรองรับระบบตัดขวางแบบไม่มีรอยต่อ:

```
        +-----------------------------------+
        |  Layer 4: Roof / Cap (หลังคา)     |  <--- ซ่อน/จางหายเมื่อซูมเข้าสู่ Z3
        +-----------------------------------+
        |  Layer 3: Upper Floors Interior   |  <--- แสดงห้องชั้นบนเมื่อเปิดหลังคา
        +-----------------------------------+
        |  Layer 2: Ground Walls & Facade   |  <--- ผนังด้านหน้าโปร่งแสงเมื่อซูม Z4
        +-----------------------------------+
        |  Layer 1: Foundation & Base Tile  |  <--- ฐานรากและลานทางเท้าด้านล่าง
        +-----------------------------------+
```

1. **Layer 1: Foundation Base (ฐานรากและภูมิทัศน์รอบอาคาร):**
   - ประกอบด้วยขอบทางเท้า พื้นคอนกรีตลานหน้าตึก ท่อระบายน้ำ และช่องปลูกต้นไม้
   - ไม่มีการเปลี่ยนแปลงใดๆ ตลอดทุกระยะซูม
2. **Layer 2: Outer Facade & Structural Columns (เปลือกอาคารภายนอกและเสาโครงสร้าง):**
   - ประกอบด้วยกระจก Facade เสาโครงสร้างหลัก บานหน้าต่าง และป้ายอาคาร
   - มีโหมดโปร่งแสง (Alpha 0.15) เมื่อเข้าสู่ระยะ Z3/Z4
3. **Layer 3: Floor Plates & Interior Partitions (พื้นชั้นและผนังกั้นห้องภายใน):**
   - ผนังห้องภายใน บันได ปล่องลิฟต์ และจุดเสียบเฟอร์นิเจอร์ (Furniture Slots)
4. **Layer 4: Removable Roof Cap (หลังคาและระบบวิศวกรรมดาดฟ้า):**
   - สวนบนดาดฟ้า (Green Roof) แผงโซลาร์เซลล์ คอมเพรสเซอร์แอร์ และลานสังสรรค์
   - ปิดสนิทในระดับ Z1–Z2 และถูกซ่อน (Fade out) ทันทีในระดับ Z3–Z4

---

## 3. กฎการตั้งชื่อไฟล์และโครงสร้างโฟลเดอร์ส่งออก (Naming & Directory Convention)

ไฟล์ภาพทั้งหมดจัดเก็บในโครงสร้าง:
```
/assets/
  ├── buildings/
  │   └── bld_office_hq_01/
  │       ├── bld_office_hq_01_base.webp
  │       ├── bld_office_hq_01_facade.webp
  │       ├── bld_office_hq_01_interior_f1.webp
  │       ├── bld_office_hq_01_interior_f2.webp
  │       └── bld_office_hq_01_roof.webp
  ├── street/
  │   ├── sf_lamp_modern_01.webp
  │   └── sf_bench_wood_01.webp
  └── characters/
      ├── bodies/
      ├── hair/
      └── tops/
```

### มาตรฐานรหัสไอเท็ม (Item ID Format)
- รูปแบบ: `[หมวดหมู่]_[ประเภท]_[ตัวแปร]_[รหัสลำดับ]`
- ตัวอย่าง:
  - `BLD_OFFICE_CATCH_01`: อาคารสำนักงานสไตล์ Catch Coworking
  - `SF_LAMP_SOLAR_01`: เสาไฟถนนพลังงานแสงอาทิตย์
  - `CL_BOAT_FERRY_01`: เรือข้ามฟากริมท่า
  - `FUR_DESK_ERGO_01`: โต๊ะทำงานปรับระดับ

---

## 4. ข้อกำหนดทางเทคนิคในการส่งออก (Export Technical Specs)

| คุณสมบัติ | สเปกสำหรับ Environment Elements (ฉาก) | สเปกสำหรับ Character Sprites (ตัวละคร) |
|:---|:---|:---|
| **รูปแบบไฟล์ต้นฉบับ** | Vector SVG / High-res PNG (2x resolution) | Pixel Grid Canvas (48x48px ต่อเฟรม) |
| **รูปแบบส่งออกใช้งานจริง** | WebP (Lossless หรือ Quality 92) | PNG-8 / Indexed WebP |
| **ความละเอียด (DPI)** | 72 DPI (Pixel perfect alignment) | 72 DPI (Nearest-Neighbor Interpolation) |
| **ขนาด Texture Atlas สูงสุด** | 2048 x 2048 พิกเซล | 1024 x 1024 พิกเซล |
| **Padding ระหว่าง Sprite** | 2 พิกเซล (ป้องกัน Texture Bleed) | 1 พิกเซล |
| **ตัวแปรสีขั้นต่ำต่อชิ้น** | **3 ตัวแปรสี/วัสดุ** (เช่น ไม้โอ๊ค / ไม้วอลนัท / โลหะดำ) | **Indexed Grayscale** รองรับ Palette Swap 24 สี |

---

## 5. กระบวนการตรวจสอบคุณภาพชิ้นงาน (Quality Assurance Checklist)

ก่อนบรรจุ Asset เข้าสู่ `data/catalog/` ต้องผ่านการตรวจสอบ 5 ข้อ:
1. [ ] **Isometric Alignment:** ขอบล่างของฐานวัตถุต้องวางทาบขนานกับแนวเส้นกริด 2:1 ได้สนิท
2. [ ] **Scale Verification:** สัดส่วนความสูงสัมพันธ์กับตัวละครมาตรฐาน (44px) และเสาไฟ (80–90px)
3. [ ] **Light Consistency:** แสงแดดตกกระทบจากทิศซ้ายบน (SW wall รับแสง) เสมอ
4. [ ] **Cutaway Integrity:** ชิ้นส่วนหลังคาแยกเลเยอร์ชัดเจน ไม่ติดเนื้อผนังชั้นล่าง
5. [ ] **Metadata Completeness:** มีข้อมูลระบุขนาดกว้างxยาว (Tile footprint), ชั้นความสูง, และแท็กการใช้งานครบถ้วนใน JSON
