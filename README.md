# มงคลไม้ — Plant Data Manager (Firebase + Firestore)

ระบบฐานข้อมูลออนไลน์หลายผู้ใช้สำหรับข้อมูลไม้มงคลไทย พัฒนาด้วย HTML/CSS/Vanilla JavaScript และ Firebase Authentication + Cloud Firestore โดยเวอร์ชันนี้ไม่ใช้ Firebase Storage รูปภาพจึงเก็บเป็น URL

## ฟังก์ชันหลัก

### สิทธิ์
- **Admin:** ดู/ค้นหา/ส่งออก/เพิ่ม/แก้ไข/ลบ/กู้คืน/ดูประวัติ/สำรองข้อมูล
- **Member:** ดู/ค้นหา/ส่งออกข้อมูล
- Admin สามารถแก้ไขข้อมูลพืชของผู้ใช้คนอื่นได้ โดยยังคงเก็บ `createdBy*` เดิมและบันทึก `updatedBy*` เป็นผู้แก้ล่าสุด

### การกรอกข้อมูล
- หมวด A–H: ไม้ยืนต้น, ไม้พุ่ม, ไม้ล้มลุก, ไม้เลื้อย, ไม้คลุมดิน, ต้นปาล์ม, ไม้อวบน้ำ, ไม้ไผ่
- ID รูปแบบ A01–H99 และกำหนด ID เองได้ โดยต้องตรงกับหมวดและห้ามซ้ำ
- ตรวจข้อมูลซ้ำจากชื่อไทย/ชื่อวิทยาศาสตร์ก่อนบันทึก
- ข้อมูลไม่ครบยังสามารถยืนยันบันทึกได้ พร้อมรายการช่องที่ขาดและปุ่มกระโดดกลับไปกรอก
- ยืนยันก่อนบันทึกจริงและแสดงความคืบหน้าการบันทึก

### Draft / กรอกข้อมูลต่อ
- Auto-save แบบร่างหลังหยุดพิมพ์
- ตั้งชื่อแบบร่างเอง
- แบบร่างแยกตามบัญชี
- เริ่มรายการใหม่โดยไม่ลบแบบร่างเดิม
- กลับมากรอกต่อได้หลังรีเฟรชหรือเข้าสู่ระบบใหม่

### คลังข้อมูล
- Smart Search หลายฟิลด์
- ตัวกรองประเภท/การดูแล/แสง/น้ำ/พื้นที่/มือใหม่/สัตว์เลี้ยง/เวลาน้อย/พื้นที่จำกัด
- เรียงล่าสุด ชื่อไทย และ ID
- ดูรายละเอียดแบบแบ่งหมวด
- แสดงผู้ลงข้อมูลและผู้แก้ไขล่าสุด

### ประวัติและความปลอดภัยของข้อมูล
- **Version History:** เก็บ Snapshot ก่อนการแก้ไขแต่ละครั้ง และห้ามแก้/ลบ Version
- **Activity Logs:** เพิ่ม/แก้ไข/ย้ายเข้าถังขยะ/กู้คืน/ลบถาวร/ส่งคำขอลบ
- **Soft Delete:** ลบเข้าถังขยะก่อน
- **Restore:** กู้คืนข้อมูลจากถังขยะได้
- **Permanent Delete:** ลบจาก Firestore ถาวร
- ข้อมูลของผู้ใช้คนอื่นมีขั้นตอน Deletion Request แทนการลบทันที

### Counters A–H
แต่ละ `counters/{A..H}` มีอย่างน้อย:
- `count` = จำนวนข้อมูลที่ยังใช้งานอยู่ในหมวดนั้น
- `last` = เลข ID สูงสุดที่เคยใช้งานในหมวดนั้น
- `categoryCode`
- `updatedAt`

การทำงาน:
- เพิ่มข้อมูล 1 รายการ → `count + 1`
- Soft Delete 1 รายการ → `count - 1`
- Restore 1 รายการ → `count + 1`
- Permanent Delete จากถังขยะ → ไม่ลดซ้ำ เพราะลดไปแล้วตอน Soft Delete
- `last` ไม่ลดลงเมื่อมีการลบ เพื่อป้องกันการนำ ID เดิมกลับมาใช้ซ้ำ
- Admin มีปุ่ม **ตรวจสอบ / ซ่อม Counters** เพื่อคำนวณค่าจาก `plants` ใหม่ทั้ง 8 หมวด

### Export / Backup
- Excel `.xlsx`
- CSV UTF-8 BOM
- JSON
- Admin Backup Excel/JSON รวม:
  - Plants
  - Plant Version History
  - Activity Logs
  - Counters
  - Deletion Requests
- Export ปกติจะส่งเฉพาะข้อมูลที่ยังใช้งานอยู่ ส่วน Backup รวมข้อมูลที่อยู่ในถังขยะด้วย

## Collections
```text
users
plants
counters
activityLogs
plantVersions
drafts
deletionsRequests
```

> ชื่อ collection จริงสำหรับคำขอลบคือ `deletionRequests`

## Firebase Rules
ใช้ไฟล์ `firestore.rules` ที่อยู่ในโฟลเดอร์นี้เป็น Rules เวอร์ชันล่าสุดของระบบ

หลังแก้ Rules ต้อง Deploy ก่อนจึงจะมีผลกับเว็บไซต์:

```bash
firebase deploy --only firestore:rules
```

หากต้องการ Deploy Hosting ด้วย:

```bash
firebase deploy --only hosting
```

หรือทั้ง Rules และ Hosting:

```bash
firebase deploy --only firestore:rules,hosting
```

## Firebase Config
แก้ `firebase-config.js` ด้วย Web App config ของ Firebase project ของคุณ

Web config เช่น `apiKey`, `authDomain`, `projectId` เป็นค่าที่ใช้กับ Firebase Web SDK และไม่ใช่ตัวควบคุมสิทธิ์หลักของฐานข้อมูล ความปลอดภัยจริงอยู่ที่ Authentication และ Firestore Rules

## โครงสร้างไฟล์
```text
index.html
style.css
app.js
firebase-config.js
firestore.rules
firebase.json
.firebaserc
README.md
```

## การทดสอบที่ควรทำหลังอัปเดต
1. Login ด้วย Admin
2. เพิ่ม A01 → ตรวจ `counters/A` ว่า `count` เพิ่ม 1 และ `last` เป็น 1
3. เพิ่ม A05 → ตรวจ `count` เพิ่มอีก 1 และ `last` เป็น 5
4. แก้ A01 ด้วย Admin คนละบัญชีจากผู้สร้าง → ต้องแก้ได้ และ `createdBy` เดิมต้องไม่เปลี่ยน
5. เปิด Version History → ต้องมี Snapshot ก่อนแก้
6. ลบ A01 → `plants/A01.isDeleted = true` และ `counters/A.count` ลด 1
7. Restore A01 → `count` เพิ่ม 1 กลับมา
8. ลบถาวร → `count` ต้องไม่ลดซ้ำ
9. กดตรวจสอบ/ซ่อม Counters → ค่า `count` และ `last` ต้องตรงกับข้อมูลจริง
10. ตรวจ Activity Logs
11. ทดสอบ Member ว่าเพิ่ม/แก้ไข/ลบไม่ได้ แต่ดู ค้นหา และ Export ได้
12. ทดสอบ Draft ว่าแต่ละบัญชีเห็นเฉพาะ Draft ของตัวเอง
