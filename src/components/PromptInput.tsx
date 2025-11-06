import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PromptInput = ({ value, onChange }: PromptInputProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="prompt" className="text-sm font-semibold">
            📝 Descrição da Imagem
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  <strong>Dica:</strong> Seja específico e detalhado. 
                  Descreva o sujeito, ambiente, iluminação e estilo desejado.
                </p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Exemplo: "Uma floresta mística ao amanhecer, com raios de luz atravessando as árvores"
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-xs text-muted-foreground">
          {value.length} caracteres
        </span>
      </div>
      <Textarea
        id="prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: Um dragão majestoso voando sobre montanhas nevadas ao pôr do sol, arte digital detalhada..."
        className="min-h-[120px] backdrop-blur-glass border-gradient resize-none"
      />
      <p className="text-xs text-muted-foreground">
        💡 Quanto mais detalhes você fornecer, melhor será o resultado
      </p>
    </div>
  );
};
