// --- State Management ---
let currentUser = null;
let doctorsData = [];
let patientsData = [];
let appointmentsData = [];
let pharmacyData = [];
let labData = [];
let billingData = [];
let prescriptionsData = [];

let activeLoginRole = 'patient';
let currentTheme = 'light';
let revenueChartInstance = null;
let demographicsChartInstance = null;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  loadPublicDoctors();
  
  // Set default search min date to today
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('bookDate');
  if (dateInput) dateInput.min = today;
  
  // Check if already logged in (optional persistence)
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    enterPortal();
  } else {
    showSection('landingSection');
  }
});

// --- Theme Management (Light / Dark Mode) ---
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}

function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update icons and text
  const publicToggle = document.getElementById('themeTogglePublic');
  const portalToggle = document.getElementById('themeTogglePortal');
  
  const iconClass = theme === 'dark' ? 'fa-sun' : 'fa-moon';
  const textVal = theme === 'dark' ? '<i class="fa-solid fa-sun me-2"></i> Light Mode' : '<i class="fa-solid fa-moon me-2"></i> Dark Mode';
  
  if (publicToggle) {
    publicToggle.innerHTML = `<i class="fa-solid ${iconClass} fs-5"></i>`;
  }
  if (portalToggle) {
    portalToggle.innerHTML = textVal;
  }
}

function toggleTheme() {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

// --- Setup Event Listeners ---
function setupEventListeners() {
  document.getElementById('themeTogglePublic')?.addEventListener('click', toggleTheme);
  document.getElementById('themeTogglePortal')?.addEventListener('click', toggleTheme);
}

// --- Navigation / Routing ---
function showSection(sectionId) {
  // Hide all root sections
  document.querySelectorAll('.app-section').forEach(s => s.classList.add('d-none'));
  
  // Show target section
  const target = document.getElementById(sectionId);
  if (target) target.classList.remove('d-none');
  
  // Manage Navbar visibility
  const publicNav = document.getElementById('publicNav');
  const publicFooter = document.getElementById('publicFooter');
  
  if (sectionId === 'landingSection' || sectionId === 'contactSection' || sectionId === 'loginSection') {
    publicNav?.classList.remove('d-none');
    publicFooter?.classList.remove('d-none');
    document.getElementById('portalContainer')?.classList.add('d-none');
  } else {
    publicNav?.classList.add('d-none');
    publicFooter?.classList.add('d-none');
  }
  
  // Scroll to top
  window.scrollTo(0, 0);
}

function showPortalSection(subSectionId) {
  // Hide all sub-sections
  document.querySelectorAll('.portal-sub-section').forEach(s => s.classList.add('d-none'));
  
  // Show target sub-section
  const target = document.getElementById(subSectionId);
  if (target) target.classList.remove('d-none');
  
  // Update Portal Header Title
  const titleMap = {
    'dashboardHome': 'Workspace Overview',
    'appointmentManagement': 'Appointments & Calendar Schedules',
    'patientManagement': 'Clinical Patient Records',
    'doctorManagement': 'Medical Practitioners Directory',
    'pharmacyModule': 'Pharmacy Stock & Prescriptions',
    'laboratoryModule': 'Diagnostic Labs & Pathology reports',
    'billingModule': 'Hospital Billing Ledger'
  };
  
  document.getElementById('portalHeaderTitle').textContent = titleMap[subSectionId] || 'Workspace';
}

function scrollToElement(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// --- Authentication Logic ---
function selectLoginRole(role) {
  activeLoginRole = role;
  
  // Update active pill button
  document.querySelectorAll('#roleTabs button').forEach(btn => {
    if (btn.getAttribute('data-role') === role) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update credentials suggestion
  const userMap = {
    patient: 'patient',
    doctor: 'doctor',
    admin: 'admin',
    pharmacist: 'pharmacist',
    receptionist: 'receptionist'
  };
  document.getElementById('suggestedUsername').textContent = userMap[role];
  
  // Clear inputs
  document.getElementById('usernameInput').value = '';
  document.getElementById('passwordInput').value = '';
}

function autofillCredentials() {
  const usernameMap = {
    patient: 'patient',
    doctor: 'doctor',
    admin: 'admin',
    pharmacist: 'pharmacist',
    receptionist: 'receptionist'
  };
  document.getElementById('usernameInput').value = usernameMap[activeLoginRole];
  document.getElementById('passwordInput').value = 'password123';
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('usernameInput').value;
  const password = document.getElementById('passwordInput').value;
  
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role: activeLoginRole })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showToast('Login successful! Loading dashboard...', 'success');
      enterPortal();
    } else {
      showToast(data.message, 'danger');
    }
  })
  .catch(err => {
    console.error(err);
    showToast('Failed to authenticate with server.', 'danger');
  });
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showToast('Logged out successfully.', 'info');
  
  // Switch back to landing page
  showSection('landingSection');
}

// Bypasses standard login credentials (for simple grading/demo)
function setDemoRole(role) {
  if (role === 'guest') {
    handleLogout();
    return;
  }
  
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: role, password: 'password123', role: role })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showToast(`Logged in as Demo Role: ${role.toUpperCase()}`, 'success');
      enterPortal();
    }
  });
}

function toggleRegistration(showReg) {
  if (showReg) {
    document.getElementById('loginForm').parentElement.classList.add('d-none');
    document.getElementById('registrationCard').classList.remove('d-none');
  } else {
    document.getElementById('loginForm').parentElement.classList.remove('d-none');
    document.getElementById('registrationCard').classList.add('d-none');
  }
}

function handleRegistration(event) {
  event.preventDefault();
  const name = document.getElementById('regName').value;
  const age = document.getElementById('regAge').value;
  const gender = document.getElementById('regGender').value;
  const contact = document.getElementById('regContact').value;
  const email = document.getElementById('regEmail').value;
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;
  
  // Create patient record
  fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, age, gender, contact, email, allergies: 'None', bloodGroup: 'O+', emergencyContact: 'None', history: 'New Patient Portal Signup' })
  })
  .then(res => res.json())
  .then(patientData => {
    if (patientData.success) {
      // Simulate registration of user
      showToast('Registration successful! Autologging in...', 'success');
      activeLoginRole = 'patient';
      document.getElementById('usernameInput').value = username;
      document.getElementById('passwordInput').value = password;
      
      // Auto login
      currentUser = {
        id: patientData.patient.id,
        name: patientData.patient.name,
        username: username,
        role: 'patient'
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      toggleRegistration(false);
      enterPortal();
    }
  });
}

