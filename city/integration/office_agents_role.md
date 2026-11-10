# integration/office_agents_role.md — การเชื่อมต่อระหว่าง Office AI Agents กับผังเมืองใหญ่ (Office Agents & City Integration)

> **อ้างอิงจาก:** `arisecityplan.md` ข้อ 5 (I) และภารกิจ Real AI Agents and NY Time Sync ที่สร้างไว้ใน `/arisebot/`  
> **หัวใจสำคัญ:** ออฟฟิศ AI Agents ที่มีอยู่เดิมไม่ได้เป็นเพียงห้องสี่เหลี่ยมแยกเดี่ยว แต่เป็น **"สมองและหัวใจ"** ที่ตั้งอยู่ใจกลางเมือง AriseCity ณ อาคาร Arise HQ

---

## 1. บทบาทคู่ขนานของ AI Agents ในโครงสร้างเมือง (Dual-Identity Architecture)

```
+-----------------------------------------------------------------------------------+
|                        [ARAISE STUDIO ENGINE (ภายในห้องทำงาน Z4)]                 |
|  - Orion (Engineering Lead): กำกับโค้ด สถาปัตยกรรมระบบ และรัน Daily Standup      |
|  - Antigravity (AI System Designer): ออกแบบอัลกอริทึม วางผังเมือง ประมวลผลภาพ     |
|  - Lyra (Creative Frontend Specialist): ออกแบบ UI, อนิเมชั่น และ Shader          |
+-----------------------------------------------------------------------------------+
                                         │
                 [เชื่อมต่อข้อมูลแบบ Real-Time Event Stream]
                                         ▼
+-----------------------------------------------------------------------------------+
|                        [ARAISE CITY PUBLIC REALM (พื้นที่เมือง Z0-Z2)]            |
|  - ป้ายดิจิทัลรอบเมือง (City Digital Kiosks) แสดงผล Git Commit ล่าสุดแบบสดๆ       |
|  - ระบบเสียงประกาศริมท่าเรือ (Harbor Public Audio) แจ้งเตือนเมื่อบิลด์ผ่านสำเร็จ  |
|  - ตัวแทน AI เดินทางไปพักผ่อนที่ Catch Cafe และสนาม Padel ในช่วงเวลาหลังเลิกงาน     |
+-----------------------------------------------------------------------------------+
```

---

## 2. ท่อส่งข้อมูลแบบสองทาง (Bi-Directional Event Pipeline)

1. **จากสตูดิโอสู่เมือง (Studio Engine ➔ City World):**
   - **GitHub Commits (`nickadesa/AriseCity`):** เมื่อมีการพุชโค้ดใหม่ คลื่นไฟ LED สีฟ้าจะวิ่งผ่านเสาสายส่งข้อมูลกลางเมือง และป้ายบิลบอร์ดในลาน Central Civic Plaza จะแสดงหัวข้อ Commit
   - **AI Standup Dialogues:** บทสนทนา Standup ยามเช้า 09:00 NY Time จะถูกบันทึกลงในฐานข้อมูลข่าวสารของเมือง (City News Gazette)
2. **จากเมืองสู่สตูดิโอ (City World ➔ Studio Engine):**
   - **New York Time & Weather:** อุณหภูมิ ลมทะเล และสภาพแสงแดดที่คำนวณจาก `TimeSyncEngine.ts` จะส่งผลให้บรรยากาศแสงไฟในห้องทำงาน Arise HQ เปลี่ยนโทนสีตามเวลาจริง
   - **NPC Visitors:** ประชาชนในเมืองสามารถเดินขึ้นลิฟต์ Catch Coworking มายังชั้น 2 เพื่อติดต่อหรือชมการทำงานของ AI Agents ผ่านแนวกระจกใสกั้นห้อง

---

## 3. สถาปัตยกรรมข้อมูลการซูมไร้รอยต่อ (Seamless Data Binding Z0 ➔ Z4)

- ทุกชั้นข้อมูลเชื่อมโยงด้วย ID Hierarchy เดียวกัน:
  `BLD_ARISE_HQ_01` (ตึก) ➔ `FLR_STUDIO_02` (ชั้น 2) ➔ `ROM_MAIN_DEV_01` (ห้องสตูดิโอ) ➔ `agentStore.ts` (ข้อมูล State สดของ Agents)
- เมื่อผู้ใช้คลิกที่ไอคอน Arise HQ บนแผนที่ Z0 กล้องจะบินและซูมต่อเนื่องลงมาจนถึงหน้าจอคอมพิวเตอร์ของ Orion ในระดับ Z4 โดยไม่มีหน้าจอโหลดคั่น (Zero Loading Screen)
