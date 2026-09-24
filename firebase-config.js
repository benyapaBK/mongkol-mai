// Firebase Web App configuration
// ไปที่ Firebase Console > Project settings > Your apps > Web app
// แล้วนำ const firebaseConfig = { ... } ของโปรเจกต์คุณมาแทนค่าด้านล่าง
//
// หมายเหตุ: Firebase Web config ไม่ใช่รหัสผ่านลับ แต่ Security Rules ของ
// Firestore เป็นสิ่งที่ใช้ป้องกันข้อมูลจริง ดังนั้นอย่าเปิด Rules เป็น public
// เพียงเพื่อให้เว็บทำงาน

const firebaseConfig = {
  apiKey: "AIzaSyBV1OMaZA0LlL6XmSLV0xyNZj3gsQxzuG8",
  authDomain: "mongkolmai-database.firebaseapp.com",
  projectId: "mongkolmai-database",
  storageBucket: "mongkolmai-database.firebasestorage.app",
  messagingSenderId: "268039681865",
  appId: "1:268039681865:web:f078bfa7efd7e809420c98",
  measurementId: "G-1JQGGNWFPS"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
