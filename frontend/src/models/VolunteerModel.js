import { fetchVolunteerById, fetchVolunteers } from '../services/api';

export const getVolunteers = async () => {
  const response = await fetchVolunteers();
  return response.data;
};

export const getVolunteerById = async (id) => {
  const response = await fetchVolunteerById(id);
  return response.data;
};