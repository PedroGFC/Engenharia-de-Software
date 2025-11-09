import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import LoginPage from './views/Auth/LoginPage';
import SignupPage from './views/Auth/SignupPage';
import VolunteerDashboard from './views/Volunteer/OpportunityList';
import NGODashboard from './views/NGO/NGODashboard';
import SubscriptionForm from './views/Volunteer/SubscriptionForm';
import VolunteerDetail from './views/NGO/VolunteerDetail';

const theme = createTheme({
  palette: {
    primary: { main: '#2E7D32' },
    secondary: { main: '#1976D2' },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Autenticação */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Voluntário */}
          <Route path="/volunteer" element={<VolunteerDashboard />} />
          <Route path="/volunteer/opportunity/:id" element={<SubscriptionForm />} />
          
          {/* ONG */}
          <Route path="/ngo" element={<NGODashboard />} />
          <Route path="/ngo/volunteer/:id" element={<VolunteerDetail />} />
          
          {/* Redirecionamentos padrão */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}