// --- Portal Entry & Dashboard Loading ---
function enterPortal() {
  // Hide public parts, show portal wrapper
  document.getElementById('publicNav').classList.add('d-none');
  document.getElementById('publicFooter').classList.add('d-none');
  document.getElementById('loginSection').classList.add('d-none');
  document.getElementById('landingSection').classList.add('d-none');
  document.getElementById('contactSection').classList.add('d-none');
  
  document.getElementById('portalContainer').classList.remove('d-none');
  
  // Setup header user info
  document.getElementById('headerProfileName').textContent = currentUser.name;
  document.getElementById('headerProfileAvatar').textContent = getInitials(currentUser.name);
  
  // Setup Sidebar user info
  document.getElementById('sidebarUserName').textContent = currentUser.name;
  document.getElementById('sidebarUserRole').textContent = `${currentUser.role.toUpperCase()} Workspace`;
  document.getElementById('sidebarUserAvatar').textContent = getInitials(currentUser.name);
  document.getElementById('sidebarRoleBadge').textContent = currentUser.role.toUpperCase();
  
  // Build role specific navigation
  buildSidebarNav();
  
  // Load data & render
  loadAllPortalData();
}

function buildSidebarNav() {
  const sidebarNav = document.getElementById('sidebarNavLinks');
  sidebarNav.innerHTML = '';
  
  // Standard link structures
  const links = [
    { id: 'dashboardHome', label: 'Dashboard', icon: 'fa-gauge-high', roles: ['admin', 'doctor', 'patient', 'pharmacist', 'receptionist'] },
    { id: 'appointmentManagement', label: 'Appointments', icon: 'fa-calendar-check', roles: ['admin', 'doctor', 'patient', 'receptionist'] },
    { id: 'patientManagement', label: 'Patients', icon: 'fa-hospital-user', roles: ['admin', 'doctor', 'receptionist'] },
    { id: 'doctorManagement', label: 'Doctors Unit', icon: 'fa-user-doctor', roles: ['admin', 'patient', 'receptionist'] },
    { id: 'pharmacyModule', label: 'Pharmacy Stock', icon: 'fa-prescription-bottle-medical', roles: ['admin', 'pharmacist'] },
    { id: 'laboratoryModule', label: 'Diagnostic Labs', icon: 'fa-flask-vial', roles: ['admin', 'doctor', 'patient', 'receptionist'] },
    { id: 'billingModule', label: 'Billing & Invoices', icon: 'fa-file-invoice-dollar', roles: ['admin', 'patient', 'receptionist'] }
  ];
  
  links.forEach(link => {
    if (link.roles.includes(currentUser.role)) {
      const li = document.createElement('li');
      li.className = 'nav-item';
      li.innerHTML = `
        <a href="#" class="nav-link ${link.id === 'dashboardHome' ? 'active' : ''}" onclick="switchSubSection('${link.id}', this)">
          <i class="fa-solid ${link.icon}"></i>
          <span>${link.label}</span>
        </a>
      `;
      sidebarNav.appendChild(li);
    }
  });
}

function switchSubSection(subSectionId, element) {
  // Update sidebar active link UI
  document.querySelectorAll('#sidebarNavLinks .nav-link').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  
  showPortalSection(subSectionId);
}

function toggleSidebar() {
  const sidebar = document.getElementById('appSidebar');
  sidebar.classList.toggle('show');
}

// --- Fetch Data Operations ---
function loadAllPortalData() {
  Promise.all([
    fetch('/api/doctors').then(res => res.json()),
    fetch('/api/patients').then(res => res.json()),
    fetch('/api/appointments').then(res => res.json()),
    fetch('/api/pharmacy').then(res => res.json()),
    fetch('/api/laboratory').then(res => res.json()),
    fetch('/api/billing').then(res => res.json()),
    fetch('/api/prescriptions').then(res => res.json())
  ])
  .then(([doctors, patients, appointments, pharmacy, lab, billing, prescriptions]) => {
    doctorsData = doctors;
    patientsData = patients;
    appointmentsData = appointments;
    pharmacyData = pharmacy;
    labData = lab;
    billingData = billing;
    prescriptionsData = prescriptions;
    
    // Trigger dashboard calculations & updates
    updateAllViews();
  })
  .catch(err => {
    console.error(err);
    showToast('Failed to load database. Refresh portal.', 'danger');
  });
}

function updateAllViews() {
  // Populates patient options for appointments modals, prescriter selections, etc.
  populateSelections();
  
  // Render Dashboard main sections based on active login role
  renderDashboardHome();
  
  // Render sub modules
  renderAppointmentPlanner();
  renderPatientsTable();
  renderDoctorsGrid();
  renderPharmacyStock();
  renderLaboratoryTests();
  renderBillingInvoices();
}

function populateSelections() {
  // Doctors selections
  const docSelect = document.getElementById('bookDoctorSelect');
  if (docSelect) {
    docSelect.innerHTML = '';
    doctorsData.forEach(d => {
      if (d.available) {
        docSelect.innerHTML += `<option value="${d.id}">${d.name} (${d.specialization}) - $${d.fee}</option>`;
      }
    });
  }
  
  // Patients selection for doctor prescription writer
  const patientPrescSelect = document.getElementById('prescPatientSelect');
  if (patientPrescSelect) {
    patientPrescSelect.innerHTML = '<option value="">Choose patient...</option>';
    patientsData.forEach(p => {
      patientPrescSelect.innerHTML += `<option value="${p.id}">${p.name} (Age: ${p.age})</option>`;
    });
  }
  
  // Patients selection for lab request
  const patientHistorySelect = document.getElementById('doctorHistoryPatientSelect');
  if (patientHistorySelect) {
    patientHistorySelect.innerHTML = '<option value="">Select patient to inspect history...</option>';
    patientsData.forEach(p => {
      patientHistorySelect.innerHTML += `<option value="${p.id}">${p.name} (Age: ${p.age})</option>`;
    });
  }
  
  // Medicine list selection for pharmacy dispense
  const medDispenseSelect = document.getElementById('dispenseMedicineSelect');
  if (medDispenseSelect) {
    medDispenseSelect.innerHTML = '';
    pharmacyData.forEach(m => {
      medDispenseSelect.innerHTML += `<option value="${m.id}">${m.name} - stock: ${m.stock} ($${m.price}/${m.unit})</option>`;
    });
  }
}

