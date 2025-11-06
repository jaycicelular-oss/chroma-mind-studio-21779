import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGifs = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['generated-gifs', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('generated_gifs')
        .select('*')
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
        .from('generated_gifs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-gifs'] });
      toast({
        title: "GIF excluído",
        description: "O GIF foi excluído com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir GIF",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, saved }: { id: string; saved: boolean }) => {
      const { error } = await supabase
        .from('generated_gifs')
        .update({ saved })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-gifs'] });
      toast({
        title: "GIF atualizado",
        description: "O GIF foi atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar GIF",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    ...query,
    deleteGif: deleteMutation.mutate,
    saveGif: saveMutation.mutate,
  };
};
