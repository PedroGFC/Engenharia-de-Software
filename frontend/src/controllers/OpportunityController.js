import { useEffect, useState } from 'react';
import { fetchOpportunities } from '../services/api';

export const useOpportunityController = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchOpportunities();
        setOpportunities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const applyFilter = (filterText) => {
    return opportunities.filter(opp => 
      opp.titulo.toLowerCase().includes(filterText.toLowerCase()) ||
      opp.ong_nome.toLowerCase().includes(filterText.toLowerCase())
    );
  };

  return { opportunities, loading, error, applyFilter };
};