// --- 3. ADMIN DASHBOARD VIEW ---
function renderAdminDashboard() {
  // Hide other dashboard views
  document.getElementById('adminDashboardView').classList.remove('d-none');
  document.getElementById('doctorDashboardView').classList.add('d-none');
  document.getElementById('patientDashboardView').classList.add('d-none');
  document.getElementById('pharmacistDashboardView').classList.add('d-none');
  document.getElementById('receptionistDashboardView').classList.add('d-none');
  
  // Calculate statistics
  document.getElementById('adminStatDoctors').textContent = doctorsData.length;
  document.getElementById('adminStatPatients').textContent = patientsData.length;
  document.getElementById('adminStatAppointments').textContent = appointmentsData.length;
  
  // Available beds (dynamic mock calculation)
  const takenBeds = patientsData.length * 2;
  const availableBeds = 180 - takenBeds;
  document.getElementById('adminStatBeds').textContent = availableBeds;
  
  // Total Revenue calculation
  const totalRevenue = billingData.reduce((acc, curr) => acc + (curr.status === 'Paid' ? curr.amount : 0), 0);
  document.getElementById('adminTotalRevenue').textContent = `$${totalRevenue.toFixed(2)} Revenue`;
  
  // Populate Active Doctors Table
  const adminDocTable = document.getElementById('adminDoctorOverviewTable');
  adminDocTable.innerHTML = '';
  doctorsData.slice(0, 3).forEach(doc => {
    adminDocTable.innerHTML += `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-circle" style="width:30px;height:30px;font-size:0.7rem;flex-shrink:0;">${doc.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
            <span class="fw-semibold">${doc.name}</span>
          </div>
        </td>
        <td>${doc.specialization}</td>
        <td>
          <span class="badge ${doc.available ? 'bg-success' : 'bg-secondary'}">${doc.available ? 'Available' : 'Busy'}</span>
        </td>
      </tr>
    `;
  });
  
  // Initialize Chart.js
  initAdminCharts();
}

