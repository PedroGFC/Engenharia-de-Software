import React, { useState } from 'react';
import { useOpportunityController } from '../../controllers/OpportunityController';
import { Card, CardContent, Typography, Grid, TextField, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function OpportunityList() {
  const { opportunities, loading, error, applyFilter } = useOpportunityController();
  const [filter, setFilter] = useState('');

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  const filtered = applyFilter(filter);

  return (
    <div style={{ padding: 20 }}>
      <TextField
        label="Buscar oportunidades"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        fullWidth
        margin="normal"
      />

      <Grid container spacing={3}>
        {filtered.map(opp => (
          <Grid item xs={12} md={6} key={opp.id}>
            <Card>
              <CardContent>
                <Typography variant="h5">{opp.titulo}</Typography>
                <Typography color="textSecondary">{opp.ong_nome}</Typography>
                <Typography>{opp.descricao}</Typography>
                <Button 
                  component={Link} 
                  to={`/volunteer/opportunity/${opp.id}`}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}