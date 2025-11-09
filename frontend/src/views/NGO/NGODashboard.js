// frontend/src/pages/NGODashboard.jsx
import React, { useEffect, useState } from 'react';
import { fetchVolunteers, createOpportunity, fetchOpportunities } from '../../services/api';
import {
  Card, CardContent, Typography, Grid, Avatar, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar,
  CircularProgress
} from '@mui/material';
import { VolunteerActivism, Add } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function NGODashboard() {
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // estado do dialog
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // formulário
  const [form, setForm] = useState({
    ong_nome: '',
    endereco: '',
    titulo: '',
    descricao: '',
  });

  // (opcional) listar oportunidades para mostrar na tela
  const [ops, setOps] = useState([]);
  const [opsLoading, setOpsLoading] = useState(false);

  useEffect(() => {
    fetchVolunteers()
      .then(res => setVolunteers(res.data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));

    // (opcional) carregar oportunidades
    setOpsLoading(true);
    fetchOpportunities()
      .then(res => setOps(res.data || []))
      .catch(() => {})
      .finally(() => setOpsLoading(false));
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (!submitting) setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      // O BACKEND espera exatamente estes campos:
      // { titulo, descricao, ong_nome, endereco }
      await createOpportunity(form);

      setSnack({ open: true, message: 'Oportunidade criada com sucesso!', severity: 'success' });
      setForm({ ong_nome: '', endereco: '', titulo: '', descricao: '' });
      setOpen(false);

      // (opcional) recarregar lista de oportunidades
      setOpsLoading(true);
      const res = await fetchOpportunities();
      setOps(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Erro ao criar oportunidade';
      setSnack({ open: true, message: msg, severity: 'error' });
    } finally {
      setSubmitting(false);
      setOpsLoading(false);
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar voluntários: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Grid item>
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
            <VolunteerActivism sx={{ mr: 1, verticalAlign: 'middle' }} />
            Voluntários Cadastrados ({volunteers.length})
          </Typography>
        </Grid>
        <Grid item>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Nova Oportunidade
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {volunteers.map((volunteer) => (
          <Grid item xs={12} md={6} key={volunteer.id}>
            <Card sx={{
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-3px)' }
            }}>
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white' }}>
                      {volunteer.nome?.[0] || '?'}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">{volunteer.nome || 'Sem nome'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {volunteer.mensagem || 'Sem mensagem'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nascimento: {volunteer.nascimento || 'Não informado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      CPF: {volunteer.cpf || 'Não informado'}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      component={Link}
                      to={`/ngo/volunteer/${volunteer.id}`}
                      size="small"
                    >
                      Ver Detalhes
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {volunteers.length === 0 && (
        <Alert severity="info" sx={{ mt: 4 }}>
          Nenhum voluntário encontrado.
        </Alert>
      )}

      {/* (opcional) bloco simples de oportunidades */}
      <div style={{ marginTop: 32 }}>
        <Typography variant="h5" gutterBottom>Oportunidades publicadas</Typography>
        {opsLoading && <CircularProgress size={20} />}
        {!opsLoading && ops.length === 0 && (
          <Alert severity="info">Nenhuma oportunidade cadastrada.</Alert>
        )}
        {!opsLoading && ops.length > 0 && (
          <ul style={{ paddingLeft: 18 }}>
            {ops.map(op => (
              <li key={op.id}>
                <strong>{op.titulo}</strong> — {op.ong_nome} <br />
                <span style={{ color: '#666' }}>{op.descricao}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dialog de criação */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>Nova Oportunidade</DialogTitle>
          <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField
              label="Nome da ONG"
              name="ong_nome"
              value={form.ong_nome}
              onChange={handleChange}
              required
            />
            <TextField
              label="Endereço"
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              required
            />
            <TextField
              label="Título"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              required
            />
            <TextField
              label="Descrição"
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              multiline
              minRows={3}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Criar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