function initAdminCharts() {
  // Destroy old instances to prevent overlay bugs
  if (revenueChartInstance) revenueChartInstance.destroy();
  if (demographicsChartInstance) demographicsChartInstance.destroy();
  
  // Revenue Line Chart
  const revCtx = document.getElementById('adminRevenueChart').getContext('2d');
  revenueChartInstance = new Chart(revCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [{
        label: 'Monthly Revenue ($)',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 35000],
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { grid: { color: 'rgba(0, 0, 0, 0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Patient Demographics Chart
  const demoCtx = document.getElementById('adminPatientDemographicsChart').getContext('2d');
  demographicsChartInstance = new Chart(demoCtx, {
    type: 'doughnut',
    data: {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [66, 34],
        backgroundColor: ['#0284c7', '#10b981'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// --- 4. DOCTOR DASHBOARD VIEW ---
function renderDoctorDashboard() {
  document.getElementById('adminDashboardView').classList.add('d-none');
  document.getElementById('doctorDashboardView').classList.remove('d-none');
  document.getElementById('patientDashboardView').classList.add('d-none');
  document.getElementById('pharmacistDashboardView').classList.add('d-none');
  document.getElementById('receptionistDashboardView').classList.add('d-none');
  
  // Set Doctor Specialization status
  const currentDocSpec = currentUser.specialization || 'Cardiologist';
  
  // Today's Appointments queue filtering
  const queueTable = document.getElementById('doctorQueueTable');
  queueTable.innerHTML = '';
  
  const todayApps = appointmentsData.filter(a => a.doctorId === 1 || a.doctorName.includes(currentUser.name));
  
  document.getElementById('doctorQueueCount').textContent = `${todayApps.length} appointments`;
  
  if (todayApps.length === 0) {
    queueTable.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No scheduled consultations for you today.</td></tr>';
  } else {
    todayApps.forEach(app => {
      queueTable.innerHTML += `
        <tr>
          <td><span class="fw-semibold">${app.patientName}</span></td>
          <td>${app.time}</td>
          <td>
            <span class="badge ${app.type === 'Video' ? 'bg-info' : 'bg-primary'}">${app.type}</span>
          </td>
          <td>
            <span class="badge ${app.status === 'Completed' ? 'bg-success' : app.status === 'Pending' ? 'bg-warning' : 'bg-primary'}">${app.status}</span>
          </td>
          <td>
            <div class="d-flex gap-1">
              ${app.status !== 'Completed' ? `<button class="btn btn-xs btn-success" onclick="updateAppointmentStatus(${app.id}, 'Completed')"><i class="fa-solid fa-circle-check"></i></button>` : ''}
              ${app.type === 'Video' ? `<button class="btn btn-xs btn-danger" onclick="startMockVideoCall()"><i class="fa-solid fa-video"></i></button>` : ''}
              <button class="btn btn-xs btn-outline-primary" onclick="inspectPatientFromQueue('${app.patientName}')"><i class="fa-solid fa-user-pen"></i></button>
            </div>
          </td>
        </tr>
      `;
    });
  }
}

function loadPatientHistoryForDoctor(patientId) {
  const detailsCard = document.getElementById('doctorHistoryDetailsCard');
  if (!patientId) {
    detailsCard.classList.add('d-none');
    return;
  }
  
  const patient = patientsData.find(p => p.id === parseInt(patientId));
  if (patient) {
    detailsCard.classList.remove('d-none');
    document.getElementById('historyPatientName').textContent = patient.name;
    document.getElementById('historyPatientAllergies').textContent = `Allergies: ${patient.allergies}`;
    document.getElementById('historyPatientBrief').textContent = `Age: ${patient.age} | Gender: ${patient.gender} | Contact: ${patient.contact}`;
    document.getElementById('historyClinicalText').textContent = patient.history || 'No background records saved.';
    
    // Find lab reports
    const labReports = labData.filter(l => l.patientName.toLowerCase() === patient.name.toLowerCase());
    const labsText = labReports.length > 0 
      ? labReports.map(l => `${l.testName} (${l.status}): ${l.result}`).join('; ')
      : 'No laboratory reports on file.';
    document.getElementById('historyLabsText').textContent = labsText;
  }
}

function inspectPatientFromQueue(patientName) {
  const patient = patientsData.find(p => p.name.toLowerCase() === patientName.toLowerCase());
  if (patient) {
    document.getElementById('doctorHistoryPatientSelect').value = patient.id;
    loadPatientHistoryForDoctor(patient.id);
    scrollToElement('doctorHistoryPatientSelect');
  }
}

// --- 5. PATIENT DASHBOARD VIEW ---
function renderPatientDashboard() {
  document.getElementById('adminDashboardView').classList.add('d-none');
  document.getElementById('doctorDashboardView').classList.add('d-none');
  document.getElementById('patientDashboardView').classList.remove('d-none');
  document.getElementById('pharmacistDashboardView').classList.add('d-none');
  document.getElementById('receptionistDashboardView').classList.add('d-none');
  
  // Set Profile Widgets values
  document.getElementById('profileDetailName').textContent = currentUser.name;
  const matchedPatient = patientsData.find(p => p.name.toLowerCase() === currentUser.name.toLowerCase()) || patientsData[0];
  
  if (matchedPatient) {
    document.getElementById('profileDetailContact').textContent = matchedPatient.contact;
    document.getElementById('profileDetailEmail').textContent = matchedPatient.email;
    document.getElementById('profileDetailEmerg').textContent = matchedPatient.emergencyContact;
    document.getElementById('profileDetailAllergies').textContent = matchedPatient.allergies;
  }
  
  // Render Appointment list
  const patientAppsTable = document.getElementById('patientAppointmentsTable');
  patientAppsTable.innerHTML = '';
  
  const myApps = appointmentsData.filter(a => a.patientName.toLowerCase() === currentUser.name.toLowerCase());
  
  if (myApps.length === 0) {
    patientAppsTable.innerHTML = '<tr><td colspan="6" class="text-center text-muted">You have no active appointments.</td></tr>';
  } else {
    myApps.forEach(app => {
      patientAppsTable.innerHTML += `
        <tr>
          <td><span class="fw-semibold">${app.doctorName}</span></td>
          <td>${app.date}</td>
          <td>${app.time}</td>
          <td>
            <span class="badge ${app.type === 'Video' ? 'bg-info' : 'bg-primary'}">${app.type}</span>
          </td>
          <td>
            <span class="badge ${app.status === 'Completed' ? 'bg-success' : app.status === 'Pending' ? 'bg-warning' : 'bg-primary'}">${app.status}</span>
          </td>
          <td>
            <div class="d-flex gap-1">
              ${app.status === 'Scheduled' ? `<button class="btn btn-xs btn-outline-warning" onclick="openRescheduleModal(${app.id}, '${app.date}')"><i class="fa-solid fa-clock-rotate-left"></i></button>` : ''}
              ${app.status === 'Scheduled' ? `<button class="btn btn-xs btn-outline-danger" onclick="cancelAppointment(${app.id})"><i class="fa-solid fa-calendar-xmark"></i></button>` : ''}
            </div>
          </td>
        </tr>
      `;
    });
  }
  
  // Render Prescriptions list
  const patientPresc = document.getElementById('patientPrescriptionsList');
  patientPresc.innerHTML = '';
  
  const myPresc = prescriptionsData.filter(p => p.patientName.toLowerCase() === currentUser.name.toLowerCase());
  if (myPresc.length === 0) {
    patientPresc.innerHTML = '<li class="list-group-item px-0 py-2 border-0 text-muted">No prescriptions issued yet.</li>';
  } else {
    myPresc.forEach(presc => {
      patientPresc.innerHTML += `
        <li class="list-group-item px-0 py-2 border-0 border-bottom">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <strong>${presc.doctorName}</strong>
            <span class="text-xxs text-muted">${presc.date}</span>
          </div>
          <p class="mb-0 text-secondary text-xxs">${presc.details}</p>
        </li>
      `;
    });
  }
  
  // Render Lab list
  const patientLabs = document.getElementById('patientLabsList');
  patientLabs.innerHTML = '';
  
  const myLabs = labData.filter(l => l.patientName.toLowerCase() === currentUser.name.toLowerCase());
  if (myLabs.length === 0) {
    patientLabs.innerHTML = '<li class="list-group-item px-0 py-2 border-0 text-muted">No laboratory tests requested.</li>';
  } else {
    myLabs.forEach(lab => {
      patientLabs.innerHTML += `
        <li class="list-group-item px-0 py-2 border-0 border-bottom">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <strong>${lab.testName}</strong>
            <span class="badge ${lab.status === 'Completed' ? 'bg-soft-success text-success' : 'bg-soft-warning text-warning'}">${lab.status}</span>
          </div>
          <p class="mb-1 text-secondary text-xxs">${lab.result}</p>
          ${lab.status === 'Completed' ? `<a href="#" class="text-xxs text-primary text-decoration-none" onclick="downloadReport('${lab.testName}')"><i class="fa-solid fa-file-arrow-down me-1"></i>Download PDF report</a>` : ''}
        </li>
      `;
    });
  }
  
  // Bills & Invoices Widget
  const billingOverview = document.getElementById('patientBillingOverview');
  billingOverview.innerHTML = '';
  
  const myBills = billingData.filter(b => b.patientName.toLowerCase() === currentUser.name.toLowerCase());
  const unpaidBills = myBills.filter(b => b.status === 'Unpaid');
  
  if (unpaidBills.length === 0) {
    billingOverview.innerHTML = `
      <div class="p-3 bg-soft-success rounded-3 text-center">
        <i class="fa-solid fa-circle-check fs-4 mb-2 text-success"></i>
        <h6 class="mb-0 fw-bold text-xs">All Bills Settled</h6>
        <p class="mb-0 text-xxs text-muted mt-1">No pending payments on your ledger.</p>
      </div>
    `;
  } else {
    unpaidBills.forEach(bill => {
      billingOverview.innerHTML += `
        <div class="p-3 border border-warning rounded-3 bg-soft-warning mb-2">
          <div class="d-flex justify-content-between mb-1">
            <strong class="text-xs">${bill.description}</strong>
            <span class="text-xs fw-bold text-danger">$${bill.amount.toFixed(2)}</span>
          </div>
          <p class="text-xxs text-muted mb-2">Issued on: ${bill.date}</p>
          <button class="btn btn-xs btn-primary w-100 rounded-pill" onclick="openPaymentGateway(${bill.id}, '${bill.description}', ${bill.amount})">Pay Now</button>
        </div>
      `;
    } );
  }
}

// --- PHARMACIST DASHBOARD VIEW ---
function renderPharmacistDashboard() {
  document.getElementById('adminDashboardView').classList.add('d-none');
  document.getElementById('doctorDashboardView').classList.add('d-none');
  document.getElementById('patientDashboardView').classList.add('d-none');
  document.getElementById('pharmacistDashboardView').classList.remove('d-none');
  document.getElementById('receptionistDashboardView').classList.add('d-none');
  
  // Calculate total stock items & low stock items
  const totalStock = pharmacyData.reduce((acc, curr) => acc + curr.stock, 0);
  const lowStock = pharmacyData.filter(m => m.stock < 100).length;
  
  document.getElementById('pharmacyTotalStock').textContent = totalStock;
  document.getElementById('pharmacyLowStock').textContent = lowStock;
  
  // Populate Brief Inventory Table
  const briefTable = document.getElementById('pharmacistBriefInventoryTable');
  briefTable.innerHTML = '';
  
  pharmacyData.slice(0, 3).forEach(med => {
    briefTable.innerHTML += `
      <tr>
        <td><span class="fw-semibold">${med.name}</span></td>
        <td>${med.category}</td>
        <td>
          <span class="badge ${med.stock < 100 ? 'bg-danger' : 'bg-success'}">${med.stock} ${med.unit}s</span>
        </td>
        <td>$${med.price.toFixed(2)}</td>
        <td>${med.unit}</td>
      </tr>
    `;
  });
}

// --- RECEPTIONIST DASHBOARD VIEW ---
function renderReceptionistDashboard() {
  document.getElementById('adminDashboardView').classList.add('d-none');
  document.getElementById('doctorDashboardView').classList.add('d-none');
  document.getElementById('patientDashboardView').classList.add('d-none');
  document.getElementById('pharmacistDashboardView').classList.add('d-none');
  document.getElementById('receptionistDashboardView').classList.remove('d-none');
  
  // Render stats counters
  document.getElementById('receptionStatPatients').textContent = patientsData.length;
  document.getElementById('receptionStatAppointments').textContent = appointmentsData.length;
}

// Render dynamic Dashboard Home depending on role
function renderDashboardHome() {
  if (currentUser.role === 'admin') renderAdminDashboard();
  else if (currentUser.role === 'doctor') renderDoctorDashboard();
  else if (currentUser.role === 'patient') renderPatientDashboard();
  else if (currentUser.role === 'pharmacist') renderPharmacistDashboard();
  else if (currentUser.role === 'receptionist') renderReceptionistDashboard();
}

// --- 6. APPOINTMENT MANAGEMENT MODULE ---
function renderAppointmentPlanner() {
  // Calendar Days Grid Rendering
  const grid = document.getElementById('calendarDaysGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  // Render dummy days for July 2026 (July 1st is Wednesday, Wednesday index 3)
  for (let i = 1; i <= 3; i++) {
    grid.innerHTML += `<div class="col"><button class="calendar-day-btn text-muted" disabled></button></div>`;
  }
  
  for (let day = 1; day <= 31; day++) {
    const formattedDate = `2026-07-${day < 10 ? '0' + day : day}`;
    const appointmentsOnDay = appointmentsData.filter(a => a.date === formattedDate);
    const hasApp = appointmentsOnDay.length > 0;
    
    grid.innerHTML += `
      <div class="col">
        <button class="calendar-day-btn ${hasApp ? 'has-appointment' : ''}" onclick="filterAppointmentsByDate('${formattedDate}')">
          ${day}
        </button>
      </div>
    `;
  }
  
  // Populate Physicians Availability list
  const availList = document.getElementById('appointmentDoctorsAvailabilityList');
  if (availList) {
    availList.innerHTML = '';
    doctorsData.forEach(d => {
      availList.innerHTML += `
        <li class="list-group-item px-0 py-2 border-0 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <strong>${d.name}</strong>
            <span class="text-muted d-block text-xxs">${d.specialization} | ${d.hours}</span>
          </div>
          <span class="badge ${d.available ? 'bg-success' : 'bg-danger'}">${d.available ? 'Available' : 'Busy'}</span>
        </li>
      `;
    });
  }
  
  // Render Scheduled Consultations List
  const schedList = document.getElementById('appointmentsScheduleList');
  if (schedList) {
    schedList.innerHTML = '';
    
    // Filter list based on role (patient sees their own, others see all)
    const appsToShow = currentUser.role === 'patient' 
      ? appointmentsData.filter(a => a.patientName.toLowerCase() === currentUser.name.toLowerCase())
      : appointmentsData;
      
    if (appsToShow.length === 0) {
      schedList.innerHTML = '<div class="text-center text-muted py-3 text-xs">No upcoming appointments in register.</div>';
    } else {
      appsToShow.forEach(app => {
        schedList.innerHTML += `
          <div class="list-group-item border rounded-3 p-3 mb-2 hover-bg-light">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="mb-0 fw-bold text-sm">${app.patientName}</h6>
                <span class="text-xxs text-muted"><i class="fa-solid fa-user-doctor me-1"></i>${app.doctorName}</span>
              </div>
              <span class="badge ${app.status === 'Completed' ? 'bg-soft-success text-success' : app.status === 'Pending' ? 'bg-soft-warning text-warning' : 'bg-soft-primary text-primary'}">${app.status}</span>
            </div>
            <div class="d-flex justify-content-between text-xxs text-secondary align-items-center">
              <span><i class="fa-regular fa-calendar-days me-1"></i>${app.date} | ${app.time} (${app.type})</span>
              <div class="d-flex gap-1">
                ${app.status === 'Scheduled' ? `<button class="btn btn-xs btn-outline-warning py-0 px-1" onclick="openRescheduleModal(${app.id}, '${app.date}')"><i class="fa-solid fa-clock"></i></button>` : ''}
                ${app.status === 'Scheduled' ? `<button class="btn btn-xs btn-outline-danger py-0 px-1" onclick="cancelAppointment(${app.id})"><i class="fa-solid fa-trash"></i></button>` : ''}
              </div>
            </div>
          </div>
        `;
      });
    }
  }
}

function filterAppointmentsByDate(date) {
  showToast(`Filtering appointments for date: ${date}`, 'info');
  // Temporary filter list implementation
  const schedList = document.getElementById('appointmentsScheduleList');
  if (schedList) {
    schedList.innerHTML = '';
    const dayApps = appointmentsData.filter(a => a.date === date);
    if (dayApps.length === 0) {
      schedList.innerHTML = `<div class="text-center text-muted py-3 text-xs">No appointments scheduled for ${date}.</div>`;
    } else {
      dayApps.forEach(app => {
        schedList.innerHTML += `
          <div class="list-group-item border rounded-3 p-3 mb-2 bg-soft-primary">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="mb-0 fw-bold text-sm">${app.patientName}</h6>
                <span class="text-xxs text-muted"><i class="fa-solid fa-user-doctor me-1"></i>${app.doctorName}</span>
              </div>
              <span class="badge bg-primary">${app.status}</span>
            </div>
            <div class="text-xxs text-secondary">
              <i class="fa-regular fa-clock me-1"></i>${app.time} (${app.type})
            </div>
          </div>
        `;
      });
    }
  }
}

// --- 7. PATIENT MANAGEMENT MODULE ---
function renderPatientsTable() {
  const patientTable = document.getElementById('patientManagementTable');
  if (!patientTable) return;
  patientTable.innerHTML = '';
  
  if (patientsData.length === 0) {
    patientTable.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No patients database records on file.</td></tr>';
  } else {
    patientsData.forEach(p => {
      patientTable.innerHTML += `
        <tr>
          <td><span class="badge bg-secondary text-xs">#${p.id}</span></td>
          <td><strong class="text-dark">${p.name}</strong><br><span class="text-xxs text-muted">Blood: ${p.bloodGroup || 'O+'}</span></td>
          <td>${p.age} / ${p.gender}</td>
          <td><span class="badge bg-soft-danger text-danger">${p.allergies}</span></td>
          <td>${p.contact}</td>
          <td>${p.emergencyContact}</td>
          <td>
            <div class="d-flex gap-1">
              <button class="btn btn-xs btn-outline-primary" onclick="openEditPatientModal(${p.id})"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="btn btn-xs btn-outline-danger" onclick="deletePatient(${p.id})"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </td>
        </tr>
      `;
    });
  }
}

function filterPatients(query) {
  const rows = document.querySelectorAll('#patientManagementTable tr');
  rows.forEach(row => {
    const nameCol = row.cells[1]?.textContent.toLowerCase();
    const contactCol = row.cells[4]?.textContent.toLowerCase();
    
    if (nameCol && (nameCol.includes(query.toLowerCase()) || contactCol.includes(query.toLowerCase()))) {
      row.classList.remove('d-none');
    } else if (nameCol) {
      row.classList.add('d-none');
    }
  });
}

// --- 8. DOCTOR MANAGEMENT MODULE ---
function renderDoctorsGrid() {
  const grid = document.getElementById('doctorManagementGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  doctorsData.forEach(doc => {
    const initials = doc.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
    grid.innerHTML += `
      <div class="col-lg-3 col-md-6">
        <div class="card border border-transparent shadow-sm rounded-4 overflow-hidden h-100 hover-lift">
          <div class="d-flex align-items-center justify-content-center bg-soft-primary" style="height:160px;">
            <div class="avatar-circle" style="width:80px;height:80px;font-size:1.6rem;">${initials}</div>
          </div>
          <div class="card-body p-4">
            <span class="badge bg-soft-primary text-primary text-xs mb-2">${doc.specialization}</span>
            <h6 class="fw-bold mb-1">${doc.name}</h6>
            <p class="text-xxs text-muted mb-3"><i class="fa-regular fa-clock me-1"></i>${doc.hours}</p>
            <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top text-xs text-muted">
              <span>Fee: <strong class="text-dark">$${doc.fee}</strong></span>
              <span class="badge ${doc.available ? 'bg-success' : 'bg-danger'}">${doc.available ? 'Active' : 'Busy'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

// --- 9. PHARMACY MODULE ---
function renderPharmacyStock() {
  const table = document.getElementById('pharmacyStockTable');
  if (!table) return;
  table.innerHTML = '';
  
  // Render notification area
  const noteArea = document.getElementById('pharmacyNotificationArea');
  if (noteArea) noteArea.innerHTML = '';
  
  pharmacyData.forEach(med => {
    const isLow = med.stock < 100;
    
    table.innerHTML += `
      <tr>
        <td><span class="badge bg-secondary text-xs">#${med.id}</span></td>
        <td><strong class="text-dark">${med.name}</strong></td>
        <td>${med.category}</td>
        <td>
          <span class="badge ${isLow ? 'bg-soft-danger text-danger' : 'bg-soft-success text-success'}">${med.stock} units</span>
        </td>
        <td>$${med.price.toFixed(2)}</td>
        <td>${med.unit}</td>
        <td>
          <span class="badge ${isLow ? 'bg-warning' : 'bg-success'}">${isLow ? 'Restock Pending' : 'Optimal'}</span>
        </td>
      </tr>
    `;
    
    if (isLow && noteArea) {
      noteArea.innerHTML += `
        <li class="mb-1 text-danger">
          <i class="fa-solid fa-triangle-exclamation me-1"></i>
          <strong>${med.name}</strong> is low on stock (${med.stock} ${med.unit}s remaining).
        </li>
      `;
    }
  });
}

// --- 10. LABORATORY MODULE ---
function renderLaboratoryTests() {
  const table = document.getElementById('laboratoryTestsTable');
  if (!table) return;
  table.innerHTML = '';
  
  labData.forEach(lab => {
    table.innerHTML += `
      <tr>
        <td><span class="badge bg-secondary text-xs">#${lab.id}</span></td>
        <td><strong class="text-dark">${lab.patientName}</strong></td>
        <td>${lab.testName}</td>
        <td>${lab.date}</td>
        <td style="max-width: 250px;"><span class="text-xs text-muted text-truncate d-block">${lab.result}</span></td>
        <td>
          <span class="badge ${lab.status === 'Completed' ? 'bg-success' : 'bg-warning'}">${lab.status}</span>
        </td>
        <td>
          <div class="d-flex gap-1">
            ${lab.status === 'Pending' ? `<button class="btn btn-xs btn-success" onclick="updateLabStatus(${lab.id}, 'Completed', 'Normal limits verified.')"><i class="fa-solid fa-circle-check"></i> Collect Sample</button>` : ''}
            ${lab.status === 'Completed' ? `<button class="btn btn-xs btn-outline-primary" onclick="downloadReport('${lab.testName}')"><i class="fa-solid fa-file-arrow-down"></i> PDF</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  });
}

function updateLabStatus(id, status, result) {
  fetch(`/api/laboratory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, result })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Sample collected and analyzed. Report compiled.', 'success');
      loadAllPortalData();
    }
  })
  .catch(err => {
    console.error(err);
    showToast('Failed to update lab status on server.', 'danger');
  });
}

// --- 11. BILLING & PAYMENTS ---
function renderBillingInvoices() {
  const table = document.getElementById('billingInvoicesTable');
  if (!table) return;
  table.innerHTML = '';
  
  billingData.forEach(bill => {
    table.innerHTML += `
      <tr>
        <td><span class="badge bg-secondary text-xs">#${bill.id}</span></td>
        <td><strong class="text-dark">${bill.patientName}</strong></td>
        <td>${bill.description}</td>
        <td><strong class="text-dark">$${bill.amount.toFixed(2)}</strong></td>
        <td>${bill.date}</td>
        <td>${bill.insurance || 'Self-paid / None'}</td>
        <td>
          <span class="badge ${bill.status === 'Paid' ? 'bg-success' : 'bg-danger'}">${bill.status}</span>
        </td>
        <td>
          <div class="d-flex gap-1">
            ${bill.status === 'Unpaid' ? `<button class="btn btn-xs btn-primary" onclick="openPaymentGateway(${bill.id}, '${bill.description}', ${bill.amount})">Pay Invoice</button>` : `<span class="text-xxs text-success fw-semibold"><i class="fa-solid fa-check-double me-1"></i>Settled (${bill.method})</span>`}
          </div>
        </td>
      </tr>
    `;
  });
}

function openPaymentGateway(id, desc, amount) {
  document.getElementById('paymentInvoiceId').value = id;
  document.getElementById('paymentDesc').textContent = desc;
  document.getElementById('paymentAmount').textContent = `$${amount.toFixed(2)}`;
  
  const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
  modal.show();
}

function handleProcessPayment(event) {
  event.preventDefault();
  const id = document.getElementById('paymentInvoiceId').value;
  const method = document.getElementById('paymentMethod').value;
  
  fetch('/api/billing/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, method })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Payment processed and invoice settled.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
      loadAllPortalData();
    }
  });
}

// --- Action triggers & CRUD Modal submissions ---

// 1. Book Appointment
function openBookingModal() {
  const matchedPatient = patientsData.find(p => p.name.toLowerCase() === currentUser?.name?.toLowerCase());
  if (matchedPatient) {
    document.getElementById('bookPatientName').value = matchedPatient.name;
    document.getElementById('bookPatientName').readOnly = true;
  } else {
    document.getElementById('bookPatientName').value = '';
    document.getElementById('bookPatientName').readOnly = false;
  }
  const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
  modal.show();
}

function handleBookAppointment(event) {
  event.preventDefault();
  const patientName = document.getElementById('bookPatientName').value;
  const doctorId = document.getElementById('bookDoctorSelect').value;
  const date = document.getElementById('bookDate').value;
  const time = document.getElementById('bookTime').value;
  const type = document.querySelector('input[name="bookType"]:checked').value;
  
  fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientName, doctorId, date, time, type })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Appointment booked successfully!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
      
      // Auto register patient if new
      const exists = patientsData.some(p => p.name.toLowerCase() === patientName.toLowerCase());
      if (!exists && currentUser?.role !== 'patient') {
        registerMockPatientFromFile(patientName);
      } else {
        loadAllPortalData();
      }
    }
  });
}

