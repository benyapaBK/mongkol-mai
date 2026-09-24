# มงคลไม้ — Plant Data Manager (Firebase + Firestore Only)

เวอร์ชันนี้เป็นฐานข้อมูลออนไลน์แบบหลายผู้ใช้ โดยใช้ **Firebase Authentication + Cloud Firestore** เท่านั้น

- ไม่ใช้ `localStorage` เป็นฐานข้อมูลหลัก
- ไม่ใช้ Firebase Storage
- ไม่ต้องอัปโหลดไฟล์รูปเข้า Firebase
- ช่องรูปภาพใช้ **URL ของรูปภาพ**
- ต้อง Login ก่อนเข้าใช้งานเว็บไซต์
- สมัครสมาชิกได้จากหน้า Login
- ทุกข้อมูลพืชบันทึก `createdByName`, `createdByEmail`, `createdAt`
- ในรายการคลังจะแสดงทั้งวันเวลาและผู้ลงข้อมูล
- มี `updatedByName`, `updatedByEmail`, `updatedAt` เมื่อแก้ไข
- มี `activityLogs` สำหรับบันทึกการเพิ่ม/แก้ไข/ลบ

## 1) เชื่อม Firebase

1. เปิด `firebase-config.js`
2. Firebase Console → Project settings → Your apps → Web app
3. คัดลอก `firebaseConfig` ของโปรเจกต์มาแทนค่าตัวอย่างในไฟล์
4. ไม่ต้องใส่ Storage config เพิ่ม เพราะเวอร์ชันนี้ไม่ใช้ Firebase Storage

ไฟล์ที่เกี่ยวข้อง:
- `firebase-config.js` — Firebase Web config
- `app.js` — Authentication + Firestore logic
- `index.html` — Firebase SDK และหน้า Login/Register

## 2) เปิด Authentication

Firebase Console → Authentication → Sign-in method

เปิด:
- Email/Password

หน้าเว็บมี:
- เข้าสู่ระบบ
- สมัครสมาชิก
- ออกจากระบบ

ตอนสมัคร ระบบจะสร้างเอกสาร:
`users/{uid}`

ตัวอย่างข้อมูล:
```text
username
displayName
email
role: "member"
createdAt
```

## 3) Cloud Firestore

สร้าง Firestore Database แบบ Standard edition

ระบบใช้ Collections:
```text
users
plants
counters
activityLogs
```

### plants
แต่ละรายการมีข้อมูลพืช + metadata เช่น:
```text
id
categoryCode
createdAt
createdBy
createdByName
createdByEmail
updatedAt
updatedBy
updatedByName
updatedByEmail
```

ID ใช้รูปแบบ:
```text
A01, A02, ...
B01, B02, ...
...
H01, H02, ...
```

การสร้าง ID ใหม่ใช้ Firestore Transaction ผ่าน `counters/{A..H}`

## 4) Firestore Rules

ตัวอย่าง Rules ที่สอดคล้องกับเว็บนี้:

```rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    match /users/{uid} {
      allow read: if isOwner(uid);
      allow create: if isOwner(uid);
      allow update: if isOwner(uid);
      allow delete: if false;
    }

    match /plants/{id} {
      allow read, create, update, delete: if signedIn();
    }

    match /counters/{id} {
      allow read, write: if signedIn();
    }

    match /activityLogs/{id} {
      allow create: if signedIn();
      allow read, update, delete: if false;
    }
  }
}
```

> สำหรับงานจริงที่มี Admin ควรเพิ่ม role-based rules ให้ Admin มีสิทธิ์จัดการสมาชิกและข้อมูลได้มากกว่าสมาชิกทั่วไป

## 5) เปิดเว็บ

แนะนำ:
- เปิดโฟลเดอร์ใน VS Code
- ติดตั้ง Live Server
- คลิกขวา `index.html`
- Open with Live Server

ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อโหลด Firebase SDK และเชื่อม Firestore

## 6) รูปภาพ

เวอร์ชันนี้ **ไม่ใช้ Firebase Storage** เพราะฉะนั้นช่องรูปภาพเป็น:
`ลิงก์รูปภาพ (URL)`

ควรใช้ URL ของรูปที่คุณมีสิทธิ์ใช้งาน และควรใช้ HTTPS เช่น:
```text
https://example.com/plant.jpg
```

## 7) การทดสอบ

1. เปิดเว็บ
2. สมัครสมาชิก
3. ตรวจ `Authentication → Users`
4. ตรวจ `Firestore → users`
5. เพิ่มข้อมูลต้นไม้
6. ตรวจ `Firestore → plants`
7. เปิดคลังข้อมูล จะเห็น:
   - วันที่ลงข้อมูล
   - ผู้ลงข้อมูล
8. Login จากอีกบัญชีหนึ่ง ข้อมูลพืชจะเห็นร่วมกันตาม Firestore Rules
