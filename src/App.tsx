import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from './components/Login/LoginPage';
import { DashboardLayout } from './components/Dashboard/DashboardLayout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { PatientsList } from './components/Patients/PatientsList';
import { PatientQueue } from './components/Patients/PatientQueue';
import { SimulationDashboard } from './components/Simulation/SimulationDashboard';
import { BedsList } from './components/Resources/BedsList';
import { DoctorsList } from './components/Resources/DoctorsList';
import { NursesList } from './components/Resources/NursesList';
import { EquipmentList } from './components/Resources/EquipmentList';
import { EmergencyList } from './components/Resources/EmergencyList';
import { Profile } from './components/Dashboard/Profile';
import { Alerts } from './components/Dashboard/Alerts';
import { Reports } from './components/Dashboard/Reports';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<PatientsList />} />
            <Route path="queue" element={<PatientQueue />} />
            <Route path="beds" element={<BedsList />} />
            <Route path="doctors" element={<DoctorsList />} />
            <Route path="nurses" element={<NursesList />} />
            <Route path="equipment" element={<EquipmentList />} />
            <Route path="emergency" element={<EmergencyList />} />
            <Route path="simulation" element={<SimulationDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
