import { fetchVolunteers, fetchVolunteerById } from '../services/api';

export const useVolunteerController = () => {
  const loadVolunteers = async () => {
    try {
      const response = await fetchVolunteers();
      return response.data;
    } catch (error) {
      console.error("Erro ao carregar voluntários:", error);
      throw error;
    }
  };

  const loadVolunteerDetails = async (id) => {
    try {
      const response = await fetchVolunteerById(id);
      return response.data;
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      throw error;
    }
  };

  return { loadVolunteers, loadVolunteerDetails };
};