import { PromptInput } from "@/components/PromptInput";
import { StyleSelector } from "@/components/StyleSelector";
import { ParameterControls } from "@/components/ParameterControls";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { GenderFilter } from "@/components/GenderFilter";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";

interface ImageTabProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedStyle: string;
  onStyleChange: (value: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  quality: string;
  onQualityChange: (value: string) => void;
  outputType: string;
  onOutputTypeChange: (value: string) => void;
  selectedGender: 'none' | 'male' | 'female';
  onGenderChange: (gender: 'none' | 'male' | 'female') => void;
  advancedFilters: any;
  onAdvancedFilterChange: (key: string, value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ImageTab = ({
  prompt,
  onPromptChange,
  selectedStyle,
  onStyleChange,
  aspectRatio,
  onAspectRatioChange,
  quality,
  onQualityChange,
  outputType,
  onOutputTypeChange,
  selectedGender,
  onGenderChange,
  advancedFilters,
  onAdvancedFilterChange,
  onGenerate,
  isGenerating,
}: ImageTabProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      {/* Step 1: Category */}
      <div className="backdrop-blur-glass rounded-lg p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
          <h3 className="font-semibold text-sm">Escolha a Categoria</h3>
        </div>
        <GenderFilter
          selectedGender={selectedGender}
          onGenderChange={onGenderChange}
        />
      </div>

      {/* Step 2: Description */}
      <div className="backdrop-blur-glass rounded-lg p-4 border border-secondary/20">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs font-bold">2</span>
          <h3 className="font-semibold text-sm">Descreva sua Criação</h3>
        </div>
        <PromptInput
          value={prompt}
          onChange={onPromptChange}
        />
      </div>

      {/* Step 3: Style */}
      <div className="backdrop-blur-glass rounded-lg p-4 border border-accent/20">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold">3</span>
          <h3 className="font-semibold text-sm">Selecione o Estilo</h3>
        </div>
        <StyleSelector
          selectedStyle={selectedStyle}
          onStyleChange={onStyleChange}
        />
      </div>

      {/* Step 4: Parameters */}
      <div className="backdrop-blur-glass rounded-lg p-4 border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-xs font-bold">4</span>
          <h3 className="font-semibold text-sm">Configure os Parâmetros</h3>
        </div>
        <ParameterControls
          aspectRatio={aspectRatio}
          quality={quality}
          outputType={outputType}
          onAspectRatioChange={onAspectRatioChange}
          onQualityChange={onQualityChange}
          onOutputTypeChange={onOutputTypeChange}
        />
      </div>

      {/* Step 5: Advanced Filters */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full backdrop-blur-glass border-gradient hover:bg-primary/10">
            <Sparkles className="mr-2 h-4 w-4" />
            <span className="font-semibold">Filtros Avançados (Opcional)</span>
            <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="backdrop-blur-glass rounded-lg p-4 border border-border/50">
            <AdvancedFilters
              filters={advancedFilters}
              onFilterChange={onAdvancedFilterChange}
              selectedGender={selectedGender}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Generate Button */}
      <Button 
        variant="generate" 
        size="xl" 
        className="w-full relative overflow-hidden group"
        onClick={onGenerate}
        disabled={isGenerating}
      >
        <span className="relative z-10 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          {isGenerating ? "✨ Gerando sua criação..." : "🚀 Gerar Imagem Agora"}
        </span>
        {!isGenerating && (
          <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        )}
      </Button>
    </div>
  );
};