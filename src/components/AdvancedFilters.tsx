import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sliders, X, User, Box, Camera, Palette } from "lucide-react";
import { CustomFilterDialog } from "./CustomFilterDialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";

interface AdvancedFiltersProps {
  filters: {
    hairColor: string;
    hairStyle: string;
    eyeColor: string;
    bodyType: string;
    height: string;
    clothing: string;
    pose: string;
    background: string;
    facialExpression: string;
    ethnicity: string;
    age: string;
    bustSize: string;
    breastSize: string;
    musculature: string;
    armPosition: string;
    viewDistance: string;
    cameraAngle: string;
    timeOfDay: string;
    lighting: string;
    contentType: string;
  };
  onFilterChange: (key: string, value: string) => void;
  selectedGender: 'none' | 'male' | 'female';
}

export const AdvancedFilters = ({ filters, onFilterChange, selectedGender }: AdvancedFiltersProps) => {
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

  // Load custom filters from localStorage
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

  // Save custom filters to localStorage
  const saveCustomFilters = (newFilters: Record<string, { value: string; category: string }>) => {
    setCustomFilters(newFilters);
    localStorage.setItem('customFilters', JSON.stringify(newFilters));
  };

  // Save custom options to localStorage
  const saveCustomOptions = (newOptions: Record<string, string[]>) => {
    setCustomOptions(newOptions);
    localStorage.setItem('customFilterOptions', JSON.stringify(newOptions));
  };

  // Add a new option to a filter's list
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
    onFilterChange(name, value);
  };

  const handleRemoveCustomFilter = (name: string) => {
    const newFilters = { ...customFilters };
    delete newFilters[name];
    saveCustomFilters(newFilters);
    onFilterChange(name, '');
  };

  const getCustomFiltersByCategory = (category: string) => {
    return Object.entries(customFilters).filter(([_, filter]) => filter.category === category);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-accent" />
          Filtros Avançados
        </Label>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-6">
          {/* Categoria: Aparência Física */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold text-primary">Aparência Física</Label>
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

          {/* Cor do Cabelo */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Cor do Cabelo</Label>
            <Select value={filters.hairColor} onValueChange={(v) => {
              if (v === 'add-new') {
                const newColor = prompt('Digite a nova cor de cabelo:');
                if (newColor && newColor.trim()) {
                  addCustomOption('hairColor', newColor.trim());
                  onFilterChange('hairColor', newColor.trim());
                }
              } else {
                onFilterChange('hairColor', v);
              }
            }}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
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
                <SelectItem value="auburn">Castanho-Avermelhado</SelectItem>
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
            <Label className="text-xs text-muted-foreground">Estilo de Cabelo</Label>
            <Select value={filters.hairStyle} onValueChange={(v) => {
              if (v === 'add-new') {
                const newStyle = prompt('Digite o novo estilo de cabelo:');
                if (newStyle && newStyle.trim()) {
                  addCustomOption('hairStyle', newStyle.trim());
                  onFilterChange('hairStyle', newStyle.trim());
                }
              } else {
                onFilterChange('hairStyle', v);
              }
            }}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
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
            <Label className="text-xs text-muted-foreground">Cor dos Olhos</Label>
            <Select value={filters.eyeColor} onValueChange={(v) => {
              if (v === 'add-new') {
                const newColor = prompt('Digite a nova cor dos olhos:');
                if (newColor && newColor.trim()) {
                  addCustomOption('eyeColor', newColor.trim());
                  onFilterChange('eyeColor', newColor.trim());
                }
              } else {
                onFilterChange('eyeColor', v);
              }
            }}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
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
            <Label className="text-xs text-muted-foreground">Expressão Facial</Label>
            <Select value={filters.facialExpression} onValueChange={(v) => {
              if (v === 'add-new') {
                const newExpression = prompt('Digite a nova expressão facial:');
                if (newExpression && newExpression.trim()) {
                  addCustomOption('facialExpression', newExpression.trim());
                  onFilterChange('facialExpression', newExpression.trim());
                }
              } else {
                onFilterChange('facialExpression', v);
              }
            }}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
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
            <Label className="text-xs text-muted-foreground">Etnia</Label>
            <Select value={filters.ethnicity} onValueChange={(v) => onFilterChange('ethnicity', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
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
            <Label className="text-xs text-muted-foreground">Idade</Label>
            <Select value={filters.age} onValueChange={(v) => onFilterChange('age', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
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

          <CustomFilterDialog 
            onAdd={(name, value) => handleAddCustomFilter(name, value, 'appearance')} 
            category="Aparência"
          />
          </div>

          <Separator />

          {/* Categoria: Corpo e Físico */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold text-primary">Corpo e Físico</Label>
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

          {/* Tipo de Corpo */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tipo de Corpo</Label>
            <Select value={filters.bodyType} onValueChange={(v) => {
              if (v === 'add-new') {
                const newType = prompt('Digite o novo tipo de corpo:');
                if (newType && newType.trim()) {
                  addCustomOption('bodyType', newType.trim());
                  onFilterChange('bodyType', newType.trim());
                }
              } else {
                onFilterChange('bodyType', v);
              }
            }}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
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

          {/* Filtros específicos de gênero */}
          {selectedGender === 'female' && (
            <>
              {/* Tamanho do Busto */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Tamanho do Busto</Label>
                <Select value={filters.bustSize} onValueChange={(v) => onFilterChange('bustSize', v)}>
                  <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
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

              {/* Tamanho dos Seios */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Tamanho dos Seios</Label>
                <Select value={filters.breastSize} onValueChange={(v) => onFilterChange('breastSize', v)}>
                  <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
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
            </>
          )}

          {selectedGender === 'male' && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Musculatura</Label>
              <Select value={filters.musculature} onValueChange={(v) => onFilterChange('musculature', v)}>
                <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="lean">Magro</SelectItem>
                  <SelectItem value="toned">Tonificado</SelectItem>
                  <SelectItem value="athletic">Atlético</SelectItem>
                  <SelectItem value="muscular">Musculoso</SelectItem>
                  <SelectItem value="bodybuilder">Fisiculturista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedGender === 'none' && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tipo de Conteúdo</Label>
              <Select value={filters.contentType} onValueChange={(v) => onFilterChange('contentType', v)}>
                <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="animal">Animal</SelectItem>
                  <SelectItem value="monster">Monstro</SelectItem>
                  <SelectItem value="creature">Criatura</SelectItem>
                  <SelectItem value="landscape">Paisagem</SelectItem>
                  <SelectItem value="location">Local</SelectItem>
                  <SelectItem value="building">Edifício</SelectItem>
                  <SelectItem value="object">Objeto</SelectItem>
                  <SelectItem value="vehicle">Veículo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Altura */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Altura</Label>
            <Select value={filters.height} onValueChange={(v) => onFilterChange('height', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
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
            <Label className="text-xs text-muted-foreground">Vestuário</Label>
            <Select value={filters.clothing} onValueChange={(v) => {
              if (v === 'add-new') {
                const newClothing = prompt('Digite o novo tipo de vestuário:');
                if (newClothing && newClothing.trim()) {
                  addCustomOption('clothing', newClothing.trim());
                  onFilterChange('clothing', newClothing.trim());
                }
              } else {
                onFilterChange('clothing', v);
              }
            }}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="sporty">Esportivo</SelectItem>
                <SelectItem value="elegant">Elegante</SelectItem>
                <SelectItem value="fantasy">Fantasia</SelectItem>
                <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                <SelectItem value="traditional">Tradicional</SelectItem>
                <SelectItem value="lingerie">Lingerie</SelectItem>
                <SelectItem value="swimwear">Traje de Banho</SelectItem>
                {customOptions.clothing?.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
                <Separator className="my-2" />
                <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CustomFilterDialog 
            onAdd={(name, value) => handleAddCustomFilter(name, value, 'body')} 
            category="Corpo"
          />
          </div>

          <Separator />

          {/* Categoria: Pose e Câmera */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold text-primary">Pose e Câmera</Label>
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

          {/* Pose */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Pose</Label>
            <Select value={filters.pose} onValueChange={(v) => {
              if (v === 'add-new') {
                const newPose = prompt('Digite a nova pose:');
                if (newPose && newPose.trim()) {
                  addCustomOption('pose', newPose.trim());
                  onFilterChange('pose', newPose.trim());
                }
              } else {
                onFilterChange('pose', v);
              }
            }}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
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
            <Label className="text-xs text-muted-foreground">Posição dos Braços</Label>
            <Select value={filters.armPosition} onValueChange={(v) => onFilterChange('armPosition', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="side">Ao lado do corpo</SelectItem>
                <SelectItem value="crossed">Cruzados</SelectItem>
                <SelectItem value="raised">Levantados</SelectItem>
                <SelectItem value="behind">Atrás do corpo</SelectItem>
                <SelectItem value="on-hips">Na cintura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distância da Visualização */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Distância da Visualização</Label>
            <Select value={filters.viewDistance} onValueChange={(v) => onFilterChange('viewDistance', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="close-up">Close-up</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="full-body">Corpo Inteiro</SelectItem>
                <SelectItem value="far">Afastado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CustomFilterDialog 
            onAdd={(name, value) => handleAddCustomFilter(name, value, 'pose')} 
            category="Pose e Câmera"
          />
          </div>

          <Separator />

          {/* Categoria: Ambiente e Iluminação */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold text-primary">Ambiente e Iluminação</Label>
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

          {/* Fundo */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Fundo</Label>
            <Select value={filters.background} onValueChange={(v) => {
              if (v === 'add-new') {
                const newBackground = prompt('Digite o novo tipo de fundo:');
                if (newBackground && newBackground.trim()) {
                  addCustomOption('background', newBackground.trim());
                  onFilterChange('background', newBackground.trim());
                }
              } else {
                onFilterChange('background', v);
              }
            }}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="solid-color">Cor Sólida</SelectItem>
                <SelectItem value="gradient">Gradiente</SelectItem>
                <SelectItem value="nature">Natureza</SelectItem>
                <SelectItem value="urban">Urbano</SelectItem>
                <SelectItem value="abstract">Abstrato</SelectItem>
                <SelectItem value="studio">Estúdio</SelectItem>
                <SelectItem value="fantasy">Fantasia</SelectItem>
                {customOptions.background?.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
                <Separator className="my-2" />
                <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hora do Dia */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Hora do Dia</Label>
            <Select value={filters.timeOfDay} onValueChange={(v) => onFilterChange('timeOfDay', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="morning">Manhã</SelectItem>
                <SelectItem value="afternoon">Tarde</SelectItem>
                <SelectItem value="evening">Entardecer</SelectItem>
                <SelectItem value="night">Noite</SelectItem>
                <SelectItem value="golden-hour">Hora Dourada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Iluminação */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Iluminação</Label>
            <Select value={filters.lighting} onValueChange={(v) => {
              if (v === 'add-new') {
                const newLighting = prompt('Digite o novo tipo de iluminação:');
                if (newLighting && newLighting.trim()) {
                  addCustomOption('lighting', newLighting.trim());
                  onFilterChange('lighting', newLighting.trim());
                }
              } else {
                onFilterChange('lighting', v);
              }
            }}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="artificial">Artificial</SelectItem>
                <SelectItem value="soft">Suave</SelectItem>
                <SelectItem value="intense">Intensa</SelectItem>
                <SelectItem value="warm">Quente</SelectItem>
                <SelectItem value="cold">Fria</SelectItem>
                <SelectItem value="dramatic">Dramática</SelectItem>
                <SelectItem value="studio">Estúdio</SelectItem>
                {customOptions.lighting?.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
                <Separator className="my-2" />
                <SelectItem value="add-new" className="text-primary font-medium">+ Adicionar novo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CustomFilterDialog 
            onAdd={(name, value) => handleAddCustomFilter(name, value, 'environment')} 
            category="Ambiente"
          />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
