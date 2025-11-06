import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, UserCircle } from "lucide-react";

interface CharacterData {
  name: string;
  familyName: string;
  age: string;
  personality: string;
  height: string;
  voice: string;
  hairType: string;
  hairLength: string;
  hairColor: string;
  eyeColor: string;
  facialExpression: string;
  facialDetails: string;
  bodyType: string;
  breastSize: string;
  buttSize: string;
  musculature: string;
}

interface CharacterFiltersProps {
  gender: 'male' | 'female';
  onGenderChange: (gender: 'male' | 'female') => void;
  characterData: CharacterData;
  onCharacterDataChange: (key: keyof CharacterData, value: string) => void;
}

export const CharacterFilters = ({
  gender,
  onGenderChange,
  characterData,
  onCharacterDataChange,
}: CharacterFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Gender Selection */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={gender === 'female' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => onGenderChange('female')}
        >
          <User className="mr-2 h-4 w-4" />
          Mulher
        </Button>
        <Button
          variant={gender === 'male' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => onGenderChange('male')}
        >
          <UserCircle className="mr-2 h-4 w-4" />
          Homem
        </Button>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">1. Nome</Label>
            <Input
              value={characterData.name}
              onChange={(e) => onCharacterDataChange('name', e.target.value)}
              placeholder="Digite o nome"
              className="backdrop-blur-glass border-gradient bg-card/40"
            />
          </div>

          {/* Nome da Família */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">2. Nome da Família (Opcional)</Label>
            <Input
              value={characterData.familyName}
              onChange={(e) => onCharacterDataChange('familyName', e.target.value)}
              placeholder="Digite o sobrenome"
              className="backdrop-blur-glass border-gradient bg-card/40"
            />
          </div>

          {/* Idade */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">3. Idade</Label>
            <Input
              type="number"
              value={characterData.age}
              onChange={(e) => onCharacterDataChange('age', e.target.value)}
              placeholder="Digite a idade"
              className="backdrop-blur-glass border-gradient bg-card/40"
            />
          </div>

          {/* Personalidade - Only for Female */}
          {gender === 'female' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">4. Personalidade</Label>
              <Select value={characterData.personality} onValueChange={(v) => onCharacterDataChange('personality', v)}>
                <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                  <SelectValue placeholder="Selecione a personalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gentle">Gentil</SelectItem>
                  <SelectItem value="confident">Confiante</SelectItem>
                  <SelectItem value="shy">Tímida</SelectItem>
                  <SelectItem value="energetic">Energética</SelectItem>
                  <SelectItem value="mysterious">Misteriosa</SelectItem>
                  <SelectItem value="playful">Brincalhona</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Altura */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{gender === 'female' ? '5' : '4'}. Altura (metros)</Label>
            <Input
              type="number"
              step="0.01"
              value={characterData.height}
              onChange={(e) => onCharacterDataChange('height', e.target.value)}
              placeholder="Ex: 1.70"
              className="backdrop-blur-glass border-gradient bg-card/40"
            />
          </div>

          {/* Voz */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{gender === 'female' ? '6' : '5'}. Voz</Label>
            <Select value={characterData.voice} onValueChange={(v) => onCharacterDataChange('voice', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue placeholder="Selecione o tipo de voz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soft">Suave</SelectItem>
                <SelectItem value="deep">Grave</SelectItem>
                <SelectItem value="high">Aguda</SelectItem>
                <SelectItem value="husky">Rouca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Cabelo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{gender === 'female' ? '7' : '6'}. Tipo de Cabelo</Label>
            <Select value={characterData.hairType} onValueChange={(v) => onCharacterDataChange('hairType', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight">Liso</SelectItem>
                <SelectItem value="wavy">Ondulado</SelectItem>
                <SelectItem value="curly">Cacheado</SelectItem>
                <SelectItem value="coily">Crespo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comprimento do Cabelo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{gender === 'female' ? '8' : '7'}. Comprimento do Cabelo</Label>
            <Select value={characterData.hairLength} onValueChange={(v) => onCharacterDataChange('hairLength', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue placeholder="Selecione o comprimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very-short">Muito Curto</SelectItem>
                <SelectItem value="short">Curto</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="long">Longo</SelectItem>
                <SelectItem value="very-long">Muito Longo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cor do Cabelo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{gender === 'female' ? '9' : '8'}. Cor do Cabelo</Label>
            <Select value={characterData.hairColor} onValueChange={(v) => onCharacterDataChange('hairColor', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue placeholder="Selecione a cor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="black">Preto</SelectItem>
                <SelectItem value="brown">Castanho</SelectItem>
                <SelectItem value="blonde">Loiro</SelectItem>
                <SelectItem value="red">Ruivo</SelectItem>
                <SelectItem value="white">Branco</SelectItem>
                <SelectItem value="blue">Azul</SelectItem>
                <SelectItem value="pink">Rosa</SelectItem>
                <SelectItem value="purple">Roxo</SelectItem>
                <SelectItem value="green">Verde</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cor dos Olhos */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{gender === 'female' ? '10' : '9'}. Cor dos Olhos</Label>
            <Select value={characterData.eyeColor} onValueChange={(v) => onCharacterDataChange('eyeColor', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue placeholder="Selecione a cor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brown">Castanho</SelectItem>
                <SelectItem value="blue">Azul</SelectItem>
                <SelectItem value="green">Verde</SelectItem>
                <SelectItem value="hazel">Avelã</SelectItem>
                <SelectItem value="gray">Cinza</SelectItem>
                <SelectItem value="amber">Âmbar</SelectItem>
                <SelectItem value="red">Vermelho</SelectItem>
                <SelectItem value="purple">Roxo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expressão Facial */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{gender === 'female' ? '11' : '10'}. Expressão Facial</Label>
            <Select value={characterData.facialExpression} onValueChange={(v) => onCharacterDataChange('facialExpression', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue placeholder="Selecione a expressão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="happy">Feliz</SelectItem>
                <SelectItem value="neutral">Neutra</SelectItem>
                <SelectItem value="serious">Séria</SelectItem>
                <SelectItem value="confident">Confiante</SelectItem>
                <SelectItem value="mysterious">Misteriosa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Detalhes Faciais */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{gender === 'female' ? '12' : '11'}. Detalhes Faciais</Label>
            <Select value={characterData.facialDetails} onValueChange={(v) => onCharacterDataChange('facialDetails', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue placeholder="Selecione os detalhes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="freckles">Sardas</SelectItem>
                <SelectItem value="mole">Pinta</SelectItem>
                <SelectItem value="piercing">Piercing</SelectItem>
                <SelectItem value="scar">Cicatriz</SelectItem>
                <SelectItem value="tattoo">Tatuagem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Corpo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{gender === 'female' ? '13' : '12'}. Tipo de Corpo</Label>
            <Select value={characterData.bodyType} onValueChange={(v) => onCharacterDataChange('bodyType', v)}>
              <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slim">Magro</SelectItem>
                <SelectItem value="average">Médio</SelectItem>
                <SelectItem value="athletic">Atlético</SelectItem>
                <SelectItem value="curvy">Curvilíneo</SelectItem>
                <SelectItem value="muscular">Musculoso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Female Specific Fields */}
          {gender === 'female' && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">14. Tamanho dos Seios</Label>
                <Select value={characterData.breastSize} onValueChange={(v) => onCharacterDataChange('breastSize', v)}>
                  <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                    <SelectItem value="extra-large">Extra Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">15. Tamanho da Bunda</Label>
                <Select value={characterData.buttSize} onValueChange={(v) => onCharacterDataChange('buttSize', v)}>
                  <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                    <SelectItem value="extra-large">Extra Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Male Specific Field */}
          {gender === 'male' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">13. Musculatura</Label>
              <Select value={characterData.musculature} onValueChange={(v) => onCharacterDataChange('musculature', v)}>
                <SelectTrigger className="backdrop-blur-glass border-gradient bg-card/40">
                  <SelectValue placeholder="Selecione a musculatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lean">Magro</SelectItem>
                  <SelectItem value="average">Médio</SelectItem>
                  <SelectItem value="toned">Definido</SelectItem>
                  <SelectItem value="muscular">Musculoso</SelectItem>
                  <SelectItem value="very-muscular">Muito Musculoso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};