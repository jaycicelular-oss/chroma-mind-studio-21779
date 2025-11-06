import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Loader2 } from "lucide-react";
import { PromptInput } from "@/components/PromptInput";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useCharacters } from "@/hooks/useCharacters";

export const FramesTab = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { characters, loading: loadingCharacters } = useCharacters();

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedCharacter) return;
    
    setIsGenerating(true);
    // TODO: Implement frames generation logic
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <Card className="backdrop-blur-glass bg-card/40 border-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Criação de Frames
        </CardTitle>
        <CardDescription>
          Crie sequências de frames para animações com personagens específicos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Selecione um Personagem</Label>
          <Select value={selectedCharacter} onValueChange={setSelectedCharacter} disabled={loadingCharacters}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um personagem criado" />
            </SelectTrigger>
            <SelectContent>
              {characters.map((character) => (
                <SelectItem key={character.id} value={character.id}>
                  {character.name} {character.family_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {characters.length === 0 && !loadingCharacters && (
            <p className="text-sm text-muted-foreground">
              Nenhum personagem criado. Crie um personagem na aba "Personagem" primeiro.
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="frames-prompt" className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <span className="text-primary">●</span>
            Descrição das Cenas
          </Label>
          <Textarea
            id="frames-prompt"
            placeholder="Descreva as cenas que deseja criar com este personagem..."
            className="min-h-[120px] resize-none backdrop-blur-glass border-gradient bg-card/40 text-foreground placeholder:text-muted-foreground focus:glow-blue transition-all"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating || !selectedCharacter}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={!prompt.trim() || !selectedCharacter || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando Frames...
            </>
          ) : (
            "Gerar Frames"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};