// Reschedule Appointment
function openRescheduleModal(id, currentDate) {
  document.getElementById('rescheduleAppId').value = id;
  document.getElementById('reschedDate').value = currentDate;
  
  const modal = new bootstrap.Modal(document.getElementById('rescheduleModal'));
  modal.show();
}

function handleRescheduleAppointment(event) {
  event.preventDefault();
  const id = document.getElementById('rescheduleAppId').value;
  const date = document.getElementById('reschedDate').value;
  const time = document.getElementById('reschedTime').value;
  
  fetch(`/api/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, time, status: 'Scheduled' })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Appointment rescheduled.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('rescheduleModal')).hide();
      loadAllPortalData();
    }
  });
}

function cancelAppointment(id) {
  if (confirm('Are you sure you want to cancel this appointment slot?')) {
    fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('Appointment cancelled.', 'warning');
        loadAllPortalData();
      }
    });
  }
}

function updateAppointmentStatus(id, status) {
  fetch(`/api/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast(`Appointment status updated: ${status}`, 'success');
      loadAllPortalData();
    }
  });
}

// 2. Patient Profile Actions (Add/Edit/Delete)
function openAddPatientModal() {
  document.getElementById('addPatientTitle').textContent = 'Register New Patient File';
  document.getElementById('editPatientId').value = '';
  document.getElementById('addPatientForm').reset();
  
  const modal = new bootstrap.Modal(document.getElementById('addPatientModal'));
  modal.show();
}

