# skills/INSTALLED.md — สรุปองค์ความรู้และทักษะที่นำมาใช้ในภารกิจ (Installed Skills & Capabilities)

> **บันทึกตามข้อกำหนด 3 ใน `arisecityplan.md`:** รายการองค์ความรู้ ทักษะเฉพาะทาง และหลักการทางวิศวกรรม/สถาปัตยกรรมที่นำมาประยุกต์ใช้ในการวางผังและออกแบบเมืองชายฝั่ง AriseCity

---

## 1. การวางผังเมืองและผังแม่บทชายฝั่ง (Urban & Coastal Waterfront Planning)
- **หลักการที่ใช้:**
  - **Transit-Oriented Development (TOD):** วางศูนย์กลางการคมนาคม (สถานีรถไฟฟ้าริมน้ำ, ท่าเทียบเรือเฟอร์รี่หลัก) เป็นจุดเชื่อมต่อที่มีความหนาแน่นสูงสุด และกระจายความหนาแน่นลดหลั่นออกไปสู่ย่านพักอาศัย
  - **Road & Path Hierarchy:** จำแนกสายทางอย่างเข้มงวด: ถนนสายหลัก Arterial Boulevard (กว้าง 6–8 tiles มีเกาะกลาง), ถนนย่าน Collector Street (กว้าง 4–5 tiles), ถนนคนเดินและทางจักรยาน Pedestrian Shared Street (กว้าง 3 tiles), และทางเดินริมน้ำ Waterfront Promenade (กว้าง 4–6 tiles ปลอดรถยนต์ 100%)
  - **Coastal Resilience & Sea-Level Adaptation:**
    - ระบบแนวกันคลื่นซ้อนชั้น (Tiered Breakwaters & Riprap Revetments)
    - ระบบดูดซับน้ำผิวดินแบบฟองน้ำ (Sponge City Bioswales & Tidal Retention Basins)
    - การกำหนดระยะถอยร่น (Setback Buffer Zone) 15–30 เมตรจากแนวน้ำสูงสุดตามกฎหมายชายฝั่งสากล
  - **Linear Park & Green Corridors:** อ้างอิงจากแบบแผน The Rose Kennedy Greenway (Boston) โดยสร้างแถบพื้นที่สีเขียวยาวต่อเนื่องขนานกับแนวชายฝั่งเพื่อเชื่อมต่อทุกย่านในเมือง

---

## 2. สถาปัตยกรรมและการจัดวางมวลอาคาร (Architecture & Building Typology)
- **หลักการที่ใช้:**
  - **Mixed-Use Coastal Architecture:** การผสมผสานการใช้สอย: ชั้น 1 เป็นร้านค้า คาเฟ่ ตลาดปลา หรือล็อบบี้สาธารณะ (Active Frontage), ชั้น 2–4 เป็นสำนักงานหรือ Coworking Hub, ชั้นบนเป็นที่พักอาศัย
  - **Massing & Solar Setback:** การปาดมุมอาคารและสร้างชานระเบียงลดหลั่น (Stepped Terraces) เพื่อเปิดรับลมทะเล แสงแดดธรรมชาติ และไม่ทอดเงาทึบบดบังพื้นที่ทางเท้าสาธารณะ
  - **Architectural Cutaway Logic (Z3):** กำหนดกฎการตัดขวางอาคารอย่างสมเหตุสมผล โดยตัดผนังด้านหน้าและเพดานออก 45 องศาตามมุมมองกล้อง โดยคงเสาโครงสร้างหลัก บันได และปล่องลิฟต์ไว้เพื่อรักษาความต่อเนื่องของสายตา

---

## 3. ทัศนศิลป์และระบบเรนเดอร์ไอโซเมตริก (Visual Design & 2.5D Isometric Systems)
- **หลักการที่ใช้:**
  - **Dimetric Projection (Isometric 2:1):** ใช้มุมเอียงสากลของวงการเกม 26.565° (อัตราส่วนกว้าง 2 ต่อ สูง 1) ซึ่งหลีกเลี่ยงรอยหยัก (Pixel Anti-aliasing artifacts) ได้อย่างสมบูรณ์แบบ
  - **Hierarchical Line Weight:**
    - เส้นเค้าโครงหลัก (Outer Contour): หนา 2px หมึกเข้ม
    - เส้นแบ่งชิ้นส่วนภายใน (Inner Plane Divider): หนา 1px เทาเข้ม
    - เส้นลวดลายพื้นผิว (Texture Hatching): หนา 0.5–1px สีจางหรือโปร่งแสง 30%
  - **Atmospheric Palette Harmonization:** การนำพาเล็ตสี Pantone Blue Fog (`#7A9A95`), Sage Green (`#8FA89B`), Slate (`#3F4E56`), Catch Yellow (`#F5BA31`) มาเกลี่ยและเชื่อมต่อกับโทนแสงตามเวลา New York (UTC-4)

