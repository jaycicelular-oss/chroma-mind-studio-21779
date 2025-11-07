import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Sparkles, User, Box, Camera, Palette, UserCircle, Save, Download, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CustomFilterDialog } from "./CustomFilterDialog";

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
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(imageUrl);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<'none' | 'male' | 'female'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Filtros avançados completos
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

  const [customFilters, setCustomFilters] = useState<Record<string, { value: string; category: string }>>({});
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

  // Load custom filters and options
  useEffect(() => {
    const saved = localStorage.getItem('customFilters');
    if (saved) {
      setCustomFilters(JSON.parse(saved));
    }

    const savedOptions = localStorage.getItem('customFilterOptions');
    if (savedOptions) {
      setCustomOptions(JSON.parse(savedOptions));
    }
  }, []);

  const saveCustomFilters = (newFilters: Record<string, { value: string; category: string }>) => {
    setCustomFilters(newFilters);
    localStorage.setItem('customFilters', JSON.stringify(newFilters));
  };

  const saveCustomOptions = (newOptions: Record<string, string[]>) => {
    setCustomOptions(newOptions);
    localStorage.setItem('customFilterOptions', JSON.stringify(newOptions));
  };

  const addCustomOption = (filterKey: string, newValue: string) => {
    const currentOptions = customOptions[filterKey] || [];
    if (!currentOptions.includes(newValue)) {
      const updatedOptions = {
        ...customOptions,
        [filterKey]: [...currentOptions, newValue],
      };
      saveCustomOptions(updatedOptions);
    }
  };

  const handleAddCustomFilter = (name: string, value: string, category: string) => {
    const newFilters = { ...customFilters, [name]: { value, category } };
    saveCustomFilters(newFilters);
  };

  const handleRemoveCustomFilter = (name: string) => {
    const newFilters = { ...customFilters };
    delete newFilters[name];
    saveCustomFilters(newFilters);
  };

  const getCustomFiltersByCategory = (category: string) => {
    return Object.entries(customFilters).filter(([_, filter]) => filter.category === category);
  };

  const handleFilterChange = (key: string, value: string) => {
    setAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleGenderChange = (gender: 'none' | 'male' | 'female') => {
    setSelectedGender(gender);
    
    // Auto-edita quando muda o gênero
    if (gender !== 'none') {
      const genderPrompt = gender === 'male' ? 'transform into male character' : 'transform into female character';
      handleEditWithPrompt(genderPrompt);
    }
  };

  // Auto-editar quando filtros mudam
  useEffect(() => {
    const hasAnyFilter = Object.values(advancedFilters).some(f => f !== "none");
    const hasCustomFilters = Object.keys(customFilters).length > 0;
    
    if ((hasAnyFilter || hasCustomFilters) && !isEditing && isOpen) {
      const timer = setTimeout(() => {
        handleAutoEdit();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [advancedFilters, customFilters]);

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

    // Add custom filters
    Object.entries(customFilters).forEach(([name, filter]) => {
      parts.push(`${name}: ${filter.value}`);
    });
    
    return parts.join(", ");
  };

  const ensureDataUrl = async (src: string): Promise<string> => {
    if (!src) return src;
    if (src.startsWith('data:')) return src;
    let absolute = src;
    if (!src.startsWith('http')) {
      absolute = `${window.location.origin}${src.startsWith('/') ? '' : '/'}${src}`;
    }
    const resp = await fetch(absolute);
    const blob = await resp.blob();
    return await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.readAsDataURL(blob);
    });
  };

  const handleEditWithPrompt = async (promptToUse: string) => {
    const baseImage = editedImageUrl || uploadedImage || currentImageUrl;
    const imageToEdit = await ensureDataUrl(baseImage);
    setIsEditing(true);

    try {
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          imageUrl: imageToEdit,
          editPrompt: promptToUse,
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
      } else {
        toast({
          title: "Erro ao editar",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleAutoEdit = async () => {
    const filtersPrompt = buildPromptFromFilters();
    const fullPrompt = [filtersPrompt, editPrompt].filter(p => p.trim()).join(", ");
    if (!fullPrompt) return;

    handleEditWithPrompt(fullPrompt);
  };

  const handleApplyPrompt = () => {
    if (!editPrompt.trim()) return;
    const filtersPrompt = buildPromptFromFilters();
    const fullPrompt = [filtersPrompt, editPrompt].filter(p => p.trim()).join(", ");
    handleEditWithPrompt(fullPrompt);
  };

  const handleSaveAsOriginal = () => {
    if (editedImageUrl) {
      setCurrentImageUrl(editedImageUrl);
      setEditedImageUrl(null);
      toast({
        title: "Alteração salva!",
        description: "A imagem editada agora é a original e pode ser editada novamente.",
      });
    }
  };

  const handleSaveToGallery = async () => {
    const finalImage = editedImageUrl || currentImageUrl;
    if (!finalImage) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const finalPrompt = buildPromptFromFilters();
        const { error } = await (supabase as any)
          .from('generated_images')
          .insert({
            user_id: user.id,
            prompt: `Live Edit: ${finalPrompt || editPrompt || 'Edição manual'}`,
            style: 'edited',
            aspect_ratio: '16:9',
            quality: 'high',
            image_url: finalImage,
          });

        if (error) throw error;

        toast({
          title: "Salvo na galeria!",
          description: "Imagem adicionada à sua galeria.",
        });
      }
    } catch (error: any) {
      console.error('Error saving to gallery:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
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
      setCurrentImageUrl(result);
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
    setCurrentImageUrl(imageUrl);
    setEditedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setEditPrompt("");
    setEditedImageUrl(null);
    setUploadedImage(null);
    setCurrentImageUrl(imageUrl);
    setSelectedGender('none');
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
      <DialogContent className="max-w-6xl h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Live Editor - Edição em Tempo Real
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 h-full">
          <div className="space-y-4 px-6 py-4 pb-6">
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
                  Imagem Original
                </Label>
                <div className="relative border-2 border-border rounded-lg overflow-hidden">
                  <img 
                    src={currentImageUrl} 
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
                    <>
                      <img src={editedImageUrl} alt="Editada" className="w-full" />
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                        <Button
                          size="sm"
                          onClick={handleSaveAsOriginal}
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Salvar Alteração
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="aspect-[16/9] flex items-center justify-center text-muted-foreground">
                      Selecione filtros ou digite um prompt
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
              <Button 
                onClick={handleApplyPrompt}
                disabled={!editPrompt.trim() || isEditing}
                className="w-full"
              >
                {isEditing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Aplicar Prompt
                  </>
                )}
              </Button>
            </div>

            {/* Gender Filter */}
            <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Categoria de Conteúdo</Label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={selectedGender === 'none' ? 'default' : 'outline'}
                  className="flex-col h-auto py-3 gap-1"
                  onClick={() => handleGenderChange('none')}
                  disabled={isEditing}
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="text-xs">Diversos</span>
                </Button>
                <Button
                  variant={selectedGender === 'female' ? 'default' : 'outline'}
                  className="flex-col h-auto py-3 gap-1"
                  onClick={() => handleGenderChange('female')}
                  disabled={isEditing}
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs">Mulher</span>
                </Button>
                <Button
                  variant={selectedGender === 'male' ? 'default' : 'outline'}
                  className="flex-col h-auto py-3 gap-1"
                  onClick={() => handleGenderChange('male')}
                  disabled={isEditing}
                >
                  <UserCircle className="h-5 w-5" />
                  <span className="text-xs">Homem</span>
                </Button>
              </div>
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

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {/* Aparência Física */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <Label className="font-semibold text-primary">Aparência Física</Label>
                    </div>

                    {/* Custom Filters - Aparência */}
                    {getCustomFiltersByCategory('appearance').map(([name, filter]) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 rounded-md backdrop-blur-glass border-gradient bg-card/40 text-sm">
                          <span className="font-medium">{name}:</span> {filter.value}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCustomFilter(name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
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

                    <CustomFilterDialog 
                      onAdd={(name, value) => handleAddCustomFilter(name, value, 'appearance')} 
                      category="Aparência"
                    />
                  </div>

                  <Separator />

                  {/* Corpo e Físico */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-primary" />
                      <Label className="font-semibold text-primary">Corpo e Físico</Label>
                    </div>

                    {/* Custom Filters - Corpo */}
                    {getCustomFiltersByCategory('body').map(([name, filter]) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 rounded-md backdrop-blur-glass border-gradient bg-card/40 text-sm">
                          <span className="font-medium">{name}:</span> {filter.value}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCustomFilter(name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
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
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filtros específicos de gênero */}
                      {selectedGender === 'female' && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-xs">Tamanho do Busto</Label>
                            <Select value={advancedFilters.bustSize} onValueChange={(v) => handleFilterChange('bustSize', v)}>
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhum</SelectItem>
                                <SelectItem value="small">Pequeno</SelectItem>
                                <SelectItem value="medium">Médio</SelectItem>
                                <SelectItem value="large">Grande</SelectItem>
                                <SelectItem value="extra-large">Extra Grande</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Tamanho dos Seios</Label>
                            <Select value={advancedFilters.breastSize} onValueChange={(v) => handleFilterChange('breastSize', v)}>
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhum</SelectItem>
                                <SelectItem value="small">Pequeno</SelectItem>
                                <SelectItem value="medium">Médio</SelectItem>
                                <SelectItem value="large">Grande</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {selectedGender === 'male' && (
                        <div className="space-y-2">
                          <Label className="text-xs">Musculatura</Label>
                          <Select value={advancedFilters.musculature} onValueChange={(v) => handleFilterChange('musculature', v)}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              <SelectItem value="lean">Definido</SelectItem>
                              <SelectItem value="athletic">Atlético</SelectItem>
                              <SelectItem value="bulky">Forte</SelectItem>
                              <SelectItem value="bodybuilder">Fisiculturista</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Vestuário */}
                      <div className="space-y-2">
                        <Label className="text-xs">Vestuário</Label>
                        <Select value={advancedFilters.clothing} onValueChange={(v) => {
                          if (v === 'add-new') {
                            const newClothing = prompt('Digite o novo vestuário:');
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
                            <SelectItem value="sport">Esportivo</SelectItem>
                            <SelectItem value="elegant">Elegante</SelectItem>
                            {customOptions.clothing?.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                            <Separator className="my-2" />
                            <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <CustomFilterDialog 
                      onAdd={(name, value) => handleAddCustomFilter(name, value, 'body')} 
                      category="Corpo"
                    />
                  </div>

                  <Separator />

                  {/* Pose e Câmera */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-primary" />
                      <Label className="font-semibold text-primary">Pose e Câmera</Label>
                    </div>

                    {/* Custom Filters - Pose */}
                    {getCustomFiltersByCategory('pose').map(([name, filter]) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 rounded-md backdrop-blur-glass border-gradient bg-card/40 text-sm">
                          <span className="font-medium">{name}:</span> {filter.value}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCustomFilter(name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="lying">Deitado</SelectItem>
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
                            <SelectItem value="sides">Ao lado</SelectItem>
                            <SelectItem value="crossed">Cruzados</SelectItem>
                            <SelectItem value="raised">Levantados</SelectItem>
                            <SelectItem value="behind">Atrás</SelectItem>
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
                            <SelectItem value="close-up">Primeiro Plano</SelectItem>
                            <SelectItem value="medium">Plano Médio</SelectItem>
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
                            <SelectItem value="high">Alto</SelectItem>
                            <SelectItem value="low">Baixo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <CustomFilterDialog 
                      onAdd={(name, value) => handleAddCustomFilter(name, value, 'pose')} 
                      category="Pose"
                    />
                  </div>

                  <Separator />

                  {/* Ambiente e Iluminação */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      <Label className="font-semibold text-primary">Ambiente e Iluminação</Label>
                    </div>

                    {/* Custom Filters - Ambiente */}
                    {getCustomFiltersByCategory('environment').map(([name, filter]) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 rounded-md backdrop-blur-glass border-gradient bg-card/40 text-sm">
                          <span className="font-medium">{name}:</span> {filter.value}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCustomFilter(name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
                      {/* Fundo */}
                      <div className="space-y-2">
                        <Label className="text-xs">Fundo</Label>
                        <Select value={advancedFilters.background} onValueChange={(v) => {
                          if (v === 'add-new') {
                            const newBg = prompt('Digite o novo fundo:');
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
                            <SelectItem value="simple">Simples</SelectItem>
                            <SelectItem value="nature">Natureza</SelectItem>
                            <SelectItem value="urban">Urbano</SelectItem>
                            <SelectItem value="interior">Interior</SelectItem>
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
                            const newLight = prompt('Digite a nova iluminação:');
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
                            <SelectItem value="dawn">Amanhecer</SelectItem>
                            <SelectItem value="morning">Manhã</SelectItem>
                            <SelectItem value="noon">Meio-dia</SelectItem>
                            <SelectItem value="afternoon">Tarde</SelectItem>
                            <SelectItem value="sunset">Pôr do Sol</SelectItem>
                            <SelectItem value="night">Noite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tipo de Conteúdo */}
                      <div className="space-y-2">
                        <Label className="text-xs">Tipo de Conteúdo</Label>
                        <Select value={advancedFilters.contentType} onValueChange={(v) => handleFilterChange('contentType', v)}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            <SelectItem value="portrait">Retrato</SelectItem>
                            <SelectItem value="fashion">Moda</SelectItem>
                            <SelectItem value="artistic">Artístico</SelectItem>
                            <SelectItem value="lifestyle">Estilo de Vida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <CustomFilterDialog 
                      onAdd={(name, value) => handleAddCustomFilter(name, value, 'environment')} 
                      category="Ambiente"
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Botão Salvar na Galeria */}
            <Button
              onClick={handleSaveToGallery}
              disabled={!editedImageUrl && !currentImageUrl}
              className="w-full gap-2"
              size="lg"
            >
              <Download className="h-5 w-5" />
              Salvar na Galeria
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};