const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database File Path
const DB_FILE = path.join(__dirname, 'database.json');

// Initial Mock Data
const initialData = {
  users: [
    { id: 1, username: 'admin', password: 'password123', role: 'admin', name: 'Dr. Sarah Jenkins' },
    { id: 2, username: 'doctor', password: 'password123', role: 'doctor', name: 'Dr. Alexander Patel', specialization: 'Cardiologist' },
    { id: 3, username: 'patient', password: 'password123', role: 'patient', name: 'John Doe', age: 34, gender: 'Male', contact: '+1 (555) 019-2834', email: 'john.doe@example.com' },
    { id: 4, username: 'pharmacist', password: 'password123', role: 'pharmacist', name: 'Emily Stone' },
    { id: 5, username: 'receptionist', password: 'password123', role: 'receptionist', name: 'Michael Vance' }
  ],
  doctors: [
    { id: 1, name: 'Dr. Alexander Patel', specialization: 'Cardiology', hours: '09:00 AM - 05:00 PM', fee: 150, available: true, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150' },
    { id: 2, name: 'Dr. Olivia Martinez', specialization: 'Pediatrics', hours: '08:00 AM - 02:00 PM', fee: 120, available: true, image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150' },
    { id: 3, name: 'Dr. William Chen', specialization: 'Neurology', hours: '01:00 PM - 07:00 PM', fee: 200, available: false, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150' },
    { id: 4, name: 'Dr. Sophia Ross', specialization: 'Dermatology', hours: '10:00 AM - 04:00 PM', fee: 130, available: true, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150' }
  ],
  patients: [
    { id: 101, name: 'John Doe', age: 34, gender: 'Male', contact: '+1 (555) 019-2834', email: 'john.doe@example.com', allergies: 'Penicillin', bloodGroup: 'O+', emergencyContact: 'Jane Doe (+1 555-019-2835)', history: 'Diagnosed with Hypertension in 2024. Regular checkups.' },
    { id: 102, name: 'Emma Watson', age: 29, gender: 'Female', contact: '+1 (555) 048-9213', email: 'emma.w@example.com', allergies: 'Peanuts', bloodGroup: 'A-', emergencyContact: 'David Watson (+1 555-048-9214)', history: 'Asthma patient since childhood. Uses Albuterol inhaler.' },
    { id: 103, name: 'Robert Downey', age: 45, gender: 'Male', contact: '+1 (555) 091-8832', email: 'robert.d@example.com', allergies: 'None', bloodGroup: 'B+', emergencyContact: 'Susan Downey (+1 555-091-8833)', history: 'Post-surgery recovery for ACL repair. In physical therapy.' }
  ],
  appointments: [
    { id: 501, patientId: 101, patientName: 'John Doe', doctorId: 1, doctorName: 'Dr. Alexander Patel', date: '2026-07-01', time: '10:00 AM', status: 'Scheduled', type: 'In-person' },
    { id: 502, patientId: 102, patientName: 'Emma Watson', doctorId: 2, doctorName: 'Dr. Olivia Martinez', date: '2026-07-02', time: '11:30 AM', status: 'Completed', type: 'Video' },
    { id: 503, patientId: 103, patientName: 'Robert Downey', doctorId: 4, doctorName: 'Dr. Sophia Ross', date: '2026-07-03', time: '03:00 PM', status: 'Pending', type: 'In-person' }
  ],
  pharmacy: [
    { id: 301, name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 120, price: 15.50, unit: 'Box' },
    { id: 302, name: 'Paracetamol 500mg', category: 'Analgesic', stock: 500, price: 4.20, unit: 'Pack' },
    { id: 303, name: 'Metformin 850mg', category: 'Antidiabetic', stock: 95, price: 22.00, unit: 'Box' },
    { id: 304, name: 'Atorvastatin 20mg', category: 'Cardiovascular', stock: 75, price: 35.80, unit: 'Box' },
    { id: 305, name: 'Albuterol Inhaler', category: 'Respiratory', stock: 40, price: 18.00, unit: 'Piece' }
  ],
  laboratory: [
    { id: 401, patientName: 'John Doe', testName: 'Lipid Profile', date: '2026-06-28', status: 'Completed', result: 'Cholesterol: 185 mg/dL (Normal: <200), HDL: 52 mg/dL (Normal: >40), LDL: 110 mg/dL (Normal: <100)', file: 'lipid_report_101.pdf' },
    { id: 402, patientName: 'Emma Watson', testName: 'Complete Blood Count (CBC)', date: '2026-06-29', status: 'Completed', result: 'WBC: 6.5 x10^3/uL, RBC: 4.8 x10^6/uL, Hemoglobin: 13.8 g/dL, Platelets: 250 x10^3/uL (All within normal ranges)', file: 'cbc_report_102.pdf' },
    { id: 403, patientName: 'Robert Downey', testName: 'Liver Function Test', date: '2026-07-02', status: 'Pending', result: 'Pending laboratory verification.', file: '' }
  ],
  billing: [
    { id: 801, patientName: 'John Doe', description: 'Cardiology Consultation + ECG Test', amount: 250.00, date: '2026-06-30', status: 'Paid', method: 'Credit Card', insurance: 'Blue Cross (90% covered)' },
    { id: 802, patientName: 'Emma Watson', description: 'Pediatric Clinic Visit + Lab Test', amount: 180.00, date: '2026-06-29', status: 'Unpaid', method: '-', insurance: 'None' },
    { id: 803, patientName: 'Robert Downey', description: 'Pharmacy Prescription (Atorvastatin)', amount: 35.80, date: '2026-06-30', status: 'Paid', method: 'Cash', insurance: 'Aetna' }
  ],
  prescriptions: [
    { id: 601, patientId: 101, patientName: 'John Doe', doctorName: 'Dr. Alexander Patel', date: '2026-06-30', details: 'Atorvastatin 20mg - Once daily at bedtime. Limit fatty food intake.' },
    { id: 602, patientId: 102, patientName: 'Emma Watson', doctorName: 'Dr. Olivia Martinez', date: '2026-06-29', details: 'Albuterol Inhaler - 2 puffs as needed for shortness of breath.' }
  ]
};

// Database helper functions
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB:', error);
    return initialData;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing DB:', error);
  }
}

// Ensure database file is initialized
readDB();

// --- API Routes ---

// Login API
app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username && u.password === password && u.role === role);
  
  if (user) {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token-xyz-' + user.role,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        specialization: user.specialization || ''
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username, password, or role' });
  }
});

