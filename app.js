const CATEGORIES = [
  {code:"A", name:"ไม้ยืนต้น", icon:"🌳", desc:"ต้นไม้ลำต้นแข็งแรง อายุหลายปี"},
  {code:"B", name:"ไม้พุ่ม", icon:"🌿", desc:"แตกกิ่งเป็นพุ่ม สูงไม่มาก"},
  {code:"C", name:"ไม้ล้มลุก", icon:"🌱", desc:"ลำต้นอ่อน อายุสั้นหรือไม่แข็ง"},
  {code:"D", name:"ไม้เลื้อย", icon:"🍃", desc:"เลื้อยหรือทอดไปตามสิ่งพยุง"},
  {code:"E", name:"ไม้คลุมดิน", icon:"☘️", desc:"เจริญแผ่ปกคลุมพื้นดิน"},
  {code:"F", name:"ต้นปาล์ม", icon:"🌴", desc:"พืชตระกูลปาล์มและลักษณะใกล้เคียง"},
  {code:"G", name:"ไม้อวบน้ำ", icon:"🪴", desc:"สะสมน้ำในใบหรือลำต้น"},
  {code:"H", name:"ไม้ไผ่", icon:"🎋", desc:"พืชกลุ่มไผ่ ลำต้นเป็นปล้อง"}
];

const FIELDS = [
  ["ข้อมูลพื้นฐาน", [
    ["thaiName","ชื่อไทย","text"],["scientificName","ชื่อวิทยาศาสตร์","text"],["englishName","ชื่ออังกฤษ","text"],["localName","ชื่อท้องถิ่น","text"],["family","วงศ์พืช","text"]
  ]],
  ["ลักษณะของพืช", [
    ["growthType","ประเภทการเจริญเติบโต","select"],["general","ลักษณะทั่วไป","textarea"],["height","ความสูง","text"],["leaf","ลักษณะใบ","textarea"],["flower","ลักษณะดอก","textarea"],["fruitSeed","ลักษณะผลและเมล็ด","textarea"],["highlight","จุดเด่น","textarea"]
  ]],
  ["ความเชื่อและความหมายมงคล", [
    ["belief","ความเชื่อ","textarea"],["meaning","ความหมายมงคล","textarea"],["auspicious","ด้านมงคล","textarea"],["beliefOrigin","ที่มาของความเชื่อ","textarea"]
  ]],
  ["การปลูกและการดูแล", [
    ["planting","วิธีปลูก","textarea"],["soil","ดิน","textarea"],["light","แสง","textarea"],["water","น้ำ","textarea"],["humidity","ความชื้น","textarea"],["temperature","อุณหภูมิ","textarea"],["fertilizer","ปุ๋ย","textarea"],["propagation","การขยายพันธุ์","textarea"],["pruning","การตัดแต่ง","textarea"]
  ]],
  ["โรคและศัตรูพืช", [
    ["disease","โรค","textarea"],["pests","ศัตรูพืช","textarea"],["prevention","วิธีป้องกัน","textarea"]
  ]],
  ["ความปลอดภัย", [
    ["humanToxicity","ความเป็นพิษต่อคน","textarea"],["petToxicity","ความเป็นพิษต่อสัตว์เลี้ยง","textarea"],["toxicParts","ส่วนที่เป็นพิษ","textarea"],["symptoms","อาการที่อาจเกิดขึ้น","textarea"],["caution","ข้อควรระวัง","textarea"]
  ]],
  ["ความเหมาะสมในการปลูก", [
    ["home","เหมาะกับบ้าน","choice"],["condo","เหมาะกับคอนโด","choice"],["balcony","เหมาะกับระเบียง","choice"],["garden","เหมาะกับสวน","choice"],["pot","เหมาะกับกระถาง","choice"],["space","ขนาดพื้นที่","select"]
  ]],
  ["ข้อมูลสำหรับระบบแนะนำต้นไม้", [
    ["careLevel","ระดับการดูแล","select"],["lightLevel","ระดับแสง","select"],["waterLevel","ระดับน้ำ","select"],["beginner","เหมาะกับมือใหม่","choice"],["petSafe","เหมาะกับสัตว์เลี้ยง","choice"],["petDetail","สัตว์เลี้ยงที่เหมาะ / ข้อมูลเพิ่มเติม","text"],["busyFriendly","เหมาะกับผู้มีเวลาน้อย","choice"],["limitedSpace","เหมาะกับพื้นที่จำกัด","choice"],["suitableUser","เหมาะกับผู้ใช้ลักษณะใด","textarea"]
  ]],
  ["รูปภาพและแหล่งอ้างอิง", [
    ["image","ลิงก์รูปภาพ (URL)","text"],["imageCredit","เครดิตภาพ","text"],["source","แหล่งอ้างอิง","textarea"]
  ]]
];

let plants = [];
let selectedCategory = null;
let editingId = null;
let libraryCategory = null;
let exportSelected = new Set();
let currentUserProfile = null;
let plantsUnsubscribe = null;
let draftsUnsubscribe = null;
let drafts = [];
let draftId = null;
let draftAutosaveTimer = null;
let draftSaving = false;
let authMode = "login";
let chatUnsubscribe = null;
let notificationUnsubscribe = null;
let taskUnsubscribe = null;
let commentCache = {};
let adminDirectory = [];
let adminDirectoryUnsubscribe = null;
let presenceTimer = null;
let chatContextMenuEl = null;
let supportRequestsUnsubscribe = null;
let activityUnsubscribe = null;

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getSavedTheme(), false);
  initAuthUI();
  auth.onAuthStateChanged(handleAuthState);
});

function initAuthUI(){
  document.getElementById("authForm").addEventListener("submit", handleAuthSubmit);
  document.getElementById("authSwitch").addEventListener("click", toggleAuthMode);
  setAuthMode("login");
  document.querySelectorAll(".nav-btn").forEach(btn => btn.addEventListener("click",()=>showPage(btn.dataset.page)));
}

function setAuthMode(mode){
  authMode=mode;
  const register=mode==="register";
  document.getElementById("authTitle").textContent=register?"สมัครสมาชิก":"เข้าสู่ระบบ";
  document.getElementById("authSubtitle").textContent=register
    ?"สร้างบัญชีสำหรับเข้าใช้งานฐานข้อมูลไม้มงคล"
    :"เข้าสู่ระบบเพื่อจัดการฐานข้อมูลไม้มงคลร่วมกัน";
  document.getElementById("usernameGroup").classList.toggle("hidden",!register);
  document.getElementById("confirmPasswordGroup").classList.toggle("hidden",!register);
  document.getElementById("authSubmit").textContent=register?"สมัครสมาชิก":"เข้าสู่ระบบ";
  document.getElementById("authSwitch").textContent=register?"มีบัญชีแล้ว? เข้าสู่ระบบ":"ยังไม่มีบัญชี? สมัครสมาชิก";
  document.getElementById("authPassword").autocomplete=register?"new-password":"current-password";
  clearAuthError();
}

function toggleAuthMode(){setAuthMode(authMode==="login"?"register":"login");}

function showAuthError(message){
  const box=document.getElementById("authError");
  box.textContent=message;
  box.classList.remove("hidden");
}
function clearAuthError(){
  document.getElementById("authError").textContent="";
  document.getElementById("authError").classList.add("hidden");
}
function friendlyAuthError(err){
  const map={
    "auth/email-already-in-use":"อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว",
    "auth/invalid-email":"รูปแบบอีเมลไม่ถูกต้อง",
    "auth/weak-password":"รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    "auth/user-not-found":"ไม่พบบัญชีผู้ใช้นี้",
    "auth/wrong-password":"อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth/invalid-credential":"อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth/too-many-requests":"ลองเข้าสู่ระบบใหม่ภายหลัง เนื่องจากมีการลองหลายครั้งเกินไป",
    "auth/network-request-failed":"ไม่สามารถเชื่อมต่อ Firebase ได้ กรุณาตรวจสอบอินเทอร์เน็ต"
  };
  return map[err?.code] || err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);

  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    button.textContent = "🙈";
    button.title = "ซ่อนรหัสผ่าน";
  } else {
    input.type = "password";
    button.textContent = "👁";
    button.title = "แสดงรหัสผ่าน";
  }
}

async function handleAuthSubmit(e){
  e.preventDefault();
  clearAuthError();
  const email=document.getElementById("authEmail").value.trim();
  const password=document.getElementById("authPassword").value;
  const username=document.getElementById("authUsername").value.trim();
  const confirm=document.getElementById("authConfirmPassword").value;
  if(!email || !password){showAuthError("กรุณากรอกอีเมลและรหัสผ่าน");return;}
  if(authMode==="register"){
    if(!username){showAuthError("กรุณากรอกชื่อผู้ใช้");return;}
    if(password.length<8){showAuthError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");return;}
    if(password!==confirm){showAuthError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");return;}
  }
  const submit=document.getElementById("authSubmit");
  submit.disabled=true;
  submit.textContent=authMode==="register"?"กำลังสมัครสมาชิก...":"กำลังเข้าสู่ระบบ...";
  try{
    if(authMode==="register"){
      const cred=await auth.createUserWithEmailAndPassword(email,password);
      const profile={
        username,
        displayName:username,
        email,
        role:"member",
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      };
      await db.collection("users").doc(cred.user.uid).set(profile);
    }else{
      await auth.signInWithEmailAndPassword(email,password);
    }
  }catch(err){
    showAuthError(friendlyAuthError(err));
    submit.disabled=false;
    submit.textContent=authMode==="register"?"สมัครสมาชิก":"เข้าสู่ระบบ";
  }
}

async function handleAuthState(user){
  const authScreen=document.getElementById("authScreen");
  const appShell=document.getElementById("appShell");
  if(!user){
    if(plantsUnsubscribe){plantsUnsubscribe();plantsUnsubscribe=null;}
    if(draftsUnsubscribe){draftsUnsubscribe();draftsUnsubscribe=null;}
    if(chatUnsubscribe){chatUnsubscribe();chatUnsubscribe=null;}
    if(notificationUnsubscribe){notificationUnsubscribe();notificationUnsubscribe=null;}
    if(taskUnsubscribe){taskUnsubscribe();taskUnsubscribe=null;}
    if(adminDirectoryUnsubscribe){adminDirectoryUnsubscribe();adminDirectoryUnsubscribe=null;}
    if(supportRequestsUnsubscribe){supportRequestsUnsubscribe();supportRequestsUnsubscribe=null;}
    if(activityUnsubscribe){activityUnsubscribe();activityUnsubscribe=null;}
    if(presenceTimer){clearInterval(presenceTimer);presenceTimer=null;}
    plants=[];
    drafts=[];
    currentUserProfile=null;
    renderDraftBoard();
    authScreen.classList.remove("hidden");
    appShell.classList.add("hidden");
    return;
  }

  try{
    let snap=await db.collection("users").doc(user.uid).get();
    if(!snap.exists){
      await db.collection("users").doc(user.uid).set({
        username:user.email.split("@")[0],
        displayName:user.email.split("@")[0],
        email:user.email,
        role:"member",
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      snap=await db.collection("users").doc(user.uid).get();
    }
    currentUserProfile={uid:user.uid,...snap.data()};
    applyTheme(currentUserProfile.theme || getSavedTheme(), false);
    document.getElementById("currentUsername").textContent=currentUserProfile.displayName||currentUserProfile.username||user.email.split("@")[0];
    document.getElementById("currentEmail").textContent=user.email||"";
    document.getElementById("userAvatarButton").textContent=currentUserProfile.avatarEmoji||"👤";
    document.getElementById("chatComposerAvatar")?.replaceChildren(document.createTextNode(currentUserProfile.avatarEmoji||"👤"));
    authScreen.classList.add("hidden");
    appShell.classList.remove("hidden");
    initApp();
  }catch(err){
    showAuthError("เข้าสู่ระบบสำเร็จ แต่โหลดโปรไฟล์จาก Firestore ไม่ได้: "+friendlyAuthError(err));
  }
}

function initApp(){
  updateRoleBasedUI();
  buildCategoryPicker();
  buildLibraryCategories();
  buildForm();
  buildExportTree();
  updateCount();
  subscribePlants();
  subscribeDrafts();
  subscribeNotifications();
  subscribeTasks();
  subscribeAdminChat();
  subscribeAdminDirectory();
  subscribeActivityLogs();
  if(isAdminUser()) subscribeSupportRequests();
  startPresence();
  renderDraftBoard();
  renderDashboard();
  showPage("home");
}

function subscribePlants(){
  if(plantsUnsubscribe)plantsUnsubscribe();
  plantsUnsubscribe=db.collection("plants").orderBy("createdAt","desc").onSnapshot(
    snapshot=>{
      plants=snapshot.docs.map(doc=>({docId:doc.id,...doc.data()}));
      updateCount();
      buildLibraryCategories();
      buildExportTree();
      renderDashboard();
      if(document.getElementById("page-library")?.classList.contains("active-page"))renderPlantList();
    },
    err=>{
      console.error(err);
      toast("โหลดข้อมูลจาก Firestore ไม่สำเร็จ กรุณาตรวจสอบ Firestore Rules");
    }
  );
}

function subscribeDrafts(){
  if(draftsUnsubscribe)draftsUnsubscribe();
  if(!currentUserProfile?.uid || !isAdminUser())return;
  draftsUnsubscribe=db.collection("drafts")
    .where("userId","==",currentUserProfile.uid)
    .onSnapshot(snapshot=>{
      drafts=snapshot.docs.map(doc=>({docId:doc.id,...doc.data()}))
        .sort((a,b)=>draftDateValue(b.updatedAt)-draftDateValue(a.updatedAt));
      renderDraftBoard();
    },err=>{
      console.error(err);
      toast("โหลดข้อมูลสำรองไม่สำเร็จ กรุณาตรวจสอบ Firestore Rules");
    });
}
function draftDateValue(v){
  if(v && typeof v.toDate==="function")return v.toDate().getTime();
  const t=new Date(v||0).getTime();
  return Number.isNaN(t)?0:t;
}

function getSavedTheme(){
  const saved=localStorage.getItem("mongkolMaiTheme") || "default";
  // Lavender was removed; safely migrate old saved preferences to Default.
  return saved==="lavender" ? "default" : saved;
}
function themeLabel(theme){
  return ({default:"Default",natursun:"NaturSun",midnight:"Midnight"}[theme]||"Default");
}
function applyTheme(theme, persist=true){
  const allowed=["default","natursun","midnight"];
  if(!allowed.includes(theme)) theme="default";
  document.body.dataset.theme=theme;
  if(persist) localStorage.setItem("mongkolMaiTheme",theme);
  const moon=document.getElementById("themeMoonToggle");
  if(moon){
    const icon=moon.querySelector(".theme-icon");
    if(icon) icon.textContent=theme==="midnight"?"☀️":"🌙";
    else moon.textContent=theme==="midnight"?"☀️":"🌙";
    moon.title=theme==="midnight"?"กลับไปธีมก่อนหน้า":"สลับเป็นธีม Midnight";
  }
  document.querySelectorAll(".theme-choice").forEach(btn=>btn.classList.toggle("selected",btn.dataset.theme===theme));
}
async function saveThemePreference(theme){
  applyTheme(theme,true);
  if(auth.currentUser){
    try{await db.collection("users").doc(auth.currentUser.uid).update({theme}); currentUserProfile={...(currentUserProfile||{}),theme};}
    catch(err){console.warn("theme preference save failed",err);}
  }
}
function toggleNightTheme(){
  const current=document.body.dataset.theme||getSavedTheme();
  if(current!=="midnight") window.preMidnightTheme=current;
  saveThemePreference(current==="midnight"?(window.preMidnightTheme||"default"):"midnight");
}

async function logout(){
  try{await auth.signOut();}catch(err){toast("ออกจากระบบไม่สำเร็จ");}
}

function updateCount(){const active=plants.filter(p=>!p.isDeleted).length; const trash=plants.filter(p=>p.isDeleted).length; const el=document.getElementById("recordCount"); if(el)el.textContent = trash?`${active} รายการ • ถังขยะ ${trash}`:`${active} รายการ`;}

function isAdminUser(){
  return currentUserProfile?.role === "admin";
}
function isSupportAdmin(){
  const p=currentUserProfile||{};
  const authEmail=(auth.currentUser?.email||p.email||"").toLowerCase();
  const display=(p.displayName||"").trim().toLowerCase();
  return authEmail==="benyapabaibuaw@gmail.com" && display==="benyapabaibuaw";
}

function updateRoleBasedUI(){
  const admin = isAdminUser();
  const entryNav=document.querySelector('[data-page="entry"]');
  const homeNav=document.querySelector('[data-page="home"]');
  const notificationNav=document.getElementById("notificationNav");
  entryNav?.classList.toggle("hidden", !admin);
  homeNav?.classList.toggle("hidden", !admin);
  document.getElementById("adminChatNav")?.classList.toggle("hidden", !admin);
  notificationNav?.classList.toggle("hidden", !admin);
  document.querySelector('[data-page="export"]')?.classList.remove("hidden");
  document.querySelector('[data-page="library"]')?.classList.remove("hidden");
  document.getElementById("dashboardUserName")?.replaceChildren(document.createTextNode(currentUserProfile?.displayName||currentUserProfile?.username||"ผู้ใช้"));
  document.getElementById("libraryAddButton")?.classList.toggle("hidden", !admin);
  document.getElementById("libraryTrashButton")?.classList.toggle("hidden", !admin);
  document.getElementById("adminBackupCard")?.classList.toggle("hidden", !admin);
  const heroAdd=document.querySelector('#page-home .dashboard-hero .btn.primary');
  heroAdd?.classList.toggle('hidden', !admin);
  if(!admin) showPage("library");
}

function showPage(page){
  if(!isAdminUser() && ["home","entry","chat"].includes(page)){
    if(page!=="library") toast(page==="chat"?"ห้องแชทนี้สำหรับ Admin เท่านั้น":"หน้านี้สำหรับ Admin เท่านั้น");
    page="library";
  }
  const target=document.getElementById(`page-${page}`);
  if(!target)return;
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
  target.classList.add("active-page");
  document.querySelectorAll(".nav-btn[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  if(page==="home")renderDashboard();
  if(page==="library"){ buildLibraryCategories(); initLibrarySearchUI(); renderPlantList(); }
  if(page==="export") buildExportTree();
  if(page==="chat"){ renderChatMessages(); renderAdminDirectory(); }
  window.scrollTo({top:0,behavior:"smooth"});
}

function buildCategoryPicker(){
  const wrap=document.getElementById("categoryPicker");
  wrap.innerHTML=CATEGORIES.map(c=>`
    <button class="category-card" onclick="openCategoryChoice('${c.code}')">
      <span class="code">${c.code}</span><div class="cat-icon">${c.icon}</div>
      <h3>${c.name}</h3><p>${c.desc}</p>
    </button>`).join("");
}

function openCategoryChoice(code){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่สามารถกรอกข้อมูลได้");return;}
  const c=CATEGORIES.find(x=>x.code===code);
  const categoryDrafts=drafts.filter(d=>d.categoryCode===code);
  document.getElementById("modalRoot").innerHTML=`
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal choice-modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <div>
            <span class="eyebrow">${esc(c?.code||"")} • ${esc(c?.name||"")}</span>
            <h2>เลือกการทำงาน</h2>
            <p class="modal-subtitle">ต้องการเริ่มข้อมูลชุดใหม่ หรือกลับมากรอกข้อมูลที่สำรองไว้?</p>
          </div>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="category-choice-grid">
          <button class="category-choice-card" onclick="closeModal();startNew('${escAttr(code)}')">
            <span>＋</span><strong>บันทึกข้อมูลใหม่</strong>
            <small>เปิดแบบฟอร์มเปล่า โดยไม่ลบข้อมูลสำรองเดิม</small>
          </button>
          <button class="category-choice-card ${categoryDrafts.length?'':'disabled'}" ${categoryDrafts.length?`onclick="openDraftList('${escAttr(code)}')"`:"disabled"}>
            <span>↻</span><strong>บันทึกข้อมูลต่อ</strong>
            <small>${categoryDrafts.length?`มีข้อมูลสำรอง ${categoryDrafts.length} รายการให้เลือก`:"ยังไม่มีข้อมูลสำรองในหมวดนี้"}</small>
          </button>
        </div>
      </div>
    </div>`;
}

function openDraftList(categoryCode=""){
  const rows=drafts.filter(d=>!categoryCode || d.categoryCode===categoryCode);
  const title=categoryCode ? `ข้อมูลสำรอง • ${CATEGORIES.find(c=>c.code===categoryCode)?.name||""}` : "ข้อมูลสำรองทั้งหมด";
  document.getElementById("modalRoot").innerHTML=`
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal draft-list-modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <div><span class="eyebrow">SAVED DRAFTS</span><h2>${esc(title)}</h2><p class="modal-subtitle">เลือกข้อมูลที่ต้องการกลับมากรอกต่อ</p></div>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="draft-modal-list">
          ${rows.length ? rows.map(renderDraftCard).join("") : `<div class="empty-library"><div class="export-icon">💾</div><h2>ยังไม่มีข้อมูลสำรอง</h2><p>เริ่มกรอกข้อมูลใหม่แล้วระบบจะสำรองให้อัตโนมัติ</p></div>`}
        </div>
      </div>
    </div>`;
}

function renderDraftCard(d){
  const c=CATEGORIES.find(x=>x.code===d.categoryCode);
  const name=d.draftName||`ร่าง ${c?.name||"ข้อมูล"} ${d.suggestedId||""}`;
  const plantName=d.data?.thaiName||"ยังไม่ได้ระบุชื่อไทย";
  return `<article class="draft-card">
    <div class="draft-card-icon">${c?.icon||"💾"}</div>
    <div class="draft-card-main">
      <strong>${esc(name)}</strong>
      <span>${esc(c?.name||"ไม่ระบุ")} • ${esc(d.suggestedId||"รหัสจะกำหนดเมื่อบันทึก")}</span>
      <span>ชื่อพืช: ${esc(plantName)} • สำรองเมื่อ ${esc(formatDate(d.updatedAt))}</span>
    </div>
    <div class="draft-card-actions">
      <button class="btn primary" onclick="continueDraft('${escAttr(d.docId)}')">กรอกต่อ</button>
      <button class="btn danger" onclick="deleteDraft('${escAttr(d.docId)}',true)">ลบ</button>
    </div>
  </article>`;
}

function renderDraftBoard(){
  const wrap=document.getElementById("draftBoardList");
  const badge=document.getElementById("draftCountBadge");
  if(!wrap)return;
  if(badge)badge.textContent=`${drafts.length} รายการ`;
  if(!drafts.length){
    wrap.innerHTML=`<div class="draft-empty"><span>💾</span><div><strong>ยังไม่มีข้อมูลสำรอง</strong><p>เลือกหมวดหมู่แล้วเริ่มกรอกข้อมูล ระบบจะสำรองข้อมูลให้อัตโนมัติระหว่างกรอก</p></div></div>`;
    return;
  }
  wrap.innerHTML=drafts.slice(0,8).map(renderDraftCard).join("");
}

async function deleteDraft(id,closeAfter=false){
  if(!currentUserProfile?.uid)return;
  const d=drafts.find(x=>x.docId===id);
  if(!d)return;
  if(!confirm(`ลบข้อมูลสำรอง “${d.draftName||d.data?.thaiName||"ไม่มีชื่อ"}” ใช่หรือไม่?`))return;
  try{
    await db.collection("drafts").doc(id).delete();
    toast("ลบข้อมูลสำรองแล้ว");
    if(closeAfter)closeModal();
  }catch(err){console.error(err);toast("ลบข้อมูลสำรองไม่สำเร็จ");}
}

function buildLibraryCategories(){
  const wrap=document.getElementById("libraryCategories");
  wrap.innerHTML=CATEGORIES.map(c=>{
    const count=plants.filter(p=>p.categoryCode===c.code && !p.isDeleted).length;
    return `<button class="category-card" onclick="setLibraryCategoryFilter('${c.code}')">
      <span class="code">${c.code}</span><div class="cat-icon">${c.icon}</div>
      <h3>${c.name}</h3><p>${count} รายการ • ใช้เป็นตัวกรอง</p>
    </button>`;
  }).join("");

  const select=document.getElementById("libraryCategoryFilter");
  if(select){
    const current=select.value;
    select.innerHTML=`<option value="">ทุกประเภท</option>`+CATEGORIES.map(c=>`<option value="${c.code}">${c.icon} ${c.name}</option>`).join("");
    select.value=current;
  }
}

function initLibrarySearchUI(){
  const ids=[
    "librarySearch","libraryCategoryFilter","libraryCareFilter","libraryLightFilter",
    "libraryWaterFilter","librarySpaceFilter","libraryBeginnerFilter","libraryPetFilter",
    "libraryBusyFilter","libraryLimitedFilter","librarySort"
  ];
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el && !el.dataset.bound){
      el.addEventListener(el.tagName==="INPUT"?"input":"change",renderPlantList);
      el.dataset.bound="1";
    }
  });
}

function setLibraryCategoryFilter(code){
  libraryCategory=code || null;
  const select=document.getElementById("libraryCategoryFilter");
  if(select) select.value=code;
  renderPlantList();
  document.getElementById("libraryListWrap")?.scrollIntoView({behavior:"smooth",block:"start"});
}

function clearLibrarySearch(){
  const input=document.getElementById("librarySearch");
  if(input){input.value="";renderPlantList();input.focus();}
}

function resetLibraryFilters(){
  libraryCategory=null;
  ["librarySearch","libraryCategoryFilter","libraryCareFilter","libraryLightFilter","libraryWaterFilter","librarySpaceFilter","libraryBeginnerFilter","libraryPetFilter","libraryBusyFilter","libraryLimitedFilter"].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value="";
  });
  const sort=document.getElementById("librarySort"); if(sort) sort.value="latest";
  renderPlantList();
}

