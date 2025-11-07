import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGeneratedImages = (userId?: string) => {
  const query = useQuery({
    queryKey: ['generated-images', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await (supabase as any)
        .from('generated_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return {
    ...query,
    refetch: query.refetch,
  };
};