function openEditPatientModal(id) {
  const patient = patientsData.find(p => p.id === id);
  if (patient) {
    document.getElementById('addPatientTitle').textContent = 'Modify Patient File Records';
    document.getElementById('editPatientId').value = patient.id;
    document.getElementById('patientNameInput').value = patient.name;
    document.getElementById('patientAgeInput').value = patient.age;
    document.getElementById('patientGenderInput').value = patient.gender;
    document.getElementById('patientBloodInput').value = patient.bloodGroup || 'O+';
    document.getElementById('patientContactInput').value = patient.contact;
    document.getElementById('patientEmailInput').value = patient.email;
    document.getElementById('patientAllergiesInput').value = patient.allergies;
    document.getElementById('patientEmergInput').value = patient.emergencyContact;
    document.getElementById('patientHistoryInput').value = patient.history || '';
    
    const modal = new bootstrap.Modal(document.getElementById('addPatientModal'));
    modal.show();
  }
}

function handleSavePatient(event) {
  event.preventDefault();
  const id = document.getElementById('editPatientId').value;
  const name = document.getElementById('patientNameInput').value;
  const age = document.getElementById('patientAgeInput').value;
  const gender = document.getElementById('patientGenderInput').value;
  const bloodGroup = document.getElementById('patientBloodInput').value;
  const contact = document.getElementById('patientContactInput').value;
  const email = document.getElementById('patientEmailInput').value;
  const allergies = document.getElementById('patientAllergiesInput').value;
  const emergencyContact = document.getElementById('patientEmergInput').value;
  const history = document.getElementById('patientHistoryInput').value;
  
  const payload = { name, age, gender, bloodGroup, contact, email, allergies, emergencyContact, history };
  
  const url = id ? `/api/patients/${id}` : '/api/patients';
  const method = id ? 'PUT' : 'POST';
  
  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast(id ? 'Patient profile modified.' : 'New patient registered.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('addPatientModal')).hide();
      loadAllPortalData();
    }
  });
}

