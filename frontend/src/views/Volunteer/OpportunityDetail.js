import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography, 
  Paper, 
  Button, 
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText 
} from '@mui/material';
import { useOpportunityController } from '../../controllers/OpportunityController';

export default function OpportunityDetail() {
  const { id } = useParams();
  const { opportunities } = useOpportunityController();
  const opportunity = opportunities.find(opp => opp.id === parseInt(id));

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: '20px auto' }}>
      <Typography variant="h4" gutterBottom>{opportunity.title}</Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Cliente: {opportunity.client}</Typography>
          <Typography>Data: {opportunity.date}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Requisitos:</Typography>
          <List dense>
            {opportunity.requirements.map((req, index) => (
              <ListItem key={index}>
                <ListItemText primary={`• ${req}`} />
              </ListItem>
            ))}
          </List>
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            component={Link}
            to={`/volunteer/opportunity/${id}/apply`}
            sx={{ mr: 2 }}
          >
            SE CANDIDATAR
          </Button>
          <Button 
            variant="outlined" 
            component={Link}
            to="/volunteer"
          >
            VOLTAR
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}