import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Validação do formulário
const validationSchema = Yup.object({
  fullName: Yup.string().required('Obrigatório'),
  birthDate: Yup.date().required('Obrigatório'),
  cpf: Yup.string().matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  motivation: Yup.string().required('Explique sua motivação')
});

// Funções de integração com o backend
async function consultar_oportunidades() {
  try {
    const response = await fetch('http://localhost:8000/oportunidades', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Erro ao consultar oportunidades:', await response.text());
    }
  } catch (err) {
    console.error('Erro de rede:', err);
  }
}

async function salvarInscricao(dados) {
  try {
    const response = await fetch('http://localhost:8000/inscricoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    const text = await response.text();
    if (response.ok) {
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    } else {
      throw new Error(text);
    }
  } catch (err) {
    throw new Error('Erro de rede: ' + err.message);
  }
}

// Componente principal
export default function SubscriptionForm() {
  const [oportunidadeId, setOportunidadeId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    consultar_oportunidades().then(oportunidades => {
      if (oportunidades && oportunidades.length > 0) {
        setOportunidadeId(oportunidades[0].id);
      } else {
        console.warn('Nenhuma oportunidade encontrada.');
      }
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      birthDate: '',
      cpf: '',
      motivation: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!oportunidadeId) {
        alert("Nenhuma oportunidade disponível para inscrição.");
        return;
      }

      const dadosInscricao = {
        nome: values.fullName,
        nascimento: values.birthDate,
        cpf: values.cpf,
        mensagem: values.motivation,
        oportunidade_id: oportunidadeId
      };

      try {
        await salvarInscricao(dadosInscricao);
        alert("Inscrição enviada com sucesso!");
        navigate('/volunteer');
      } catch (err) {
        alert("Erro ao enviar inscrição: " + err.message);
      }
    }
  });

  return (
    <Paper sx={{ p: 3, maxWidth: 600, margin: '20px auto' }}>
      <Typography variant="h4" gutterBottom>Candidatura</Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome Completo"
              name="fullName"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              error={formik.touched.fullName && Boolean(formik.errors.fullName)}
              helperText={formik.touched.fullName && formik.errors.fullName}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Data de Nascimento"
              type="date"
              InputLabelProps={{ shrink: true }}
              name="birthDate"
              value={formik.values.birthDate}
              onChange={formik.handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="CPF"
              name="cpf"
              placeholder="000.000.000-00"
              value={formik.values.cpf}
              onChange={formik.handleChange}
              error={formik.touched.cpf && Boolean(formik.errors.cpf)}
              helperText={formik.touched.cpf && formik.errors.cpf}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motivação"
              name="motivation"
              value={formik.values.motivation}
              onChange={formik.handleChange}
              error={formik.touched.motivation && Boolean(formik.errors.motivation)}
              helperText={formik.touched.motivation && formik.errors.motivation}
            />
          </Grid>

          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={!oportunidadeId}
            >
              Enviar Candidatura
            </Button>
            <Button variant="outlined" sx={{ ml: 2 }}>Cancelar</Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
