import { useState } from "react";
import { useAlbums } from "@/hooks/useAlbums";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FolderPlus, Edit, Trash2, Search } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Albums() {
  const { albums, loading, createAlbum, updateAlbum, deleteAlbum } = useAlbums();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreate = async () => {
    if (!newAlbumName.trim()) return;
    
    await createAlbum(newAlbumName, newAlbumDescription);
    setNewAlbumName("");
    setNewAlbumDescription("");
    setIsCreating(false);
  };

  const handleUpdate = async (id: string) => {
    if (!newAlbumName.trim()) return;
    
    await updateAlbum(id, newAlbumName, newAlbumDescription);
    setNewAlbumName("");
    setNewAlbumDescription("");
    setIsEditing(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este álbum?");
    if (!confirmed) return;
    
    await deleteAlbum(id);
  };

  const filteredAlbums = albums.filter(album =>
    album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    album.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Álbuns</h1>
            <p className="text-muted-foreground">Organize seu conteúdo em álbuns personalizados</p>
          </div>
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Álbum
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Álbum</DialogTitle>
                <DialogDescription className="sr-only">Informe nome e descrição para criar um novo álbum.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Álbum</Label>
                  <Input
                    id="name"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    placeholder="Nome do álbum"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={newAlbumDescription}
                    onChange={(e) => setNewAlbumDescription(e.target.value)}
                    placeholder="Descrição do álbum"
                  />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={loading}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Criar Álbum
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar álbuns..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAlbums.map((album) => (
            <Card key={album.id} className="p-4 backdrop-blur-glass bg-card/40 border-gradient">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{album.name}</h3>
                  {album.description && (
                    <p className="text-sm text-muted-foreground mt-1">{album.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Dialog open={isEditing === album.id} onOpenChange={(open) => setIsEditing(open ? album.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setNewAlbumName(album.name);
                        setNewAlbumDescription(album.description || "");
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Álbum</DialogTitle>
                        <DialogDescription className="sr-only">Atualize nome e descrição do álbum selecionado.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name">Nome do Álbum</Label>
                          <Input
                            id="edit-name"
                            value={newAlbumName}
                            onChange={(e) => setNewAlbumName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Descrição</Label>
                          <Textarea
                            id="edit-description"
                            value={newAlbumDescription}
                            onChange={(e) => setNewAlbumDescription(e.target.value)}
                          />
                        </div>
                        <Button onClick={() => handleUpdate(album.id)} className="w-full" disabled={loading}>
                          Salvar Alterações
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(album.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Criado em {new Date(album.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {filteredAlbums.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-12">
            {searchQuery ? "Nenhum álbum encontrado" : "Nenhum álbum criado ainda. Crie seu primeiro álbum!"}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