---

## 4. ระบบตัวละครพิกเซลและการประกอบเลเยอร์ (Pixel Character & Paper-Doll Pipeline)
- **หลักการที่ใช้:**
  - **Composite Multi-Layering Pipeline:** ตัวละคร 1 ตัวเกิดจากการซ้อนเลเยอร์ลำดับตายตัว:
    1. Shadow (เงาตกทอด)
    2. Back Hair / Cape (ผมด้านหลัง / ผ้าคลุม)
    3. Base Body (สรีระหลักตามช่วงวัย)
    4. Face & Eyes (ใบหน้า ดวงตา ปาก)
    5. Bottom / Pants / Skirt (ท่อนล่าง)
    6. Shoes (รองเท้า)
    7. Top / Shirt / Jacket (ท่อนบน)
    8. Front Hair (ผมด้านหน้า / ผมม้า)
    9. Facial Hair / Glasses (หนวดเครา / แว่นตา)
    10. Hat / Headgear (หมวก / เครื่องประดับศีรษะ)
    11. Handheld Item (อุปกรณ์ถือในมือ)
  - **Standardized Anchor Matrix:** กำหนดพิกัด Anchor Point (X, Y) ประจำแต่ละเฟรมของ Walk Cycle (3–4 เฟรม) สำหรับ 4 ทิศทาง (SE, SW, NE, NW) ทำให้ไอเท็มทุกชิ้นในหมวดหมู่ 100+ สามารถสวมใส่ได้พอดีโดยไม่เลื่อนหลุด
  - **Procedural Palette Swapping:** แปลงชุดสไปรต์ขาว-เทา (Grayscale Base) ให้เป็นสีจริงด้วย Dynamic Color Ramp Map (เช่น เฉดสีผิว 8 โทน, เฉดสีผม 16 โทน, เฉดสีผ้า 24 โทน)

---

## 5. การจำลองสังคมและตัวแทนปัญญาประดิษฐ์ (Simulation & Agent-Based Modeling)
- **หลักการที่ใช้:**
  - **Circadian Rhythm & Schedule Matrix:** ประชากร NPC จำลองมีตารางชีวิต 24 ชั่วโมงที่สอดคล้องกับเวลานิวยอร์ก (ตื่นนอน, เดินทางไปทำงาน, ประชุม, พักเที่ยงที่ตลาดปลา, ออกกำลังกายที่สนาม Padel, กลับบ้าน)
  - **Office AI Agents Deep Integration:** สถาปัตยกรรมการเชื่อมโยงข้อมูลระหว่างสำนักงาน Arise Studio เข้าสู่ระบบเมืองใหญ่ เพื่อให้ AI Agents สามารถส่งออกสถานะความคืบหน้าของงาน, กิจกรรม Git Commits, และบทสนทนา Standup ออกสู่กระดานข่าวสารและป้ายดิจิทัลรอบเมืองได้อย่างเป็นธรรมชาติ


---

## 6. สกิลเฉพาะทางที่เปิดใช้งานในขั้นตอนการพัฒนา (Active Engineering & Design Skills)
- **`web-app-development`:** สถาปัตยกรรมเว็บแอปพลิเคชัน การจัดระบบ State, Event Pipeline, Component Structure, และการเรนเดอร์ระดับ 60 FPS
- **`frontend-design`:** การกำกับทิศทางศิลป์ การคัดสรรโทนสี Modern Metropolitan Marine, การจัดลำดับ Typography และ Micro-interactions
- **`apple-design`:** ฟิสิกส์การซูมแบบ Continuous Zoom Z0->Z4 การเคลื่อนที่ของกล้องที่ตอบสนองอย่างนุ่มนวล (Damped Smooth Transitions) และการ Peeling เปลือกอาคารอย่างไร้รอยต่อ
- **`systematic-debugging` & `verification-before-completion`:** การตรวจสอบ Type-safety, Build Integrity, และการวัดประสิทธิภาพของ Viewport Rendering
