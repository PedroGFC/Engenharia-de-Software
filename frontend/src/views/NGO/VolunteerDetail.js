import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { updateApplicationStatus } from '../../services/api';
import { useState } from 'react';

export default function VolunteerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);

  const handleStatusUpdate = async (status) => {
    try {
      await updateApplicationStatus(id, status);
      navigate('/ngo');
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: '20px auto' }}>
      <Typography variant="h4">Gerenciar Candidatura</Typography>
      
      <Button 
        variant="contained" 
        color="success" 
        onClick={() => setOpenApprove(true)}
        sx={{ mt: 3, mr: 2 }}
      >
        Aprovar
      </Button>

      <Button 
        variant="outlined" 
        color="error"
        onClick={() => setOpenReject(true)}
      >
        Reprovar
      </Button>

      {/* Diálogos de Confirmação */}
      <Dialog open={openApprove} onClose={() => setOpenApprove(false)}>
        <DialogTitle>Confirmar Aprovação</DialogTitle>
        <DialogContent>
          Tem certeza que deseja aprovar este voluntário?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApprove(false)}>Cancelar</Button>
          <Button onClick={() => handleStatusUpdate('aprovado')} color="success">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReject} onClose={() => setOpenReject(false)}>
        <DialogTitle>Confirmar Reprovação</DialogTitle>
        <DialogContent>
          Esta ação não pode ser desfeita. Continuar?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReject(false)}>Cancelar</Button>
          <Button onClick={() => handleStatusUpdate('rejeitado')} color="error">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}