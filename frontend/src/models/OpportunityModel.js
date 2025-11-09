// src/models/OpportunityModel.js
import { fetchOpportunities } from '../services/api';

// Garanta que está exportando corretamente
export const getOpportunities = async () => {
  const response = await fetchOpportunities();
  return response.data; 
};