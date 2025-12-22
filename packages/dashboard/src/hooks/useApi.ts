import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useUsage = () => {
  return useQuery({
    queryKey: ['usage'],
    queryFn: api.getUsage
  });
};

export const useApiKey = () => {
  return useQuery({
    queryKey: ['apiKey'],
    queryFn: api.getApiKey
  });
};

export const useNamespaces = () => {
  return useQuery({
    queryKey: ['namespaces'],
    queryFn: api.getNamespaces
  });
};

export const useCreateNamespace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createNamespace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['namespaces'] });
    }
  });
};
