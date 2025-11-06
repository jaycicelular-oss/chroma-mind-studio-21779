import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";

interface ImageEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onImageEdited: (newImageUrl: string) => void;
}

export const ImageEditDialog = ({ isOpen, onClose, imageUrl, onImageEdited }: ImageEditDialogProps) => {
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máximo 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 20MB",
        variant: "destructive",
      });
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      toast({
        title: "Imagem carregada",
        description: "Pronta para ser editada",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUpload = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = async () => {
    if (!editPrompt.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva as alterações que deseja fazer",
        variant: "destructive",
      });
      return;
    }

    // Usar imagem carregada se disponível, senão usar a original
    const imageToEdit = uploadedImage || imageUrl;

    setIsEditing(true);
    try {
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          imageUrl: imageToEdit,
          editPrompt: `IMPORTANTE: Mantenha 100% da qualidade e integridade da imagem original. Não faça nenhuma alteração visual ou gráfica não solicitada. Apenas altere conforme pedido: ${editPrompt}`,
        },
      });

      if (error) {
        const errorMessage = error.message || "Não foi possível editar a imagem. Tente novamente.";
        const isCreditsError = errorMessage.includes("Créditos insuficientes") || errorMessage.includes("402");
        
        toast({
          title: isCreditsError ? "Créditos insuficientes" : "Erro ao editar imagem",
          description: isCreditsError 
            ? "Você ficou sem créditos. Adicione créditos em Settings -> Workspace -> Usage para continuar usando a edição de imagens."
            : errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (data.error) {
        const isCreditsError = data.error.includes("Créditos insuficientes") || data.error.includes("402");
        
        toast({
          title: isCreditsError ? "Créditos insuficientes" : "Erro ao editar imagem",
          description: isCreditsError 
            ? "Você ficou sem créditos. Adicione créditos em Settings -> Workspace -> Usage para continuar usando a edição de imagens."
            : data.error,
          variant: "destructive",
        });
        return;
      }

      if (data.editedImageUrl) {
        setEditedImageUrl(data.editedImageUrl);
        toast({
          title: "Imagem editada!",
          description: "Sua imagem foi editada com sucesso.",
        });
      }
    } catch (error: any) {
      console.error('Error editing image:', error);
      const errorMessage = error.message || "Tente novamente mais tarde";
      const isCreditsError = errorMessage.includes("Créditos insuficientes") || errorMessage.includes("402");
      
      toast({
        title: isCreditsError ? "Créditos insuficientes" : "Erro ao editar imagem",
        description: isCreditsError 
          ? "Você ficou sem créditos. Adicione créditos em Settings -> Workspace -> Usage para continuar usando a edição de imagens."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleApplyEdit = async () => {
    if (editedImageUrl) {
      try {
        // Salvar a imagem editada na galeria
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { error } = await supabase
            .from('generated_images')
            .insert({
              user_id: user.id,
              prompt: `Imagem editada: ${editPrompt}`,
              style: 'edited',
              aspect_ratio: '16:9',
              quality: 'high',
              image_url: editedImageUrl,
            });

          if (error) throw error;

          toast({
            title: "Imagem salva na galeria!",
            description: "A imagem editada foi adicionada à sua galeria.",
          });
        }
      } catch (error: any) {
        console.error('Error saving to gallery:', error);
        toast({
          title: "Erro ao salvar na galeria",
          description: error.message,
          variant: "destructive",
        });
      }
      
      onImageEdited(editedImageUrl);
      handleClose();
    }
  };

  const handleClose = () => {
    setEditPrompt("");
    setEditedImageUrl(null);
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Imagem</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Upload de imagem */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Imagem para Editar</Label>
            <div className="flex gap-2 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
                disabled={isEditing}
              >
                <Upload className="h-4 w-4" />
                Anexar Imagem
              </Button>
              {uploadedImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveUpload}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Remover
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {uploadedImage 
                ? "✓ Imagem carregada. Você pode editá-la agora." 
                : "Opcional: Anexe uma imagem ou use a imagem atual"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                {uploadedImage ? "Imagem Anexada" : "Imagem Original"}
              </Label>
              <img 
                src={uploadedImage || imageUrl} 
                alt="Para editar" 
                className="w-full rounded-lg border" 
              />
            </div>
            {editedImageUrl && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">Imagem Editada</Label>
                <img src={editedImageUrl} alt="Editada" className="w-full rounded-lg border" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="editPrompt">
              Descreva as alterações (posição, pose, ângulo)
            </Label>
            <Textarea
              id="editPrompt"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="Ex: mudar a pose para braços cruzados, virar o rosto para a esquerda, mudar para posição de perfil..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              💡 Dica: Descreva apenas mudanças de posição/pose. As características visuais serão mantidas.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            {editedImageUrl ? (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button onClick={handleApplyEdit}>
                  Aplicar Edição
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button onClick={handleEdit} disabled={isEditing}>
                  {isEditing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Editando...
                    </>
                  ) : (
                    "Editar Imagem"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
