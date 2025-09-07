// ========= FIREBASE CONFIG =========
const firebaseConfig = {
  apiKey: "AIzaSyAtVqyjeLLtWJisJe65mNY0fkkTUxXGpqE",
  authDomain: "kcfs-30fc0.firebaseapp.com",
  projectId: "kcfs-30fc0",
  storageBucket: "kcfs-30fc0.firebasestorage.app",
  messagingSenderId: "806743955905",
  appId: "1:806743955905:web:ccf5c25a873e319f183740"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

// ========= ELEMENTS =========
const teacherContainer = document.getElementById("teacherContainer");
const loginModal       = document.getElementById("loginModal");
const loginBtn         = document.getElementById("loginBtn");
const logoutBtn        = document.getElementById("logoutBtn");
const linksList        = document.getElementById("linksList");
const linksHeading     = document.getElementById("linksHeading");
const sidebar          = document.getElementById("sidebar");
const bgFade           = document.getElementById("bgFade");

// ========= HELPERS =========
function setFade(on) { on ? bgFade.classList.add("dim") : bgFade.classList.remove("dim"); }

function showLinksUI(grade) {
  linksHeading.textContent = `Links for ${grade}`;
  linksHeading.classList.remove("hidden");
  linksList.style.display = "block";
  setFade(true);
}

function hideLinksUI() {
  linksHeading.classList.add("hidden");
  linksHeading.textContent = "";
  linksList.style.display = "none";
  linksList.innerHTML = "";
  setFade(false);
}

// ========= SIDEBAR TOGGLE =========
function toggleSidebar() {
  sidebar.classList.toggle("collapsed");
  // If sidebar collapsed → return to pure homepage (no text)
  if (sidebar.classList.contains("collapsed")) {
    hideLinksUI();
    teacherContainer.innerHTML = "";
  }
}
window.toggleSidebar = toggleSidebar;

// ========= AUTH =========
function showLogin() {
  loginModal.classList.remove("hidden");
  setFade(true);
}
window.showLogin = showLogin;

function closeLogin() {
  loginModal.classList.add("hidden");
  // Only remove fade if links are not visible
  if (linksHeading.classList.contains("hidden")) setFade(false);
}
window.closeLogin = closeLogin;

function login() {
  const email    = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginModal.classList.add("hidden");
      if (linksHeading.classList.contains("hidden")) setFade(false);
    })
    .catch(err => alert("Login failed: " + err.message));
}
window.login = login;

function logout() { auth.signOut(); }
window.logout = logout;

// Auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    logoutBtn.classList.remove("hidden");
    loginBtn.classList.add("hidden");

    // Inject teacher form
    teacherContainer.innerHTML = `
      <div id="teacherSection" class="teacher-section" style="
        background:#fff;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,0.12);
        padding:16px;margin-top:16px;">
        <h2 style="margin:0 0 12px 0;">Add a Link</h2>
        <input type="text" id="linkName" placeholder="Link Name" style="padding:10px;border:1px solid #cfd8ea;border-radius:8px;width:100%;margin-bottom:8px;">
        <input type="url" id="linkUrl" placeholder="https://example.com" style="padding:10px;border:1px solid #cfd8ea;border-radius:8px;width:100%;margin-bottom:8px;">
        <select id="gradeSelect" style="padding:10px;border:1px solid #cfd8ea;border-radius:8px;width:100%;margin-bottom:12px;">
          <option value="Grade 5">Grade 5</option>
          <option value="Grade 6">Grade 6</option>
        </select>
        <button onclick="addLink()" style="background:#0054d1;color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:700;width:100%;">Add Link</button>
      </div>
    `;
  } else {
    logoutBtn.classList.add("hidden");
    loginBtn.classList.remove("hidden");
    teacherContainer.innerHTML = "";
  }
});

// ========= LINKS =========
function addLink() {
  const name  = document.getElementById("linkName").value.trim();
  const url   = document.getElementById("linkUrl").value.trim();
  const grade = document.getElementById("gradeSelect").value;

  if (name && url) {
    db.collection("links").add({ name, url, grade }).then(() => {
      document.getElementById("linkName").value = "";
      document.getElementById("linkUrl").value  = "";
      loadLinks(grade);
    });
  } else {
    alert("Please enter both a name and a valid URL.");
  }
}
window.addLink = addLink;

function loadLinks(grade) {
  showLinksUI(grade);
  linksList.innerHTML = "";

  db.collection("links")
    .where("grade", "==", grade)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        linksList.innerHTML = `<li>No links yet for ${grade}</li>`;
      } else {
        const frag = document.createDocumentFragment();
        snapshot.forEach(doc => {
          const data = doc.data();
          const li = document.createElement("li");
          li.innerHTML = `<a href="${data.url}" target="_blank" rel="noopener">${data.name}</a>`;
          frag.appendChild(li);
        });
        linksList.appendChild(frag);
      }
    })
    .catch(err => console.error("Error loading links:", err));
}
window.loadLinks = loadLinks;

// ========= DEFAULT (HOMEPAGE) =========
// On load: pure background only (no text)
window.onload = () => { hideLinksUI(); };
