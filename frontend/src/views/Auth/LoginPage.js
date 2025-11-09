import React, { useState } from 'react';
import { Tabs, Tab, Paper, TextField, Button, Typography, CircularProgress, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import BusinessIcon from '@mui/icons-material/Business';
import { loginUser } from '../../services/api';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState(0); // só visual
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', senha: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await loginUser(form);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('user_name', data.user.nome);

      // decide destino pelo role do backend
      if (data.user.role === 'volunteer') navigate('/volunteer');
      else navigate('/ngo');
    } catch (err) {
      alert(err?.response?.data?.detail || 'Falha no login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #2E7D32 30%, #1976D2 90%)'
    }}>
      <Paper elevation={6} sx={{ width: 400, p: 4, borderRadius: 4 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth" sx={{ mb: 3 }}>
          <Tab icon={<VolunteerActivismIcon />} label="Voluntário" sx={{ fontSize: 16 }} />
          <Tab icon={<BusinessIcon />} label="ONG" sx={{ fontSize: 16 }} />
        </Tabs>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email" variant="outlined" fullWidth margin="normal" required type="email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Senha" variant="outlined" fullWidth margin="normal" required type="password"
            value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading} sx={{ mt: 3 }}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Não tem conta? <Link to="/signup" style={{ color: '#1976D2', textDecoration: 'none', fontWeight: 500 }}>Criar conta</Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
