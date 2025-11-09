import React from 'react';
import { Box, Typography, Grid, Button, Container, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import VolunteerAct from '@mui/icons-material/VolunteerActivism';
import GroupsIcon from '@mui/icons-material/Groups';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box textAlign="center" py={8}>
        <Typography variant="h2" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Conectando Voluntários e ONGs
        </Typography>
        
        <Grid container spacing={4} mt={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, height: '100%' }}>
              <VolunteerAct sx={{ fontSize: 80, color: 'secondary.main' }} />
              <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                Sou Voluntário
              </Typography>
              <Typography variant="body1" paragraph>
                Encontre oportunidades de voluntariado que combinam com suas habilidades e disponibilidade.
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                component={Link}
                to="/volunteer"
                sx={{ mt: 2 }}
              >
                Buscar Oportunidades
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, height: '100%' }}>
              <GroupsIcon sx={{ fontSize: 80, color: 'secondary.main' }} />
              <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                Sou ONG
              </Typography>
              <Typography variant="body1" paragraph>
                Gerencie suas vagas de voluntariado e conecte-se com profissionais qualificados.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                component={Link}
                to="/ngo"
                sx={{ mt: 2 }}
              >
                Gerenciar Voluntários
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}