// Get all appointments
app.get('/api/appointments', (req, res) => {
  const db = readDB();
  res.json(db.appointments);
});

// Book an appointment
app.post('/api/appointments', (req, res) => {
  const { patientName, doctorId, date, time, type } = req.body;
  const db = readDB();
  const doctor = db.doctors.find(d => d.id == doctorId);
  
  const newAppointment = {
    id: Date.now(),
    patientId: 101, // default mock user
    patientName: patientName || 'John Doe',
    doctorId: parseInt(doctorId),
    doctorName: doctor ? doctor.name : 'Unknown Doctor',
    date,
    time,
    status: 'Scheduled',
    type: type || 'In-person'
  };
  
  db.appointments.push(newAppointment);
  writeDB(db);
  res.status(201).json({ success: true, appointment: newAppointment });
});

// Update appointment status (Cancel / Reschedule / Complete)
app.put('/api/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { status, date, time } = req.body;
  const db = readDB();
  const appIndex = db.appointments.findIndex(a => a.id === id);
  
  if (appIndex !== -1) {
    if (status) db.appointments[appIndex].status = status;
    if (date) db.appointments[appIndex].date = date;
    if (time) db.appointments[appIndex].time = time;
    writeDB(db);
    res.json({ success: true, appointment: db.appointments[appIndex] });
  } else {
    res.status(404).json({ success: false, message: 'Appointment not found' });
  }
});

// Patients API
app.get('/api/patients', (req, res) => {
  const db = readDB();
  res.json(db.patients);
});

app.post('/api/patients', (req, res) => {
  const { name, age, gender, contact, email, allergies, bloodGroup, emergencyContact, history } = req.body;
  const db = readDB();
  const newPatient = {
    id: Date.now(),
    name,
    age: parseInt(age),
    gender,
    contact,
    email,
    allergies,
    bloodGroup,
    emergencyContact,
    history
  };
  
  db.patients.push(newPatient);
  writeDB(db);
  res.status(201).json({ success: true, patient: newPatient });
});