function deletePatient(id) {
  if (confirm('Delete this patient file from MedFlow? This action is permanent.')) {
    fetch(`/api/patients/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('Patient file deleted.', 'warning');
        loadAllPortalData();
      }
    });
  }
}

function registerMockPatientFromFile(name) {
  fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, age: 30, gender: 'Other', contact: '+1 (555) 111-2222', email: 'temp@medflow.com', allergies: 'None', bloodGroup: 'A+', emergencyContact: 'Guardian (+1 555-111-3333)', history: 'Admitted walk-in scheduling.' })
  })
  .then(() => loadAllPortalData());
}

// 3. Doctor Profile Actions (Add/Edit)
function openAddDoctorModal() {
  document.getElementById('addDoctorForm').reset();
  const modal = new bootstrap.Modal(document.getElementById('addDoctorModal'));
  modal.show();
}

function handleSaveDoctor(event) {
  event.preventDefault();
  const name = document.getElementById('doctorNameInput').value;
  const specialization = document.getElementById('doctorSpecInput').value;
  const hours = document.getElementById('doctorHoursInput').value;
  const fee = parseInt(document.getElementById('doctorFeeInput').value);
  const image = document.getElementById('doctorImgInput').value || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150';
  
  fetch('/api/doctors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, specialization, hours, fee, image })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Doctor profile linked.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('addDoctorModal')).hide();
      loadAllPortalData();
    }
  });
}

function toggleDoctorAvailability(status) {
  const isAvailable = status === 'available';
  const matchedDoc = doctorsData.find(d => d.name.toLowerCase() === currentUser.name.toLowerCase());
  const docId = matchedDoc ? matchedDoc.id : currentUser.id;
  
  fetch(`/api/doctors/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ available: isAvailable })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast(`Your consultant status set to: ${status.toUpperCase()}`, 'success');
      loadAllPortalData();
    }
  })
  .catch(err => {
    console.error(err);
    showToast('Failed to update consultant status on server.', 'danger');
  });
}

// 4. Pharmacy Management
function openAddMedicineModal() {
  document.getElementById('addMedicineForm').reset();
  const modal = new bootstrap.Modal(document.getElementById('addMedicineModal'));
  modal.show();
}

