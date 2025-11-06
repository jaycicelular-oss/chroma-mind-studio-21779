import { Card } from "@/components/ui/card";

interface CharacterDisplayProps {
  character?: {
    name: string;
    family_name?: string;
    gender: string;
    hair_color?: string;
    eye_color?: string;
    age?: string;
    imageUrl?: string;
  };
}

export const CharacterDisplay = ({ character }: CharacterDisplayProps) => {
  return (
    <Card className="relative overflow-hidden border-gradient backdrop-blur-glass p-1">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted/20">
        {character ? (
          <div className="flex h-full">
            <div className="w-1/2 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-6xl">👤</div>
            </div>
            <div className="w-1/2 p-6 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">
                {character.name} {character.family_name}
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Gênero:</span> {character.gender}</p>
                {character.hair_color && (
                  <p><span className="text-muted-foreground">Cabelo:</span> {character.hair_color}</p>
                )}
                {character.eye_color && (
                  <p><span className="text-muted-foreground">Olhos:</span> {character.eye_color}</p>
                )}
                {character.age && (
                  <p><span className="text-muted-foreground">Idade:</span> {character.age}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Nenhum personagem criado ainda</p>
              <p className="text-xs mt-2">Configure os parâmetros abaixo e crie seu personagem</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
