import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import photoRealisticThumb from "@/assets/style-photorealistic.jpg";
import fantasyThumb from "@/assets/style-fantasy.jpg";
import animeThumb from "@/assets/style-anime.jpg";
import conceptThumb from "@/assets/style-concept.jpg";
import linearThumb from "@/assets/style-linear.jpg";
import artLinearXThumb from "@/assets/style-art-linear-x.jpg";

const styles = [
  { id: "photorealistic", label: "Fotorrealista", thumbnail: photoRealisticThumb },
  { id: "fantasy", label: "Fantasia", thumbnail: fantasyThumb },
  { id: "anime", label: "Anime", thumbnail: animeThumb },
  { id: "linear", label: "Art Linear", thumbnail: linearThumb },
  { id: "art-linear-x", label: "Art Linear X", thumbnail: artLinearXThumb },
  { id: "concept", label: "Arte Conceitual", thumbnail: conceptThumb },
];

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

export const StyleSelector = ({ selectedStyle, onStyleChange }: StyleSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
        <span className="text-secondary">●</span>
        Estilo
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {styles.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-lg shadow-primary/50' 
                  : 'ring-1 ring-border/50 hover:ring-primary/50'
              }`}
            >
              <div className="aspect-video relative">
                <img 
                  src={style.thumbnail} 
                  alt={style.label}
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-primary rounded-full p-1">
                      <Check className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
              <div className={`px-3 py-2 text-center text-sm font-medium ${
                isSelected ? 'bg-primary/10 text-primary' : 'bg-card/40 text-foreground'
              }`}>
                {style.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
