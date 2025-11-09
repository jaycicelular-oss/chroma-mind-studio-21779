import { useState } from "react";
import { CharacterFilters } from "@/components/CharacterFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharacters } from "@/hooks/useCharacters";
import { Save, Trash2, Users, Sparkles, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CharacterTab = () => {
  const { characters, loading, saveCharacter, deleteCharacter } = useCharacters();
  const { toast } = useToast();
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [aiMessage, setAiMessage] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [characterData, setCharacterData] = useState({
    name: '',
    familyName: '',
    age: '',
    personality: '',
    height: '',
    voice: '',
    hairType: '',
    hairLength: '',
    hairColor: '',
    eyeColor: '',
    facialExpression: '',
    facialDetails: '',
    bodyType: '',
    breastSize: '',
    buttSize: '',
    musculature: '',
  });

  const handleCharacterDataChange = (key: string, value: string) => {
    setCharacterData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveCharacter = async () => {
    if (!characterData.name) {
      return;
    }

    await saveCharacter({
      name: characterData.name,
      family_name: characterData.familyName || undefined,
      gender,
      age: characterData.age ? parseInt(characterData.age) : undefined,
      personality: characterData.personality || undefined,
      height: characterData.height ? parseFloat(characterData.height) : undefined,
      voice: characterData.voice || undefined,
      hair_type: characterData.hairType || undefined,
      hair_length: characterData.hairLength || undefined,
      hair_color: characterData.hairColor || undefined,
      eye_color: characterData.eyeColor || undefined,
      facial_expression: characterData.facialExpression || undefined,
      facial_details: characterData.facialDetails || undefined,
      body_type: characterData.bodyType || undefined,
      breast_size: characterData.breastSize || undefined,
      butt_size: characterData.buttSize || undefined,
      musculature: characterData.musculature || undefined,
    });

    // Reset form
    setCharacterData({
      name: '',
      familyName: '',
      age: '',
      personality: '',
      height: '',
      voice: '',
      hairType: '',
      hairLength: '',
      hairColor: '',
      eyeColor: '',
      facialExpression: '',
      facialDetails: '',
      bodyType: '',
      breastSize: '',
      buttSize: '',
      musculature: '',
    });
  };

  const handleAIAssistant = async () => {
    if (!aiMessage.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva o que você precisa",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('character-ai-assistant', {
        body: {
          message: aiMessage,
          characterData: {
            name: characterData.name,
            gender,
            hair_color: characterData.hairColor,
            eye_color: characterData.eyeColor,
            age: characterData.age,
            body_type: characterData.bodyType,
          },
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.error) {
        const errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        const isCredits = errorMsg.includes("Créditos insuficientes") || errorMsg.includes("402") || errorMsg.includes("payment_required") || errorMsg.includes("Not enough credits");
        
        toast({
          title: isCredits ? "Créditos insuficientes" : "Erro ao gerar sugestão",
          description: isCredits 
            ? "Seus créditos acabaram. Adicione mais créditos em Settings → Workspace → Usage." 
            : "Erro ao processar sugestão. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      if (data?.suggestion) {
        setAiSuggestion(data.suggestion);
        toast({
          title: "Sugestão gerada!",
          description: "O assistente IA criou uma sugestão de prompt para você.",
        });
      }
    } catch (error: any) {
      console.error('Error calling AI assistant:', error);
      const errorMsg = error?.message || error?.msg || JSON.stringify(error);
      const isCredits = errorMsg.includes("Créditos") || errorMsg.includes("402") || errorMsg.includes("payment_required") || errorMsg.includes("Not enough credits");
      
      toast({
        title: isCredits ? "Créditos insuficientes" : "Erro ao gerar sugestão",
        description: isCredits 
          ? "Seus créditos acabaram. Adicione mais créditos em Settings → Workspace → Usage." 
          : "Ocorreu um erro ao gerar a sugestão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Character Creation Form */}
      <Card className="backdrop-blur-glass bg-card/40 border-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5" />
            Criar Personagem
          </CardTitle>
          <CardDescription className="text-sm">
            Configure os detalhes do seu personagem para salvar na galeria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <CharacterFilters
                gender={gender}
                onGenderChange={setGender}
                characterData={characterData}
                onCharacterDataChange={handleCharacterDataChange}
              />

              {/* AI Assistant Section */}
              <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <Label className="text-sm font-semibold">Assistente IA para Prompts</Label>
                </div>
                <div className="space-y-2">
                  <Textarea
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder="Peça ao assistente IA para criar um prompt detalhado para imagem do seu personagem. Ex: Crie um prompt para uma foto de retrato em estúdio..."
                    className="min-h-[80px]"
                  />
                  <Button 
                    onClick={handleAIAssistant} 
                    disabled={isLoadingAI}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoadingAI ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando sugestão...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar Sugestão de Prompt
                      </>
                    )}
                  </Button>
                </div>
                
                {aiSuggestion && (
                  <div className="space-y-2 p-3 rounded-lg bg-background/50 border">
                    <Label className="text-xs font-semibold text-primary">Sugestão do Assistente:</Label>
                    <p className="text-sm text-muted-foreground">{aiSuggestion}</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          <Button
            onClick={handleSaveCharacter}
            disabled={loading || !characterData.name}
            className="w-full mt-6"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar na Galeria
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};