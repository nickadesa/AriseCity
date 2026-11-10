# architecture/building_standards.md — มาตรฐานการออกแบบสถาปัตยกรรม (Architectural Standards & Typology Manual)

> **อ้างอิงจาก:** `arisecityplan.md` ข้อ 5 (C) และรูปอ้างอิงสถาปัตยกรรมทั้งหมด  
> **หลักการ:** กำหนดสัดส่วน ความสูง ชั้นวัสดุ และการจัดวางพื้นที่ภายใน เพื่อให้สถาปัตยกรรมทุกหลังสามารถแสดงผลได้สมบูรณ์ตั้งแต่ระดับ Z2 (ภายนอก) สู่ Z4 (ภายใน)

---

## 1. มิติและสัดส่วนโครงสร้างสากล (Universal Structural Dimensions)

- **ความสูงของชั้นมาตรฐาน (Floor-to-Floor Height):** 3.0 เมตร (เท่ากับ 3 เท่าของความสูงตัวละคร หรือ 96 พิกเซลในสเกล Z2)
- **ความหนาของแผ่นพื้นชั้น (Slab Thickness):** 0.3 เมตร (9–10 พิกเซล)
- **อัตราส่วนความโปร่งแสงของ Facade (Glazing Ratio):**
  - อาคารสำนักงานเทคโนโลยี: กระจกตัดแสง 65%, กรอบอะลูมิเนียมดำ 35%
  - อาคารที่พักอาศัยริมผา: กระจก 45%, ไม้ระแนงกันแดด 40%, คอนกรีตเปลือย 15%
  - อาคารท่าเรือและโกดัง: ผนังเหล็กลอนคอนเทนเนอร์ 80%, หน้าต่างแถบยาว 20%

---

## 2. ต้นแบบอาคารหลัก: Arise Studio Headquarters (Flagship Vertical Slice)

อาคารสำนักงานใหญ่ของ AI Agents ได้รับการออกแบบตามภาพอ้างอิง Catch Coworking 01, #BOXSPACES, และ Multi-level Bleacher:

### แผนผังชั้นภายใน (Floor-by-Floor Program)
- **Floor 01 (Ground Level):**
  - **Catch Foyer & Reception:** เสาสี่เหลี่ยมสีเหลือง Catch Yellow (`#F5BA31`), ป้าย Wayfinding ตัวเลขอักษรใหญ่ "01", ลิฟต์คู่สีเทาชาร์โคล
  - **Public Specialty Cafe:** เคาน์เตอร์เอสเพรสโซไม้โอ๊ค โต๊ะกาแฟกลมเตี้ย และโซฟาหนังดำสำหรับผู้มาเยือน
- **Floor 02 (Studio Engine & Townhall Bleachers):**
  - **Bleacher Auditorium:** อัฒจันทร์ไม้หลายระดับสำหรับจัด AI Daily Standup และการนำเสนอโครงการ
  - **Pair-Programming Pods:** โต๊ะทำงานปรับระดับ Ergonomic Desks พร้อมเก้าอี้ตาข่ายระบายอากาศและจอดิจิทัลแสดงผล Git Log
  - **Antigravity Focus Lab:** ห้องทำงานกระจกเก็บเสียงสำหรับงานสถาปัตยกรรมระบบขั้นสูง
- **Floor 03 (Executive Mezzanine & Server Vault):**
  - ชั้นลอยมองลงมายังอัฒจันทร์ชั้น 2 เชื่อมต่อด้วยบันไดเวียนเหล็กดำ
  - ตู้เซิร์ฟเวอร์ควบคุมระบบเวลา New York Real-Time Clock และ Cloudflare Workers AI Gateway
- **Floor 04 (Rooftop Sedum Garden & Ocean Lookout):**
  - สวนพืชทนแล้ง Sedum Roof แผงโซลาร์เซลล์ และลานพักผ่อนชมวิวอ่าวทะเล

---

## 3. กฎเกณฑ์การจัดระบบสัญจรแนวดิ่ง (Vertical Circulation Integrity)

1. **Staircase & Elevator Alignment:** ปล่องลิฟต์และช่องบันไดหนีไฟต้องตั้งอยู่ในตำแหน่งพิกัด X, Y เดียวกันทุกชั้นตั้งแต่ชั้น 1 ถึงดาดฟ้า เพื่อให้การเดินของ NPC ระหว่างชั้นมีความถูกต้องตามตรรกะสถาปัตยกรรม
2. **Door Threshold Snap:** บานประตูทุกบานต้องมีความกว้างอย่างน้อย 1 tile (1 เมตร) เพื่อให้ตัวละครสามารถเดินผ่านได้โดยไม่ติดขัด Collision Box
