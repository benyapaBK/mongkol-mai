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

document.addEventListener("DOMContentLoaded", () => {
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
    document.getElementById("currentUsername").textContent=currentUserProfile.displayName||currentUserProfile.username||user.email.split("@")[0];
    document.getElementById("currentEmail").textContent=user.email||"";
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
  renderDraftBoard();
}

function subscribePlants(){
  if(plantsUnsubscribe)plantsUnsubscribe();
  plantsUnsubscribe=db.collection("plants").orderBy("createdAt","desc").onSnapshot(
    snapshot=>{
      plants=snapshot.docs.map(doc=>({docId:doc.id,...doc.data()}));
      updateCount();
      buildLibraryCategories();
      buildExportTree();
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
  if(!currentUserProfile?.uid)return;
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

async function logout(){
  try{await auth.signOut();}catch(err){toast("ออกจากระบบไม่สำเร็จ");}
}

function updateCount(){document.getElementById("recordCount").textContent = `${plants.length} รายการ`;}

function isAdminUser(){
  return currentUserProfile?.role === "admin";
}

function updateRoleBasedUI(){
  const admin = isAdminUser();
  const entryNav=document.querySelector('[data-page="entry"]');
  entryNav?.classList.toggle("hidden", !admin);
  document.querySelector('[data-page="export"]')?.classList.remove("hidden");
  document.getElementById("libraryAddButton")?.classList.toggle("hidden", !admin);
  document.getElementById("libraryTrashButton")?.classList.toggle("hidden", !admin);

  // Member ไม่สามารถเพิ่มข้อมูลได้ จึงพาไปหน้าคลังข้อมูลทันทีหลัง Login
  if(!admin){
    showPage("library");
  }
}

function showPage(page){
  if(page === "entry" && !isAdminUser()){
    toast("เฉพาะ Admin เท่านั้นที่สามารถเพิ่มหรือแก้ไขข้อมูลได้");
    return;
  }
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
  document.getElementById(`page-${page}`).classList.add("active-page");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  if(page==="library"){
    buildLibraryCategories();
    initLibrarySearchUI();
    renderPlantList();
  }
  if(page==="export") buildExportTree();
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
    const count=plants.filter(p=>p.categoryCode===c.code).length;
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
    if(key==="space") opts=["เล็ก","เล็ก–กลาง","ปานกลาง","ใหญ่"];
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
      setSaveProgress(40,"กำลังเก็บ Version เดิม...");
      await savePlantVersion(existing,"update");
      setSaveProgress(55,"กำลังบันทึกการแก้ไขข้อมูล...");
      await db.collection("plants").doc(existing.docId||existing.id).set(record,{merge:true});
      setSaveProgress(75,"กำลังบันทึกประวัติการทำงาน...");
      await logActivity("update",record);
      if(draftId)await db.collection("drafts").doc(draftId).delete();
      setSaveProgress(100,"บันทึกข้อมูลเรียบร้อยแล้ว");
      await new Promise(r=>setTimeout(r,500));
      document.getElementById("modalRoot").innerHTML="";
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
    setSaveProgress(35,`กำลังตรวจสอบรหัส ${createdId}...`);
    await db.runTransaction(async tx=>{
      const counterSnap=await tx.get(counterRef);
      const last=counterSnap.exists?Number(counterSnap.data().last||0):0;

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

      tx.set(counterRef,{last:nextCounter},{merge:true});
      tx.set(plantRef,record);
    });

    setSaveProgress(72,`กำลังบันทึก ${createdId} และสร้าง Version แรก...`);
    await savePlantVersion(record,"create");
    await logActivity("create",record);
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
    if(err.code==="permission-denied")message="ไม่มีสิทธิ์เขียน Firestore — บัญชีนี้ต้องมี role = admin";
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
      <div class="form-actions">
        <button class="btn ghost" onclick="closeModal()">ปิด</button>
        ${isAdminUser()?`<button class="btn ghost" onclick="showActivityHistory('${escAttr(p.id)}')">ประวัติการแก้ไข</button><button class="btn ghost" onclick="showVersionHistory('${escAttr(p.id)}')">Version History</button><button class="btn primary" onclick="closeModal();editPlant('${escAttr(p.id)}')">แก้ไขข้อมูล</button>`:""}
      </div>
    </div>
  </div>`;
}

function closeModal(e){if(e && e.target!==e.currentTarget)return;document.getElementById("modalRoot").innerHTML="";}
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
      await db.collection("plants").doc(p.docId||p.id).update({
        isDeleted:true,
        deletedAt:firebase.firestore.FieldValue.serverTimestamp(),
        deletedBy:currentUserProfile.uid,
        deletedByEmail:currentUserProfile.email||auth.currentUser?.email||"",
        deletedByName:currentUserProfile.displayName||currentUserProfile.username||auth.currentUser?.email||"",
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy:currentUserProfile.uid,
        updatedByEmail:currentUserProfile.email||"",
        updatedByName:currentUserProfile.displayName||currentUserProfile.username||""
      });
      await logActivity("delete",p);
      toast("ย้ายข้อมูลเข้าถังขยะแล้ว");
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
          <div class="form-actions"><button class="btn ghost" onclick="closeModal()">ปิด</button></div>
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
  return ({create:"เพิ่มข้อมูล",update:"แก้ไขข้อมูล",delete:"ย้ายเข้าถังขยะ",restore:"กู้คืนข้อมูล",permanent_delete:"ลบถาวร",delete_request:"ส่งคำขอลบ"}[action]||action||"การทำงาน");
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
    await db.collection("plants").doc(p.docId||p.id).update({isDeleted:false,deletedAt:firebase.firestore.FieldValue.delete(),deletedBy:firebase.firestore.FieldValue.delete(),deletedByEmail:firebase.firestore.FieldValue.delete(),deletedByName:firebase.firestore.FieldValue.delete(),updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:currentUserProfile.uid,updatedByEmail:currentUserProfile.email||"",updatedByName:currentUserProfile.displayName||currentUserProfile.username||""});
    await logActivity("restore",p); toast(`กู้คืน ${id} แล้ว`); openTrash();
  }catch(err){console.error(err);toast("กู้คืนไม่สำเร็จ");}
}

async function permanentDeletePlant(id){
  if(!isAdminUser())return;
  const p=plants.find(x=>x.id===id && x.isDeleted); if(!p)return;
  if(!confirm(`ลบ ${id} ถาวรใช่หรือไม่?`))return;
  if(!confirm(`ยืนยันอีกครั้ง การลบถาวรจะไม่สามารถกู้คืนจากถังขยะได้`))return;
  try{
    await db.collection("plants").doc(p.docId||p.id).delete();
    await logActivity("permanent_delete",p);
    toast(`ลบ ${id} ถาวรแล้ว`); openTrash();
  }catch(err){console.error(err);toast("ลบถาวรไม่สำเร็จ");}
}

async function exportFullBackupJson(){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่สำรองฐานข้อมูลทั้งหมดได้");return;}
  try{
    const [plantsSnap,versionsSnap,logsSnap]=await Promise.all([
      db.collection("plants").get(),db.collection("plantVersions").get(),db.collection("activityLogs").get()
    ]);
    const payload={
      exportedAt:new Date().toISOString(),
      exportedBy:currentUserProfile?.email||auth.currentUser?.email||"",
      plants:plantsSnap.docs.map(d=>({docId:d.id,...d.data()})),
      plantVersions:versionsSnap.docs.map(d=>({docId:d.id,...d.data()})),
      activityLogs:logsSnap.docs.map(d=>({docId:d.id,...d.data()}))
    };
    downloadBlob(`mongkol-mai-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(payload,null,2),"application/json;charset=utf-8");
    toast("สร้างไฟล์ Backup JSON เรียบร้อยแล้ว");
  }catch(err){console.error(err);toast("สร้าง Backup ไม่สำเร็จ");}
}

async function exportFullBackupXlsx(){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้น");return;}
  if(typeof XLSX==="undefined"){toast("โหลด Excel ไม่สำเร็จ");return;}
  try{
    const [ps,vs,ls]=await Promise.all([db.collection("plants").get(),db.collection("plantVersions").get(),db.collection("activityLogs").get()]);
    const wb=XLSX.utils.book_new(), labels=fieldLabelMap();
    const plantRows=ps.docs.map(d=>{const p={docId:d.id,...d.data()},o={ID:p.id,"หมวดหมู่":CATEGORIES.find(c=>c.code===p.categoryCode)?.name||""};Object.keys(labels).forEach(k=>o[labels[k]]=formatDetailValue(p[k]??""));o["สถานะ"]=p.isDeleted?"ถังขยะ":"ใช้งาน";o["วันที่ลงข้อมูล"]=formatDate(p.createdAt);o["ผู้ลงข้อมูล"]=p.createdByName||p.createdByEmail||"";o["แก้ไขล่าสุด"]=formatDate(p.updatedAt);o["ผู้แก้ไขล่าสุด"]=p.updatedByName||p.updatedByEmail||"";return o;});
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(plantRows),"Plants");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(vs.docs.map(d=>{const x=d.data();return {plantId:x.plantId,action:x.action,changedBy:x.changedByName||x.changedByEmail||"",createdAt:formatDate(x.createdAt),snapshot:JSON.stringify(x.snapshot||{})};})),"VersionHistory");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(ls.docs.map(d=>{const x=d.data();return {plantId:x.plantId,plantName:x.plantName,action:x.action,user:x.userName||x.userEmail||"",createdAt:formatDate(x.createdAt)};})),"ActivityLogs");
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

function openHelp(){
  const root=document.getElementById("helpRoot");
  if(!root)return;
  const admin=isAdminUser();
  root.innerHTML=`
    <div class="help-backdrop" onclick="closeHelp(event)">
      <section class="help-modal" onclick="event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
        <div class="help-head">
          <div>
            <span class="eyebrow">HELP CENTER</span>
            <h2 id="helpTitle">คู่มือการใช้งาน มงคลไม้</h2>
            <p>คำอธิบายฟังก์ชันสำคัญสำหรับ Admin และ Member พร้อมแนวทางใช้งานอย่างปลอดภัย</p>
          </div>
          <button class="icon-btn" type="button" onclick="closeHelp()" aria-label="ปิด">×</button>
        </div>

        <div class="help-role-banner">
          <span>${admin?"👑":"👤"}</span>
          <div><strong>คุณกำลังใช้งานในสิทธิ์ ${admin?"Admin":"Member"}</strong><small>${admin?"สามารถจัดการข้อมูลหลักและเพิ่ม/แก้ไข/ลบข้อมูลได้":"สามารถดู ค้นหา และส่งออกข้อมูลได้ แต่ไม่สามารถแก้ไขฐานข้อมูล"}</small></div>
        </div>

        <div class="help-grid">
          <article class="help-card"><div class="help-icon">🌱</div><div><h3>เลือกหมวดหมู่และรหัส</h3><p>เลือกหมวดการเจริญเติบโต A–H ระบบจะแนะนำรหัสถัดไป เช่น A01, A02 และกำหนดรหัสจริงเมื่อบันทึกเข้าสู่ระบบ</p></div></article>
          <article class="help-card"><div class="help-icon">💾</div><div><h3>สำรองข้อมูลอัตโนมัติ</h3><p>ระหว่างกรอกข้อมูล ระบบจะสำรองข้อมูลที่มีการเปลี่ยนแปลงลงพื้นที่ข้อมูลสำรองของบัญชีคุณโดยอัตโนมัติหลังหยุดพิมพ์ชั่วครู่ และยังมีปุ่ม “สำรองข้อมูล” สำหรับสั่งเอง</p></div></article>
          <article class="help-card"><div class="help-icon">📌</div><div><h3>กรอกข้อมูลต่อ</h3><p>หน้าแรกมี “กรอกข้อมูลต่อ” แสดงชื่อสำรอง หมวดหมู่ ชื่อพืช รหัสที่คาดการณ์ และเวลาสำรอง คุณสามารถกดกลับมากรอกต่อได้หลังรีเฟรชหรือกลับเข้าระบบใหม่</p></div></article>
          <article class="help-card"><div class="help-icon">🗂️</div><div><h3>บันทึกข้อมูลใหม่ / ต่อข้อมูลเดิม</h3><p>เมื่อกดหมวดหมู่ ระบบจะให้เลือกเริ่มข้อมูลใหม่โดยไม่ลบแบบร่างเดิม หรือเลือกข้อมูลสำรองที่ต้องการกรอกต่อ</p></div></article>
          <article class="help-card"><div class="help-icon">⚠️</div><div><h3>ข้อมูลไม่ครบก็ยืนยันบันทึกได้</h3><p>ระบบจะบอกว่าช่องใดว่างอยู่ก่อนบันทึก คุณเลือกกลับไปกรอกต่อเพื่อกระโดดไปยังช่องแรกที่ยังว่าง หรือยืนยันบันทึกทั้งที่ข้อมูลยังไม่ครบได้</p></div></article>
          <article class="help-card"><div class="help-icon">☁️</div><div><h3>ยืนยันก่อนขึ้นระบบ</h3><p>ก่อนบันทึกจริงจะมีหน้าต่างยืนยัน และระหว่างบันทึกจะแสดงความคืบหน้า เพื่อให้ทราบว่าระบบกำลังเขียนข้อมูลลง Cloud Firestore</p></div></article>
          <article class="help-card"><div class="help-icon">🔎</div><div><h3>คลังข้อมูล</h3><p>ค้นหาได้จากข้อมูลหลายช่องและใช้ตัวกรองประเภท การดูแล แสง น้ำ พื้นที่ และความเหมาะสม เปิดดูรายละเอียดของต้นไม้ได้จากปุ่ม “ดูข้อมูล”</p></div></article>
          <article class="help-card"><div class="help-icon">✏️</div><div><h3>แก้ไขและลบข้อมูล</h3><p>เฉพาะ Admin เท่านั้นที่สามารถแก้ไขหรือลบข้อมูลหลักได้ การลบมีการยืนยันซ้ำเพื่อป้องกันการลบโดยไม่ตั้งใจ</p></div></article>
          <article class="help-card"><div class="help-icon">📤</div><div><h3>ส่งออกข้อมูล</h3><p>เลือกข้อมูลแล้วดาวน์โหลดเป็น Excel (.xlsx), CSV (.csv) หรือ JSON (.json) ได้ ข้อมูลที่ส่งออกมาจาก Cloud Firestore และไม่กระทบข้อมูลต้นฉบับ</p></div></article>
          <article class="help-card"><div class="help-icon">🔐</div><div><h3>ความปลอดภัยและสิทธิ์</h3><p>สิทธิ์สำคัญถูกตรวจสอบที่ Firestore Rules ไม่ใช่แค่การซ่อนปุ่มบนหน้าเว็บ จึงควรเก็บบัญชีและรหัสผ่านของตนเองไว้เป็นความลับ</p></div></article>
          <article class="help-card"><div class="help-icon">📱</div><div><h3>การใช้งานบนโทรศัพท์</h3><p>หน้าเว็บรองรับหน้าจอมือถือ โดยเฉพาะคลังข้อมูลและตัวกรอง หากข้อมูลไม่อัปเดตให้ลองรีเฟรชหน้าใหม่หรือเปิดแท็บใหม่</p></div></article>
          <article class="help-card"><div class="help-icon">🌐</div><div><h3>การเชื่อมต่ออินเทอร์เน็ต</h3><p>การสำรองบน Cloud และการบันทึกเข้าระบบต้องใช้อินเทอร์เน็ต หากการสำรองล้มเหลว ให้ตรวจสอบการเชื่อมต่อก่อนปิดหน้า</p></div></article>
        </div>

        <div class="help-footer">
          <span>💡 บัญชีของคุณจะเห็นข้อมูลสำรองของตัวเองเป็นหลัก</span>
          <button class="btn primary" type="button" onclick="closeHelp()">ปิดคู่มือ</button>
        </div>
      </section>
    </div>`;
}

function closeHelp(event){
  if(event && event.target!==event.currentTarget)return;
  document.getElementById("helpRoot").innerHTML="";
  showPage(isAdminUser()?"entry":"library");
}

function fieldLabelMap(){const m={};FIELDS.forEach(([s,fs])=>fs.forEach(([k,l])=>m[k]=l));return m}

function buildExportTree(){
  const wrap=document.getElementById("exportTree");
  wrap.innerHTML=CATEGORIES.map(c=>{
    const ps=plants.filter(p=>p.categoryCode===c.code);
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
  const selected=plants.filter(p=>exportSelected.has(p.id)); const wb=XLSX.utils.book_new(); const labels=fieldLabelMap();
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
  const selected=plants.filter(p=>exportSelected.has(p.id));
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
  const selected=plants.filter(p=>exportSelected.has(p.id)).map(p=>{
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
