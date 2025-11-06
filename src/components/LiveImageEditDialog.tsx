import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Sparkles, User, Box, Camera, Palette } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  const [advancedFilters, setAdvancedFilters] = useState({
    hairColor: "none",
    hairStyle: "none",
    eyeColor: "none",
    bodyType: "none",
    height: "none",
    clothing: "none",
    pose: "none",
    background: "none",
    facialExpression: "none",
    ethnicity: "none",
    age: "none",
    bustSize: "none",
    breastSize: "none",
    musculature: "none",
    armPosition: "none",
    viewDistance: "none",
    cameraAngle: "none",
    timeOfDay: "none",
    lighting: "none",
    contentType: "none",
  });
  
  const [customOptions, setCustomOptions] = useState<Record<string, string[]>>({
    hairColor: [],
    hairStyle: [],
    eyeColor: [],
    facialExpression: [],
    bodyType: [],
    clothing: [],
    pose: [],
    background: [],
    lighting: [],
  });

  // Load custom options from localStorage
  useEffect(() => {
    const savedOptions = localStorage.getItem('customFilterOptions');
    if (savedOptions) {
      setCustomOptions(JSON.parse(savedOptions));
    }
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };

  const addCustomOption = (filterKey: string, newValue: string) => {
    const currentOptions = customOptions[filterKey] || [];
    if (!currentOptions.includes(newValue)) {
      const updatedOptions = {
        ...customOptions,
        [filterKey]: [...currentOptions, newValue],
      };
      setCustomOptions(updatedOptions);
      localStorage.setItem('customFilterOptions', JSON.stringify(updatedOptions));
    }
  };

  // Auto-editar quando filtros mudam
  useEffect(() => {
    const hasAnyFilter = Object.values(advancedFilters).some(f => f !== "none");
    
    if (hasAnyFilter && !isEditing && isOpen) {
      const timer = setTimeout(() => {
        handleAutoEdit();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [advancedFilters]);

  const buildPromptFromFilters = () => {
    const parts: string[] = [];
    const filterMap: Record<string, string> = {
      hairColor: "cor do cabelo",
      hairStyle: "estilo de cabelo",
      eyeColor: "cor dos olhos",
      bodyType: "tipo físico",
      height: "altura",
      clothing: "vestuário",
      pose: "pose",
      background: "fundo",
      facialExpression: "expressão facial",
      ethnicity: "etnia",
      age: "idade",
      bustSize: "tamanho do busto",
      breastSize: "tamanho dos seios",
      musculature: "musculatura",
      armPosition: "posição dos braços",
      viewDistance: "distância da câmera",
      cameraAngle: "ângulo da câmera",
      timeOfDay: "hora do dia",
      lighting: "iluminação",
      contentType: "tipo de conteúdo",
    };
    
    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (value !== "none") {
        const label = filterMap[key] || key;
        parts.push(`${label}: ${value}`);
      }
    });
    
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
    setAdvancedFilters({
      hairColor: "none",
      hairStyle: "none",
      eyeColor: "none",
      bodyType: "none",
      height: "none",
      clothing: "none",
      pose: "none",
      background: "none",
      facialExpression: "none",
      ethnicity: "none",
      age: "none",
      bustSize: "none",
      breastSize: "none",
      musculature: "none",
      armPosition: "none",
      viewDistance: "none",
      cameraAngle: "none",
      timeOfDay: "none",
      lighting: "none",
      contentType: "none",
    });
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
                {/* Aparência Física */}
                <div className="col-span-full">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-primary" />
                    <Label className="font-semibold text-primary">Aparência Física</Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Cor do Cabelo */}
                    <div className="space-y-2">
                      <Label className="text-xs">Cor do Cabelo</Label>
                      <Select value={advancedFilters.hairColor} onValueChange={(v) => {
                        if (v === 'add-new') {
                          const newColor = prompt('Digite a nova cor de cabelo:');
                          if (newColor && newColor.trim()) {
                            addCustomOption('hairColor', newColor.trim());
                            handleFilterChange('hairColor', newColor.trim());
                          }
                        } else {
                          handleFilterChange('hairColor', v);
                        }
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="black">Preto</SelectItem>
                          <SelectItem value="brown">Castanho</SelectItem>
                          <SelectItem value="blonde">Loiro</SelectItem>
                          <SelectItem value="red">Ruivo</SelectItem>
                          <SelectItem value="white">Branco</SelectItem>
                          <SelectItem value="gray">Cinza</SelectItem>
                          {customOptions.hairColor?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                          <Separator className="my-2" />
                          <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Estilo de Cabelo */}
                    <div className="space-y-2">
                      <Label className="text-xs">Estilo de Cabelo</Label>
                      <Select value={advancedFilters.hairStyle} onValueChange={(v) => {
                        if (v === 'add-new') {
                          const newStyle = prompt('Digite o novo estilo de cabelo:');
                          if (newStyle && newStyle.trim()) {
                            addCustomOption('hairStyle', newStyle.trim());
                            handleFilterChange('hairStyle', newStyle.trim());
                          }
                        } else {
                          handleFilterChange('hairStyle', v);
                        }
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="straight">Liso</SelectItem>
                          <SelectItem value="wavy">Ondulado</SelectItem>
                          <SelectItem value="curly">Cacheado</SelectItem>
                          <SelectItem value="short">Curto</SelectItem>
                          <SelectItem value="long">Longo</SelectItem>
                          <SelectItem value="ponytail">Rabo de Cavalo</SelectItem>
                          <SelectItem value="braided">Trançado</SelectItem>
                          <SelectItem value="bun">Coque</SelectItem>
                          {customOptions.hairStyle?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                          <Separator className="my-2" />
                          <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cor dos Olhos */}
                    <div className="space-y-2">
                      <Label className="text-xs">Cor dos Olhos</Label>
                      <Select value={advancedFilters.eyeColor} onValueChange={(v) => {
                        if (v === 'add-new') {
                          const newColor = prompt('Digite a nova cor dos olhos:');
                          if (newColor && newColor.trim()) {
                            addCustomOption('eyeColor', newColor.trim());
                            handleFilterChange('eyeColor', newColor.trim());
                          }
                        } else {
                          handleFilterChange('eyeColor', v);
                        }
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="brown">Castanho</SelectItem>
                          <SelectItem value="blue">Azul</SelectItem>
                          <SelectItem value="green">Verde</SelectItem>
                          <SelectItem value="hazel">Avelã</SelectItem>
                          <SelectItem value="gray">Cinza</SelectItem>
                          <SelectItem value="amber">Âmbar</SelectItem>
                          {customOptions.eyeColor?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                          <Separator className="my-2" />
                          <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Expressão Facial */}
                    <div className="space-y-2">
                      <Label className="text-xs">Expressão Facial</Label>
                      <Select value={advancedFilters.facialExpression} onValueChange={(v) => {
                        if (v === 'add-new') {
                          const newExpression = prompt('Digite a nova expressão facial:');
                          if (newExpression && newExpression.trim()) {
                            addCustomOption('facialExpression', newExpression.trim());
                            handleFilterChange('facialExpression', newExpression.trim());
                          }
                        } else {
                          handleFilterChange('facialExpression', v);
                        }
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="happy">Feliz</SelectItem>
                          <SelectItem value="sad">Triste</SelectItem>
                          <SelectItem value="neutral">Neutra</SelectItem>
                          <SelectItem value="surprised">Surpresa</SelectItem>
                          <SelectItem value="angry">Raiva</SelectItem>
                          <SelectItem value="seductive">Sedutora</SelectItem>
                          <SelectItem value="playful">Brincalhona</SelectItem>
                          {customOptions.facialExpression?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                          <Separator className="my-2" />
                          <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Etnia */}
                    <div className="space-y-2">
                      <Label className="text-xs">Etnia</Label>
                      <Select value={advancedFilters.ethnicity} onValueChange={(v) => handleFilterChange('ethnicity', v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="caucasian">Caucasiana</SelectItem>
                          <SelectItem value="african">Africana</SelectItem>
                          <SelectItem value="asian">Asiática</SelectItem>
                          <SelectItem value="indigenous">Indígena</SelectItem>
                          <SelectItem value="latin">Latina</SelectItem>
                          <SelectItem value="middle-eastern">Oriente Médio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Idade */}
                    <div className="space-y-2">
                      <Label className="text-xs">Idade</Label>
                      <Select value={advancedFilters.age} onValueChange={(v) => handleFilterChange('age', v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="young-adult">Jovem Adulto</SelectItem>
                          <SelectItem value="adult">Adulto</SelectItem>
                          <SelectItem value="mature">Maduro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Corpo e Físico */}
                <div className="col-span-full">
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2 mb-3">
                    <Box className="h-4 w-4 text-primary" />
                    <Label className="font-semibold text-primary">Corpo e Físico</Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Tipo de Corpo */}
                    <div className="space-y-2">
                      <Label className="text-xs">Tipo de Corpo</Label>
                      <Select value={advancedFilters.bodyType} onValueChange={(v) => {
                        if (v === 'add-new') {
                          const newType = prompt('Digite o novo tipo de corpo:');
                          if (newType && newType.trim()) {
                            addCustomOption('bodyType', newType.trim());
                            handleFilterChange('bodyType', newType.trim());
                          }
                        } else {
                          handleFilterChange('bodyType', v);
                        }
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="slim">Magro</SelectItem>
                          <SelectItem value="average">Médio</SelectItem>
                          <SelectItem value="athletic">Atlético</SelectItem>
                          <SelectItem value="curvy">Curvilíneo</SelectItem>
                          <SelectItem value="muscular">Musculoso</SelectItem>
                          <SelectItem value="petite">Pequeno</SelectItem>
                          <SelectItem value="plus">Plus Size</SelectItem>
                          {customOptions.bodyType?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                          <Separator className="my-2" />
                          <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Altura */}
                    <div className="space-y-2">
                      <Label className="text-xs">Altura</Label>
                      <Select value={advancedFilters.height} onValueChange={(v) => handleFilterChange('height', v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="short">Baixo</SelectItem>
                          <SelectItem value="average">Médio</SelectItem>
                          <SelectItem value="tall">Alto</SelectItem>
                          <SelectItem value="very-tall">Muito Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Vestuário */}
                    <div className="space-y-2">
                      <Label className="text-xs">Vestuário</Label>
                      <Select value={advancedFilters.clothing} onValueChange={(v) => {
                        if (v === 'add-new') {
                          const newClothing = prompt('Digite o novo tipo de vestuário:');
                          if (newClothing && newClothing.trim()) {
                            addCustomOption('clothing', newClothing.trim());
                            handleFilterChange('clothing', newClothing.trim());
                          }
                        } else {
                          handleFilterChange('clothing', v);
                        }
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="sporty">Esportivo</SelectItem>
                          <SelectItem value="elegant">Elegante</SelectItem>
                          <SelectItem value="fantasy">Fantasia</SelectItem>
                          {customOptions.clothing?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                          <Separator className="my-2" />
                          <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Pose e Câmera */}
                <div className="col-span-full">
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="h-4 w-4 text-primary" />
                    <Label className="font-semibold text-primary">Pose e Câmera</Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Pose */}
                    <div className="space-y-2">
                      <Label className="text-xs">Pose</Label>
                      <Select value={advancedFilters.pose} onValueChange={(v) => {
                        if (v === 'add-new') {
                          const newPose = prompt('Digite a nova pose:');
                          if (newPose && newPose.trim()) {
                            addCustomOption('pose', newPose.trim());
                            handleFilterChange('pose', newPose.trim());
                          }
                        } else {
                          handleFilterChange('pose', v);
                        }
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="standing">Em pé</SelectItem>
                          <SelectItem value="sitting">Sentado</SelectItem>
                          <SelectItem value="walking">Andando</SelectItem>
                          <SelectItem value="action">Ação</SelectItem>
                          <SelectItem value="portrait">Retrato</SelectItem>
                          <SelectItem value="dynamic">Dinâmica</SelectItem>
                          {customOptions.pose?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                          <Separator className="my-2" />
                          <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Posição dos Braços */}
                    <div className="space-y-2">
                      <Label className="text-xs">Posição dos Braços</Label>
                      <Select value={advancedFilters.armPosition} onValueChange={(v) => handleFilterChange('armPosition', v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="relaxed">Relaxados</SelectItem>
                          <SelectItem value="crossed">Cruzados</SelectItem>
                          <SelectItem value="raised">Levantados</SelectItem>
                          <SelectItem value="behind-back">Atrás das Costas</SelectItem>
                          <SelectItem value="on-hips">Na Cintura</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Distância da Câmera */}
                    <div className="space-y-2">
                      <Label className="text-xs">Distância da Câmera</Label>
                      <Select value={advancedFilters.viewDistance} onValueChange={(v) => handleFilterChange('viewDistance', v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="close-up">Close-up</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="full-body">Corpo Inteiro</SelectItem>
                          <SelectItem value="wide">Plano Aberto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ângulo da Câmera */}
                    <div className="space-y-2">
                      <Label className="text-xs">Ângulo da Câmera</Label>
                      <Select value={advancedFilters.cameraAngle} onValueChange={(v) => handleFilterChange('cameraAngle', v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="front">Frontal</SelectItem>
                          <SelectItem value="side">Lateral</SelectItem>
                          <SelectItem value="back">Traseira</SelectItem>
                          <SelectItem value="above">De Cima</SelectItem>
                          <SelectItem value="below">De Baixo</SelectItem>
                          <SelectItem value="tilted">Inclinado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Ambiente e Iluminação */}
                <div className="col-span-full">
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="h-4 w-4 text-primary" />
                    <Label className="font-semibold text-primary">Ambiente e Iluminação</Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Fundo */}
                    <div className="space-y-2">
                      <Label className="text-xs">Fundo</Label>
                      <Select value={advancedFilters.background} onValueChange={(v) => {
                        if (v === 'add-new') {
                          const newBg = prompt('Digite o novo tipo de fundo:');
                          if (newBg && newBg.trim()) {
                            addCustomOption('background', newBg.trim());
                            handleFilterChange('background', newBg.trim());
                          }
                        } else {
                          handleFilterChange('background', v);
                        }
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="plain">Simples</SelectItem>
                          <SelectItem value="nature">Natureza</SelectItem>
                          <SelectItem value="urban">Urbano</SelectItem>
                          <SelectItem value="indoor">Interior</SelectItem>
                          <SelectItem value="abstract">Abstrato</SelectItem>
                          <SelectItem value="beach">Praia</SelectItem>
                          {customOptions.background?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                          <Separator className="my-2" />
                          <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Iluminação */}
                    <div className="space-y-2">
                      <Label className="text-xs">Iluminação</Label>
                      <Select value={advancedFilters.lighting} onValueChange={(v) => {
                        if (v === 'add-new') {
                          const newLight = prompt('Digite o novo tipo de iluminação:');
                          if (newLight && newLight.trim()) {
                            addCustomOption('lighting', newLight.trim());
                            handleFilterChange('lighting', newLight.trim());
                          }
                        } else {
                          handleFilterChange('lighting', v);
                        }
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="natural">Natural</SelectItem>
                          <SelectItem value="studio">Estúdio</SelectItem>
                          <SelectItem value="dramatic">Dramática</SelectItem>
                          <SelectItem value="soft">Suave</SelectItem>
                          <SelectItem value="backlit">Contraluz</SelectItem>
                          <SelectItem value="neon">Neon</SelectItem>
                          {customOptions.lighting?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                          <Separator className="my-2" />
                          <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Hora do Dia */}
                    <div className="space-y-2">
                      <Label className="text-xs">Hora do Dia</Label>
                      <Select value={advancedFilters.timeOfDay} onValueChange={(v) => handleFilterChange('timeOfDay', v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="morning">Manhã</SelectItem>
                          <SelectItem value="noon">Meio-dia</SelectItem>
                          <SelectItem value="afternoon">Tarde</SelectItem>
                          <SelectItem value="sunset">Pôr do Sol</SelectItem>
                          <SelectItem value="night">Noite</SelectItem>
                          <SelectItem value="blue-hour">Hora Azul</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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