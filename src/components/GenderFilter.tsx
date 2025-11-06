import { Button } from "@/components/ui/button";
import { User, UserCircle, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";

interface GenderFilterProps {
  selectedGender: 'none' | 'male' | 'female';
  onGenderChange: (gender: 'none' | 'male' | 'female') => void;
}

export const GenderFilter = ({ selectedGender, onGenderChange }: GenderFilterProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <Label className="text-sm font-semibold">Categoria de Conteúdo</Label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={selectedGender === 'none' ? 'default' : 'outline'}
          className="flex-col h-auto py-3 gap-1"
          onClick={() => onGenderChange('none')}
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-xs">Diversos</span>
        </Button>
        <Button
          variant={selectedGender === 'female' ? 'default' : 'outline'}
          className="flex-col h-auto py-3 gap-1"
          onClick={() => onGenderChange('female')}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Mulher</span>
        </Button>
        <Button
          variant={selectedGender === 'male' ? 'default' : 'outline'}
          className="flex-col h-auto py-3 gap-1"
          onClick={() => onGenderChange('male')}
        >
          <UserCircle className="h-5 w-5" />
          <span className="text-xs">Homem</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {selectedGender === 'none' && '🎨 Animais, paisagens, objetos e mais'}
        {selectedGender === 'female' && '👩 Personagens femininos com filtros específicos'}
        {selectedGender === 'male' && '👨 Personagens masculinos com filtros específicos'}
      </p>
    </div>
  );
};