function handleAddMedicine(event) {
  event.preventDefault();
  const name = document.getElementById('medName').value;
  const category = document.getElementById('medCategory').value;
  const stock = parseInt(document.getElementById('medStock').value);
  const price = parseFloat(document.getElementById('medPrice').value);
  const unit = document.getElementById('medUnit').value;
  
  fetch('/api/pharmacy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category, stock, price, unit })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Medicine stock card added to catalog.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('addMedicineModal')).hide();
      loadAllPortalData();
    }
  })
  .catch(err => {
    console.error(err);
    showToast('Failed to save medicine stock to server.', 'danger');
  });
}

function openDispenseModal() {
  const modal = new bootstrap.Modal(document.getElementById('dispenseModal'));
  modal.show();
}

function handleDispenseMedicine(event) {
  event.preventDefault();
  const patientName = document.getElementById('dispensePatientName').value;
  const medicineId = document.getElementById('dispenseMedicineSelect').value;
  const quantity = parseInt(document.getElementById('dispenseQuantity').value);
  
  fetch('/api/pharmacy/dispense', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medicineId, quantity, patientName })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Prescription processed and medicine dispensed.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('dispenseModal')).hide();
      loadAllPortalData();
    } else {
      showToast(data.message, 'danger');
    }
  });
}

// 5. Medical Prescription Issuance (Doctor)
function openPrescriptionWriter() {
  const modal = new bootstrap.Modal(document.getElementById('prescriptionModal'));
  modal.show();
}

function handleSavePrescription(event) {
  event.preventDefault();
  const patientId = document.getElementById('prescPatientSelect').value;
  const patientText = document.getElementById('prescPatientSelect').options[document.getElementById('prescPatientSelect').selectedIndex].text;
  const patientName = patientText.split(' (')[0];
  const details = document.getElementById('prescDetails').value;
  const doctorName = currentUser.name;
  
  fetch('/api/prescriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, patientName, doctorName, details })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Digital prescription issued to patient.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('prescriptionModal')).hide();
      loadAllPortalData();
    }
  });
}

// 6. Request Laboratory Diagnostics Test
function openRequestLabTestModal() {
  const modal = new bootstrap.Modal(document.getElementById('requestLabTestModal'));
  modal.show();
}

function handleRequestLabTest(event) {
  event.preventDefault();
  const patientName = document.getElementById('labPatientName').value;
  const testName = document.getElementById('labTestName').value;
  
  fetch('/api/laboratory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientName, testName })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Diagnostics lab test request logged.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('requestLabTestModal')).hide();
      loadAllPortalData();
    }
  });
}

// --- Video Consultations room & PDF mock downloads ---
function startMockVideoCall() {
  const modal = new bootstrap.Modal(document.getElementById('videoConsultationModal'));
  modal.show();
  
  // Timer count logic
  let sec = 0;
  const timer = setInterval(() => {
    if (!document.getElementById('videoConsultationModal').classList.contains('show')) {
      clearInterval(timer);
      return;
    }
    sec++;
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    document.getElementById('callDuration').textContent = 
      `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }, 1000);
}

function downloadReport(testName) {
  showToast(`Preparing pdf download for: ${testName}`, 'info');
  setTimeout(() => {
    alert(`Report generated: ${testName} analysis compiled on ${new Date().toLocaleDateString()}. Status: normal.`);
  }, 500);
}

function openProfileEditModal() {
  const matchedPatient = patientsData.find(p => p.name.toLowerCase() === currentUser.name.toLowerCase());
  if (matchedPatient) {
    openEditPatientModal(matchedPatient.id);
  } else {
    showToast('Patient profile not found in database.', 'warning');
  }
}

// Contact form Submission
function handleContactSubmit(event) {
  event.preventDefault();
  showToast('Thank you! Your message has been routed to our front desk.', 'success');
  document.getElementById('contactForm').reset();
}

// --- Auxiliary Helpers ---
function showToast(message, type = 'info') {
  const toastEl = document.getElementById('appToast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  
  // Clean alert classes
  toastEl.className = 'toast align-items-center border-0 shadow-lg';
  
  // Set type accent styles
  if (type === 'success') {
    toastEl.classList.add('bg-success', 'text-white');
    toastIcon.className = 'fa-solid fa-circle-check me-2 fs-5 text-white';
  } else if (type === 'danger') {
    toastEl.classList.add('bg-danger', 'text-white');
    toastIcon.className = 'fa-solid fa-circle-exclamation me-2 fs-5 text-white';
  } else if (type === 'warning') {
    toastEl.classList.add('bg-warning', 'text-dark');
    toastIcon.className = 'fa-solid fa-triangle-exclamation me-2 fs-5 text-dark';
  } else {
    toastEl.classList.add('bg-info', 'text-dark');
    toastIcon.className = 'fa-solid fa-circle-info me-2 fs-5 text-dark';
  }
  
  toastMessage.textContent = message;
  
  const toastInstance = new bootstrap.Toast(toastEl, { delay: 4000 });
  toastInstance.show();
}

function getInitials(name) {
  if (!name) return 'MF';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function clearNotifications() {
  document.getElementById('notificationBadge').style.display = 'none';
  showToast('All notifications cleared.', 'info');
}

function handleGlobalSearch(query) {
  if (query.trim() === '') {
    // Restore tables default views
    updateAllViews();
    return;
  }
  
  showToast(`Filtering workspace matching: "${query}"`, 'info');
  // Simple table row matcher across active portal subsections
  const tables = document.querySelectorAll('table tbody');
  tables.forEach(tbody => {
    Array.from(tbody.rows).forEach(row => {
      const match = Array.from(row.cells).some(cell => cell.textContent.toLowerCase().includes(query.toLowerCase()));
      if (match) {
        row.classList.remove('d-none');
      } else {
        row.classList.add('d-none');
      }
    });
  });
}

// --- Landing Page Specific functions ---
function loadPublicDoctors() {
  const container = document.getElementById('doctorsContainer');
  if (!container) return;
  
  const initialDocs = [
    { name: 'Dr. Alexander Patel', specialization: 'Cardiology', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150' },
    { name: 'Dr. Olivia Martinez', specialization: 'Pediatrics', image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150' },
    { name: 'Dr. William Chen', specialization: 'Neurology', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150' },
    { name: 'Dr. Sophia Ross', specialization: 'Dermatology', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150' }
  ];
  
  container.innerHTML = '';
  initialDocs.forEach(doc => {
    const initials = doc.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
    container.innerHTML += `
      <div class="col-lg-3 col-md-6">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 hover-lift text-center p-4">
          <div class="avatar-circle mx-auto mb-3" style="width:80px;height:80px;font-size:1.6rem;">${initials}</div>
          <h5 class="fw-bold mb-1">${doc.name}</h5>
          <p class="text-muted text-xs mb-3">${doc.specialization} specialist</p>
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-xs btn-outline-primary" onclick="openBookingModal()">Book Appointment</button>
          </div>
        </div>
      </div>
    `;
  });
}
