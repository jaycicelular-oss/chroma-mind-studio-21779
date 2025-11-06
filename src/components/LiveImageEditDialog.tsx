import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LiveImageEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onImageEdited: (newImageUrl: string) => void;
}

export const LiveImageEditDialog = ({ isOpen, onClose, imageUrl, onImageEdited }: LiveImageEditDialogProps) => {
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Filtros avançados para Live Editing
  const [bodyType, setBodyType] = useState("none");
  const [pose, setPose] = useState("none");
  const [angle, setAngle] = useState("none");
  const [expression, setExpression] = useState("none");
  const [clothing, setClothing] = useState("none");
  const [hairStyle, setHairStyle] = useState("none");
  const [lighting, setLighting] = useState("none");
  const [background, setBackground] = useState("none");
  const [ageAppearance, setAgeAppearance] = useState("none");
  const [muscleDefinition, setMuscleDefinition] = useState("none");

  // Auto-editar quando filtros mudam
  useEffect(() => {
    const hasAnyFilter = [bodyType, pose, angle, expression, clothing, hairStyle, lighting, background, ageAppearance, muscleDefinition].some(f => f !== "none");
    
    if (hasAnyFilter && !isEditing && isOpen) {
      const timer = setTimeout(() => {
        handleAutoEdit();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [bodyType, pose, angle, expression, clothing, hairStyle, lighting, background, ageAppearance, muscleDefinition]);

  const buildPromptFromFilters = () => {
    const parts: string[] = [];
    
    if (bodyType !== "none") parts.push(`tipo físico: ${bodyType}`);
    if (pose !== "none") parts.push(`pose: ${pose}`);
    if (angle !== "none") parts.push(`ângulo: ${angle}`);
    if (expression !== "none") parts.push(`expressão: ${expression}`);
    if (clothing !== "none") parts.push(`roupa: ${clothing}`);
    if (hairStyle !== "none") parts.push(`cabelo: ${hairStyle}`);
    if (lighting !== "none") parts.push(`iluminação: ${lighting}`);
    if (background !== "none") parts.push(`fundo: ${background}`);
    if (ageAppearance !== "none") parts.push(`aparência de idade: ${ageAppearance}`);
    if (muscleDefinition !== "none") parts.push(`definição muscular: ${muscleDefinition}`);
    
    if (editPrompt.trim()) {
      parts.push(editPrompt.trim());
    }
    
    return parts.join(", ");
  };

  const handleAutoEdit = async () => {
    const fullPrompt = buildPromptFromFilters();
    if (!fullPrompt) return;

    const imageToEdit = uploadedImage || imageUrl;
    setIsEditing(true);

    try {
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          imageUrl: imageToEdit,
          editPrompt: fullPrompt,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.editedImageUrl) {
        setEditedImageUrl(data.editedImageUrl);
      }
    } catch (error: any) {
      console.error('Error editing image:', error);
      const errorMessage = error.message || "Erro ao editar";
      const isCreditsError = errorMessage.includes("Créditos insuficientes") || errorMessage.includes("402");
      
      if (isCreditsError) {
        toast({
          title: "Créditos insuficientes",
          description: "Adicione créditos em Settings → Workspace → Usage",
          variant: "destructive",
        });
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 20MB",
        variant: "destructive",
      });
      return;
    }

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
      setEditedImageUrl(null);
      toast({
        title: "Imagem carregada",
        description: "Pronta para edição ao vivo",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUpload = () => {
    setUploadedImage(null);
    setEditedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyEdit = async () => {
    if (editedImageUrl) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const finalPrompt = buildPromptFromFilters();
          const { error } = await supabase
            .from('generated_images')
            .insert({
              user_id: user.id,
              prompt: `Live Edit: ${finalPrompt}`,
              style: 'edited',
              aspect_ratio: '16:9',
              quality: 'high',
              image_url: editedImageUrl,
            });

          if (error) throw error;

          toast({
            title: "Imagem salva!",
            description: "Adicionada à sua galeria.",
          });
        }
      } catch (error: any) {
        console.error('Error saving:', error);
        toast({
          title: "Erro ao salvar",
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
    setBodyType("none");
    setPose("none");
    setAngle("none");
    setExpression("none");
    setClothing("none");
    setHairStyle("none");
    setLighting("none");
    setBackground("none");
    setAgeAppearance("none");
    setMuscleDefinition("none");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Live Editor - Edição em Tempo Real
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Upload Section */}
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
                  Anexar Nova Imagem
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
            </div>

            {/* Images Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  {uploadedImage ? "Imagem Anexada" : "Imagem Original"}
                </Label>
                <div className="relative border-2 border-border rounded-lg overflow-hidden">
                  <img 
                    src={uploadedImage || imageUrl} 
                    alt="Para editar" 
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  {editedImageUrl ? "Resultado (Auto-atualizado)" : "Resultado aparecerá aqui"}
                </Label>
                <div className="relative border-2 border-primary rounded-lg overflow-hidden bg-muted/20">
                  {isEditing ? (
                    <div className="aspect-[16/9] flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : editedImageUrl ? (
                    <img src={editedImageUrl} alt="Editada" className="w-full" />
                  ) : (
                    <div className="aspect-[16/9] flex items-center justify-center text-muted-foreground">
                      Selecione filtros para ver o resultado
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prompt Manual */}
            <div className="space-y-2">
              <Label htmlFor="editPrompt">
                Prompt Adicional (Opcional)
              </Label>
              <Textarea
                id="editPrompt"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Ex: adicionar óculos escuros, mudar cor da roupa para vermelho..."
                className="min-h-[80px]"
              />
            </div>

            {/* Advanced Filters */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label className="font-semibold">Filtros Avançados - Live Editing</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Selecione os filtros e veja a imagem se transformar automaticamente
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Tipo Físico */}
                <div className="space-y-2">
                  <Label>Tipo Físico</Label>
                  <Select value={bodyType} onValueChange={setBodyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="magro">Magro</SelectItem>
                      <SelectItem value="atlético">Atlético</SelectItem>
                      <SelectItem value="musculoso">Musculoso</SelectItem>
                      <SelectItem value="gordo">Gordo</SelectItem>
                      <SelectItem value="com sobrepeso">Com Sobrepeso</SelectItem>
                      <SelectItem value="muito magro">Muito Magro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pose */}
                <div className="space-y-2">
                  <Label>Pose</Label>
                  <Select value={pose} onValueChange={setPose}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="em pé">Em pé</SelectItem>
                      <SelectItem value="sentado">Sentado</SelectItem>
                      <SelectItem value="braços cruzados">Braços cruzados</SelectItem>
                      <SelectItem value="mãos nos bolsos">Mãos nos bolsos</SelectItem>
                      <SelectItem value="acenando">Acenando</SelectItem>
                      <SelectItem value="correndo">Correndo</SelectItem>
                      <SelectItem value="pulando">Pulando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ângulo */}
                <div className="space-y-2">
                  <Label>Ângulo da Câmera</Label>
                  <Select value={angle} onValueChange={setAngle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="frontal">Frontal</SelectItem>
                      <SelectItem value="perfil">Perfil</SelectItem>
                      <SelectItem value="3/4">3/4</SelectItem>
                      <SelectItem value="de costas">De costas</SelectItem>
                      <SelectItem value="de cima">De cima</SelectItem>
                      <SelectItem value="de baixo">De baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Expressão */}
                <div className="space-y-2">
                  <Label>Expressão Facial</Label>
                  <Select value={expression} onValueChange={setExpression}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="sorrindo">Sorrindo</SelectItem>
                      <SelectItem value="sério">Sério</SelectItem>
                      <SelectItem value="feliz">Feliz</SelectItem>
                      <SelectItem value="triste">Triste</SelectItem>
                      <SelectItem value="bravo">Bravo</SelectItem>
                      <SelectItem value="surpreso">Surpreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Roupa */}
                <div className="space-y-2">
                  <Label>Roupa</Label>
                  <Select value={clothing} onValueChange={setClothing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="esportivo">Esportivo</SelectItem>
                      <SelectItem value="terno">Terno</SelectItem>
                      <SelectItem value="vestido">Vestido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cabelo */}
                <div className="space-y-2">
                  <Label>Estilo de Cabelo</Label>
                  <Select value={hairStyle} onValueChange={setHairStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="curto">Curto</SelectItem>
                      <SelectItem value="longo">Longo</SelectItem>
                      <SelectItem value="careca">Careca</SelectItem>
                      <SelectItem value="cacheado">Cacheado</SelectItem>
                      <SelectItem value="liso">Liso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Iluminação */}
                <div className="space-y-2">
                  <Label>Iluminação</Label>
                  <Select value={lighting} onValueChange={setLighting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="dramática">Dramática</SelectItem>
                      <SelectItem value="suave">Suave</SelectItem>
                      <SelectItem value="neon">Neon</SelectItem>
                      <SelectItem value="pôr do sol">Pôr do sol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fundo */}
                <div className="space-y-2">
                  <Label>Fundo</Label>
                  <Select value={background} onValueChange={setBackground}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="branco">Branco</SelectItem>
                      <SelectItem value="preto">Preto</SelectItem>
                      <SelectItem value="cidade">Cidade</SelectItem>
                      <SelectItem value="natureza">Natureza</SelectItem>
                      <SelectItem value="praia">Praia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Aparência de Idade */}
                <div className="space-y-2">
                  <Label>Aparência de Idade</Label>
                  <Select value={ageAppearance} onValueChange={setAgeAppearance}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="jovem (18-25)">Jovem (18-25)</SelectItem>
                      <SelectItem value="adulto (25-40)">Adulto (25-40)</SelectItem>
                      <SelectItem value="meia-idade (40-60)">Meia-idade (40-60)</SelectItem>
                      <SelectItem value="idoso (60+)">Idoso (60+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Definição Muscular */}
                <div className="space-y-2">
                  <Label>Definição Muscular</Label>
                  <Select value={muscleDefinition} onValueChange={setMuscleDefinition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="pouca definição">Pouca definição</SelectItem>
                      <SelectItem value="média definição">Média definição</SelectItem>
                      <SelectItem value="muito definido">Muito definido</SelectItem>
                      <SelectItem value="bodybuilder">Bodybuilder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              {editedImageUrl ? (
                <>
                  <Button variant="outline" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button onClick={handleApplyEdit}>
                    Salvar na Galeria
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleClose}>
                  Fechar
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};