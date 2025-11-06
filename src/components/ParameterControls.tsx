import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Maximize, Zap, FileImage } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ParameterControlsProps {
  aspectRatio: string;
  quality: string;
  outputType: string;
  onAspectRatioChange: (value: string) => void;
  onQualityChange: (value: string) => void;
  onOutputTypeChange: (value: string) => void;
}

export const ParameterControls = ({
  aspectRatio,
  quality,
  outputType,
  onAspectRatioChange,
  onQualityChange,
  onOutputTypeChange,
}: ParameterControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Maximize className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold">Proporção</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Define o formato da imagem. Use 16:9 para paisagens, 9:16 para retratos e 1:1 para redes sociais
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
          <SelectTrigger className="backdrop-blur-glass border-gradient">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1:1">🟦 Quadrado (1:1) - Instagram</SelectItem>
            <SelectItem value="16:9">📺 Paisagem (16:9) - Desktop</SelectItem>
            <SelectItem value="9:16">📱 Retrato (9:16) - Stories</SelectItem>
            <SelectItem value="4:3">🖼️ Clássico (4:3) - Fotos</SelectItem>
            <SelectItem value="21:9">🎬 Ultra-Wide (21:9) - Cinema</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-secondary" />
          <Label className="text-sm font-semibold">Qualidade</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Maior qualidade = mais detalhes, mas leva mais tempo para gerar
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={quality} onValueChange={onQualityChange}>
          <SelectTrigger className="backdrop-blur-glass border-gradient">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">⚡ Rascunho - Rápido</SelectItem>
            <SelectItem value="standard">✨ Padrão - Balanceado</SelectItem>
            <SelectItem value="high">💎 Alta - Detalhado</SelectItem>
            <SelectItem value="ultra">👑 Ultra HD - Máxima</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileImage className="h-4 w-4 text-accent" />
          <Label className="text-sm font-semibold">Tipo de Saída</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Escolha entre imagem estática, GIF animado ou sequência de frames
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={outputType} onValueChange={onOutputTypeChange}>
          <SelectTrigger className="backdrop-blur-glass border-gradient">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">🖼️ Imagem Estática</SelectItem>
            <SelectItem value="gif">🎞️ GIF Animado</SelectItem>
            <SelectItem value="frames">🎬 Sequência de Frames</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
