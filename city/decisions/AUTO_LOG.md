# decisions/AUTO_LOG.md — บันทึกการตัดสินใจภายในและงานย่อยอัตโนมัติ (Internal Decisions Log)

> **คำชี้แจง:** บันทึกงานย่อยและการจัดโครงสร้างภายในตามกฎเหล็กข้อ 4 (งานที่ไม่กระทบทิศทางและอยู่ในกรอบที่ได้รับอนุมัติแล้ว)

---

## รายการบันทึก (Chronological Log)

### [LOG-001] การจัดโครงสร้างโฟลเดอร์โครงการตามมาตรฐานสากล
- **วันที่/เวลา:** 2026-11-10
- **การดำเนินการ:** สร้างโครงสร้างโฟลเดอร์ภายใน `/city/` ตามข้อกำหนด 14 ใน `arisecityplan.md` ครอบคลุม:
  - `decisions/` (APPROVED.md, PENDING.md, AUTO_LOG.md)
  - `skills/` (INSTALLED.md)
  - `research/`, `masterplan/`, `architecture/`, `landscape/`, `society/`, `systems/`, `integration/`
  - `npc/template/`, `npc/schedule/`, `npc/catalog/`
  - `visual/references/`, `visual/references/characters/`, `visual/catalog/`
  - `data/schema/`, `data/catalog/`
- **เหตุผล:** เป็นโครงสร้างที่ระบุชัดเจนในแผนงานหลักเพื่อความเป็นระเบียบและเป็นเอกภาพ

### [LOG-002] การย้ายและสำเนาชุดรูปภาพอ้างอิงทั้งหมด
- **วันที่/เวลา:** 2026-11-10
- **การดำเนินการ:** สำเนาไฟล์ภาพอ้างอิงทั้งหมด 33 ภาพจากรูท `/home/antigravity/` ไปยัง `/city/visual/references/` โดยแยกรูปตัวละครไปยัง `visual/references/characters/`
- **เหตุผล:** เพื่อให้ระบบไฟล์ภายใน `/city/` สามารถอ้างอิงแบบ Standalone ได้โดยสมบูรณ์

### [LOG-003] การกำหนดรูปแบบและมาตรฐานการตั้งชื่อไฟล์ข้อมูล (Data Naming Convention)
- **วันที่/เวลา:** 2026-11-10
- **การดำเนินการ:**
  - กำหนดรหัส ID ของ Asset ทุกชิ้นให้ขึ้นต้นด้วย Prefix ตามหมวดหมู่ เช่น:
    - `SF-xxx` สำหรับ Street Furniture
    - `CL-xxx` สำหรับ Coastal & Landscape
    - `VEH-xxx` สำหรับ Vehicles
    - `BLD-xxx` สำหรับ Building Typologies
    - `FUR-xxx` สำหรับ Interior Furniture
    - `SPEC-xxx` สำหรับ Specialized Equipment
    - `SIG-xxx` สำหรับ Interior Signage
    - `CHR-xxx` สำหรับ Character Layers (HAIR, FACE, TOP, BOT, SHOE, ACC)
  - ไฟล์ Schema ใช้มาตรฐาน JSON Schema Draft 7 / 2020-12
- **เหตุผล:** ป้องกันการซ้ำซ้อนของ ID และทำให้โค้ดเรนเดอร์ในอนาคตสามารถทำ Type-checking ได้ง่าย

### [LOG-004] การกำหนดสเกลกริดพื้นฐาน (Default Grid Metric for Schemas)
- **วันที่/เวลา:** 2026-11-10
- **การดำเนินการ:** กำหนดใน Schema เบื้องต้นให้ขนาดวัตถุระบุเป็นหน่วยเมตร (meters) และหน่วยช่องตาราง (tiles) โดยตั้งค่าสมมติฐานเริ่มต้นเป็น 1 tile = 1 เมตร (32x16px diamond หรือ 64x32px diamond) ซึ่งสามารถปรับ Scale Factor ในโค้ดเรนเดอร์ตามผลการตัดสินใจใน P-008 ได้โดยไม่ต้องแก้ข้อมูล JSON
- **เหตุผล:** ทำให้การจัดทำ Catalog ไม่ถูกบล็อกและพร้อมสเกลได้ทันที

### [LOG-005] การกำหนด Schema ของ Character Paper-Doll
- **วันที่/เวลา:** 2026-11-10
- **การดำเนินการ:** สร้างระบบจุดยึด Anchor Points มาตรฐาน (Head, Torso, Legs, Feet, Hands) ใน Schema ของตัวละคร เพื่อให้ชิ้นส่วนเสื้อผ้าและทรงผมสามารถสวมทับกันได้ในทุกสัดส่วนตามสเปก APP-005
- **เหตุผล:** เป็นหัวใจสำคัญของ Paper-Doll Layered System

### [LOG-006] การรองรับระบบเวลานิวยอร์ก (America/New_York UTC-4) ข้ามสู่ระบบเมือง
- **วันที่/เวลา:** 2026-11-10
- **การดำเนินการ:** เชื่อมต่อระบบเวลาของเมืองเข้ากับโมดูล `TimeSyncEngine.ts` ของ AriseCity เพื่อให้แสงแดด ทิศทางเงา และตารางชีวิตของ NPC เปลี่ยนแปลงตามเวลาจริงของนิวยอร์ก
- **เหตุผล:** ต่อเนื่องจากภารกิจ Real AI Agents and NY Time Sync ที่สร้างไว้ในส่วนแรก
