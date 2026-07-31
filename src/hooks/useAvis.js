// ============================================================
// frontend/src/hooks/useAvis.js -- NOUVEAU (TanStack Query)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

// ─── Queries ───
export function useAvisDisponibles() {
  return useQuery({
    queryKey: ['avis', 'disponibles'],
    queryFn: () => api.get('/avis').then(r => r.data),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useMesAvis() {
  return useQuery({
    queryKey: ['avis', 'mes-avis'],
    queryFn: () => api.get('/avis/mes-avis').then(r => r.data),
    staleTime: 1 * 60 * 1000,
  });
}

export function useSolde() {
  return useQuery({
    queryKey: ['solde'],
    queryFn: () => api.get('/paiements/solde').then(r => r.data),
    staleTime: 30 * 1000,
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.get('/paiements/transactions').then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Mutations ───
export function useReserverAvis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/avis/${id}/reserver`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avis'] });
      toast.success('Avis reserve ! Tu as 1h pour publier.', {
        icon: '✓',
        style: { borderRadius: '10px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erreur', {
        icon: '✕',
        style: { borderRadius: '10px', background: '#fef2f2', color: '#991b1b' }
      });
    }
  });
}

export function useSoumettreAvis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, lien_avis }) => api.post(`/avis/${id}/soumettre`, { lien_avis }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avis'] });
      toast.success('Avis soumis et valide !', {
        icon: '✓',
        style: { borderRadius: '10px' }
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erreur', {
        icon: '✕',
        style: { borderRadius: '10px', background: '#fef2f2', color: '#991b1b' }
      });
    }
  });
}

export function useAnnulerAvis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/avis/${id}/annuler`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avis'] });
      toast.success('Reservation annulee', { icon: '↩️' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  });
}

export function useDemanderRetrait() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (montant) => api.post('/paiements/retrait', { montant }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solde', 'transactions', 'retraits'] });
      toast.success('Demande de retrait envoyee ! Paiement sous 24-48h.', {
        icon: '💸',
        style: { borderRadius: '10px' }
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erreur', {
        icon: '✕',
        style: { borderRadius: '10px', background: '#fef2f2', color: '#991b1b' }
      });
    }
  });
}
