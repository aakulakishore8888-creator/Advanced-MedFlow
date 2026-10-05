import http.server
import json
import os
import re
import socketserver
import time

PORT = 3000
DB_FILE = os.path.join(os.path.dirname(__file__), 'database.json')

# Initial mock database
INITIAL_DATA = {
  "users": [
    { "id": 1, "username": "admin", "password": "password123", "role": "admin", "name": "Dr. Sarah Jenkins" },
    { "id": 2, "username": "doctor", "password": "password123", "role": "doctor", "name": "Dr. Alexander Patel", "specialization": "Cardiologist" },
    { "id": 3, "username": "patient", "password": "password123", "role": "patient", "name": "John Doe", "age": 34, "gender": "Male", "contact": "+1 (555) 019-2834", "email": "john.doe@example.com" },
    { "id": 4, "username": "pharmacist", "password": "password123", "role": "pharmacist", "name": "Emily Stone" },
    { "id": 5, "username": "receptionist", "password": "password123", "role": "receptionist", "name": "Michael Vance" }
  ],
  "doctors": [
    { "id": 1, "name": "Dr. Alexander Patel", "specialization": "Cardiology", "hours": "09:00 AM - 05:00 PM", "fee": 150, "available": True, "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150" },
    { "id": 2, "name": "Dr. Olivia Martinez", "specialization": "Pediatrics", "hours": "08:00 AM - 02:00 PM", "fee": 120, "available": True, "image": "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150" },
    { "id": 3, "name": "Dr. William Chen", "specialization": "Neurology", "hours": "01:00 PM - 07:00 PM", "fee": 200, "available": False, "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150" },
    { "id": 4, "name": "Dr. Sophia Ross", "specialization": "Dermatology", "hours": "10:00 AM - 04:00 PM", "fee": 130, "available": True, "image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150" }
  ],
  "patients": [
    { "id": 101, "name": "John Doe", "age": 34, "gender": "Male", "contact": "+1 (555) 019-2834", "email": "john.doe@example.com", "allergies": "Penicillin", "bloodGroup": "O+", "emergencyContact": "Jane Doe (+1 555-019-2835)", "history": "Diagnosed with Hypertension in 2024. Regular checkups." },
    { "id": 102, "name": "Emma Watson", "age": 29, "gender": "Female", "contact": "+1 (555) 048-9213", "email": "emma.w@example.com", "allergies": "Peanuts", "bloodGroup": "A-", "emergencyContact": "David Watson (+1 555-048-9214)", "history": "Asthma patient since childhood. Uses Albuterol inhaler." },
    { "id": 103, "name": "Robert Downey", "age": 45, "gender": "Male", "contact": "+1 (555) 091-8832", "email": "robert.d@example.com", "allergies": "None", "bloodGroup": "B+", "emergencyContact": "Susan Downey (+1 555-091-8833)", "history": "Post-surgery recovery for ACL repair. In physical therapy." }
  ],
  "appointments": [
    { "id": 501, "patientId": 101, "patientName": "John Doe", "doctorId": 1, "doctorName": "Dr. Alexander Patel", "date": "2026-07-01", "time": "10:00 AM", "status": "Scheduled", "type": "In-person" },
    { "id": 502, "patientId": 102, "patientName": "Emma Watson", "doctorId": 2, "doctorName": "Dr. Olivia Martinez", "date": "2026-07-02", "time": "11:30 AM", "status": "Completed", "type": "Video" },
    { "id": 503, "patientId": 103, "patientName": "Robert Downey", "doctorId": 4, "doctorName": "Dr. Sophia Ross", "date": "2026-07-03", "time": "03:00 PM", "status": "Pending", "type": "In-person" }
  ],
  "pharmacy": [
    { "id": 301, "name": "Amoxicillin 500mg", "category": "Antibiotic", "stock": 120, "price": 15.50, "unit": "Box" },
    { "id": 302, "name": "Paracetamol 500mg", "category": "Analgesic", "stock": 500, "price": 4.20, "unit": "Pack" },
    { "id": 303, "name": "Metformin 850mg", "category": "Antidiabetic", "stock": 95, "price": 22.00, "unit": "Box" },
    { "id": 304, "name": "Atorvastatin 20mg", "category": "Cardiovascular", "stock": 75, "price": 35.80, "unit": "Box" },
    { "id": 305, "name": "Albuterol Inhaler", "category": "Respiratory", "stock": 40, "price": 18.00, "unit": "Piece" }
  ],
  "laboratory": [
    { "id": 401, "patientName": "John Doe", "testName": "Lipid Profile", "date": "2026-06-28", "status": "Completed", "result": "Cholesterol: 185 mg/dL (Normal: <200), HDL: 52 mg/dL (Normal: >40), LDL: 110 mg/dL (Normal: <100)", "file": "lipid_report_101.pdf" },
    { "id": 402, "patientName": "Emma Watson", "testName": "Complete Blood Count (CBC)", "date": "2026-06-29", "status": "Completed", "result": "WBC: 6.5 x10^3/uL, RBC: 4.8 x10^6/uL, Hemoglobin: 13.8 g/dL, Platelets: 250 x10^3/uL (All within normal ranges)", "file": "cbc_report_102.pdf" },
    { "id": 403, "patientName": "Robert Downey", "testName": "Liver Function Test", "date": "2026-07-02", "status": "Pending", "result": "Pending laboratory verification.", "file": "" }
  ],
  "billing": [
    { "id": 801, "patientName": "John Doe", "description": "Cardiology Consultation + ECG Test", "amount": 250.00, "date": "2026-06-30", "status": "Paid", "method": "Credit Card", "insurance": "Blue Cross (90% covered)" },
    { "id": 802, "patientName": "Emma Watson", "description": "Pediatric Clinic Visit + Lab Test", "amount": 180.00, "date": "2026-06-29", "status": "Unpaid", "method": "-", "insurance": "None" },
    { "id": 803, "patientName": "Robert Downey", "description": "Pharmacy Prescription (Atorvastatin)", "amount": 35.80, "date": "2026-06-30", "status": "Paid", "method": "Cash", "insurance": "Aetna" }
  ],
  "prescriptions": [
    { "id": 601, "patientId": 101, "patientName": "John Doe", "doctorName": "Dr. Alexander Patel", "date": "2026-06-30", "details": "Atorvastatin 20mg - Once daily at bedtime. Limit fatty food intake." },
    { "id": 602, "patientId": 102, "patientName": "Emma Watson", "doctorName": "Dr. Olivia Martinez", "date": "2026-06-29", "details": "Albuterol Inhaler - 2 puffs as needed for shortness of breath." }
  ]
}