function normalizeSearchValue(value){
  return String(value??"").toLocaleLowerCase("th-TH").normalize("NFC").trim();
}

function plantMatchesSearch(p,q){
  if(!q)return true;
  const searchableKeys=[
    "id","thaiName","scientificName","englishName","localName","family",
    "general","highlight","belief","meaning","auspicious","beliefOrigin",
    "planting","soil","light","water","humidity","temperature","fertilizer",
    "propagation","pruning","disease","pests","prevention","suitableUser","petDetail"
  ];
  return searchableKeys.some(key=>normalizeSearchValue(p[key]).includes(q));
}

function renderPlantList(){
  const q=normalizeSearchValue(document.getElementById("librarySearch")?.value);
  const category=document.getElementById("libraryCategoryFilter")?.value||"";
  const care=document.getElementById("libraryCareFilter")?.value||"";
  const light=document.getElementById("libraryLightFilter")?.value||"";
  const water=document.getElementById("libraryWaterFilter")?.value||"";
  const space=document.getElementById("librarySpaceFilter")?.value||"";
  const beginner=document.getElementById("libraryBeginnerFilter")?.value||"";
  const pet=document.getElementById("libraryPetFilter")?.value||"";
  const busy=document.getElementById("libraryBusyFilter")?.value||"";
  const limited=document.getElementById("libraryLimitedFilter")?.value||"";
  const sort=document.getElementById("librarySort")?.value||"latest";

  let rows=plants.filter(p=>{
    if(p.isDeleted)return false;
    if(category && p.categoryCode!==category)return false;
    if(care && p.careLevel!==care)return false;
    if(light && p.lightLevel!==light)return false;
    if(water && p.waterLevel!==water)return false;
    if(space && p.space!==space)return false;
    if(beginner && p.beginner!==beginner)return false;
    if(pet && p.petSafe!==pet)return false;
    if(busy && p.busyFriendly!==busy)return false;
    if(limited && p.limitedSpace!==limited)return false;
    return plantMatchesSearch(p,q);
  });

  rows.sort((a,b)=>{
    if(sort==="nameAsc")return normalizeSearchValue(a.thaiName).localeCompare(normalizeSearchValue(b.thaiName),"th");
    if(sort==="nameDesc")return normalizeSearchValue(b.thaiName).localeCompare(normalizeSearchValue(a.thaiName),"th");
    if(sort==="idAsc")return String(a.id||"").localeCompare(String(b.id||""),"en",{numeric:true});
    const da=a.createdAt?.toDate?a.createdAt.toDate():new Date(a.createdAt||0);
    const db=b.createdAt?.toDate?b.createdAt.toDate():new Date(b.createdAt||0);
    return db-da;
  });

  const total=plants.filter(p=>!p.isDeleted).length;
  const resultCount=document.getElementById("libraryResultCount");
  if(resultCount)resultCount.textContent=rows.length;
  const meta=document.getElementById("libraryCategoryMeta");
  if(meta)meta.textContent=`พบ ${rows.length} จาก ${total} รายการ`;

  const active=[];
  if(q)active.push(`คำค้นหา “${q}”`);
  if(category){const c=CATEGORIES.find(x=>x.code===category);active.push(c?c.name:category);}
  if(care)active.push(`ดูแล ${care}`);
  if(light)active.push(`แสง ${light}`);
  if(water)active.push(`น้ำ ${water}`);
  if(space)active.push(`พื้นที่ ${space}`);
  if(beginner)active.push(`มือใหม่: ${beginner}`);
  if(pet)active.push(`สัตว์เลี้ยง: ${pet}`);
  if(busy)active.push(`เวลาน้อย: ${busy}`);
  if(limited)active.push(`พื้นที่จำกัด: ${limited}`);
  const activeText=document.getElementById("libraryActiveFilterText");
  if(activeText)activeText.textContent=active.length?`กำลังกรอง: ${active.join(" • ")}`:`แสดงข้อมูลทั้งหมด ${total} รายการ`;

  const wrap=document.getElementById("plantList");
  if(!wrap)return;
  wrap.innerHTML=rows.length?rows.map(p=>{
    const c=CATEGORIES.find(x=>x.code===p.categoryCode);
    const adminActions=isAdminUser()?`<button class="btn ghost" onclick="editPlant('${escAttr(p.id)}')">แก้ไข</button><button class="btn danger" onclick="deletePlant('${escAttr(p.id)}')">ลบ</button>`:"";
    return `<div class="plant-row">
      <div class="plant-id">${esc(p.id)}</div>
      <div>
        <div class="plant-name">${esc(p.thaiName)}</div>
        <div class="plant-scientific">${esc(p.scientificName)}</div>
        <div class="plant-meta-tags"><span>${c?.icon||"🌿"} ${esc(c?.name||"ไม่ระบุ")}</span>${p.careLevel?`<span>ดูแล ${esc(p.careLevel)}</span>`:""}${p.lightLevel?`<span>แสง ${esc(p.lightLevel)}</span>`:""}${p.waterLevel?`<span>น้ำ ${esc(p.waterLevel)}</span>`:""}</div>
        <div class="plant-meta-line">ลงข้อมูล ${formatDate(p.createdAt)} • ผู้ลงข้อมูล <strong>${esc(p.createdByName||p.createdByEmail||"ไม่ระบุ")}</strong></div>
      </div>
      <div class="row-actions"><button class="btn ghost" onclick="viewPlant('${escAttr(p.id)}')">ดูข้อมูล</button>${adminActions}</div>
    </div>`;
  }).join(""):`<div class="empty-library"><div class="export-icon">🔎</div><h2>ไม่พบข้อมูลที่ตรงกับเงื่อนไข</h2><p>ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองแล้วค้นหาใหม่</p><button class="btn ghost" onclick="resetLibraryFilters()">↺ ล้างตัวกรอง</button></div>`;
}

function buildForm(data={}){
  const form=document.getElementById("plantForm");
  form.innerHTML=FIELDS.map(([section, fields])=>`
    <div class="form-section">
      <div class="form-section-title">${section}</div>
      <div class="fields">
        ${fields.map(([key,label,type])=>renderField(key,label,type,data[key] ?? "")).join("")}
      </div>
    </div>`).join("");
}

