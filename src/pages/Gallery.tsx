import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Film, Layers, Video, UserCircle } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { ImageGallery } from "@/components/ImageGallery";
import { useGeneratedImages } from "@/hooks/useGeneratedImages";
import { useGifs } from "@/hooks/useGifs";
import { useFrames } from "@/hooks/useFrames";
import { useCharacters } from "@/hooks/useCharacters";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Save, Trash2, FolderInput, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAlbums } from "@/hooks/useAlbums";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageEditDialog } from "@/components/ImageEditDialog";

export default function Gallery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: images, isLoading: loadingImages, refetch: refetchImages } = useGeneratedImages(user?.id);
  const { data: gifs, isLoading: loadingGifs, refetch: refetchGifs } = useGifs(user?.id);
  const { data: frames, isLoading: loadingFrames, refetch: refetchFrames } = useFrames(user?.id);
  const { characters, loading: loadingCharacters } = useCharacters();
  const { albums, loading: loadingAlbums, fetchAlbums, addItemToAlbum } = useAlbums();
  
  const [selectedImage, setSelectedImage] = useState<{ url: string; id: string; type: 'image' | 'gif' | 'frame' } | null>(null);
  const [showAlbumDialog, setShowAlbumDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const toggleItemSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const handleDeleteMultiple = async (type: 'image' | 'gif' | 'frame') => {
    if (selectedItems.size === 0) return;
    
    const confirmed = window.confirm(
      `⚠️ ATENÇÃO: Você está prestes a excluir ${selectedItems.size} ${selectedItems.size === 1 ? 'item' : 'itens'}.\n\n` +
      `Certifique-se de ter salvo ou baixado os itens importantes antes de continuar.\n\n` +
      `Esta ação não pode ser desfeita. Deseja continuar?`
    );
    if (!confirmed) return;

    try {
      const tableName = type === 'image' ? 'generated_images' : type === 'gif' ? 'generated_gifs' : 'generated_frames';
      
      for (const id of selectedItems) {
        const { error } = await (supabase as any)
          .from(tableName)
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      toast({
        title: "Itens excluídos",
        description: `${selectedItems.size} ${selectedItems.size === 1 ? 'item foi excluído' : 'itens foram excluídos'} com sucesso!`,
      });

      setSelectedItems(new Set());
      setSelectionMode(false);
      
      // Refetch data
      if (type === 'image') refetchImages();
      else if (type === 'gif') refetchGifs();
      else refetchFrames();
      
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, type: 'image' | 'gif' | 'frame') => {
    const confirmed = window.confirm(
      "⚠️ ATENÇÃO: Você está prestes a excluir este item.\n\n" +
      "Certifique-se de ter salvo ou baixado se for importante.\n\n" +
      "Esta ação não pode ser desfeita. Deseja continuar?"
    );
    if (!confirmed) return;

    try {
      const tableName = type === 'image' ? 'generated_images' : type === 'gif' ? 'generated_gifs' : 'generated_frames';
      const { error } = await (supabase as any)
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Item excluído",
        description: "O item foi excluído com sucesso!",
      });

      setSelectedImage(null);
      
      // Refetch data
      if (type === 'image') refetchImages();
      else if (type === 'gif') refetchGifs();
      else refetchFrames();
      
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async (id: string, type: 'image' | 'gif' | 'frame') => {
    try {
      const tableName = type === 'image' ? 'generated_images' : type === 'gif' ? 'generated_gifs' : 'generated_frames';
      const { error } = await (supabase as any)
        .from(tableName)
        .update({ saved: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Item salvo",
        description: "O item foi salvo com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `download-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: "O arquivo está sendo baixado.",
    });
  };

  const handleAddToAlbum = async (albumId: string) => {
    if (!selectedImage) return;

    try {
      await addItemToAlbum(
        albumId,
        selectedImage.id,
        selectedImage.type === 'image' ? 'image' : selectedImage.type === 'gif' ? 'gif' : 'frames'
      );

      toast({
        title: "Adicionado ao álbum",
        description: "O item foi adicionado ao álbum com sucesso!",
      });

      setShowAlbumDialog(false);
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Galeria</h1>
          <p className="text-muted-foreground">Visualize e gerencie todo o conteúdo criado</p>
        </div>

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-5 backdrop-blur-glass bg-card/40">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Imagens</span>
            </TabsTrigger>
            <TabsTrigger value="gifs" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              <span className="hidden sm:inline">GIFs</span>
            </TabsTrigger>
            <TabsTrigger value="frames" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Frames</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Vídeos</span>
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Personagens</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <div className="flex gap-2">
                <Button
                  variant={selectionMode ? "default" : "outline"}
                  onClick={() => {
                    setSelectionMode(!selectionMode);
                    setSelectedItems(new Set());
                  }}
                >
                  {selectionMode ? "Cancelar Seleção" : "Selecionar Múltiplos"}
                </Button>
                {selectionMode && selectedItems.size > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteMultiple('image')}
                  >
                    Excluir {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'itens'}
                  </Button>
                )}
                </div>
                {images && images.length > 0 && (
                  <div className={`text-sm px-3 py-2 rounded-md ${
                    images.length >= 100 
                      ? 'bg-destructive/10 text-destructive' 
                      : images.length >= 90 
                      ? 'bg-warning/10 text-warning' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {images.length}/100 imagens
                  </div>
                )}
              </div>
            </div>
            {images && images.length >= 100 && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Limite de 100 imagens atingido! 
                  Por favor, exclua algumas imagens antes de gerar novas.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images?.map((image) => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer overflow-hidden rounded-lg border-gradient backdrop-blur-glass ${
                    selectedItems.has(image.id) ? 'ring-4 ring-primary' : ''
                  }`}
                  onClick={() => {
                    if (selectionMode) {
                      toggleItemSelection(image.id);
                    } else {
                      setSelectedImage({ url: image.image_url, id: image.id, type: 'image' });
                    }
                  }}
                >
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  {selectionMode && selectedItems.has(image.id) && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gifs" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button
                  variant={selectionMode ? "default" : "outline"}
                  onClick={() => {
                    setSelectionMode(!selectionMode);
                    setSelectedItems(new Set());
                  }}
                >
                  {selectionMode ? "Cancelar Seleção" : "Selecionar Múltiplos"}
                </Button>
                {selectionMode && selectedItems.size > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteMultiple('gif')}
                  >
                    Excluir {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'itens'}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gifs?.map((gif) => (
                <div
                  key={gif.id}
                  className={`relative group cursor-pointer overflow-hidden rounded-lg border-gradient backdrop-blur-glass ${
                    selectedItems.has(gif.id) ? 'ring-4 ring-primary' : ''
                  }`}
                  onClick={() => {
                    if (selectionMode) {
                      toggleItemSelection(gif.id);
                    } else {
                      setSelectedImage({ url: gif.gif_url, id: gif.id, type: 'gif' });
                    }
                  }}
                >
                  <img
                    src={gif.gif_url}
                    alt={gif.prompt}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  {selectionMode && selectedItems.has(gif.id) && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="frames" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button
                  variant={selectionMode ? "default" : "outline"}
                  onClick={() => {
                    setSelectionMode(!selectionMode);
                    setSelectedItems(new Set());
                  }}
                >
                  {selectionMode ? "Cancelar Seleção" : "Selecionar Múltiplos"}
                </Button>
                {selectionMode && selectedItems.size > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteMultiple('frame')}
                  >
                    Excluir {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'itens'}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {frames?.map((frame) => (
                <div
                  key={frame.id}
                  className={`relative group cursor-pointer overflow-hidden rounded-lg border-gradient backdrop-blur-glass ${
                    selectedItems.has(frame.id) ? 'ring-4 ring-primary' : ''
                  }`}
                  onClick={() => {
                    if (selectionMode) {
                      toggleItemSelection(frame.id);
                    } else {
                      setSelectedImage({ url: frame.frame_urls[0], id: frame.id, type: 'frame' });
                    }
                  }}
                >
                  <img
                    src={frame.frame_urls[0]}
                    alt={frame.prompt}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  {selectionMode && selectedItems.has(frame.id) && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <div className="text-center text-muted-foreground py-12">
              Nenhum vídeo criado ainda
            </div>
          </TabsContent>

          <TabsContent value="characters" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {characters?.map((character) => (
                <div
                  key={character.id}
                  className="p-4 rounded-lg border-gradient backdrop-blur-glass"
                >
                  <h3 className="font-semibold">{character.name} {character.family_name}</h3>
                  <p className="text-sm text-muted-foreground">{character.gender}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh]">
            {selectedImage && (
              <div className="space-y-4">
                <div className="max-h-[60vh] overflow-hidden flex items-center justify-center bg-black/5 rounded-lg">
                  <img
                    src={selectedImage.url}
                    alt="Visualização"
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
                <div className="flex gap-2 justify-end flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(selectedImage.url)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave(selectedImage.id, selectedImage.type)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedImage(null);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAlbumDialog(true)}
                  >
                    <FolderInput className="h-4 w-4 mr-2" />
                    Adicionar ao Álbum
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedImage.id, selectedImage.type)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showAlbumDialog} onOpenChange={setShowAlbumDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selecionar Álbum</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[400px] pr-4">
              {loadingAlbums ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando álbuns...
                </div>
              ) : albums.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum álbum criado ainda. Crie um álbum primeiro.
                </div>
              ) : (
                <div className="space-y-2">
                  {albums.map((album) => (
                    <Button
                      key={album.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleAddToAlbum(album.id)}
                    >
                      <FolderInput className="h-4 w-4 mr-2" />
                      {album.name}
                    </Button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <ImageEditDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          imageUrl={selectedImage?.url || ""}
          onImageEdited={(editedUrl) => {
            setShowEditDialog(false);
            if (selectedImage?.type === 'image') {
              refetchImages();
            }
          }}
        />
      </div>
    </div>
    </div>
  );
}