app.put('/api/patients/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();
  const idx = db.patients.findIndex(p => p.id === id);
  if (idx !== -1) {
    db.patients[idx] = { ...db.patients[idx], ...req.body, id };
    writeDB(db);
    res.json({ success: true, patient: db.patients[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Patient not found' });
  }
});

app.delete('/api/patients/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();
  const filtered = db.patients.filter(p => p.id !== id);
  if (filtered.length !== db.patients.length) {
    db.patients = filtered;
    writeDB(db);
    res.json({ success: true, message: 'Patient deleted successfully' });
  } else {
    res.status(404).json({ success: false, message: 'Patient not found' });
  }
});

// Doctors API
app.get('/api/doctors', (req, res) => {
  const db = readDB();
  res.json(db.doctors);
});

app.post('/api/doctors', (req, res) => {
  const db = readDB();
  const newDoctor = {
    id: Date.now(),
    ...req.body,
    available: req.body.available !== undefined ? req.body.available : true
  };
  db.doctors.push(newDoctor);
  writeDB(db);
  res.status(201).json({ success: true, doctor: newDoctor });
});

app.put('/api/doctors/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { available, name, specialization, hours, fee } = req.body;
  const db = readDB();
  const docIndex = db.doctors.findIndex(d => d.id === id);
  
  if (docIndex !== -1) {
    if (available !== undefined) db.doctors[docIndex].available = available;
    if (name) db.doctors[docIndex].name = name;
    if (specialization) db.doctors[docIndex].specialization = specialization;
    if (hours) db.doctors[docIndex].hours = hours;
    if (fee) db.doctors[docIndex].fee = parseInt(fee);
    writeDB(db);
    res.json({ success: true, doctor: db.doctors[docIndex] });
  } else {
    res.status(404).json({ success: false, message: 'Doctor not found' });
  }
});

// Pharmacy API
app.get('/api/pharmacy', (req, res) => {
  const db = readDB();
  res.json(db.pharmacy);
});

app.post('/api/pharmacy/dispense', (req, res) => {
  const { medicineId, quantity, patientName } = req.body;
  const db = readDB();
  const item = db.pharmacy.find(p => p.id === parseInt(medicineId));
  
  if (item && item.stock >= quantity) {
    item.stock -= quantity;
    
    // Add to billing
    const newBill = {
      id: Date.now(),
      patientName,
      description: `Pharmacy: Dispensed ${item.name} x${quantity}`,
      amount: item.price * quantity,
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      method: 'Cash',
      insurance: 'None'
    };
    db.billing.push(newBill);
    
    writeDB(db);
    res.json({ success: true, message: 'Medicine dispensed successfully', bill: newBill });
  } else {
    res.status(400).json({ success: false, message: 'Insufficient stock or invalid medicine' });
  }
});

app.post('/api/pharmacy', (req, res) => {
  const { name, category, stock, price, unit } = req.body;
  const db = readDB();
  
  const newMedicine = {
    id: Date.now(),
    name,
    category,
    stock: parseInt(stock) || 0,
    price: parseFloat(price) || 0.0,
    unit: unit || 'Box'
  };
  
  db.pharmacy.push(newMedicine);
  writeDB(db);
  res.status(201).json({ success: true, medicine: newMedicine });
});

// Laboratory API
app.get('/api/laboratory', (req, res) => {
  const db = readDB();
  res.json(db.laboratory);
});

app.post('/api/laboratory', (req, res) => {
  const { patientName, testName } = req.body;
  const db = readDB();
  const newLab = {
    id: Date.now(),
    patientName,
    testName,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    result: 'Pending laboratory verification.',
    file: ''
  };
  db.laboratory.push(newLab);
  writeDB(db);
  res.status(201).json({ success: true, lab: newLab });
});

app.put('/api/laboratory/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { status, result } = req.body;
  const db = readDB();
  const labIndex = db.laboratory.findIndex(l => l.id === id);
  
  if (labIndex !== -1) {
    if (status) db.laboratory[labIndex].status = status;
    if (result) db.laboratory[labIndex].result = result;
    writeDB(db);
    res.json({ success: true, lab: db.laboratory[labIndex] });
  } else {
    res.status(404).json({ success: false, message: 'Lab test not found' });
  }
});

// Billing API
app.get('/api/billing', (req, res) => {
  const db = readDB();
  res.json(db.billing);
});

app.post('/api/billing/pay', (req, res) => {
  const { id, method } = req.body;
  const db = readDB();
  const bill = db.billing.find(b => b.id === parseInt(id));
  if (bill) {
    bill.status = 'Paid';
    bill.method = method || 'Online';
    writeDB(db);
    res.json({ success: true, bill });
  } else {
    res.status(404).json({ success: false, message: 'Invoice not found' });
  }
});

// Prescriptions API
app.get('/api/prescriptions', (req, res) => {
  const db = readDB();
  res.json(db.prescriptions);
});

app.post('/api/prescriptions', (req, res) => {
  const { patientId, patientName, doctorName, details } = req.body;
  const db = readDB();
  const newPrescription = {
    id: Date.now(),
    patientId: parseInt(patientId),
    patientName,
    doctorName,
    date: new Date().toISOString().split('T')[0],
    details
  };
  db.prescriptions.push(newPrescription);
  writeDB(db);
  res.status(201).json({ success: true, prescription: newPrescription });
});

// Serve frontend main entrypoint for any frontend routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
