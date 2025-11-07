import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Album {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AlbumItem {
  id: string;
  album_id: string;
  content_id: string;
  content_type: 'image' | 'gif' | 'frames' | 'video' | 'character';
  created_at: string;
}

export const useAlbums = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar álbuns",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAlbum = async (name: string, description?: string) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { error } = await (supabase as any).from('albums').insert({
        user_id: userData.user.id,
        name,
        description,
      });

      if (error) throw error;

      toast({
        title: "Álbum criado",
        description: "O álbum foi criado com sucesso!",
      });

      await fetchAlbums();
    } catch (error: any) {
      toast({
        title: "Erro ao criar álbum",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAlbum = async (id: string, name: string, description?: string) => {
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('albums')
        .update({ name, description })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Álbum atualizado",
        description: "O álbum foi atualizado com sucesso!",
      });

      await fetchAlbums();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar álbum",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAlbum = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('albums')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Álbum excluído",
        description: "O álbum foi excluído com sucesso!",
      });

      await fetchAlbums();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir álbum",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItemToAlbum = async (albumId: string, contentId: string, contentType: AlbumItem['content_type']) => {
    try {
      const { error } = await (supabase as any).from('album_items').insert({
        album_id: albumId,
        content_id: contentId,
        content_type: contentType,
      });

      if (error) throw error;

      toast({
        title: "Item adicionado",
        description: "O item foi adicionado ao álbum com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeItemFromAlbum = async (itemId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('album_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Item removido",
        description: "O item foi removido do álbum com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return {
    albums,
    loading,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    addItemToAlbum,
    removeItemFromAlbum,
    fetchAlbums,
  };
};
