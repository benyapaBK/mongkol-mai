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
    ["humanToxicity","ความเป็นพิษต่อคน","textarea"],["dogToxicity","ความเป็นพิษต่อสุนัข","textarea"],["catToxicity","ความเป็นพิษต่อแมว","textarea"],["toxicParts","ส่วนที่เป็นพิษ","textarea"],["symptoms","อาการที่อาจเกิดขึ้น","textarea"],["caution","ข้อควรระวัง","textarea"]
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
    plants=[];
    currentUserProfile=null;
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
}

function subscribePlants(){
  if(plantsUnsubscribe)plantsUnsubscribe();
  plantsUnsubscribe=db.collection("plants").orderBy("createdAt","desc").onSnapshot(
    snapshot=>{
      plants=snapshot.docs.map(doc=>({docId:doc.id,...doc.data()}));
      updateCount();
      buildLibraryCategories();
      buildExportTree();
      if(libraryCategory)renderPlantList();
    },
    err=>{
      console.error(err);
      toast("โหลดข้อมูลจาก Firestore ไม่สำเร็จ กรุณาตรวจสอบ Firestore Rules");
    }
  );
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
  document.querySelector('[data-page="entry"]')?.classList.toggle("hidden", !admin);
  document.querySelector('[data-page="export"]')?.classList.remove("hidden");
  document.getElementById("libraryAddButton")?.classList.toggle("hidden", !admin);
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
    <button class="category-card" onclick="startNew('${c.code}')">
      <span class="code">${c.code}</span><div class="cat-icon">${c.icon}</div>
      <h3>${c.name}</h3><p>${c.desc}</p>
    </button>`).join("");
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

  const total=plants.length;
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

function viewPlant(id){
  const p=plants.find(x=>x.id===id); if(!p)return;
  const labels=fieldLabelMap();
  document.getElementById("modalRoot").innerHTML=`<div class="modal-backdrop" onclick="closeModal(event)"><div class="modal" onclick="event.stopPropagation()">
    <div class="modal-head"><div><span class="eyebrow">${esc(p.id)} • ${esc(CATEGORIES.find(c=>c.code===p.categoryCode)?.name||"")}</span><h2>${esc(p.thaiName)}</h2><em>${esc(p.scientificName)}</em></div><button class="icon-btn" onclick="closeModal()">×</button></div>
    <div class="detail-grid">
      ${Object.entries(p).filter(([k])=>!["id","categoryCode","docId","image","createdBy","updatedBy"].includes(k)).map(([k,v])=>`<div class="detail-item ${String(v?.toDate?v.toDate():v||"").length>120?"full":""}"><b>${labels[k]||k}</b><span>${esc(formatDetailValue(v))}</span></div>`).join("")}
      ${p.createdByName?`<div class="detail-item"><b>ผู้ลงข้อมูล</b><span>${esc(p.createdByName)}${p.createdByEmail?` (${esc(p.createdByEmail)})`:""}</span></div>`:""}
      ${p.updatedByName?`<div class="detail-item"><b>แก้ไขล่าสุดโดย</b><span>${esc(p.updatedByName)} • ${esc(formatDate(p.updatedAt))}</span></div>`:""}
      ${p.image?`<div class="detail-item full"><b>รูปภาพ</b><div><img src="${safeUrl(p.image)}" style="max-width:240px;border-radius:14px" onerror="this.style.display='none'"><div class="image-link"><a href="${safeUrl(p.image)}" target="_blank" rel="noopener">เปิดลิงก์รูปภาพ</a></div></div></div>`:""}
    </div>
    <div class="form-actions"><button class="btn ghost" onclick="closeModal()">ปิด</button>${isAdminUser()?`<button class="btn primary" onclick="closeModal();editPlant('${escAttr(p.id)}')">แก้ไขข้อมูล</button>`:""}</div>
  </div></div>`;
}
function closeModal(e){if(e && e.target!==e.currentTarget)return;document.getElementById("modalRoot").innerHTML="";}
function editPlant(id){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่สามารถแก้ไขข้อมูลได้");return;}
  const p=plants.find(x=>x.id===id);if(!p)return;
  selectedCategory=CATEGORIES.find(c=>c.code===p.categoryCode);editingId=id;
  showPage("entry");document.getElementById("categoryPicker").classList.add("hidden");document.getElementById("formWrap").classList.remove("hidden");
  document.getElementById("formTitle").textContent=`แก้ไขข้อมูล ${p.id}`;document.getElementById("selectedCategoryName").textContent=selectedCategory.name;document.getElementById("nextId").textContent=p.id;
  buildForm(p);
}
async function deletePlant(id){
  if(!isAdminUser()){toast("เฉพาะ Admin เท่านั้นที่สามารถลบข้อมูลได้");return;}
  const p=plants.find(x=>x.id===id); if(!p)return;
  if(!confirm(`ต้องการลบข้อมูล “${p.thaiName}” (${id}) ใช่หรือไม่?`))return;
  if(!confirm(`ยืนยันอีกครั้ง: ลบ ${id} ออกจากคลังข้อมูลถาวร?`))return;
  try{
    await db.collection("plants").doc(p.docId||p.id).delete();
    await logActivity("delete",p);
    toast("ลบข้อมูลเรียบร้อยแล้ว");
  }catch(err){
    console.error(err);
    toast("ลบข้อมูลไม่สำเร็จ: "+(err.code==="permission-denied"?"ไม่มีสิทธิ์ลบข้อมูล":"กรุณาลองใหม่"));
  }
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
