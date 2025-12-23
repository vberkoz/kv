import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useUsage = () => {
  return useQuery({
    queryKey: ['usage'],
    queryFn: api.getUsage,
    staleTime: 30 * 1000 // 30 seconds
  });
};

export const useApiKey = () => {
  return useQuery({
    queryKey: ['apiKey'],
    queryFn: api.getApiKey,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useNamespaces = () => {
  return useQuery({
    queryKey: ['namespaces'],
    queryFn: api.getNamespaces,
    staleTime: 60 * 1000 // 1 minute
  });
};

export const useCreateNamespace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createNamespace,
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ['namespaces'] });
      const previous = queryClient.getQueryData(['namespaces']);
      queryClient.setQueryData(['namespaces'], (old: any) => ({
        namespaces: [...(old?.namespaces || []), { name, createdAt: new Date().toISOString() }]
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['namespaces'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['namespaces'] });
    }
  });
};
