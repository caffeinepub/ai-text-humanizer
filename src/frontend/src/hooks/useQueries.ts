import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useHumanizeText() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) {
        throw new Error('Actor not initialized');
      }
      return await actor.humanizeText(text);
    }
  });
}

export function useDetectAI() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) {
        throw new Error('Service not available');
      }
      
      if (!text || text.trim().length === 0) {
        throw new Error('Invalid text input');
      }
      
      try {
        const result = await actor.detectAIText(text);
        return result;
      } catch (error) {
        // Handle specific error cases
        if (error instanceof Error) {
          if (error.message.includes('network') || error.message.includes('timeout')) {
            throw new Error('Detection service unavailable');
          }
          if (error.message.includes('parse') || error.message.includes('JSON')) {
            throw new Error('Invalid response from detection service');
          }
        }
        throw new Error('Detection failed. Please try again.');
      }
    }
  });
}