def read_db():
    if not os.path.exists(DB_FILE):
        write_db(INITIAL_DATA)
        return INITIAL_DATA
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print("Error reading db, returning initial data:", e)
        return INITIAL_DATA

def write_db(data):
    try:
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print("Error writing db:", e)

class HospitalHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve from public directory
        super().__init__(*args, directory=os.path.join(os.path.dirname(__file__), 'public'), **kwargs)

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error_json(self, message, status=400):
        self.send_json({"success": False, "message": message}, status)

    def get_post_data(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            return json.loads(post_data.decode('utf-8'))
        except Exception:
            return {}

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        path = self.path.split('?')[0]
        
        # --- API GET Endpoints ---
        if path == '/api/doctors':
            self.send_json(read_db()['doctors'])
            return
        elif path == '/api/patients':
            self.send_json(read_db()['patients'])
            return
        elif path == '/api/appointments':
            self.send_json(read_db()['appointments'])
            return
        elif path == '/api/pharmacy':
            self.send_json(read_db()['pharmacy'])
            return
        elif path == '/api/laboratory':
            self.send_json(read_db()['laboratory'])
            return
        elif path == '/api/billing':
            self.send_json(read_db()['billing'])
            return
        elif path == '/api/prescriptions':
            self.send_json(read_db()['prescriptions'])
            return
            
        # --- Static File and SPA handling ---
        if '.' in os.path.basename(path):
            super().do_GET()
        else:
            # Fallback to index.html for Single Page Routing
            self.path = '/index.html'
            super().do_GET()

    def do_POST(self):
        path = self.path.split('?')[0]
        db = read_db()
        data = self.get_post_data()

        if path == '/api/auth/login':
            username = data.get('username')
            password = data.get('password')
            role = data.get('role')
            
            user = next((u for u in db['users'] if u['username'] == username and u['password'] == password and u['role'] == role), None)
            if user:
                self.send_json({
                    "success": True,
                    "message": "Login successful",
                    "token": "mock-jwt-token-xyz-" + user['role'],
                    "user": {
                        "id": user['id'],
                        "name": user['name'],
                        "username": user['username'],
                        "role": user['role'],
                        "specialization": user.get('specialization', '')
                    }
                })
            else:
                self.send_error_json("Invalid username, password, or role", 401)
            return

        elif path == '/api/appointments':
            patient_name = data.get('patientName', 'John Doe')
            doctor_id = int(data.get('doctorId', 1))
            date = data.get('date')
            time_val = data.get('time')
            app_type = data.get('type', 'In-person')
            
            doctor = next((d for d in db['doctors'] if d['id'] == doctor_id), None)
            new_app = {
                "id": int(time.time() * 1000),
                "patientId": 101,
                "patientName": patient_name,
                "doctorId": doctor_id,
                "doctorName": doctor['name'] if doctor else 'Unknown Doctor',
                "date": date,
                "time": time_val,
                "status": "Scheduled",
                "type": app_type
            }
            db['appointments'].append(new_app)
            write_db(db)
            self.send_json({"success": True, "appointment": new_app}, 201)
            return

        elif path == '/api/patients':
            new_patient = {
                "id": int(time.time() * 1000),
                "name": data.get('name'),
                "age": int(data.get('age', 30)),
                "gender": data.get('gender'),
                "contact": data.get('contact'),
                "email": data.get('email'),
                "allergies": data.get('allergies', 'None'),
                "bloodGroup": data.get('bloodGroup', 'O+'),
                "emergencyContact": data.get('emergencyContact'),
                "history": data.get('history', '')
            }
            db['patients'].append(new_patient)
            write_db(db)
            self.send_json({"success": True, "patient": new_patient}, 201)
            return

        elif path == '/api/doctors':
            new_doctor = {
                "id": int(time.time() * 1000),
                "name": data.get('name'),
                "specialization": data.get('specialization'),
                "hours": data.get('hours', '09:00 AM - 05:00 PM'),
                "fee": int(data.get('fee', 100)),
                "available": data.get('available', True),
                "image": data.get('image', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150')
            }
            db['doctors'].append(new_doctor)
            write_db(db)
            self.send_json({"success": True, "doctor": new_doctor}, 201)
            return

        elif path == '/api/pharmacy/dispense':
            med_id = int(data.get('medicineId', 0))
            qty = int(data.get('quantity', 0))
            pat_name = data.get('patientName')
            
            med = next((m for m in db['pharmacy'] if m['id'] == med_id), None)
            if med and med['stock'] >= qty:
                med['stock'] -= qty
                
                new_bill = {
                    "id": int(time.time() * 1000),
                    "patientName": pat_name,
                    "description": f"Pharmacy: Dispensed {med['name']} x{qty}",
                    "amount": med['price'] * qty,
                    "date": time.strftime('%Y-%m-%d'),
                    "status": "Paid",
                    "method": "Cash",
                    "insurance": "None"
                }
                db['billing'].append(new_bill)
                write_db(db)
                self.send_json({"success": True, "message": "Medicine dispensed successfully", "bill": new_bill})
            else:
                self.send_error_json("Insufficient stock or invalid medicine", 400)
            return

        elif path == '/api/pharmacy':
            new_med = {
                "id": int(time.time() * 1000),
                "name": data.get('name'),
                "category": data.get('category'),
                "stock": int(data.get('stock', 0)),
                "price": float(data.get('price', 0.0)),
                "unit": data.get('unit', 'Box')
            }
            db['pharmacy'].append(new_med)
            write_db(db)
            self.send_json({"success": True, "medicine": new_med}, 201)
            return

        elif path == '/api/laboratory':
            new_lab = {
                "id": int(time.time() * 1000),
                "patientName": data.get('patientName'),
                "testName": data.get('testName'),
                "date": time.strftime('%Y-%m-%d'),
                "status": "Pending",
                "result": "Pending laboratory verification.",
                "file": ""
            }
            db['laboratory'].append(new_lab)
            write_db(db)
            self.send_json({"success": True, "lab": new_lab}, 201)
            return

        elif path == '/api/billing/pay':
            bill_id = int(data.get('id', 0))
            method = data.get('method', 'Online')
            
            bill = next((b for b in db['billing'] if b['id'] == bill_id), None)
            if bill:
                bill['status'] = 'Paid'
                bill['method'] = method
                write_db(db)
                self.send_json({"success": True, "bill": bill})
            else:
                self.send_error_json("Invoice not found", 404)
            return

        elif path == '/api/prescriptions':
            new_presc = {
                "id": int(time.time() * 1000),
                "patientId": int(data.get('patientId', 101)),
                "patientName": data.get('patientName'),
                "doctorName": data.get('doctorName'),
                "date": time.strftime('%Y-%m-%d'),
                "details": data.get('details')
            }
            db['prescriptions'].append(new_presc)
            write_db(db)
            self.send_json({"success": True, "prescription": new_presc}, 201)
            return

        self.send_error_json("Route not found", 404)

    def do_PUT(self):
        path = self.path.split('?')[0]
        db = read_db()
        data = self.get_post_data()

        # Match /api/appointments/:id
        m = re.match(r'^/api/appointments/(\d+)$', path)
        if m:
            app_id = int(m.group(1))
            app = next((a for a in db['appointments'] if a['id'] == app_id), None)
            if app:
                if 'status' in data: app['status'] = data['status']
                if 'date' in data: app['date'] = data['date']
                if 'time' in data: app['time'] = data['time']
                write_db(db)
                self.send_json({"success": True, "appointment": app})
            else:
                self.send_error_json("Appointment not found", 404)
            return

        # Match /api/patients/:id
        m = re.match(r'^/api/patients/(\d+)$', path)
        if m:
            pat_id = int(m.group(1))
            pat_idx = next((i for i, p in enumerate(db['patients']) if p['id'] == pat_id), -1)
            if pat_idx != -1:
                for key, val in data.items():
                    if key != 'id':
                        if key == 'age':
                            db['patients'][pat_idx][key] = int(val)
                        else:
                            db['patients'][pat_idx][key] = val
                write_db(db)
                self.send_json({"success": True, "patient": db['patients'][pat_idx]})
            else:
                self.send_error_json("Patient not found", 404)
            return

        # Match /api/doctors/:id
        m = re.match(r'^/api/doctors/(\d+)$', path)
        if m:
            doc_id = int(m.group(1))
            doc = next((d for d in db['doctors'] if d['id'] == doc_id), None)
            if doc:
                if 'available' in data: doc['available'] = bool(data['available'])
                if 'name' in data: doc['name'] = data['name']
                if 'specialization' in data: doc['specialization'] = data['specialization']
                if 'hours' in data: doc['hours'] = data['hours']
                if 'fee' in data: doc['fee'] = int(data['fee'])
                write_db(db)
                self.send_json({"success": True, "doctor": doc})
            else:
                self.send_error_json("Doctor not found", 404)
            return

        # Match /api/laboratory/:id
        m = re.match(r'^/api/laboratory/(\d+)$', path)
        if m:
            lab_id = int(m.group(1))
            lab = next((l for l in db['laboratory'] if l['id'] == lab_id), None)
            if lab:
                if 'status' in data: lab['status'] = data['status']
                if 'result' in data: lab['result'] = data['result']
                write_db(db)
                self.send_json({"success": True, "lab": lab})
            else:
                self.send_error_json("Lab test not found", 404)
            return

        self.send_error_json("Route not found", 404)

    def do_DELETE(self):
        path = self.path.split('?')[0]
        db = read_db()

        # Match /api/patients/:id
        m = re.match(r'^/api/patients/(\d+)$', path)
        if m:
            pat_id = int(m.group(1))
            filtered = [p for p in db['patients'] if p['id'] != pat_id]
            if len(filtered) != len(db['patients']):
                db['patients'] = filtered
                write_db(db)
                self.send_json({"success": True, "message": "Patient deleted successfully"})
            else:
                self.send_error_json("Patient not found", 404)
            return

        self.send_error_json("Route not found", 404)

# Start server
if __name__ == '__main__':
    # Initialize JSON file
    read_db()
    
    server_address = ('', PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, HospitalHTTPRequestHandler)
    print(f"Python Mock Server started at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    print("Server stopped.")
