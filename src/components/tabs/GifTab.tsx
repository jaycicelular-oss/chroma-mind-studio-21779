import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Loader2 } from "lucide-react";
import { PromptInput } from "@/components/PromptInput";
import { StyleSelector } from "@/components/StyleSelector";
import { GenderFilter } from "@/components/GenderFilter";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GifTab = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [quality, setQuality] = useState("hd");
  const [selectedGender, setSelectedGender] = useState<'none' | 'male' | 'female'>('none');
  const [advancedFilters, setAdvancedFilters] = useState({
    hairColor: '',
    hairStyle: '',
    eyeColor: '',
    bodyType: '',
    height: '',
    clothing: '',
    pose: '',
    background: '',
    facialExpression: '',
    ethnicity: '',
    age: '',
    buttSize: '',
    breastSize: '',
    musculature: '',
    armPosition: '',
    viewDistance: '',
    cameraAngle: '',
    timeOfDay: '',
    lighting: '',
    contentType: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-gif', {
        body: { 
          prompt, 
          style: selectedStyle, 
          aspectRatio, 
          quality 
        }
      });

      if (error) throw error;

      toast({
        title: "GIF gerado!",
        description: "Seu GIF animado foi criado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar GIF",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="backdrop-blur-glass bg-card/40 border-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          Criação de GIF
        </CardTitle>
        <CardDescription>
          Crie GIFs animados com movimentos realistas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <GenderFilter
          selectedGender={selectedGender}
          onGenderChange={setSelectedGender}
        />
        
        <PromptInput
          value={prompt}
          onChange={setPrompt}
        />
        
        <StyleSelector
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
        />

        {selectedGender !== 'none' && (
          <AdvancedFilters
            selectedGender={selectedGender}
            filters={advancedFilters}
            onFilterChange={(key, value) => 
              setAdvancedFilters(prev => ({ ...prev, [key]: value }))
            }
          />
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Proporção</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                <SelectItem value="4:3">4:3 (Padrão)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Qualidade</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="hd">HD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={!prompt.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando GIF...
            </>
          ) : (
            "Gerar GIF"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};