function bindDraftAutoSave(){
  const form=document.getElementById("plantForm");
  if(!form)return;
  form.querySelectorAll("input, textarea, select").forEach(el=>{
    el.addEventListener(el.type==="radio"||el.tagName==="SELECT"?"change":"input",queueDraftAutosave);
  });
  document.getElementById("draftName")?.addEventListener("input",queueDraftAutosave);
}
function queueDraftAutosave(){
  clearTimeout(draftAutosaveTimer);
  const form=document.getElementById("plantForm");
  if(!form || !selectedCategory)return;
  draftAutosaveTimer=setTimeout(()=>saveDraft(false),1400);
}
function hasMeaningfulFormData(){
  const data=collectForm();
  return Object.values(data).some(v=>String(v||"").trim()!=="");
}
async function saveDraft(manual=false){
  if(!currentUserProfile?.uid || !selectedCategory || !document.getElementById("plantForm"))return false;
  if(!hasMeaningfulFormData()){
    if(manual)toast("ยังไม่มีข้อมูลสำหรับสำรอง");
    return false;
  }
  if(draftSaving)return false;
  const inputName=document.getElementById("draftName")?.value.trim()||"";
  if(manual && !inputName){
    const name=prompt("ตั้งชื่อการสำรองข้อมูล เช่น “มะลิบ้านยาย”");
    if(name===null)return false;
    if(document.getElementById("draftName"))document.getElementById("draftName").value=name.trim();
  }
  const draftName=(document.getElementById("draftName")?.value.trim())||`ร่าง ${selectedCategory.name} ${document.getElementById("nextId")?.value||""}`;
  const record=collectForm();
  const payload={
    userId:currentUserProfile.uid,
    userEmail:currentUserProfile.email||auth.currentUser?.email||"",
    userName:currentUserProfile.displayName||currentUserProfile.username||"",
    draftName,
    categoryCode:selectedCategory.code,
    categoryName:selectedCategory.name,
    suggestedId:document.getElementById("nextId")?.value||"",
    editingId:editingId||"",
    data:record,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  draftSaving=true;
  const status=document.getElementById("draftSaveStatus");
  if(status)status.textContent="กำลังสำรอง...";
  try{
    if(draftId){
      await db.collection("drafts").doc(draftId).set(payload,{merge:true});
    }else{
      const ref=db.collection("drafts").doc();
      draftId=ref.id;
      await ref.set({...payload,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    }
    if(status)status.textContent=`สำรองล่าสุด ${new Date().toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})}`;
    if(manual)toast("สำรองข้อมูลเรียบร้อยแล้ว");
    return true;
  }catch(err){
    console.error(err);
    if(status)status.textContent="สำรองไม่สำเร็จ";
    if(manual)toast("สำรองข้อมูลไม่สำเร็จ: กรุณาตรวจสอบอินเทอร์เน็ต");
    return false;
  }finally{draftSaving=false;}
}
async function manualSaveDraft(){ await saveDraft(true); }
async function continueDraft(id){
  const d=drafts.find(x=>x.docId===id);
  if(!d)return;
  closeModal();
  selectedCategory=CATEGORIES.find(c=>c.code===d.categoryCode);
  if(!selectedCategory)return;
  draftId=id;
  editingId=d.editingId||null;
  document.getElementById("categoryPicker").classList.add("hidden");
  document.getElementById("formWrap").classList.remove("hidden");
  document.getElementById("formTitle").textContent=editingId?`แก้ไขข้อมูล ${editingId}`:"กรอกข้อมูลพันธุ์ไม้ต่อ";
  document.getElementById("selectedCategoryName").textContent=selectedCategory.name;
  document.getElementById("draftName").value=d.draftName||"";
  document.getElementById("draftSaveStatus").textContent=`สำรองล่าสุด ${formatDate(d.updatedAt)}`;
  buildForm({...d.data,growthType:d.data?.growthType||selectedCategory.name});
  bindDraftAutoSave();
  try{
    const idNext=await peekNextId(selectedCategory.code);
    if(!editingId)document.getElementById("nextId").value=idNext;
    else document.getElementById("nextId").value=editingId;
    setIdInputState(!!editingId);
  }catch(err){}
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderField(key,label,type,value){
  const req="";
  if(type==="textarea") return `<div class="field full"><label>${label}${req}</label><textarea id="f-${key}" required>${esc(value)}</textarea></div>`;
  if(type==="select"){
    let opts=[];
    if(key==="growthType") opts=CATEGORIES.map(c=>c.name);
    if(key==="space") opts=["เล็ก","เล็ก–กลาง","ปานกลาง","ปานกลาง–ใหญ่","ใหญ่"];
    if(key==="careLevel") opts=["ง่าย","ปานกลาง","ยาก"];
    if(key==="lightLevel") opts=["น้อย","ปานกลาง","มาก"];
    if(key==="waterLevel") opts=["น้อย","ปานกลาง","มาก"];
    return `<div class="field"><label>${label}${req}</label><select id="f-${key}" required><option value="">เลือก...</option>${opts.map(o=>`<option ${o===value?"selected":""}>${o}</option>`).join("")}</select></div>`;
  }
  if(type==="choice"){
    return `<div class="field"><label>${label}${req}</label><div class="choice-row">
      ${["ใช่","ไม่ใช่"].map(o=>`<label class="choice"><input type="radio" name="${key}" value="${o}" ${value===o?"checked":""} required><span>${o}</span></label>`).join("")}
    </div></div>`;
  }
  return `<div class="field"><label>${label}${req}</label><input id="f-${key}" value="${esc(value)}" required></div>`;
}


function collectForm(){
  const record = {};

  FIELDS.forEach(([section, fields]) => {
    fields.forEach(([key, label, type]) => {
      if(type === "choice"){
        const checked = document.querySelector(`input[name="${key}"]:checked`);
        record[key] = checked ? checked.value : "";
      }else{
        const el = document.getElementById(`f-${key}`);
        record[key] = el ? String(el.value ?? "").trim() : "";
      }
    });
  });

  return record;
}

async function startNew(code){
  selectedCategory=CATEGORIES.find(c=>c.code===code);
  editingId=null;
  draftId=null;
  document.getElementById("formWrap").classList.remove("hidden");
  document.getElementById("categoryPicker").classList.add("hidden");
  document.getElementById("formTitle").textContent="กรอกข้อมูลพันธุ์ไม้";
  document.getElementById("selectedCategoryName").textContent=selectedCategory.name;
  document.getElementById("nextId").value="กำลังตรวจสอบ...";
  setIdInputState(false);
  const draftName=document.getElementById("draftName");
  if(draftName)draftName.value="";
  const status=document.getElementById("draftSaveStatus");
  if(status)status.textContent="ยังไม่มีการสำรอง";
  buildForm({growthType:selectedCategory.name});
  try{
    const id=await peekNextId(code);
    if(!editingId && selectedCategory?.code===code) document.getElementById("nextId").value=id;
  }catch(err){
    console.error(err);
    document.getElementById("nextId").value="";
    toast("ยังตรวจสอบ ID ไม่ได้ กรุณาตรวจสอบ Firestore Rules");
  }
  bindDraftAutoSave();
  window.scrollTo({top:0,behavior:"smooth"});
}


function getFormPlantId(){
  return String(document.getElementById("nextId")?.value||"").trim().toUpperCase();
}

function validateCustomPlantId(id, code){
  const normalized=String(id||"").trim().toUpperCase();
  const pattern=new RegExp(`^${code}\\d{2,}$`);
  if(!pattern.test(normalized)){
    return {ok:false,message:`รหัสต้องขึ้นต้นด้วย ${code} และตามด้วยตัวเลขอย่างน้อย 2 หลัก เช่น ${code}01`};
  }
  return {ok:true,id:normalized,number:Number(normalized.slice(1))};
}

function setIdInputState(editing=false){
  const el=document.getElementById("nextId");
  const hint=document.getElementById("idEditHint");
  if(!el)return;
  el.readOnly=editing;
  el.classList.toggle("readonly-id",editing);
  if(hint)hint.textContent=editing
    ?"รหัสเดิมของข้อมูลนี้ไม่ควรเปลี่ยน เพราะใช้เป็นรหัสอ้างอิงของรายการในคลังข้อมูล"
    :"ระบบรันรหัสให้อัตโนมัติ คุณสามารถแก้รหัสได้ โดยต้องใช้ตัวอักษรหมวดเดียวกัน เช่น A01";
}

function findDuplicatePlant(record, ignoreId=""){
  const thai=normalizeSearchValue(record.thaiName);
  const scientific=normalizeSearchValue(record.scientificName);
  if(!thai && !scientific)return [];
  return plants.filter(p=>p.id!==ignoreId && (
    (thai && normalizeSearchValue(p.thaiName)===thai) ||
    (scientific && normalizeSearchValue(p.scientificName)===scientific)
  ));
}

async function peekNextId(code){
  const snap=await db.collection("counters").doc(code).get();
  const n=(snap.exists?(snap.data().last||0):0)+1;
  return `${code}${String(n).padStart(2,"0")}`;
}

async function initializeCounterIfNeeded(code){
  const ref=db.collection("counters").doc(code);
  const snap=await ref.get();
  const data=snap.exists?snap.data():{};
  if(Number.isFinite(Number(data.count)) && Number.isFinite(Number(data.last))) return data;

  // รองรับฐานข้อมูลเก่าที่มีเพียง last หรือยังไม่มี count
  const plantSnap=await db.collection("plants").where("categoryCode","==",code).get();
  let count=0, last=Number(data.last||0);
  plantSnap.forEach(d=>{
    const p=d.data()||{};
    if(!p.isDeleted) count++;
    const n=Number(String(p.id||"").replace(/^[A-H]/i,""));
    if(Number.isFinite(n)) last=Math.max(last,n);
  });
  await ref.set({categoryCode:code,count,last,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  return {count,last};
}

async function adjustCounterInTransaction(tx,code,delta){
  const ref=db.collection("counters").doc(code);
  const snap=await tx.get(ref);
  const data=snap.exists?snap.data():{};
  const current=Number(data.count||0);
  const next=Math.max(0,current+delta);
  tx.set(ref,{categoryCode:code,count:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  return next;
}

async function syncAllCounters(showToast=true){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่ตรวจสอบ Counters ได้");return;}
  try{
    const snap=await db.collection("plants").get();
    const stats={};
    CATEGORIES.forEach(c=>stats[c.code]={count:0,last:0});
    snap.forEach(d=>{
      const p=d.data()||{};
      const code=p.categoryCode;
      if(!stats[code])return;
      if(!p.isDeleted)stats[code].count++;
      const n=Number(String(p.id||"").replace(/^[A-H]/i,""));
      if(Number.isFinite(n))stats[code].last=Math.max(stats[code].last,n);
    });
    const batch=db.batch();
    CATEGORIES.forEach(c=>{
      const ref=db.collection("counters").doc(c.code);
      batch.set(ref,{categoryCode:c.code,count:stats[c.code].count,last:stats[c.code].last,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    });
    await batch.commit();
    if(showToast)toast("ตรวจสอบและปรับ Counters ครบทั้ง 8 หมวดแล้ว");
    return stats;
  }catch(err){
    console.error(err);
    toast("ปรับ Counters ไม่สำเร็จ: "+(err.code==="permission-denied"?"Firestore Rules ยังไม่อนุญาต":"กรุณาลองใหม่"));
  }
}

async function nextId(code){
  const ref=db.collection("counters").doc(code);
  return db.runTransaction(async tx=>{
    const snap=await tx.get(ref);
    const n=(snap.exists?(snap.data().last||0):0)+1;
    tx.set(ref,{last:n},{merge:true});
    return `${code}${String(n).padStart(2,"0")}`;
  });
}

function backToCategories(){
  document.getElementById("formWrap").classList.add("hidden");
  document.getElementById("categoryPicker").classList.remove("hidden");
  selectedCategory=null; editingId=null;
  window.scrollTo({top:0,behavior:"smooth"});
}

async function savePlant(){
  if(!currentUserProfile){toast("กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล");return;}
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่สามารถเพิ่มหรือแก้ไขข้อมูลได้");return;}
  if(!selectedCategory){toast("กรุณาเลือกหมวดหมู่ก่อน");return;}

  const form=document.getElementById("plantForm");
  const missing=[];
  let first=null;
  FIELDS.forEach(([section,fields])=>fields.forEach(([key,label,type])=>{
    if(type==="choice"){
      const checked=form.querySelector(`input[name="${key}"]:checked`);
      if(!checked){missing.push({label,el:form.querySelector(`input[name="${key}"]`)});first=first||form.querySelector(`input[name="${key}"]`);}
    }else{
      const el=document.getElementById(`f-${key}`);
      if(!el || !String(el.value||"").trim()){missing.push({label,el});first=first||el;}
    }
  }));

  showSaveConfirm(missing);
}

function showSaveConfirm(missing){
  const list=missing.length
    ? `<div class="missing-warning"><strong>ยังมีข้อมูลที่ไม่ได้กรอก ${missing.length} ส่วน</strong><div>${missing.map(x=>`<span>• ${esc(x.label)}</span>`).join("")}</div><p>คุณยังสามารถบันทึกเข้าสู่ระบบได้ หากข้อมูลบางส่วนยังไม่พร้อม</p></div>`
    : `<div class="save-ready"><span>✓</span><div><strong>ข้อมูลพร้อมสำหรับการบันทึก</strong><p>ระบบจะบันทึกข้อมูลเข้าสู่ Cloud Firestore และแสดงในคลังข้อมูล</p></div></div>`;
  document.getElementById("modalRoot").innerHTML=`
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal save-confirm-modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <div><span class="eyebrow">CONFIRM SAVE</span><h2>ยืนยันการบันทึกข้อมูล</h2><p class="modal-subtitle">กรุณาตรวจสอบอีกครั้งก่อนนำข้อมูลขึ้นระบบ</p></div>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        ${list}
        <div class="form-actions">
          <button class="btn ghost" onclick="focusFirstMissing();closeModal()">← กลับไปกรอกต่อ</button>
          <button class="btn primary" onclick="closeModal();commitPlantToFirestore()">✓ ยืนยันบันทึกเข้าสู่ระบบ</button>
        </div>
      </div>
    </div>`;
}

function focusFirstMissing(){
  const form=document.getElementById("plantForm");
  if(!form)return;
  let target=null;
  FIELDS.some(([section,fields])=>fields.some(([key,label,type])=>{
    if(type==="choice"){
      if(!form.querySelector(`input[name="${key}"]:checked`)){target=form.querySelector(`input[name="${key}"]`);return true;}
    }else{
      const el=document.getElementById(`f-${key}`);
      if(!el || !String(el.value||"").trim()){target=el;return true;}
    }
    return false;
  }));
  if(target){
    target.scrollIntoView({behavior:"smooth",block:"center"});
    setTimeout(()=>{try{target.focus({preventScroll:true});}catch(e){}},350);
  }
}

function showSaveProgress(){
  document.getElementById("modalRoot").innerHTML=`
    <div class="modal-backdrop progress-backdrop">
      <div class="modal save-progress-modal">
        <div class="progress-icon">☁️</div>
        <span class="eyebrow">SAVING TO FIRESTORE</span>
        <h2>กำลังบันทึกข้อมูลเข้าสู่ระบบ</h2>
        <p id="saveProgressText">กำลังเตรียมข้อมูล...</p>
        <div class="progress-track"><div id="saveProgressBar" class="progress-bar" style="width:8%"></div></div>
        <strong id="saveProgressPercent">8%</strong>
        <p class="progress-note">กรุณาอย่าปิดหรือรีเฟรชหน้านี้จนกว่าการบันทึกจะเสร็จสิ้น</p>
      </div>
    </div>`;
}
function setSaveProgress(percent,text){
  const bar=document.getElementById("saveProgressBar");
  const pct=document.getElementById("saveProgressPercent");
  const label=document.getElementById("saveProgressText");
  if(bar)bar.style.width=`${percent}%`;
  if(pct)pct.textContent=`${percent}%`;
  if(label)label.textContent=text;
}

async function commitPlantToFirestore(){
  showSaveProgress();
  const record=collectForm();
  try{
    setSaveProgress(20,"กำลังตรวจสอบข้อมูลและสิทธิ์...");
    await new Promise(r=>setTimeout(r,180));

    if(editingId){
      const existing=plants.find(p=>p.id===editingId);
      if(!existing)throw new Error("ไม่พบข้อมูลที่ต้องการแก้ไข");
      record.id=editingId;
      record.categoryCode=existing.categoryCode;
      record.createdAt=existing.createdAt;
      record.createdBy=existing.createdBy;
      record.createdByEmail=existing.createdByEmail;
      record.createdByName=existing.createdByName;
      record.updatedAt=firebase.firestore.FieldValue.serverTimestamp();
      record.updatedBy=currentUserProfile.uid;
      record.updatedByEmail=currentUserProfile.email||auth.currentUser?.email||"";
      record.updatedByName=currentUserProfile.displayName||currentUserProfile.username||auth.currentUser?.email||"";
      setSaveProgress(40,"กำลังบันทึก Version และการแก้ไขแบบปลอดภัย...");
      const plantRef=db.collection("plants").doc(existing.docId||existing.id);
      const versionRef=db.collection("plantVersions").doc();
      const logRef=db.collection("activityLogs").doc();
      const versionSnapshot={...existing};
      delete versionSnapshot.docId;
      const now=firebase.firestore.FieldValue.serverTimestamp();
      const batch=db.batch();
      batch.set(versionRef,{
        plantId:existing.id,
        plantName:existing.thaiName||"",
        categoryCode:existing.categoryCode||"",
        action:"update",
        snapshot:versionSnapshot,
        changedBy:currentUserProfile.uid,
        changedByEmail:currentUserProfile.email||auth.currentUser?.email||"",
        changedByName:currentUserProfile.displayName||currentUserProfile.username||auth.currentUser?.email||"",
        createdAt:now
      });
      batch.set(plantRef,record,{merge:true});
      batch.set(logRef,{
        action:"update",plantId:record.id||"",plantName:record.thaiName||"",
        userId:currentUserProfile.uid,
        userEmail:currentUserProfile.email||auth.currentUser?.email||"",
        userName:currentUserProfile.displayName||currentUserProfile.username||"",
        createdAt:now
      });
      await batch.commit();
      setSaveProgress(78,"บันทึกข้อมูลและประวัติเรียบร้อย...");
      if(draftId)await db.collection("drafts").doc(draftId).delete();
      setSaveProgress(100,"บันทึกข้อมูลเรียบร้อยแล้ว");
      await new Promise(r=>setTimeout(r,500));
      document.getElementById("modalRoot").innerHTML="";
      await notifyAllAdmins("มีการแก้ไขข้อมูลพืช",`${currentUserProfile.displayName||"Admin"} แก้ไข ${record.id} • ${record.thaiName||""}`,{plantId:record.id,type:"plant_update",icon:"✏️"});
      toast(`แก้ไข ${editingId} เรียบร้อยแล้ว`);
      showPage("library");
      return;
    }

    const code=selectedCategory.code;
    const requestedId=getFormPlantId();

    // ตรวจรหัสที่ผู้ใช้กำหนดเอง: ต้องขึ้นต้นด้วยรหัสหมวดเดียวกัน
    const idCheck=validateCustomPlantId(requestedId,code);
    if(!idCheck.ok){
      document.getElementById("modalRoot").innerHTML="";
      toast(idCheck.message);
      const idEl=document.getElementById("nextId");
      if(idEl){idEl.focus();idEl.select();}
      return;
    }

    // เตือนข้อมูลซ้ำก่อนเขียนจริง แต่ยังให้ผู้ใช้ตัดสินใจได้
    const duplicates=findDuplicatePlant(record);
    if(duplicates.length){
      document.getElementById("modalRoot").innerHTML="";
      const names=duplicates.slice(0,3).map(p=>`${p.id} • ${p.thaiName||p.scientificName||"ไม่ระบุ"}`).join("\n");
      const proceed=confirm(`พบข้อมูลที่อาจซ้ำกับรายการเดิม:\n${names}\n\nหากยังต้องการบันทึก ${idCheck.id} ให้กดตกลง`);
      if(!proceed)return;
      showSaveProgress();
    }

    const counterRef=db.collection("counters").doc(code);
    let createdId=idCheck.id;
    setSaveProgress(35,`กำลังตรวจสอบรหัส ${createdId} และจำนวนในหมวด...`);
    await initializeCounterIfNeeded(code);
    await db.runTransaction(async tx=>{
      const counterSnap=await tx.get(counterRef);
      const counterData=counterSnap.exists?counterSnap.data():{};
      const last=Number(counterData.last||0);
      const count=Number(counterData.count||0);

      // ถ้าผู้ใช้เลือก ID เอง ให้รหัสถัดไปอัตโนมัติเดินต่อจากเลขที่สูงสุด
      const nextCounter=Math.max(last,idCheck.number);

      const plantRef=db.collection("plants").doc(createdId);
      const plantSnap=await tx.get(plantRef);
      if(plantSnap.exists)throw new Error(`รหัส ${createdId} มีอยู่แล้ว กรุณาเลือกรหัสอื่น`);

      const timestamp=firebase.firestore.Timestamp.now();
      record.id=createdId;
      record.categoryCode=code;
      record.createdAt=timestamp;
      record.updatedAt=timestamp;
      record.createdBy=currentUserProfile.uid;
      record.createdByEmail=currentUserProfile.email||auth.currentUser?.email||"";
      record.createdByName=currentUserProfile.displayName||currentUserProfile.username||auth.currentUser?.email||"";
      record.updatedBy=currentUserProfile.uid;
      record.updatedByEmail=record.createdByEmail;
      record.updatedByName=record.createdByName;
      record.isDeleted=false;

      tx.set(counterRef,{last:nextCounter,count:count+1,categoryCode:code,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      tx.set(plantRef,record);
    });

    setSaveProgress(72,`กำลังบันทึก ${createdId} และสร้าง Version แรก...`);
    await savePlantVersion(record,"create");
    await logActivity("create",record);
    await notifyAllAdmins("มีการเพิ่มข้อมูลพืชใหม่",`${currentUserProfile.displayName||"Admin"} เพิ่ม ${record.id} • ${record.thaiName||""}`,{plantId:record.id,type:"plant_create",icon:"🌱"});
    setSaveProgress(90,"กำลังอัปเดตคลังข้อมูล...");
    if(draftId)await db.collection("drafts").doc(draftId).delete();
    setSaveProgress(100,`บันทึก ${createdId} เรียบร้อยแล้ว`);
    await new Promise(r=>setTimeout(r,600));
    document.getElementById("modalRoot").innerHTML="";
    toast(`บันทึก ${createdId} เรียบร้อยแล้ว`);
    showPage("library");
  }catch(err){
    console.error(err);
    document.getElementById("modalRoot").innerHTML="";
    let message="กรุณาตรวจสอบการเชื่อมต่อ";
    if(err.code==="permission-denied")message="Firestore ปฏิเสธการเขียนข้อมูล — ตรวจสอบว่า users/<UID> ของคุณมี role = admin และได้ Deploy firestore.rules เวอร์ชันล่าสุดแล้ว";
    else if(err.code==="failed-precondition")message="Firestore ต้องตรวจสอบ Index หรือการตั้งค่าฐานข้อมูล";
    else if(err.message)message=err.message;
    toast("บันทึกข้อมูลไม่สำเร็จ: "+message);
  }
}


function viewPlant(id){
  const p=plants.find(x=>x.id===id);
  if(!p)return;
  const category=CATEGORIES.find(c=>c.code===p.categoryCode);
  const sections=FIELDS.map(([section,fields])=>{
    const items=fields.map(([key,label])=>({key,label,value:p[key]})).filter(x=>String(x.value??"").trim()!=="");
    if(!items.length)return "";
    return `<section class="detail-section">
      <h3>${esc(section)}</h3>
      <div class="detail-grid">
        ${items.map(item=>`<div class="detail-item ${String(formatDetailValue(item.value)).length>140?"full":""}"><b>${esc(item.label)}</b><span>${esc(formatDetailValue(item.value))}</span></div>`).join("")}
      </div>
    </section>`;
  }).join("");
  document.getElementById("modalRoot").innerHTML=`<div class="modal-backdrop" onclick="closeModal(event)">
    <div class="modal detail-modal" onclick="event.stopPropagation()">
      <div class="modal-head">
        <div>
          <span class="eyebrow">${esc(p.id)} • ${esc(category?.name||"")}</span>
          <h2>${esc(p.thaiName||"ไม่ระบุชื่อไทย")}</h2>
          <em>${esc(p.scientificName||"")}</em>
        </div>
        <button class="icon-btn" onclick="closeModal()">×</button>
      </div>
      <div class="detail-summary">
        <span>${category?.icon||"🌿"} ${esc(category?.name||"ไม่ระบุหมวด")}</span>
        <span>ลงข้อมูล ${esc(formatDate(p.createdAt))}</span>
        <span>โดย ${esc(p.createdByName||p.createdByEmail||"ไม่ระบุ")}</span>
      </div>
      ${p.image?`<div class="detail-image"><img src="${safeUrl(p.image)}" alt="${esc(p.thaiName||"รูปพันธุ์ไม้")}" onerror="this.style.display='none'"><a href="${safeUrl(p.image)}" target="_blank" rel="noopener">เปิดลิงก์รูปภาพ</a></div>`:""}
      ${sections}
      <section class="detail-section">
        <h3>ประวัติข้อมูล</h3>
        <div class="detail-grid">
          <div class="detail-item"><b>ผู้ลงข้อมูล</b><span>${esc(p.createdByName||p.createdByEmail||"ไม่ระบุ")}</span></div>
          <div class="detail-item"><b>วันที่ลงข้อมูล</b><span>${esc(formatDate(p.createdAt))}</span></div>
          <div class="detail-item"><b>ผู้แก้ไขล่าสุด</b><span>${esc(p.updatedByName||p.updatedByEmail||"ยังไม่มี")}</span></div>
          <div class="detail-item"><b>แก้ไขล่าสุด</b><span>${esc(formatDate(p.updatedAt))}</span></div>
        </div>
      </section>
      ${isAdminUser()?`<section class="detail-section comment-section">
        <div class="comment-head"><div><h3>💬 ความคิดเห็นและจุดที่ต้องแก้ไข</h3><p>ใช้บอกเจ้าของข้อมูลหรือ Admin คนอื่นว่าควรแก้ตรงไหนต่อ</p></div><button class="btn ghost" onclick="openTaskComposer('${escAttr(p.id)}')">📌 ปักหมุดให้แก้ไข</button></div>
        <div id="plantComments_${escAttr(p.id)}" class="plant-comments"><div class="empty-state">กำลังโหลดความคิดเห็น...</div></div>
        <form class="comment-form" onsubmit="addPlantComment(event,'${escAttr(p.id)}')"><input id="commentInput_${escAttr(p.id)}" maxlength="1000" placeholder="เขียนความคิดเห็นถึงเจ้าของข้อมูลหรือทีม Admin..." required><button class="btn primary" type="submit">ส่งความคิดเห็น</button></form>
      </section>`:''}
      <div class="form-actions">
        <button class="btn ghost" onclick="closeModal()">ปิด</button>
        ${isAdminUser()?`<button class="btn ghost" onclick="showActivityHistory('${escAttr(p.id)}')">ประวัติการแก้ไข</button><button class="btn ghost" onclick="showVersionHistory('${escAttr(p.id)}')">Version History</button><button class="btn primary" onclick="closeModal();editPlant('${escAttr(p.id)}')">แก้ไขข้อมูล</button>`:""}
      </div>
    </div>
  </div>`;
  loadPlantComments(p.id);
}

function closeModal(e){if(e && e.target!==e.currentTarget)return;document.getElementById("modalRoot").innerHTML="";}

document.addEventListener("keydown", (e)=>{
  if(e.key!=="Escape")return;
  const helpRoot=document.getElementById("helpRoot");
  const modalRoot=document.getElementById("modalRoot");
  if(modalRoot?.innerHTML.trim()){closeModal();return;}
  if(helpRoot?.innerHTML.trim()){closeHelp();}
});
function editPlant(id){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่สามารถแก้ไขข้อมูลได้");return;}
  const p=plants.find(x=>x.id===id);if(!p)return;
  selectedCategory=CATEGORIES.find(c=>c.code===p.categoryCode);editingId=id;
  showPage("entry");document.getElementById("categoryPicker").classList.add("hidden");document.getElementById("formWrap").classList.remove("hidden");
  document.getElementById("formTitle").textContent=`แก้ไขข้อมูล ${p.id}`;document.getElementById("selectedCategoryName").textContent=selectedCategory.name;document.getElementById("nextId").value=p.id;
  setIdInputState(true);
  buildForm(p);
}
async function deletePlant(id){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่สามารถลบข้อมูลได้");return;}
  const p=plants.find(x=>x.id===id); if(!p)return;

  const ownerId=p.createdBy||"";
  const ownerEmail=p.createdByEmail||"";
  const ownerName=p.createdByName||ownerEmail||"ไม่ระบุ";
  const isOwnData=ownerId && ownerId===currentUserProfile?.uid;

  // ข้อมูลของตัวเอง: ยืนยัน 2 ชั้น แล้วทำ Soft Delete เข้าถังขยะ
  if(isOwnData){
    if(!confirm(`ต้องการย้ายข้อมูล “${p.thaiName||"ไม่ระบุชื่อ"}” (${id}) ไปถังขยะใช่หรือไม่?`))return;
    if(!confirm(`ยืนยันอีกครั้ง: ย้าย ${id} ไปถังขยะ? ข้อมูลยังสามารถกู้คืนได้`))return;
    try{
      await initializeCounterIfNeeded(p.categoryCode);
      const plantRef=db.collection("plants").doc(p.docId||p.id);
      const counterRef=db.collection("counters").doc(p.categoryCode);
      const logRef=db.collection("activityLogs").doc();
      await db.runTransaction(async tx=>{
        const plantSnap=await tx.get(plantRef);
        if(!plantSnap.exists)throw new Error("ไม่พบข้อมูลพืชใน Firestore");
        const current=plantSnap.data()||{};
        if(current.isDeleted)throw new Error("ข้อมูลนี้อยู่ในถังขยะแล้ว");
        const counterSnap=await tx.get(counterRef);
        const count=Math.max(0,Number(counterSnap.exists?counterSnap.data().count||0:0)-1);
        const now=firebase.firestore.FieldValue.serverTimestamp();
        tx.update(plantRef,{
          isDeleted:true,
          deletedAt:now,
          deletedBy:currentUserProfile.uid,
          deletedByEmail:currentUserProfile.email||auth.currentUser?.email||"",
          deletedByName:currentUserProfile.displayName||currentUserProfile.username||auth.currentUser?.email||"",
          updatedAt:now,updatedBy:currentUserProfile.uid,
          updatedByEmail:currentUserProfile.email||"",
          updatedByName:currentUserProfile.displayName||currentUserProfile.username||""
        });
        tx.set(counterRef,{categoryCode:p.categoryCode,count,updatedAt:now},{merge:true});
        tx.set(logRef,{action:"delete",plantId:p.id||"",plantName:p.thaiName||"",userId:currentUserProfile.uid,userEmail:currentUserProfile.email||auth.currentUser?.email||"",userName:currentUserProfile.displayName||currentUserProfile.username||"",createdAt:now});
      });
      toast("ย้ายข้อมูลเข้าถังขยะแล้ว และลดจำนวนใน Counters 1 รายการ");
    }catch(err){
      console.error(err);
      toast("ย้ายข้อมูลเข้าถังขยะไม่สำเร็จ: "+(err.code==="permission-denied"?"ไม่มีสิทธิ์แก้ไขข้อมูล":"กรุณาลองใหม่"));
    }
    return;
  }

  // ข้อมูลของผู้อื่น: ไม่ลบทันที แต่สร้างคำขอและเปิดอีเมลถึงเจ้าของ
  if(!ownerEmail){
    toast("ข้อมูลรายการนี้ไม่มีอีเมลเจ้าของ จึงไม่สามารถส่งคำขอลบได้");
    return;
  }

  const subject=`คำขอลบข้อมูลต้นไม้ ${id} • ${p.thaiName||"ไม่ระบุชื่อ"}`;
  const body=[
    `เรียน ${ownerName}`,
    ``,
    `มีคำขอให้พิจารณาลบข้อมูลต้นไม้จากระบบ “ไม้มงคล”`,
    `รหัสต้นไม้: ${id}`,
    `ชื่อไทย: ${p.thaiName||"ไม่ระบุ"}`,
    `ผู้ขอลบ: ${currentUserProfile?.displayName||currentUserProfile?.username||auth.currentUser?.email||"ไม่ระบุ"}`,
    `อีเมลผู้ขอ: ${currentUserProfile?.email||auth.currentUser?.email||"ไม่ระบุ"}`,
    ``,
    `โปรดตรวจสอบข้อมูลและติดต่อผู้ดูแลระบบก่อนดำเนินการลบ`,
    ``,
    `อีเมลฉบับนี้ถูกเตรียมจากระบบ และผู้ขอต้องกดส่งด้วยตนเอง`
  ].join("\n");

  const confirmed=confirm(
    `ข้อมูลนี้เป็นของผู้ใช้คนอื่น\n\n`+
    `เจ้าของ: ${ownerName}\n`+
    `อีเมล: ${ownerEmail}\n`+
    `รายการ: ${id} • ${p.thaiName||"ไม่ระบุชื่อ"}\n\n`+
    `ระบบจะยังไม่ลบข้อมูลทันที แต่จะบันทึกคำขอลบและเปิดโปรแกรมอีเมลเพื่อส่งคำขอให้เจ้าของข้อมูล\n\n`+
    `ยืนยันส่งคำขอลบหรือไม่?`
  );
  if(!confirmed)return;

  try{
    await db.collection("deletionRequests").add({
      plantId:id,
      plantName:p.thaiName||"",
      plantOwnerId:ownerId,
      plantOwnerEmail:ownerEmail,
      plantOwnerName:ownerName,
      requestedBy:currentUserProfile.uid,
      requestedByEmail:currentUserProfile.email||auth.currentUser?.email||"",
      requestedByName:currentUserProfile.displayName||currentUserProfile.username||"",
      status:"pending_owner_review",
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    await logActivity("delete_request",p);

    const mailto=`mailto:${encodeURIComponent(ownerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href=mailto;
    toast("คำขอลบถูกบันทึกแล้ว กรุณากดส่งอีเมลจากโปรแกรมอีเมลของคุณ");
  }catch(err){
    console.error(err);
    toast("สร้างคำขอลบไม่สำเร็จ: "+(err.code==="permission-denied"?"Firestore Rules ยังไม่อนุญาต deletionRequests":"กรุณาลองใหม่"));
  }
}


async function savePlantVersion(plant, action="update"){
  if(!plant?.id || !currentUserProfile)return;
  const snapshot={...plant};
  delete snapshot.docId;
  await db.collection("plantVersions").add({
    plantId: plant.id,
    plantName: plant.thaiName||"",
    categoryCode: plant.categoryCode||"",
    action,
    snapshot,
    changedBy: currentUserProfile.uid,
    changedByEmail: currentUserProfile.email||auth.currentUser?.email||"",
    changedByName: currentUserProfile.displayName||currentUserProfile.username||auth.currentUser?.email||"",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function showActivityHistory(id){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่ดูประวัติการแก้ไขได้");return;}
  try{
    const snap=await db.collection("activityLogs").where("plantId","==",id).get();
    const rows=snap.docs.map(d=>d.data()).sort((a,b)=>dateValue(b.createdAt)-dateValue(a.createdAt));
    const p=plants.find(x=>x.id===id);
    document.getElementById("modalRoot").innerHTML=`
      <div class="modal-backdrop" onclick="closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head"><div><span class="eyebrow">ACTIVITY HISTORY</span><h2>ประวัติการทำงาน • ${esc(id)}</h2><p class="modal-subtitle">${esc(p?.thaiName||"")}</p></div><button class="icon-btn" onclick="closeModal()">×</button></div>
          <div class="history-list">${rows.length?rows.map(r=>`<div class="history-item"><strong>${esc(activityActionLabel(r.action))}</strong><span>${esc(r.userName||r.userEmail||"ไม่ระบุผู้ใช้")}</span><small>${esc(formatDate(r.createdAt))}</small></div>`).join(""):`<div class="empty-state">ยังไม่มีประวัติการทำงาน</div>`}</div>
          <div class="form-actions"><button class="btn ghost" onclick="closeModal()">ปิด</button></div>
        </div>
      </div>`;
  }catch(err){console.error(err);toast("โหลดประวัติไม่สำเร็จ");}
}

async function showVersionHistory(id){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่ดู Version History ได้");return;}
  try{
    const snap=await db.collection("plantVersions").where("plantId","==",id).get();
    const rows=snap.docs.map(d=>({docId:d.id,...d.data()})).sort((a,b)=>dateValue(b.createdAt)-dateValue(a.createdAt));
    document.getElementById("modalRoot").innerHTML=`
      <div class="modal-backdrop" onclick="closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-head"><div><span class="eyebrow">VERSION HISTORY</span><h2>ประวัติรุ่นข้อมูล • ${esc(id)}</h2><p class="modal-subtitle">เก็บสำเนาข้อมูลก่อนการแก้ไขแต่ละครั้ง</p></div><button class="icon-btn" onclick="closeModal()">×</button></div>
          <div class="history-list">${rows.length?rows.map((r,i)=>`<div class="history-item"><div><strong>${esc(r.action==="create"?"สร้างข้อมูล":"ก่อนแก้ไข")}</strong><span>${esc(r.changedByName||r.changedByEmail||"ไม่ระบุผู้ใช้")}</span></div><small>${esc(formatDate(r.createdAt))}</small><button class="btn ghost small" onclick="viewVersion('${escAttr(r.docId)}')">ดูรุ่นนี้</button></div>`).join(""):`<div class="empty-state">ยังไม่มี Version History</div>`}</div>
          <div class="form-actions"><button class="btn ghost" onclick="showVersionComparison('${escAttr(id)}')">⇄ เปรียบเทียบกับปัจจุบัน</button><button class="btn ghost" onclick="closeModal()">ปิด</button></div>
        </div>
      </div>`;
  }catch(err){console.error(err);toast("โหลด Version History ไม่สำเร็จ");}
}

async function viewVersion(versionDocId){
  try{
    const d=await db.collection("plantVersions").doc(versionDocId).get();
    if(!d.exists){toast("ไม่พบ Version นี้");return;}
    const v=d.data(), p=v.snapshot||{}, labels=fieldLabelMap();
    const sections=FIELDS.map(([section,fields])=>{
      const items=fields.map(([key,label])=>({label,value:p[key]})).filter(x=>String(x.value??"").trim()!=="");
      if(!items.length)return "";
      return `<section class="detail-section"><h3>${esc(section)}</h3><div class="detail-grid">${items.map(x=>`<div class="detail-item ${String(formatDetailValue(x.value)).length>140?"full":""}"><b>${esc(x.label)}</b><span>${esc(formatDetailValue(x.value))}</span></div>`).join("")}</div></section>`;
    }).join("");
    document.getElementById("modalRoot").innerHTML=`<div class="modal-backdrop" onclick="closeModal(event)"><div class="modal detail-modal" onclick="event.stopPropagation()"><div class="modal-head"><div><span class="eyebrow">VERSION SNAPSHOT</span><h2>${esc(p.id||"") } • ${esc(p.thaiName||"")}</h2><p class="modal-subtitle">${esc(v.action==="create"?"รุ่นแรกของข้อมูล":"สำเนาก่อนการแก้ไข")} • ${esc(formatDate(v.createdAt))}</p></div><button class="icon-btn" onclick="showVersionHistory('${escAttr(p.id||"")}')">←</button></div>${sections}<div class="form-actions"><button class="btn ghost" onclick="showVersionHistory('${escAttr(p.id||"")}')">ย้อนกลับ</button></div></div></div>`;
  }catch(err){console.error(err);toast("เปิด Version ไม่สำเร็จ");}
}

function activityActionLabel(action){
  return ({create:"เพิ่มข้อมูล",update:"แก้ไขข้อมูล",delete:"ย้ายเข้าถังขยะ",restore:"กู้คืนข้อมูล",permanent_delete:"ลบถาวร",delete_request:"ส่งคำขอลบ",comment:"แสดงความคิดเห็น",task_create:"ปักหมุดงานแก้ไข",task_edit:"แก้ไขงานปักหมุด",task_delete:"ลบงานปักหมุด",task_complete:"ปิดงานแก้ไข",comment_edit:"แก้ไขความคิดเห็น",comment_delete:"ลบความคิดเห็น"}[action]||action||"การทำงาน");
}
function dateValue(v){
  if(v&&typeof v.toDate==="function")return v.toDate().getTime();
  const n=new Date(v||0).getTime(); return Number.isNaN(n)?0:n;
}

async function openTrash(){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่จัดการถังขยะได้");return;}
  const rows=plants.filter(p=>p.isDeleted);
  document.getElementById("modalRoot").innerHTML=`<div class="modal-backdrop" onclick="closeModal(event)"><div class="modal" style="max-width:900px" onclick="event.stopPropagation()">
    <div class="modal-head"><div><span class="eyebrow">RECYCLE BIN</span><h2>ถังขยะ</h2><p class="modal-subtitle">ข้อมูลที่ถูกลบแบบ Soft Delete ยังสามารถกู้คืนได้</p></div><button class="icon-btn" onclick="closeModal()">×</button></div>
    <div class="history-list">${rows.length?rows.map(p=>`<div class="history-item"><div><strong>${esc(p.id)} • ${esc(p.thaiName||"ไม่ระบุ")}</strong><span>ลบโดย ${esc(p.deletedByName||p.deletedByEmail||"ไม่ระบุ")} • ${esc(formatDate(p.deletedAt))}</span></div><div style="display:flex;gap:8px"><button class="btn ghost small" onclick="restorePlant('${escAttr(p.id)}')">↩ กู้คืน</button><button class="btn danger small" onclick="permanentDeletePlant('${escAttr(p.id)}')">ลบถาวร</button></div></div>`).join(""):`<div class="empty-state">ถังขยะว่าง</div>`}</div>
    <div class="form-actions"><button class="btn ghost" onclick="closeModal()">ปิด</button></div>
  </div></div>`;
}

async function restorePlant(id){
  if(!isAdminUser())return;
  const p=plants.find(x=>x.id===id && x.isDeleted); if(!p)return;
  if(!confirm(`กู้คืน ${id} • ${p.thaiName||""} ใช่หรือไม่?`))return;
  try{
    await initializeCounterIfNeeded(p.categoryCode);
    const plantRef=db.collection("plants").doc(p.docId||p.id);
    const counterRef=db.collection("counters").doc(p.categoryCode);
    const logRef=db.collection("activityLogs").doc();
    await db.runTransaction(async tx=>{
      const plantSnap=await tx.get(plantRef);
      if(!plantSnap.exists)throw new Error("ไม่พบข้อมูลพืช");
      const current=plantSnap.data()||{};
      if(!current.isDeleted)throw new Error("ข้อมูลนี้ไม่ได้อยู่ในถังขยะ");
      const counterSnap=await tx.get(counterRef);
      const count=Number(counterSnap.exists?counterSnap.data().count||0:0)+1;
      const now=firebase.firestore.FieldValue.serverTimestamp();
      tx.update(plantRef,{isDeleted:false,deletedAt:firebase.firestore.FieldValue.delete(),deletedBy:firebase.firestore.FieldValue.delete(),deletedByEmail:firebase.firestore.FieldValue.delete(),deletedByName:firebase.firestore.FieldValue.delete(),updatedAt:now,updatedBy:currentUserProfile.uid,updatedByEmail:currentUserProfile.email||"",updatedByName:currentUserProfile.displayName||currentUserProfile.username||""});
      tx.set(counterRef,{categoryCode:p.categoryCode,count,updatedAt:now},{merge:true});
      tx.set(logRef,{action:"restore",plantId:p.id||"",plantName:p.thaiName||"",userId:currentUserProfile.uid,userEmail:currentUserProfile.email||auth.currentUser?.email||"",userName:currentUserProfile.displayName||currentUserProfile.username||"",createdAt:now});
    });
    toast(`กู้คืน ${id} แล้ว และเพิ่มจำนวนใน Counters 1 รายการ`); openTrash();
  }catch(err){console.error(err);toast("กู้คืนไม่สำเร็จ: "+(err.code==="permission-denied"?"ไม่มีสิทธิ์เขียน Counters/Plants":"กรุณาลองใหม่"));}
}

async function permanentDeletePlant(id){
  if(!isAdminUser())return;
  const p=plants.find(x=>x.id===id && x.isDeleted); if(!p)return;
  if(!confirm(`ลบ ${id} ถาวรใช่หรือไม่?`))return;
  if(!confirm(`ยืนยันอีกครั้ง การลบถาวรจะไม่สามารถกู้คืนจากถังขยะได้`))return;
  try{
    await db.collection("plants").doc(p.docId||p.id).delete();
    await logActivity("permanent_delete",p);
    // Counters ไม่ลดซ้ำ เพราะจำนวนถูกลดตั้งแต่ตอน Soft Delete แล้ว
    toast(`ลบ ${id} ถาวรแล้ว`); openTrash();
  }catch(err){console.error(err);toast("ลบถาวรไม่สำเร็จ");}
}

async function exportFullBackupJson(){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่สำรองฐานข้อมูลทั้งหมดได้");return;}
  try{
    const [plantsSnap,versionsSnap,logsSnap,countersSnap,requestsSnap,commentsSnap,tasksSnap,chatSnap,notificationsSnap]=await Promise.all([
      db.collection("plants").get(),db.collection("plantVersions").get(),db.collection("activityLogs").get(),db.collection("counters").get(),db.collection("deletionRequests").get(),db.collection("plantComments").get(),db.collection("adminTasks").get(),db.collection("adminChatMessages").get(),db.collection("notifications").get()
    ]);
    const payload={
      exportedAt:new Date().toISOString(),
      exportedBy:currentUserProfile?.email||auth.currentUser?.email||"",
      plants:plantsSnap.docs.map(d=>({docId:d.id,...d.data()})),
      plantVersions:versionsSnap.docs.map(d=>({docId:d.id,...d.data()})),
      activityLogs:logsSnap.docs.map(d=>({docId:d.id,...d.data()})),
      counters:countersSnap.docs.map(d=>({docId:d.id,...d.data()})),
      deletionRequests:requestsSnap.docs.map(d=>({docId:d.id,...d.data()})),
      plantComments:commentsSnap.docs.map(d=>({docId:d.id,...d.data()})),
      adminTasks:tasksSnap.docs.map(d=>({docId:d.id,...d.data()})),
      adminChatMessages:chatSnap.docs.map(d=>({docId:d.id,...d.data()})),
      notifications:notificationsSnap.docs.map(d=>({docId:d.id,...d.data()}))
    };
    downloadBlob(`mongkol-mai-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(payload,null,2),"application/json;charset=utf-8");
    toast("สร้างไฟล์ Backup JSON เรียบร้อยแล้ว");
  }catch(err){console.error(err);toast("สร้าง Backup ไม่สำเร็จ");}
}

async function exportFullBackupXlsx(){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้น");return;}
  if(typeof XLSX==="undefined"){toast("โหลด Excel ไม่สำเร็จ");return;}
  try{
    const [ps,vs,ls,cs,rs,comments, tasks, chat, notifications]=await Promise.all([db.collection("plants").get(),db.collection("plantVersions").get(),db.collection("activityLogs").get(),db.collection("counters").get(),db.collection("deletionRequests").get(),db.collection("plantComments").get(),db.collection("adminTasks").get(),db.collection("adminChatMessages").get(),db.collection("notifications").get()]);
    const wb=XLSX.utils.book_new(), labels=fieldLabelMap();
    const plantRows=ps.docs.map(d=>{const p={docId:d.id,...d.data()},o={ID:p.id,"หมวดหมู่":CATEGORIES.find(c=>c.code===p.categoryCode)?.name||""};Object.keys(labels).forEach(k=>o[labels[k]]=formatDetailValue(p[k]??""));o["สถานะ"]=p.isDeleted?"ถังขยะ":"ใช้งาน";o["วันที่ลงข้อมูล"]=formatDate(p.createdAt);o["ผู้ลงข้อมูล"]=p.createdByName||p.createdByEmail||"";o["แก้ไขล่าสุด"]=formatDate(p.updatedAt);o["ผู้แก้ไขล่าสุด"]=p.updatedByName||p.updatedByEmail||"";return o;});
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(plantRows),"Plants");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(vs.docs.map(d=>{const x=d.data();return {plantId:x.plantId,action:x.action,changedBy:x.changedByName||x.changedByEmail||"",createdAt:formatDate(x.createdAt),snapshot:JSON.stringify(x.snapshot||{})};})),"VersionHistory");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(ls.docs.map(d=>{const x=d.data();return {plantId:x.plantId,plantName:x.plantName,action:x.action,user:x.userName||x.userEmail||"",createdAt:formatDate(x.createdAt)};})),"ActivityLogs");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(cs.docs.map(d=>{const x=d.data();return {categoryCode:d.id,count:x.count||0,last:x.last||0,updatedAt:formatDate(x.updatedAt)};})),"Counters");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rs.docs.map(d=>{const x=d.data();return {plantId:x.plantId,status:x.status,owner:x.plantOwnerName||x.plantOwnerEmail||"",requestedBy:x.requestedByName||x.requestedByEmail||"",createdAt:formatDate(x.createdAt)};})),"DeletionRequests");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(comments.docs.map(d=>{const x=d.data();return {plantId:x.plantId,plantName:x.plantName,author:x.authorName||x.authorEmail||"",message:x.message,createdAt:formatDate(x.createdAt)};})),"PlantComments");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(tasks.docs.map(d=>{const x=d.data();return {plantId:x.plantId,plantName:x.plantName,field:x.fieldLabel,note:x.note,assignee:x.assigneeName,status:x.status,createdBy:x.createdByName,createdAt:formatDate(x.createdAt),completedAt:formatDate(x.completedAt)};})),"AdminTasks");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(chat.docs.map(d=>{const x=d.data();return {sender:x.senderName||x.senderEmail||"",message:x.message,createdAt:formatDate(x.createdAt)};})),"AdminChat");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(notifications.docs.map(d=>{const x=d.data();return {userId:x.userId,title:x.title,message:x.message,plantId:x.plantId||"",taskId:x.taskId||"",read:!!x.read,createdAt:formatDate(x.createdAt)};})),"Notifications");
    XLSX.writeFile(wb,`mongkol-mai-full-backup-${new Date().toISOString().slice(0,10)}.xlsx`);
    toast("สร้างไฟล์ Backup Excel เรียบร้อยแล้ว");
  }catch(err){console.error(err);toast("สร้าง Backup Excel ไม่สำเร็จ");}
}

async function logActivity(action,p){
  try{
    await db.collection("activityLogs").add({
      action,plantId:p.id||"",
      plantName:p.thaiName||"",
      userId:currentUserProfile?.uid||auth.currentUser?.uid||"",
      userEmail:currentUserProfile?.email||auth.currentUser?.email||"",
      userName:currentUserProfile?.displayName||currentUserProfile?.username||"",
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
  }catch(err){console.warn("activity log failed",err);}
}


function openProfileMenu(){
  const current=document.body.dataset.theme||"default";
  document.getElementById("modalRoot").innerHTML=`
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal profile-menu-modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <div><span class="eyebrow">ACCOUNT & THEME</span><h2>ตั้งค่าและหน้าตาเว็บไซต์</h2><p class="modal-subtitle">จัดการบัญชีของคุณและเลือกธีมที่ชอบ</p></div>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="profile-menu-actions">
          <button class="profile-menu-item" onclick="openProfileModal()"><span>👤</span><div><strong>แก้ไขบัญชี</strong><small>Display Name, Username และ Emoji</small></div></button>
          <button class="profile-menu-item" onclick="openPasswordModal()"><span>🔐</span><div><strong>เปลี่ยนรหัสผ่าน</strong><small>เปลี่ยนรหัสผ่านบัญชีของตัวเอง</small></div></button>
          <button class="profile-menu-item" onclick="closeModal();openHelp();setTimeout(()=>openSupportForm('ขอแก้ไขอีเมลบัญชี','ขอแก้ไขอีเมลบัญชี'),250)"><span>📨</span><div><strong>ขอแก้ไขอีเมล</strong><small>ส่งคำขอถึง BENYAPA ผ่านศูนย์ช่วยเหลือ</small></div></button>
          ${isSupportAdmin()?`<button class="profile-menu-item role-management-item" onclick="openRoleManagement()"><span>🛡️</span><div><strong>ตั้งค่าสิทธิ์การเข้าถึง</strong><small>จัดการ Role ของผู้ใช้งานทั้งหมด • เฉพาะ BENYAPA</small></div></button>`:""}
        </div>
        <div class="theme-section">
          <div class="theme-section-head"><div><span class="eyebrow">THEME</span><h3>เลือกธีม UI</h3></div><span id="activeThemeLabel" class="theme-current-label">${themeLabel(current)}</span></div>
          <div class="theme-grid">
            ${[["default","🌿","Default","เขียวสะอาดแบบปัจจุบัน"],["natursun","🌻","NaturSun","โทนธรรมชาติหม่นและอบอุ่น"],["midnight","🌙","Midnight","ดำ–น้ำเงินแบบกลางคืน"]].map(([id,icon,name,desc])=>`<button type="button" class="theme-choice ${current===id?'selected':''}" data-theme="${id}" onclick="chooseThemeFromMenu('${id}')"><span class="theme-swatch theme-swatch-${id}">${icon}</span><span><strong>${name}</strong><small>${desc}</small></span><b>✓</b></button>`).join("")}
          </div>
        </div>
        <button class="profile-menu-item danger-item profile-logout-row" onclick="closeModal();logout()"><span>🚪</span><div><strong>ออกจากระบบ</strong><small>ออกจากบัญชีปัจจุบัน</small></div></button>
      </div>
    </div>`;
}
async function openRoleManagement(){
  if(!isSupportAdmin()){toast("เมนูนี้สำหรับ BENYAPA เท่านั้น");return;}
  closeModal();
  try{
    const snap=await db.collection("users").orderBy("displayName").get();
    const users=snap.docs.map(d=>({uid:d.id,...d.data()}));
    document.getElementById("modalRoot").innerHTML=`
      <div class="modal-backdrop" onclick="closeModal(event)">
        <div class="modal role-management-modal" onclick="event.stopPropagation()">
          <div class="modal-head"><div><span class="eyebrow">ACCESS CONTROL</span><h2>🛡️ ตั้งค่าสิทธิ์การเข้าถึง</h2><p class="modal-subtitle">เลือก Role ของผู้ใช้งานแต่ละบัญชี แล้วกดบันทึกเพื่ออัปเดต Firestore</p></div><button class="icon-btn" onclick="closeModal()">×</button></div>
          <div class="role-manager-note"><strong>ผู้ดูแลสิทธิ์หลัก:</strong> benyapabaibuaw • benyapabaibuaw@gmail.com</div>
          <div class="role-user-list">${users.map(u=>`<div class="role-user-row" data-uid="${escAttr(u.uid)}"><div class="role-user-identity"><span class="role-user-avatar">${esc(u.avatarEmoji||"👤")}</span><div><strong>${esc(u.displayName||u.username||u.email||"ผู้ใช้")}</strong><small>${esc(u.email||"")} ${u.username?`• @${esc(u.username)}`:""}</small></div></div><label class="role-select-label">Role<select class="role-select" data-uid="${escAttr(u.uid)}" data-original-role="${escAttr(u.role||"member")}" ${u.uid===currentUserProfile.uid?"disabled":""}><option value="member" ${u.role==="member"?"selected":""}>member</option><option value="admin" ${u.role==="admin"?"selected":""}>admin</option></select></label></div>`).join("")}</div>
          <div class="role-manager-actions"><button class="btn ghost" onclick="closeModal()">ยกเลิก</button><button class="btn primary" onclick="saveRoleChanges()">💾 บันทึกการเปลี่ยน Role</button></div>
        </div>
      </div>`;
  }catch(e){console.error(e);toast("โหลดรายการผู้ใช้งานไม่สำเร็จ");}
}
async function saveRoleChanges(){
  if(!isSupportAdmin())return;
  const changes=[...document.querySelectorAll(".role-select:not(:disabled)")].map(sel=>({uid:sel.dataset.uid,newRole:sel.value,oldRole:sel.dataset.originalRole||"member"})).filter(c=>c.newRole!==c.oldRole);
  if(!changes.length){toast("ยังไม่มีการเปลี่ยน Role");return;}
  if(!confirm(`ยืนยันการเปลี่ยน Role จำนวน ${changes.length} บัญชีหรือไม่?`))return;
  try{
    const batch=db.batch();
    changes.forEach(c=>batch.update(db.collection("users").doc(c.uid),{role:c.newRole,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}));
    await batch.commit();
    for(const c of changes)await db.collection("notifications").add({userId:c.uid,title:"สิทธิ์การเข้าถึงถูกเปลี่ยน",message:`Role ของบัญชีคุณถูกเปลี่ยนจาก ${c.oldRole} เป็น ${c.newRole} โดย BENYAPA`,type:"role_change",icon:"🛡️",read:false,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    closeModal();toast(`บันทึก Role แล้ว ${changes.length} บัญชี และส่งการแจ้งเตือนให้ผู้ใช้ที่เกี่ยวข้อง`);
  }catch(e){console.error(e);toast("บันทึก Role ไม่สำเร็จ: "+(e.code==="permission-denied"?"Firestore Rules ไม่อนุญาต":"กรุณาลองใหม่"));}
}
function chooseThemeFromMenu(theme){
  saveThemePreference(theme);
  document.getElementById("activeThemeLabel")?.replaceChildren(document.createTextNode(themeLabel(theme)));
  document.querySelectorAll(".theme-choice").forEach(btn=>btn.classList.toggle("selected",btn.dataset.theme===theme));
}

function openProfileModal(){
  closeModal();
  const p=currentUserProfile||{};
  const emojis=["🌿","🌱","🌳","🍃","🌸","🌺","🌻","🪴","🌴","🍀","🌼","🪷","✨","🌙","🦋","🐝"];
  document.getElementById("modalRoot").innerHTML=`
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal profile-modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <div><span class="eyebrow">MY ACCOUNT</span><h2>⚙️ ตั้งค่าบัญชี</h2><p class="modal-subtitle">แก้ไขข้อมูลบัญชีได้ ยกเว้นอีเมล</p></div>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <form onsubmit="saveProfile(event)">
          <div class="profile-avatar-picker">
            <div id="profileAvatarPreview" class="profile-avatar-preview">${esc(p.avatarEmoji||"👤")}</div>
            <div><strong>เลือก Emoji ประจำตัว</strong><div class="emoji-picker">${emojis.map(e=>`<button type="button" class="emoji-choice ${e===(p.avatarEmoji||"👤")?"selected":""}" onclick="selectProfileEmoji('${e}')">${e}</button>`).join("")}</div></div>
          </div>
          <div class="profile-form-grid">
            <label>Display Name<input id="profileDisplayName" maxlength="80" value="${escAttr(p.displayName||"")}"></label>
            <label>Username<input id="profileUsername" maxlength="40" value="${escAttr(p.username||"")}"></label>
            <label class="full-field">อีเมลบัญชี<input value="${escAttr(auth.currentUser?.email||"")}" disabled><small>ไม่สามารถแก้ไขจากหน้านี้ หากต้องการเปลี่ยนอีเมลให้ส่งแบบฟอร์มถึง BENYAPA ในศูนย์ช่วยเหลือ</small></label>
          </div>
          <div class="profile-form-actions"><button type="button" class="btn ghost" onclick="closeModal()">ยกเลิก</button><button class="btn primary" type="submit">บันทึกการตั้งค่า</button></div>
        </form>
      </div>
    </div>`;
  window.selectedProfileEmoji=p.avatarEmoji||"👤";
}
function selectProfileEmoji(e){
  window.selectedProfileEmoji=e;
  const p=document.getElementById("profileAvatarPreview"); if(p)p.textContent=e;
  document.querySelectorAll(".emoji-choice").forEach(b=>b.classList.toggle("selected",b.textContent===e));
}
async function saveProfile(e){
  e.preventDefault();
  if(!auth.currentUser||!currentUserProfile)return;
  const displayName=document.getElementById("profileDisplayName").value.trim();
  const username=document.getElementById("profileUsername").value.trim();
  if(!displayName||!username){toast("กรุณากรอก Display Name และ Username");return;}
  if(username.length<3){toast("Username ต้องมีอย่างน้อย 3 ตัวอักษร");return;}
  try{
    await db.collection("users").doc(auth.currentUser.uid).update({
      displayName,username,avatarEmoji:window.selectedProfileEmoji||"👤",
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    currentUserProfile={...currentUserProfile,displayName,username,avatarEmoji:window.selectedProfileEmoji||"👤"};
    document.getElementById("currentUsername").textContent=displayName;
    document.getElementById("userAvatarButton").textContent=window.selectedProfileEmoji||"👤";
    document.getElementById("dashboardUserName").textContent=displayName;
    closeModal();toast("บันทึกการตั้งค่าเรียบร้อยแล้ว");
  }catch(err){console.error(err);toast("บันทึกการตั้งค่าไม่สำเร็จ");}
}
function openPasswordModal(){
  closeModal();
  document.getElementById("modalRoot").innerHTML=`
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal password-modal" onclick="event.stopPropagation()">
        <div class="modal-head"><div><span class="eyebrow">SECURITY</span><h2>🔐 เปลี่ยนรหัสผ่าน</h2><p class="modal-subtitle">ระบบจะยืนยันรหัสผ่านเดิมก่อนเปลี่ยน</p></div><button class="icon-btn" onclick="closeModal()">×</button></div>
        <form onsubmit="changeOwnPassword(event)" class="password-form">
          <label>รหัสผ่านปัจจุบัน<input id="profileCurrentPassword" type="password" autocomplete="current-password" required></label>
          <label>รหัสผ่านใหม่<input id="profileNewPassword" type="password" minlength="8" autocomplete="new-password" required></label>
          <label>ยืนยันรหัสผ่านใหม่<input id="profileConfirmPassword" type="password" minlength="8" autocomplete="new-password" required></label>
          <div class="profile-form-actions"><button type="button" class="btn ghost" onclick="closeModal()">ยกเลิก</button><button class="btn primary" type="submit">เปลี่ยนรหัสผ่าน</button></div>
        </form>
      </div>
    </div>`;
}
async function changeOwnPassword(e){
  e.preventDefault();
  const user=auth.currentUser;
  if(!user?.email)return;
  const current=document.getElementById("profileCurrentPassword").value;
  const next=document.getElementById("profileNewPassword").value;
  const confirm=document.getElementById("profileConfirmPassword").value;
  if(next.length<8){toast("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");return;}
  if(next!==confirm){toast("รหัสผ่านใหม่ไม่ตรงกัน");return;}
  try{
    const credential=firebase.auth.EmailAuthProvider.credential(user.email,current);
    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(next);
    closeModal();toast("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
  }catch(err){
    console.error(err);
    toast(err?.code==="auth/wrong-password"?"รหัสผ่านปัจจุบันไม่ถูกต้อง":"เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาตรวจสอบรหัสผ่านเดิมและลองใหม่");
  }
}

async function submitSupportRequest(e){
  e.preventDefault();
  if(!auth.currentUser)return;
  const subject=document.getElementById("supportSubject").value.trim();
  const type=document.getElementById("supportType").value;
  const message=document.getElementById("supportMessage").value.trim();
  if(!subject||!message){toast("กรุณากรอกหัวข้อและรายละเอียด");return;}
  try{
    await db.collection("supportRequests").add({
      fromUid:auth.currentUser.uid,
      fromEmail:auth.currentUser.email||"",
      fromName:currentUserProfile?.displayName||currentUserProfile?.username||"",
      type,subject,message,targetEmail:"benyapabaibuaw@gmail.com",targetUsername:"BENYAPA",
      status:"new",createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    e.target.reset();
    closeModal();
    toast("ส่งแบบฟอร์มถึง BENYAPA แล้ว");
  }catch(err){console.error(err);toast("ส่งแบบฟอร์มไม่สำเร็จ กรุณาตรวจสอบ Firestore Rules");}
}
function openSupportForm(defaultType="ความคิดเห็นต่อเว็บไซต์",defaultSubject=""){
  document.getElementById("modalRoot").innerHTML=`
    <div class="modal-backdrop support-form-backdrop" onclick="closeModal(event)">
      <div class="modal support-form-modal" onclick="event.stopPropagation()">
        <div class="modal-head"><div><span class="eyebrow">CONTACT ADMIN</span><h2>📨 แจ้งปัญหา / ส่งความคิดเห็น</h2><p class="modal-subtitle">แบบฟอร์มจะถูกส่งเข้า Inbox ของ BENYAPA • benyapabaibuaw@gmail.com</p></div><button class="icon-btn" onclick="closeModal()">×</button></div>
        <form class="support-form" onsubmit="submitSupportRequest(event)">
          <div class="support-form-grid">
            <label>ประเภท<select id="supportType" required><option value="แจ้งแก้ไขข้อมูล">แจ้งแก้ไขข้อมูล</option><option value="แจ้งปัญหาการใช้งาน">แจ้งปัญหาการใช้งาน</option><option value="ความคิดเห็นต่อเว็บไซต์">ความคิดเห็นต่อเว็บไซต์</option><option value="ขอแก้ไขอีเมลบัญชี">ขอแก้ไขอีเมลบัญชี</option><option value="ข้อเสนอแนะ">ข้อเสนอแนะ</option><option value="คำร้องขอเพิ่มแอดมิน">คำร้องขอเพิ่มแอดมิน</option></select></label>
            <label>หัวข้อ<input id="supportSubject" maxlength="120" required placeholder="เช่น ขอแก้ไขอีเมลบัญชี" value="${escAttr(defaultSubject)}"></label>
          </div>
          <label>รายละเอียด<textarea id="supportMessage" maxlength="3000" rows="7" required placeholder="อธิบายสิ่งที่ต้องการให้แก้ไขหรือความคิดเห็นของคุณ"></textarea></label>
          <div class="support-form-actions"><small>ผู้ส่ง: ${esc(currentUserProfile?.displayName||currentUserProfile?.username||"ผู้ใช้")} • ${esc(auth.currentUser?.email||"")}</small><div><button type="button" class="btn ghost" onclick="closeModal()">ยกเลิก</button><button class="btn primary" type="submit">ส่งแบบฟอร์มถึง BENYAPA</button></div></div>
        </form>
      </div>
    </div>`;
  const select=document.getElementById("supportType"); if(select)select.value=defaultType;
}
async function openSupportInbox(){
  if(!isSupportAdmin())return;
  closeHelp();
  try{
    const snap=await db.collection("supportRequests").orderBy("createdAt","desc").limit(50).get();
    const rows=snap.docs.map(d=>({docId:d.id,...d.data()}));
    document.getElementById("modalRoot").innerHTML=`
      <div class="modal-backdrop" onclick="closeModal(event)">
        <div class="modal support-inbox-modal" onclick="event.stopPropagation()">
          <div class="modal-head"><div><span class="eyebrow">ADMIN INBOX</span><h2>📨 แบบฟอร์มจากผู้ใช้งาน</h2><p class="modal-subtitle">ปลายทาง: BENYAPA • benyapabaibuaw@gmail.com</p></div><button class="icon-btn" onclick="closeModal()">×</button></div>
          <div class="support-inbox-list">${rows.length?rows.map(r=>`<article class="support-item ${r.status==="new"?"is-new":""}"><div class="support-item-head"><strong>${esc(r.subject)}</strong><span>${esc(formatDate(r.createdAt))}</span></div><small>${esc(r.fromName||"ผู้ใช้")} • ${esc(r.fromEmail||"")}</small><span class="support-type">${esc(r.type||"ความคิดเห็น")}</span><p>${esc(r.message)}</p><div class="support-item-actions"><button class="btn ghost small" onclick="markSupportRead('${escAttr(r.docId)}')">${r.status==="new"?"ทำเครื่องหมายว่าอ่านแล้ว":"อ่านแล้ว"}</button>${r.fromEmail?`<a class="btn ghost small" href="mailto:${escAttr(r.fromEmail)}?subject=${encodeURIComponent("Re: "+r.subject)}">ตอบกลับทางอีเมล</a>`:""}</div></article>`).join(""):'<div class="empty-state">ยังไม่มีแบบฟอร์ม</div>'}</div>
        </div>
      </div>`;
  }catch(err){console.error(err);toast("เปิดกล่องรับแบบฟอร์มไม่สำเร็จ");}
}
async function markSupportRead(id){
  if(!isSupportAdmin())return;
  try{await db.collection("supportRequests").doc(id).update({status:"read",readAt:firebase.firestore.FieldValue.serverTimestamp(),readBy:auth.currentUser.uid});toast("อัปเดตสถานะแล้ว");openSupportInbox();}catch(e){toast("อัปเดตสถานะไม่สำเร็จ");}
}
function subscribeSupportRequests(){
  if(supportRequestsUnsubscribe)supportRequestsUnsubscribe();
  if(!isSupportAdmin())return;
  supportRequestsUnsubscribe=db.collection("supportRequests").where("status","==","new").onSnapshot(s=>{
    window.newSupportRequestCount=s.size;
    renderDashboard();
  },e=>console.warn("supportRequests",e));
}

function closeHelp(e){
  if(e && e.target!==e.currentTarget)return;
  const root=document.getElementById("helpRoot");
  if(root)root.innerHTML="";
}

function openHelp(){
  const root=document.getElementById("helpRoot");
  if(!root)return;
  const admin=isAdminUser();
  const cards=[
    ["01","เริ่มต้นใช้งาน","Login, Logout และสิทธิ์ Admin/Member: Admin จัดการข้อมูลและ Collaboration ได้ ส่วน Member ใช้เฉพาะคลังข้อมูล การส่งออก และช่วยเหลือ","เริ่ม login ออกจากระบบ สิทธิ์ บทบาท"],
    ["02","Dashboard","หน้าแรกของ Admin แสดงข้อมูลใช้งาน แจ้งเตือนที่ยังไม่อ่าน จำนวนข้อมูลที่คุณลง และข้อมูลในถังขยะ พร้อมทางลัดกรอกข้อมูลต่อ","dashboard หน้าหลัก สถิติ ทางลัด"],
    ["03","ตั้งค่า บัญชี และหน้าตาเว็บไซต์","กดเมนูตั้งค่าเพื่อเปลี่ยน Emoji, Display Name, Username และ Theme รวมถึงเปลี่ยนรหัสผ่าน อีเมลแก้จากหน้าตั้งค่าไม่ได้ ต้องส่งคำขอถึง BENYAPA","ตั้งค่า username display name emoji รหัสผ่าน email theme ธีม"],
    ["04","เพิ่มข้อมูลและ ID","เลือกหมวด A–H ระบบแนะนำ ID เช่น A01 และรองรับ ID ที่กำหนดเองโดยต้องขึ้นต้นด้วยตัวอักษรหมวดเดียวกันและไม่ซ้ำ","เพิ่มข้อมูล ID A01 หมวด"],
    ["05","Draft และกรอกข้อมูลต่อ","ระบบ Auto-save แบบร่างแยกตามบัญชี ตั้งชื่อ Draft ได้ และปุ่มกรอกข้อมูลต่อบน Dashboard จะเปิด Draft ล่าสุดของคุณทันที","draft กรอกต่อ autosave แบบร่าง"],
    ["06","คลังข้อมูลและ Smart Search","ค้นหา กรอง และเรียงข้อมูลพืชจาก ID ชื่อ ลักษณะ ความเชื่อ การดูแล พื้นที่ และคุณสมบัติต่าง ๆ","คลังข้อมูล ค้นหา filter sort"],
    ["07","แก้ไขข้อมูลและ Version History","Admin แก้ข้อมูลของทุกคนได้ ระบบเก็บผู้สร้าง ผู้แก้ไข และ Snapshot ก่อนแก้ไข","แก้ไข version ประวัติ"],
    ["08","Counters และถังขยะ","เพิ่มข้อมูลจะเพิ่ม count, Soft Delete ย้ายเข้าถังขยะ, Restore นำกลับมา และ Permanent Delete จะลบถาวร","counter ถังขยะ restore ลบ"],
    ["09","Export และ Backup","Export เป็น Excel, CSV, JSON ได้ และ Admin สามารถ Backup ข้อมูลหลักพร้อม Version, Activity, Comments, Tasks, Chat และ Notifications","export backup excel csv json"],
    ["10","Admin Chat","Admin ทุกคนเข้าห้องร่วมกันอัตโนมัติ แสดง Online/Offline และ Last seen ใช้ @Mention และจัดการข้อความของตัวเองได้","chat แชท online offline mention"],
    ["11","ความคิดเห็นต่อข้อมูลพืช","Admin แสดงความคิดเห็นในรายการพืชได้ ความคิดเห็นของตัวเองแก้ไขหรือลบได้ และกิจกรรมสำคัญส่ง Notification","comment ความคิดเห็น แก้ไข ลบ"],
    ["12","กระดานปักหมุดงานแก้ไข","ผู้ปักหมุดแก้ไขหรือลบ Pin ของตัวเองได้ ระบุจุดที่ต้องแก้และมอบหมาย Admin คนอื่น","pin ปักหมุด task งาน มอบหมาย"],
    ["13","สถานะงานและสิทธิ์","เฉพาะ Admin ที่ถูกมอบหมายเท่านั้นที่กดทำสำเร็จได้ คนอื่นเห็นงานและสถานะได้","สถานะ สำเร็จ มอบหมาย"],
    ["14","Notification","ระฆังแสดงจุดสีแดงและจำนวนที่ยังไม่อ่าน แจ้งเตือน Comment, Pin, Mention, งานสำเร็จ และกิจกรรมสำคัญ","notification แจ้งเตือน ระฆัง unread"],
    ["15","Version Comparison","เลือก Version เดิมแล้วเปรียบเทียบกับข้อมูลปัจจุบัน ระบบแสดงเฉพาะช่องที่เปลี่ยน พร้อมผู้แก้และเวลา","version comparison เปรียบเทียบ"],
    ["16","Activity History","บันทึกการเพิ่ม แก้ไข ลบ กู้คืน Comment และงานปักหมุด เพื่อให้ตรวจสอบย้อนหลังได้","activity history ประวัติ"],
    ["17","Deletion Request","การลบข้อมูลของผู้อื่นใช้คำขอและเก็บหลักฐานไว้ใน Firestore ตามสิทธิ์ที่กำหนด","deletion request คำขอลบ"],
    ["18","ศูนย์รับแบบฟอร์ม","ผู้ใช้ส่งข้อเสนอแนะ แจ้งปัญหา หรือขอแก้ไขอีเมลถึง BENYAPA ได้ และ Admin บัญชี BENYAPA จะเห็นคำขอใน Inbox","แบบฟอร์ม แจ้งปัญหา ความคิดเห็น อีเมล BENYAPA"],
    ["19","ความปลอดภัยและ Firestore Rules","สิทธิ์จริงบังคับด้วย Firestore Rules ไม่ใช่การซ่อนปุ่ม หลังแก้ Rules ต้อง Deploy Rules ก่อนใช้งานจริง","security rules permission firebase"],
    ["20","อินเทอร์เน็ตและการแก้ปัญหา","การอ่าน/เขียน Firestore ต้องใช้อินเทอร์เน็ต หากบันทึกไม่ได้ให้ตรวจ Console, Authentication และ Firestore Rules","แก้ปัญหา permission error console"],
  ];
  const helpGroups=[
    ["01","เริ่มต้นใช้งาน","ทำความรู้จักระบบ บัญชี และหน้า Dashboard",[cards[0],cards[1],cards[2]]],
    ["02","การจัดการข้อมูล","กรอก ค้นหา แก้ไข บันทึก และส่งออกข้อมูล",[cards[3],cards[4],cards[5],cards[6],cards[7],cards[8]]],
    ["03","การทำงานร่วมกันของ Admin","Chat, Comment, Pin, Notification และประวัติการทำงาน",[cards[9],cards[10],cards[11],cards[12],cards[13],cards[14],cards[15]]],
    ["04","ความปลอดภัย การช่วยเหลือ และการแก้ปัญหา","คำขอลบ แบบฟอร์ม และแนวทางตรวจสอบปัญหา",[cards[16],cards[17],cards[18],cards[19]]]
  ];
  const cardsHtml=helpGroups.map((g,gi)=>`<section class="help-category-section ${gi===0?'is-open':''}" data-help-category>
    <button type="button" class="help-category-heading" onclick="toggleHelpCategory(this.parentElement)">
      <span>${g[0]}</span><div><strong>${esc(g[1])}</strong><small>${esc(g[2])}</small></div><b class="help-category-chevron">⌄</b>
    </button>
    <div class="help-category-body">${g[3].map(c=>`<article class="help-card" data-help-search="${escAttr((c[1]+" "+c[2]+" "+c[3]).toLowerCase())}"><div class="help-icon">${c[0]}</div><div><h3>${esc(c[1])}</h3><p>${esc(c[2])}</p></div></article>`).join("")}</div>
  </section>`).join("");
  root.innerHTML=`
    <div class="help-backdrop" onclick="closeHelp(event)">
      <section class="help-modal" onclick="event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
        <div class="help-head">
          <div><span class="eyebrow">HELP CENTER</span><h2 id="helpTitle">คู่มือการใช้งาน มงคลไม้</h2><p>เรียงหมวด 01 → 04 จากบนลงล่าง กดหัวข้อเพื่อเปิดหรือพับรายละเอียด และใช้ค้นหาเพื่อหาเรื่องที่ต้องการได้ทันที</p></div>
          <button class="icon-btn" type="button" onclick="closeHelp()" aria-label="ปิด">×</button>
        </div>
        <div class="help-role-banner"><span>${admin?"👑":"👤"}</span><div><strong>คุณกำลังใช้งานในสิทธิ์ ${admin?"Admin":"Member"}</strong><small>${admin?"สามารถจัดการข้อมูลหลักและ Collaboration ได้":"สามารถใช้เฉพาะคลังข้อมูล การส่งออกข้อมูล และส่วนช่วยเหลือได้"}</small></div></div>
        <div class="help-search-box"><span>⌕</span><input id="helpSearchInput" type="search" placeholder="ค้นหา เช่น กรอกข้อมูลต่อ, เปลี่ยนรหัสผ่าน, Notification..." oninput="filterHelpCards(this.value)"><button type="button" onclick="clearHelpSearch()">×</button></div>
        <div id="helpSearchResult" class="help-search-result">แสดงคู่มือทั้งหมด ${cards.length} หัวข้อ</div>
        <div id="helpCardsGrid" class="help-sections">${cardsHtml}</div>
        <section class="help-support-section" id="helpSupportForm">
          <div><span class="eyebrow">CONTACT ADMIN</span><h3>📨 ต้องการแจ้งปัญหาหรือส่งความคิดเห็น?</h3><p>แบบฟอร์มจะส่งถึง <strong>BENYAPA</strong> • benyapabaibuaw@gmail.com และจะแสดงในกล่องรับแบบฟอร์มของ Admin</p></div>
          <button class="btn primary" type="button" onclick="openSupportForm()">เปิดแบบฟอร์ม</button>
        </section>
        ${isSupportAdmin()?`<section class="support-admin-banner"><div><span class="eyebrow">ADMIN INBOX</span><h3>📨 กล่องรับแบบฟอร์ม</h3><p>กล่องนี้เป็นของ Admin ผู้รับแบบฟอร์มหลักเท่านั้น • BENYAPA • benyapabaibuaw@gmail.com</p></div><button class="btn primary" type="button" onclick="openSupportInbox()">เปิดกล่องรับแบบฟอร์ม${window.newSupportRequestCount?` (${window.newSupportRequestCount} ใหม่)`:""}</button></section>`:""}
        <div class="help-footer"><span>⌨️ กด Esc เพื่อปิดหน้าต่างช่วยเหลือ</span><button class="btn ghost" type="button" onclick="closeHelp()">ปิดคู่มือ</button></div>
      </section>
    </div>`;
}
function toggleHelpCategory(section){
  section?.classList.toggle("is-open");
}
function clearHelpSearch(){
  const input=document.getElementById("helpSearchInput");
  if(input)input.value="";
  filterHelpCards("");
}
function filterHelpCards(query){
  const q=normalizeSearchValue(query);
  const sections=[...document.querySelectorAll("#helpCardsGrid .help-category-section")];
  let shown=0;
  sections.forEach(section=>{
    const cards=[...section.querySelectorAll(".help-card")];
    let sectionShown=0;
    cards.forEach(card=>{const hit=!q||normalizeSearchValue(card.dataset.helpSearch).includes(q);card.classList.toggle("hidden",!hit);if(hit){shown++;sectionShown++;}});
    section.classList.toggle("hidden",q&&sectionShown===0);
    if(q&&sectionShown) section.classList.add("is-open");
    if(!q&&sectionShown) section.classList.toggle("hidden",false);
  });
  const result=document.getElementById("helpSearchResult");
  if(result)result.textContent=q?`พบคู่มือที่เกี่ยวข้อง ${shown} หัวข้อ`:`แสดงคู่มือทั้งหมด 20 หัวข้อ`;
}

// ===================== TEAM COLLABORATION =====================
async function getAdminProfiles(){
  const snap=await db.collection("users").where("role","==","admin").get();
  return snap.docs.map(d=>({uid:d.id,...d.data()}));
}

async function createNotificationsForUsers(userIds,title,message,meta={}){
  const ids=[...new Set((userIds||[]).filter(Boolean))];
  if(!ids.length || !isAdminUser()) return;
  const chunks=[];
  for(let i=0;i<ids.length;i+=450)chunks.push(ids.slice(i,i+450));
  for(const idsChunk of chunks){
    const batch=db.batch();
    idsChunk.forEach(uid=>{
      const ref=db.collection("notifications").doc();
      batch.set(ref,{userId:uid,title,message,plantId:meta.plantId||"",taskId:meta.taskId||"",type:meta.type||"team",icon:meta.icon||"🔔",read:false,createdAt:firebase.firestore.FieldValue.serverTimestamp(),createdBy:currentUserProfile?.uid||"",createdByName:currentUserProfile?.displayName||currentUserProfile?.username||"Admin"});
    });
    await batch.commit();
  }
}

async function notifyAllAdmins(title,message,meta={}){
  try{
    const admins=adminDirectory.length?adminDirectory:await getAdminProfiles();
    await createNotificationsForUsers(admins.map(a=>a.uid),title,message,meta);
  }catch(e){console.warn("notifyAllAdmins",e);}
}

async function notifyUsers(userIds,title,message,meta={}){
  try{await createNotificationsForUsers(userIds,title,message,meta);}catch(e){console.warn("notifyUsers",e);}
}

function subscribeNotifications(){
  if(notificationUnsubscribe)notificationUnsubscribe();
  if(!currentUserProfile?.uid || !isAdminUser())return;
  notificationUnsubscribe=db.collection("notifications").where("userId","==",currentUserProfile.uid).onSnapshot(s=>{
    const rows=s.docs.map(d=>({docId:d.id,...d.data()})).sort((a,b)=>dateValue(b.createdAt)-dateValue(a.createdAt));
    window.userNotifications=rows;
    const unread=rows.filter(x=>!x.read).length;
    const badge=document.getElementById("notificationBadge");
    const nav=document.getElementById("notificationNav");
    if(badge){badge.textContent=unread>99?"99+":unread;badge.classList.toggle("hidden",!unread);}
    nav?.classList.toggle("has-unread",unread>0);
    const box=document.getElementById("dashboardNotifications");
    if(box)box.innerHTML=rows.slice(0,8).map(renderNotificationItem).join("")||'<div class="empty-state">ยังไม่มีการแจ้งเตือน</div>';
  },err=>console.warn("notifications",err));
}
function renderNotificationItem(n){
  return `<button class="notification-item ${n.read?'':'unread'}" onclick="openNotification('${escAttr(n.docId)}')"><span class="notification-icon">${esc(n.icon||"🔔")}</span><span><strong>${esc(n.title||"การแจ้งเตือน")}</strong><small>${esc(n.message||"")} • ${esc(formatDate(n.createdAt))}</small></span></button>`;
}
async function openNotification(id){
  if(!isAdminUser())return;
  try{await db.collection("notifications").doc(id).update({read:true,readAt:firebase.firestore.FieldValue.serverTimestamp()});}catch(e){}
  const n=(await db.collection("notifications").doc(id).get()).data()||{};
  if(n.plantId){closeModal();viewPlant(n.plantId);} else if(n.taskId){showPage("home");}
}
async function openNotifications(){
  if(!isAdminUser())return;
  const snap=await db.collection("notifications").where("userId","==",currentUserProfile.uid).get();
  const rows=snap.docs.map(d=>({docId:d.id,...d.data()})).sort((a,b)=>dateValue(b.createdAt)-dateValue(a.createdAt));
  document.getElementById("modalRoot").innerHTML=`<div class="modal-backdrop" onclick="closeModal(event)"><div class="modal notification-modal" onclick="event.stopPropagation()"><div class="modal-head"><div><span class="eyebrow">NOTIFICATIONS</span><h2>🔔 การแจ้งเตือนทั้งหมด</h2><p class="modal-subtitle">ความคิดเห็น งานปักหมุด การ Mention และกิจกรรมสำคัญของทีม</p></div><button class="icon-btn" onclick="closeModal()">×</button></div><div class="notification-toolbar"><button class="btn ghost small" onclick="markAllNotificationsRead()">✓ อ่านทั้งหมด</button><button class="btn ghost small" onclick="clearReadNotifications()">🧹 ล้างที่อ่านแล้ว</button></div><div class="notification-list">${rows.length?rows.map(renderNotificationItem).join(""):'<div class="empty-state">ยังไม่มีการแจ้งเตือน</div>'}</div><div class="form-actions"><button class="btn primary" onclick="closeModal()">ปิด</button></div></div></div>`;
}
async function markAllNotificationsRead(){
  if(!isAdminUser())return;
  const snap=await db.collection("notifications").where("userId","==",currentUserProfile.uid).get();
  const batch=db.batch(); snap.docs.filter(d=>!d.data().read).forEach(d=>batch.update(d.ref,{read:true,readAt:firebase.firestore.FieldValue.serverTimestamp()}));
  if(snap.docs.length)await batch.commit(); toast("ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว"); openNotifications();
}
async function clearReadNotifications(){
  if(!isAdminUser())return;
  const snap=await db.collection("notifications").where("userId","==",currentUserProfile.uid).get();
  const batch=db.batch(); snap.docs.filter(d=>d.data().read).forEach(d=>batch.delete(d.ref));
  if(snap.docs.length)await batch.commit(); toast("ล้างการแจ้งเตือนที่อ่านแล้ว"); openNotifications();
}

function subscribeAdminChat(){
  if(chatUnsubscribe)chatUnsubscribe();
  if(!isAdminUser())return;
  chatUnsubscribe=db.collection("adminChatMessages").orderBy("createdAt","asc").limitToLast(200).onSnapshot(s=>{
    window.adminChatMessages=s.docs.map(d=>({docId:d.id,...d.data()}));
    renderChatMessages();
  },err=>console.warn("admin chat",err));
}
function renderChatMessages(){
  const box=document.getElementById("chatMessages"); if(!box)return;
  const rows=window.adminChatMessages||[];
  box.innerHTML=rows.length?rows.map(m=>{
    const mine=m.senderId===currentUserProfile?.uid;
    const mentions=(m.mentions||[]).map(x=>`@${esc(x.name||x.uid)}`).join(" ");
    const reply=m.replyToName?`<div class="chat-reply">↩ ${esc(m.replyToName)}: ${esc(m.replyToText||"")}</div>`:"";
    return `<div class="chat-message ${mine?'mine':''}" data-message-id="${escAttr(m.docId)}" oncontextmenu="openChatContextMenu(event,'${escAttr(m.docId)}')"><div class="chat-avatar" title="${escAttr(m.senderName||m.senderEmail||"Admin")}">${esc((m.senderAvatar||((adminDirectory||[]).find(a=>a.uid===m.senderId)?.avatarEmoji)||"👤"))}</div><div><div class="chat-bubble"><strong>${esc(m.senderName||m.senderEmail||"Admin")}</strong>${reply}<p>${renderMentions(m.message||"")}</p>${m.editedAt?'<small class="edited-label">แก้ไขแล้ว</small>':''}</div><small>${esc(formatDate(m.createdAt))}</small></div></div>`;
  }).join(""):'<div class="empty-state">ยังไม่มีข้อความ เริ่มคุยกับทีม Admin ได้เลย</div>';
  box.scrollTop=box.scrollHeight;
}
function renderMentions(text){
  let safe=esc(text);
  (adminDirectory||[]).forEach(a=>{
    const names=[a.displayName,a.username,a.email].filter(Boolean).map(esc).sort((x,y)=>y.length-x.length);
    names.forEach(n=>{if(n)safe=safe.replace(new RegExp(`@${escapeRegExp(n)}(?=\\s|$)`,'g'),`<span class="chat-mention">@${n}</span>`);});
  });
  return safe;
}
function escapeRegExp(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}

function subscribeAdminDirectory(){
  if(adminDirectoryUnsubscribe)adminDirectoryUnsubscribe();
  if(!isAdminUser())return;
  adminDirectoryUnsubscribe=db.collection("users").where("role","==","admin").onSnapshot(s=>{
    adminDirectory=s.docs.map(d=>({uid:d.id,...d.data()}));
    renderAdminDirectory();
    renderDashboard();
  },e=>console.warn("admin directory",e));
}
async function loadAdminDirectory(){
  if(!isAdminUser())return;
  try{const s=await db.collection("users").where("role","==","admin").get(); adminDirectory=s.docs.map(d=>({uid:d.id,...d.data()})); renderAdminDirectory();}catch(e){console.warn(e);}
}
function renderAdminDirectory(){
  const box=document.getElementById("adminMembersList"), label=document.getElementById("adminCountLabel"); if(!box)return;
  if(label)label.textContent=`${adminDirectory.length} Admin`;
  box.innerHTML=adminDirectory.map(a=>{
    const online=a.online===true && (Date.now()-dateValue(a.lastSeen||0)<90000);
    return `<div class="admin-member"><span class="member-avatar">${esc(a.avatarEmoji||"👤")}</span><span><strong>${esc(a.displayName||a.username||a.email||"Admin")}</strong><small>${online?'🟢 ออนไลน์':`⚪ ออฟไลน์${a.lastSeen?` • ${esc(formatDate(a.lastSeen))}`:''}`}</small></span><i class="presence-dot ${online?'online':'offline'}">●</i></div>`;
  }).join("")||'<div class="empty-state">ยังไม่พบ Admin</div>';
}
async function startPresence(){
  if(!currentUserProfile?.uid)return;
  const update=async()=>{
    try{await db.collection("users").doc(currentUserProfile.uid).set({online:true,lastSeen:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});}catch(e){console.warn("presence",e);}
  };
  await update();
  if(presenceTimer)clearInterval(presenceTimer);
  presenceTimer=setInterval(update,30000);
  document.addEventListener('visibilitychange',update,{passive:true});
  window.addEventListener('beforeunload',()=>{try{db.collection("users").doc(currentUserProfile.uid).set({online:false,lastSeen:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});}catch(e){}},{once:true});
}
function getMentionCandidates(text){
  const found=[];
  const raw=String(text||'');
  (adminDirectory||[]).forEach(a=>{
    [a.displayName,a.username,a.email].filter(Boolean).forEach(name=>{
      const token='@'+String(name);
      if(raw.toLowerCase().includes(token.toLowerCase()) && !found.some(x=>x.uid===a.uid)){
        found.push({uid:a.uid,name:a.displayName||a.username||a.email});
      }
    });
  });
  return found;
}
function showMentionSuggestions(){
  const input=document.getElementById('chatInput'), box=document.getElementById('mentionSuggestions'); if(!input||!box)return;
  const before=input.value.slice(0,input.selectionStart||input.value.length); const m=before.match(/@([^\s@]*)$/);
  if(!m){box.classList.add('hidden');return;}
  const q=m[1].toLowerCase();
  const rows=adminDirectory.filter(a=>[a.displayName,a.username,a.email].some(v=>String(v||'').toLowerCase().includes(q))).slice(0,8);
  box.innerHTML=rows.map(a=>`<button type="button" onclick="insertMention('${escAttr(a.displayName||a.username||a.email)}')">👤 ${esc(a.displayName||a.username||a.email)}</button>`).join('');
  box.classList.toggle('hidden',!rows.length);
}
function insertMention(name){
  const input=document.getElementById('chatInput'); if(!input)return;
  const start=input.selectionStart||input.value.length, before=input.value.slice(0,start), after=input.value.slice(start); const replaced=before.replace(/@([^\s@]*)$/,'@'+name+' '); input.value=replaced+after; input.focus(); input.selectionStart=input.selectionEnd=replaced.length; document.getElementById('mentionSuggestions')?.classList.add('hidden');
}
async function sendAdminChat(e){
  e.preventDefault(); if(!isAdminUser())return;
  const input=document.getElementById("chatInput"); const message=input.value.trim(); if(!message)return;
  const mentions=getMentionCandidates(message);
  try{
    await db.collection("adminChatMessages").add({message,senderId:currentUserProfile.uid,senderName:currentUserProfile.displayName||currentUserProfile.username||"Admin",senderEmail:currentUserProfile.email||auth.currentUser?.email||"",senderAvatar:currentUserProfile.avatarEmoji||"👤",mentions,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    const mentionIds=mentions.map(x=>x.uid);
    if(mentionIds.length)await notifyUsers(mentionIds,"มีการ @Mention ถึงคุณใน Admin Chat",`${currentUserProfile.displayName||"Admin"}: ${message}`,{type:'mention',icon:'💬'});
    input.value=""; document.getElementById('mentionSuggestions')?.classList.add('hidden');
  }catch(err){console.error(err);toast("ส่งข้อความไม่สำเร็จ: "+(err.code==="permission-denied"?"ตรวจสอบ Firestore Rules":"ลองใหม่"));}
}
async function editChatMessage(id){
  if(!isAdminUser())return;
  const m=(window.adminChatMessages||[]).find(x=>x.docId===id); if(!m||m.senderId!==currentUserProfile.uid)return toast("แก้ไขได้เฉพาะข้อความของตัวเอง");
  const next=prompt("แก้ไขข้อความ",m.message||""); if(next===null)return; const message=next.trim(); if(!message)return;
  const mentions=getMentionCandidates(message);
  try{await db.collection('adminChatMessages').doc(id).update({message,mentions,editedAt:firebase.firestore.FieldValue.serverTimestamp()}); toast('แก้ไขข้อความแล้ว');}
  catch(e){console.error(e);toast('แก้ไขข้อความไม่สำเร็จ');}
}
async function deleteChatMessage(id){
  if(!isAdminUser())return;
  const m=(window.adminChatMessages||[]).find(x=>x.docId===id); if(!m||m.senderId!==currentUserProfile.uid)return toast("ลบได้เฉพาะข้อความของตัวเอง");
  if(!confirm('ลบข้อความนี้หรือไม่?'))return;
  try{await db.collection('adminChatMessages').doc(id).delete();toast('ลบข้อความแล้ว');}catch(e){console.error(e);toast('ลบข้อความไม่สำเร็จ');}
}
function openChatContextMenu(e,id){
  e.preventDefault(); const m=(window.adminChatMessages||[]).find(x=>x.docId===id); if(!m)return;
  if(!m.senderId||m.senderId!==currentUserProfile?.uid)return;
  closeChatContextMenu();
  const menu=document.createElement('div'); menu.id='chatContextMenu'; menu.className='chat-context-menu'; menu.style.left=`${Math.min(e.clientX,window.innerWidth-170)}px`; menu.style.top=`${Math.min(e.clientY,window.innerHeight-100)}px`; menu.innerHTML=`<button onclick="editChatMessage('${escAttr(id)}');closeChatContextMenu()">✏️ แก้ไขข้อความ</button><button class="danger-text" onclick="deleteChatMessage('${escAttr(id)}');closeChatContextMenu()">🗑️ ลบข้อความ</button>`; document.body.appendChild(menu); chatContextMenuEl=menu;
}
function closeChatContextMenu(){if(chatContextMenuEl){chatContextMenuEl.remove();chatContextMenuEl=null;}}
document.addEventListener('click',e=>{if(!e.target.closest('#chatContextMenu'))closeChatContextMenu();});

async function loadPlantComments(plantId){
  const box=document.getElementById(`plantComments_${plantId}`); if(!box)return;
  try{const snap=await db.collection("plantComments").where("plantId","==",plantId).get(); const rows=snap.docs.map(d=>({docId:d.id,...d.data()})).sort((a,b)=>dateValue(a.createdAt)-dateValue(b.createdAt)); commentCache[plantId]=rows; box.innerHTML=rows.length?rows.map(c=>`<article class="comment-item"><div class="comment-avatar">👤</div><div class="comment-content"><div><strong>${esc(c.authorName||c.authorEmail||"ผู้ใช้")}</strong><small>${esc(formatDate(c.createdAt))}${c.editedAt?' • แก้ไขแล้ว':''}</small></div><p>${esc(c.message||"")}</p>${c.fieldLabel?`<span class="comment-field">จุดที่เกี่ยวข้อง: ${esc(c.fieldLabel)}</span>`:""}${isAdminUser()&&c.authorId===currentUserProfile.uid?`<div class="comment-actions"><button class="btn ghost small" onclick="editPlantComment('${escAttr(c.docId)}','${escAttr(plantId)}')">✏️ แก้ไข</button><button class="btn danger small" onclick="deletePlantComment('${escAttr(c.docId)}','${escAttr(plantId)}')">🗑️ ลบ</button></div>`:''}</div></article>`).join(''):'<div class="empty-state">ยังไม่มีความคิดเห็นสำหรับข้อมูลนี้</div>';}catch(e){console.error(e);box.innerHTML='<div class="empty-state">โหลดความคิดเห็นไม่สำเร็จ</div>';}
}
async function addPlantComment(e,plantId){
  e.preventDefault(); if(!isAdminUser())return;
  const input=document.getElementById(`commentInput_${plantId}`); const message=input?.value.trim(); if(!message)return;
  const p=plants.find(x=>x.id===plantId); if(!p)return;
  try{
    const ref=await db.collection("plantComments").add({plantId,plantName:p.thaiName||"",ownerId:p.createdBy||"",authorId:currentUserProfile.uid,authorName:currentUserProfile.displayName||currentUserProfile.username||"Admin",authorEmail:currentUserProfile.email||"",message,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    await logActivity("comment",p);
    await notifyAllAdmins("มีความคิดเห็นใหม่ในข้อมูลพืช",`${currentUserProfile.displayName||'Admin'} แสดงความคิดเห็นใน ${plantId} • ${message}`,{plantId,type:'comment',icon:'💬'});
    input.value=""; await loadPlantComments(plantId); toast("เพิ่มความคิดเห็นแล้ว");
  }catch(err){console.error(err);toast("เพิ่มความคิดเห็นไม่สำเร็จ: "+(err.code==='permission-denied'?'ตรวจสอบ Firestore Rules':'ลองใหม่'));}
}
async function editPlantComment(id,plantId){
  if(!isAdminUser())return;
  const c=(commentCache[plantId]||[]).find(x=>x.docId===id); if(!c||c.authorId!==currentUserProfile.uid)return toast('แก้ไขได้เฉพาะความคิดเห็นของตัวเอง');
  const message=prompt('แก้ไขความคิดเห็น',c.message||''); if(message===null)return; const text=message.trim(); if(!text)return;
  try{await db.collection('plantComments').doc(id).update({message:text,editedAt:firebase.firestore.FieldValue.serverTimestamp()}); const p=plants.find(x=>x.id===plantId); if(p){await logActivity('comment_edit',p);await notifyAllAdmins('มีการแก้ไขความคิดเห็น',`${currentUserProfile.displayName||'Admin'} แก้ไขความคิดเห็นใน ${plantId}`,{plantId,type:'comment_edit',icon:'✏️'});} await loadPlantComments(plantId);toast('แก้ไขความคิดเห็นแล้ว');}catch(e){console.error(e);toast('แก้ไขความคิดเห็นไม่สำเร็จ');}
}
async function deletePlantComment(id,plantId){
  if(!isAdminUser())return;
  const c=(commentCache[plantId]||[]).find(x=>x.docId===id); if(!c||c.authorId!==currentUserProfile.uid)return toast('ลบได้เฉพาะความคิดเห็นของตัวเอง');
  if(!confirm('ลบความคิดเห็นนี้หรือไม่?'))return;
  try{await db.collection('plantComments').doc(id).delete(); const p=plants.find(x=>x.id===plantId); if(p){await logActivity('comment_delete',p);await notifyAllAdmins('ความคิดเห็นถูกลบ',`${currentUserProfile.displayName||'Admin'} ลบความคิดเห็นใน ${plantId}`,{plantId,type:'comment_delete',icon:'🗑️'});} await loadPlantComments(plantId);toast('ลบความคิดเห็นแล้ว');}catch(e){console.error(e);toast('ลบความคิดเห็นไม่สำเร็จ');}
}

async function openTaskComposer(plantId="",taskId=""){
  if(!isAdminUser()){toast("ฟังก์ชันนี้สำหรับ Admin");return;}
  await loadAdminDirectory();
  const existing=taskId?(window.adminTasks||[]).find(x=>x.docId===taskId):null;
  if(existing && existing.createdBy!==currentUserProfile.uid){toast('แก้ไขได้เฉพาะผู้ที่ปักหมุดงานนี้');return;}
  const p=plantId?plants.find(x=>x.id===plantId):existing?plants.find(x=>x.id===existing.plantId):null;
  const fields=FIELDS.flatMap(([section,fs])=>fs.map(([key,label])=>({key,label,section})));
  const ownerAdmin=p&&adminDirectory.some(a=>a.uid===p.createdBy)?p.createdBy:"";
  const data=existing||{};
  document.getElementById("modalRoot").innerHTML=`<div class="modal-backdrop" onclick="closeModal(event)"><div class="modal task-modal" onclick="event.stopPropagation()"><div class="modal-head"><div><span class="eyebrow">PINNED WORK</span><h2>📌 ${existing?'แก้ไขงานปักหมุด':'ปักหมุดงานแก้ไข'}</h2><p class="modal-subtitle">ระบุจุดที่ต้องแก้และส่งต่อให้ Admin คนอื่นทำต่อ</p></div><button class="icon-btn" onclick="closeModal()">×</button></div><div class="task-form-grid"><label>ข้อมูลพืช<select id="taskPlant">${plants.filter(x=>!x.isDeleted).map(x=>`<option value="${escAttr(x.id)}" ${x.id===(data.plantId||plantId)?'selected':''}>${esc(x.id)} — ${esc(x.thaiName||"ไม่ระบุ")}</option>`).join("")}</select></label><label>จุดที่ต้องแก้<select id="taskField"><option value="">ทั้งรายการ</option>${fields.map(f=>`<option value="${escAttr(f.key)}" ${f.key===(data.fieldKey||'')?'selected':''}>${esc(f.label)}</option>`).join("")}</select></label><label>มอบหมายให้ Admin<select id="taskAssignee">${adminDirectory.map(a=>`<option value="${escAttr(a.uid)}" ${a.uid===(data.assigneeId||ownerAdmin)?'selected':''}>${esc(a.displayName||a.username||a.email||"Admin")}</option>`).join("")}</select></label><label class="full">หมายเหตุ / สิ่งที่ควรแก้<textarea id="taskNote" rows="5" maxlength="2000" placeholder="เช่น ตรวจสอบแหล่งอ้างอิงส่วนความเชื่อ และเติมข้อมูลความเป็นพิษต่อแมว">${esc(data.note||'')}</textarea></label></div><div class="form-actions"><button class="btn ghost" onclick="closeModal()">ยกเลิก</button><button class="btn primary" onclick="${existing?'updateFixTask':'createFixTask'}('${existing?escAttr(existing.docId):''}')">${existing?'บันทึกการแก้ไข':'📌 ปักหมุดและแจ้ง Admin'}</button></div></div></div>`;
}
async function createFixTask(){
  const plantId=document.getElementById("taskPlant")?.value; const fieldKey=document.getElementById("taskField")?.value||""; const assigneeId=document.getElementById("taskAssignee")?.value; const note=document.getElementById("taskNote")?.value.trim();
  const p=plants.find(x=>x.id===plantId); if(!p||!assigneeId||!note){toast("กรุณากรอกข้อมูลให้ครบ");return;}
  const fieldLabel=fieldLabelMap()[fieldKey]||"ทั้งรายการ"; const assignee=adminDirectory.find(a=>a.uid===assigneeId);
  try{const ref=await db.collection("adminTasks").add({plantId,plantName:p.thaiName||"",fieldKey,fieldLabel,note,assigneeId,assigneeName:assignee?.displayName||assignee?.username||assignee?.email||"Admin",createdBy:currentUserProfile.uid,createdByName:currentUserProfile.displayName||currentUserProfile.username||"Admin",status:"in_progress",pinned:true,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}); await logActivity("task_create",p); await notifyAllAdmins("มีงานปักหมุดใหม่",`${currentUserProfile.displayName||'Admin'} ปักหมุด ${plantId} ให้ ${assignee?.displayName||'Admin'} • ${fieldLabel}`,{plantId,taskId:ref.id,type:'task_create',icon:'📌'}); if(assigneeId!==currentUserProfile.uid)await notifyUsers([assigneeId],"มีงานปักหมุดมอบหมายถึงคุณ",`${plantId} • ${fieldLabel} • ${note}`,{plantId,taskId:ref.id,type:'task_assigned',icon:'📌'}); closeModal(); toast("ปักหมุดงานและแจ้งทีมแล้ว");}
  catch(err){console.error(err);toast("สร้างงานไม่สำเร็จ: "+(err.code==="permission-denied"?"ตรวจสอบ Firestore Rules":"ลองใหม่"));}
}
async function updateFixTask(id){
  if(!isAdminUser())return; const task=(window.adminTasks||[]).find(x=>x.docId===id); if(!task||task.createdBy!==currentUserProfile.uid){toast('แก้ไขได้เฉพาะผู้ปักหมุด');return;}
  const plantId=document.getElementById('taskPlant')?.value, fieldKey=document.getElementById('taskField')?.value||'', assigneeId=document.getElementById('taskAssignee')?.value, note=document.getElementById('taskNote')?.value.trim(); const p=plants.find(x=>x.id===plantId); if(!p||!assigneeId||!note)return toast('กรุณากรอกข้อมูลให้ครบ'); const assignee=adminDirectory.find(a=>a.uid===assigneeId); const fieldLabel=fieldLabelMap()[fieldKey]||'ทั้งรายการ';
  try{await db.collection('adminTasks').doc(id).update({plantId,plantName:p.thaiName||'',fieldKey,fieldLabel,note,assigneeId,assigneeName:assignee?.displayName||assignee?.username||assignee?.email||'Admin',updatedAt:firebase.firestore.FieldValue.serverTimestamp()}); await logActivity('task_edit',p); await notifyAllAdmins('มีการแก้ไขงานปักหมุด',`${currentUserProfile.displayName||'Admin'} แก้ไขงาน ${plantId} • ${fieldLabel}`,{plantId,taskId:id,type:'task_edit',icon:'✏️'}); closeModal();toast('แก้ไขงานปักหมุดแล้ว');}catch(e){console.error(e);toast('แก้ไขงานปักหมุดไม่สำเร็จ');}
}
async function deleteFixTask(id){
  if(!isAdminUser())return; const task=(window.adminTasks||[]).find(x=>x.docId===id); if(!task||task.createdBy!==currentUserProfile.uid){toast('ลบได้เฉพาะผู้ปักหมุด');return;} if(!confirm('ลบการปักหมุดนี้หรือไม่?'))return;
  try{await db.collection('adminTasks').doc(id).delete(); const p=plants.find(x=>x.id===task.plantId); if(p){await logActivity('task_delete',p);await notifyAllAdmins('มีการลบงานปักหมุด',`${currentUserProfile.displayName||'Admin'} ลบงาน ${task.plantId} • ${task.fieldLabel||'ทั้งรายการ'}`,{plantId:task.plantId,taskId:id,type:'task_delete',icon:'🗑️'});} toast('ลบการปักหมุดแล้ว');}catch(e){console.error(e);toast('ลบการปักหมุดไม่สำเร็จ');}
}
function subscribeTasks(){
  if(taskUnsubscribe)taskUnsubscribe(); if(!currentUserProfile?.uid || !isAdminUser())return;
  taskUnsubscribe=db.collection("adminTasks").limit(100).onSnapshot(s=>{window.adminTasks=s.docs.map(d=>({docId:d.id,...d.data()})); renderDashboardTasks();},e=>console.warn("tasks",e));
}
function renderDashboardTasks(){
  const box=document.getElementById("dashboardTasks"); if(!box)return; const rows=(window.adminTasks||[]).slice(0,20);
  box.innerHTML=rows.length?rows.map(t=>{const mine=t.assigneeId===currentUserProfile?.uid, creator=t.createdBy===currentUserProfile?.uid, done=t.status==='completed'; return `<article class="task-card ${done?'task-done':''}"><div class="task-pin">📌</div><div><strong>${esc(t.plantId)} • ${esc(t.plantName||"")}</strong><span>${esc(t.fieldLabel||"ทั้งรายการ")} • มอบหมายให้ ${esc(t.assigneeName||"Admin")}</span><p>${esc(t.note||"")}</p><small>ปักหมุดโดย ${esc(t.createdByName||"Admin")} • ${esc(formatDate(t.createdAt))}</small><div class="task-status ${done?'done':'progress'}">${done?'🟢 สำเร็จ':'🟡 กำลังดำเนินการ'}</div></div><div class="task-actions"><button class="btn ghost" onclick="viewPlant('${escAttr(t.plantId)}')">เปิดข้อมูล</button>${creator?`<button class="btn ghost small" onclick="openTaskComposer('', '${escAttr(t.docId)}')">✏️ แก้ไข</button><button class="btn danger small" onclick="deleteFixTask('${escAttr(t.docId)}')">🗑️ ลบ</button>`:''}${mine&&!done?`<button class="btn primary" onclick="completeTask('${escAttr(t.docId)}')">✓ ทำสำเร็จ</button>`:''}</div></article>`;}).join(''):'<div class="empty-state">ยังไม่มีงานที่ปักหมุด</div>';
}
async function completeTask(id){
  if(!isAdminUser())return; const task=(window.adminTasks||[]).find(x=>x.docId===id); if(!task||task.assigneeId!==currentUserProfile.uid){toast('เฉพาะ Admin ที่ถูกมอบหมายเท่านั้นที่กดสำเร็จได้');return;} if(task.status==='completed')return;
  try{await db.collection("adminTasks").doc(id).update({status:"completed",completedBy:currentUserProfile.uid,completedByName:currentUserProfile.displayName||currentUserProfile.username||"Admin",completedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}); const p=plants.find(x=>x.id===task.plantId); if(p)await logActivity("task_complete",p); await notifyAllAdmins("งานปักหมุดสำเร็จ",`${currentUserProfile.displayName||'Admin'} ทำงาน ${task.plantId} สำเร็จแล้ว`,{plantId:task.plantId,taskId:id,type:'task_complete',icon:'✅'}); toast("ปิดงานที่ปักหมุดแล้ว");}catch(e){console.error(e);toast("ปิดงานไม่สำเร็จ");}
}
function openTaskBoard(){showPage("home");}
function activityActionLabel(action){
  return ({create:"เพิ่มข้อมูลพืช",update:"แก้ไขข้อมูลพืช",permanent_delete:"ลบข้อมูลถาวร",restore:"กู้คืนข้อมูลจากถังขยะ",delete_request:"ส่งคำขอลบข้อมูล",comment:"แสดงความคิดเห็น",comment_edit:"แก้ไขความคิดเห็น",comment_delete:"ลบความคิดเห็น",task_create:"สร้างงานปักหมุด",task_edit:"แก้ไขงานปักหมุด",task_delete:"ลบงานปักหมุด",task_complete:"ทำงานปักหมุดสำเร็จ"}[action]||action||"ทำรายการ");
}
function activityActionIcon(action){
  return ({create:"🌱",update:"✏️",permanent_delete:"🗑️",restore:"♻️",delete_request:"📨",comment:"💬",comment_edit:"✏️",comment_delete:"🗑️",task_create:"📌",task_edit:"✏️",task_delete:"🗑️",task_complete:"✅"}[action]||"•");
}
function subscribeActivityLogs(){
  if(activityUnsubscribe)activityUnsubscribe();
  if(!currentUserProfile?.uid || !isAdminUser())return;
  activityUnsubscribe=db.collection("activityLogs").orderBy("createdAt","desc").limit(30).onSnapshot(s=>{window.teamActivityLogs=s.docs.map(d=>({docId:d.id,...d.data()}));renderTeamActivity();},e=>{console.warn("activity logs",e);renderTeamActivity();});
}
function renderTeamActivity(){
  const box=document.getElementById("dashboardTeamActivity");if(!box)return;
  const rows=(window.teamActivityLogs||[]).slice(0,8);
  box.innerHTML=rows.length?rows.map(r=>`<article class="team-activity-item"><span class="team-activity-icon">${activityActionIcon(r.action)}</span><div class="team-activity-main"><strong>${esc(r.userName||r.userEmail||"Admin")}</strong><span>${esc(activityActionLabel(r.action))}${r.plantId?` • ${esc(r.plantId)}`:""}</span><small>${esc(formatDate(r.createdAt))}</small></div></article>`).join(""):'<div class="empty-state team-activity-empty">ยังไม่มีกิจกรรมของทีม</div>';
}
function openActivityLog(){
  if(!isAdminUser())return;
  const rows=(window.teamActivityLogs||[]);
  document.getElementById("modalRoot").innerHTML=`<div class="modal-backdrop" onclick="closeModal(event)"><div class="modal activity-modal" onclick="event.stopPropagation()"><div class="modal-head"><div><span class="eyebrow">TEAM ACTIVITY</span><h2>📋 กิจกรรมของทีม</h2><p class="modal-subtitle">รายการการทำงานล่าสุดของ Admin</p></div><button class="icon-btn" onclick="closeModal()">×</button></div><div class="activity-full-list">${rows.length?rows.map(r=>`<article class="team-activity-item"><span class="team-activity-icon">${activityActionIcon(r.action)}</span><div class="team-activity-main"><strong>${esc(r.userName||r.userEmail||"Admin")}</strong><span>${esc(activityActionLabel(r.action))}${r.plantId?` • ${esc(r.plantId)}`:""}</span><small>${esc(formatDate(r.createdAt))}</small></div></article>`).join(""):'<div class="empty-state">ยังไม่มีกิจกรรมของทีม</div>'}</div></div></div>`;
}
function renderDashboard(){
  const stats=document.getElementById("dashboardStats"); if(!stats)return;
  const active=plants.filter(p=>!p.isDeleted).length;
  const trash=plants.filter(p=>p.isDeleted).length;
  const my=plants.filter(p=>p.createdBy===currentUserProfile?.uid&&!p.isDeleted).length;
  const unread=window.userNotifications?.filter(n=>!n.read).length ?? 0;
  stats.innerHTML=`
    <div class="dash-stat"><span>🌱</span><strong>${active}</strong><small>ข้อมูลใช้งาน</small></div>
    <div class="dash-stat"><span>🔔</span><strong>${unread}</strong><small>แจ้งเตือนที่ยังไม่อ่าน</small></div>
    <div class="dash-stat"><span>📝</span><strong>${my}</strong><small>ข้อมูลที่ฉันลงแล้ว</small></div>
    <div class="dash-stat"><span>🗑️</span><strong>${trash}</strong><small>ข้อมูลในถังขยะ</small></div>`;
  const latest=drafts?.[0];
  const hint=document.getElementById("dashboardDraftHint");
  if(hint) hint.textContent=latest
    ? `${latest.draftName||latest.data?.thaiName||"Draft ล่าสุด"} • ${formatDate(latest.updatedAt)}`
    : "ยังไม่มี Draft ของคุณ";
}

function continueLatestDraft(){
  if(!isAdminUser())return;
  if(!drafts?.length){
    showPage("entry");
    toast("ยังไม่มี Draft ล่าสุด กรุณาเริ่มกรอกข้อมูลใหม่");
    return;
  }
  continueDraft(drafts[0].docId);
}

function fieldLabelMap(){const m={};FIELDS.forEach(([s,fs])=>fs.forEach(([k,l])=>m[k]=l));return m}

function buildExportTree(){
  const wrap=document.getElementById("exportTree");
  wrap.innerHTML=CATEGORIES.map(c=>{
    const ps=plants.filter(p=>p.categoryCode===c.code && !p.isDeleted);
    return `<div class="export-cat"><label class="export-cat-title"><input type="checkbox" onchange="toggleCategoryExport('${c.code}',this.checked)"> ${c.icon} ${c.name} <span style="margin-left:auto;color:#839087;font-size:11px">${ps.length}</span></label>
      <div class="export-plants">${ps.map(p=>`<label><input type="checkbox" class="export-item" value="${escAttr(p.id)}" ${exportSelected.has(p.id)?"checked":""} onchange="toggleExport('${escAttr(p.id)}',this.checked)"> ${esc(p.id)} — ${esc(p.thaiName)}</label>`).join("")}</div>
    </div>`;
  }).join("");
  updateExportCount();
}
function toggleExport(id,on){on?exportSelected.add(id):exportSelected.delete(id);updateExportCount()}
function toggleCategoryExport(code,on){plants.filter(p=>p.categoryCode===code).forEach(p=>on?exportSelected.add(p.id):exportSelected.delete(p.id));buildExportTree()}
function toggleAllExport(on){plants.forEach(p=>on?exportSelected.add(p.id):exportSelected.delete(p.id));buildExportTree()}
function updateExportCount(){document.getElementById("selectedExportCount").textContent=`${exportSelected.size} รายการ`}
function safeSheetName(s){return String(s).replace(/[\\/?*\[\]:]/g," ").slice(0,28)||"Plant"}
function exportXlsx(){
  if(!exportSelected.size){toast("กรุณาเลือกข้อมูลที่ต้องการส่งออกก่อน");return}
  if(typeof XLSX==="undefined"){toast("โหลดตัวสร้าง Excel ไม่สำเร็จ กรุณาเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่");return}
  const selected=plants.filter(p=>exportSelected.has(p.id) && !p.isDeleted); const wb=XLSX.utils.book_new(); const labels=fieldLabelMap();
  CATEGORIES.forEach(c=>{
    const rows=selected.filter(p=>p.categoryCode===c.code);
    if(!rows.length)return;
    const data=rows.map(p=>{
      const o={ID:p.id,"ชื่อไทย":p.thaiName,"ชื่อวิทยาศาสตร์":p.scientificName,"ชื่ออังกฤษ":p.englishName,"วันที่ลงข้อมูล":formatDate(p.createdAt),"ผู้ลงข้อมูล":p.createdByName||p.createdByEmail||""};
      Object.keys(labels).forEach(k=>{if(!["thaiName","scientificName","englishName"].includes(k))o[labels[k]]=p[k]||""});
      return o;
    });
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data),safeSheetName(`${c.code}_${c.name}`));
  });
  selected.forEach(p=>{
    const base={ID:p.id,"หมวดหมู่":CATEGORIES.find(c=>c.code===p.categoryCode)?.name||"",...p};
    const data=Object.entries(base)
      .filter(([k])=>!["id","categoryCode","docId","createdBy","updatedBy"].includes(k))
      .map(([k,v])=>({หัวข้อ:labels[k]||k,ข้อมูล:formatDetailValue(v)||""}));
    if(p.createdByName)data.push({หัวข้อ:"ผู้ลงข้อมูล",ข้อมูล:p.createdByName});
    if(p.createdByEmail)data.push({หัวข้อ:"อีเมลผู้ลงข้อมูล",ข้อมูล:p.createdByEmail});
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(data.map(x=>[x.หัวข้อ,x.ข้อมูล])),safeSheetName(`${p.id}_${p.thaiName}`));
  });
  XLSX.writeFile(wb,`mongkol-mai-${new Date().toISOString().slice(0,10)}.xlsx`);
  toast("สร้างไฟล์ Excel เรียบร้อยแล้ว");
}

function getExportRows(){
  const selected=plants.filter(p=>exportSelected.has(p.id) && !p.isDeleted);
  const labels=fieldLabelMap();
  return selected.map(p=>{
    const row={ID:p.id,"หมวดหมู่":CATEGORIES.find(c=>c.code===p.categoryCode)?.name||""};
    Object.keys(labels).forEach(k=>{
      row[labels[k]]=formatDetailValue(p[k]??"");
    });
    row["วันที่ลงข้อมูล"]=formatDate(p.createdAt);
    row["ผู้ลงข้อมูล"]=p.createdByName||p.createdByEmail||"";
    row["แก้ไขล่าสุด"]=formatDate(p.updatedAt);
    row["ผู้แก้ไขล่าสุด"]=p.updatedByName||p.updatedByEmail||"";
    return row;
  });
}

function csvEscape(value){
  const s=String(value??"").replace(/\r?\n/g," ");
  return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;
}

function downloadBlob(filename, content, mime){
  const blob=new Blob([content],{type:mime});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function exportCsv(){
  if(!exportSelected.size){toast("กรุณาเลือกข้อมูลที่ต้องการส่งออกก่อน");return;}
  const rows=getExportRows();
  if(!rows.length){toast("ไม่พบข้อมูลที่เลือก");return;}
  const headers=Object.keys(rows[0]);
  const csv=[headers.map(csvEscape).join(","),...rows.map(row=>headers.map(h=>csvEscape(row[h])).join(","))].join("\r\n");
  // UTF-8 BOM ช่วยให้ Excel/Google Sheets อ่านภาษาไทยได้ถูกต้อง
  downloadBlob(`mongkol-mai-${new Date().toISOString().slice(0,10)}.csv`,`\uFEFF${csv}`,"text/csv;charset=utf-8");
  toast("ดาวน์โหลด CSV เรียบร้อยแล้ว");
}

function exportJson(){
  if(!exportSelected.size){toast("กรุณาเลือกข้อมูลที่ต้องการส่งออกก่อน");return;}
  const selected=plants.filter(p=>exportSelected.has(p.id) && !p.isDeleted).map(p=>{
    const copy={...p};
    delete copy.docId;
    ["createdAt","updatedAt"].forEach(k=>{
      if(copy[k] && typeof copy[k].toDate==="function") copy[k]=copy[k].toDate().toISOString();
    });
    return copy;
  });
  downloadBlob(`mongkol-mai-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(selected,null,2),"application/json;charset=utf-8");
  toast("ดาวน์โหลด JSON เรียบร้อยแล้ว");
}

function formatDetailValue(v){
  if(v && typeof v.toDate==="function")return formatDate(v);
  return String(v??"");
}
function formatDate(v){
  if(!v)return"-";
  const d=v && typeof v.toDate==="function"?v.toDate():new Date(v);
  if(Number.isNaN(d.getTime()))return"-";
  return d.toLocaleString("th-TH",{dateStyle:"medium",timeStyle:"short"});
}
function safeUrl(url){
  const s=String(url||"").trim();
  return /^(https?:\/\/)/i.test(s)?s:"#";
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function escAttr(v){return esc(v).replace(/`/g,"&#096;");}
let toastTimer;
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2800);}