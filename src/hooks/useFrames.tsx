import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFrames = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['generated-frames', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('generated_frames')
        .select('*, characters(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('generated_frames')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-frames'] });
      toast({
        title: "Frames excluídos",
        description: "Os frames foram excluídos com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir frames",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, saved }: { id: string; saved: boolean }) => {
      const { error } = await supabase
        .from('generated_frames')
        .update({ saved })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-frames'] });
      toast({
        title: "Frames atualizados",
        description: "Os frames foram atualizados com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar frames",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    ...query,
    deleteFrames: deleteMutation.mutate,
    saveFrames: saveMutation.mutate,
  };
};
