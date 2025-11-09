import React from 'react';
import { Typography, Paper, Button, Grid } from '@mui/material';

export default function NGODetail() {
  return (
    <Paper style={{ padding: 20, margin: 20 }}>
      <Typography variant="h4" gutterBottom>Detalhes da Ação</Typography>
      
      <Typography variant="h6">Informações da Ação</Typography>
      <Typography>Nome do cliente: Hospital do Cancer</Typography>
      <Typography>Responsável: Lucas Silva</Typography>
      <Typography>Endereço: Av. Santa Maria, Paraíso - 223 - SP</Typography>

      <hr style={{ margin: '20px 0' }} />

      <Typography variant="h6" gutterBottom>Requisitos para Inscrição</Typography>
      <ul>
        <li>Idade entre 18-60 anos</li>
        <li>Inglês fluente</li>
        <li>Experiência com crianças</li>
      </ul>

      <Grid container spacing={2} style={{ marginTop: 20 }}>
        <Grid item>
          <Button variant="contained" color="primary">SE CANDIDATAR</Button>
        </Grid>
        <Grid item>
          <Button variant="outlined">ENTRAR EM CONTATO</Button>
        </Grid>
      </Grid>
    </Paper>
  );
}