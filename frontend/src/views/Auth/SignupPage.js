import React, { useState } from 'react';
import { TextField, Button, Typography, Paper, RadioGroup, FormControlLabel, Radio, CircularProgress, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from '../../services/api';

export default function SignupPage() {
  const [userType, setUserType] = useState('volunteer');
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', cnpj: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        role: userType,
        cnpj: userType === 'ngo' ? form.cnpj : null
      };
      const { data } = await signupUser(payload);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('user_name', data.user.nome);

      if (data.user.role === 'volunteer') navigate('/volunteer');
      else navigate('/ngo');
    } catch (err) {
      alert(err?.response?.data?.detail || 'Falha ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #1976D2 30%, #2E7D32 90%)'
    }}>
      <Paper elevation={6} sx={{ width: 400, p: 4, borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom align="center">Criar Conta</Typography>

        <RadioGroup row value={userType} onChange={(e) => setUserType(e.target.value)} sx={{ justifyContent: 'center', mb: 3 }}>
          <FormControlLabel value="volunteer" control={<Radio color="primary" />} label="Voluntário" />
          <FormControlLabel value="ngo" control={<Radio color="primary" />} label="ONG" />
        </RadioGroup>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Nome Completo" variant="outlined" fullWidth margin="normal" required
            value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          {userType === 'ngo' && (
            <TextField
              label="CNPJ" variant="outlined" fullWidth margin="normal" required placeholder="00.000.000/0000-00"
              value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
            />
          )}
          <TextField
            label="Email" variant="outlined" fullWidth margin="normal" required type="email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Senha" variant="outlined" fullWidth margin="normal" required type="password"
            value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />

          <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading} sx={{ mt: 2 }}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Criar Conta'}
          </Button>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Já tem conta? <Link to="/login" style={{ color: '#2E7D32', textDecoration: 'none', fontWeight: 500 }}>Fazer Login</Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
