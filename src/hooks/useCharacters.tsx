import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Character {
  id: string;
  name: string;
  family_name?: string;
  gender: 'male' | 'female';
  age?: number;
  personality?: string;
  height?: number;
  voice?: string;
  hair_type?: string;
  hair_length?: string;
  hair_color?: string;
  eye_color?: string;
  facial_expression?: string;
  facial_details?: string;
  body_type?: string;
  breast_size?: string;
  butt_size?: string;
  musculature?: string;
}

export const useCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCharacters(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar personagens",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCharacter = async (characterData: Omit<Character, 'id'>) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { error } = await (supabase as any).from('characters').insert({
        user_id: userData.user.id,
        name: characterData.name,
        family_name: characterData.family_name,
        gender: characterData.gender,
        age: characterData.age,
        personality: characterData.personality,
        height: characterData.height,
        voice: characterData.voice,
        hair_type: characterData.hair_type,
        hair_length: characterData.hair_length,
        hair_color: characterData.hair_color,
        eye_color: characterData.eye_color,
        facial_expression: characterData.facial_expression,
        facial_details: characterData.facial_details,
        body_type: characterData.body_type,
        breast_size: characterData.breast_size,
        butt_size: characterData.butt_size,
        musculature: characterData.musculature,
      });

      if (error) throw error;

      toast({
        title: "Personagem salvo",
        description: "O personagem foi salvo com sucesso!",
      });

      await fetchCharacters();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar personagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCharacter = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('characters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Personagem excluído",
        description: "O personagem foi excluído com sucesso!",
      });

      await fetchCharacters();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir personagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  return {
    characters,
    loading,
    saveCharacter,
    deleteCharacter,
    fetchCharacters,
  };
};