// ============================================================
// frontend/src/hooks/useAvis.js -- NOUVEAU (TanStack Query)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

// Les avis classiques et les avis publics (clients sans compte) sont présentés
// comme une seule liste : le membre n'a pas à connaître la différence. Chaque
// avis garde sa `source` pour appeler la bonne route, et une `cle` unique car
// les deux tables numérotent leurs avis chacune de leur côté.
const baseUrl = (source) => (source === 'public' ? '/public/avis' : '/avis');
const marquer = (source) => (a) => ({ ...a, source, cle: `${source}-${a.id}` });
const pasDePublic = () => [];

// ─── Queries ───
export function useAvisDisponibles() {
  return useQuery({
    queryKey: ['avis', 'disponibles'],
    queryFn: async () => {
      const [classiques, publics] = await Promise.all([
        api.get('/avis').then(r => r.data.map(marquer('classique'))),
        api.get('/public/avis-disponibles').then(r => r.data.map(marquer('public'))).catch(pasDePublic),
      ]);
      // Prioritaires d'abord, puis les plus récents
      return [...classiques, ...publics].sort((a, b) =>
        (b.prioritaire ? 1 : 0) - (a.prioritaire ? 1 : 0) ||
        new Date(String(b.created_at).replace(' ', 'T') + 'Z') - new Date(String(a.created_at).replace(' ', 'T') + 'Z'));
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useMesAvis() {
  return useQuery({
    queryKey: ['avis', 'mes-avis'],
    queryFn: async () => {
      const [classiques, publics] = await Promise.all([
        api.get('/avis/mes-avis').then(r => r.data.map(marquer('classique'))),
        api.get('/public/mes-avis').then(r => r.data.map(marquer('public'))).catch(pasDePublic),
      ]);
      return [...classiques, ...publics];
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useMonPalier() {
  return useQuery({
    queryKey: ['avis', 'mon-palier'],
    queryFn: () => api.get('/avis/mon-palier').then(r => r.data),
    staleTime: 60 * 1000,
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
    mutationFn: ({ id, source }) => api.post(`${baseUrl(source)}/${id}/reserver`),
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
    mutationFn: ({ id, source, lien_avis }) => api.post(`${baseUrl(source)}/${id}/soumettre`, { lien_avis }),
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
    mutationFn: ({ id, source }) => api.post(`${baseUrl(source)}/${id}/annuler`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avis'] });
      toast.success('Reservation annulee');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  });
}

export function useContesterAvis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }) => api.post(`/avis/${id}/contester`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avis'] });
      toast.success("Contestation envoyee a l'admin");
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
