import { Card } from "@/components/ui/card";

interface GifDisplayProps {
  gifUrl?: string;
  alt: string;
}

export const GifDisplay = ({ gifUrl, alt }: GifDisplayProps) => {
  return (
    <Card className="relative overflow-hidden border-gradient backdrop-blur-glass p-1">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted/20 flex items-center justify-center">
        {gifUrl ? (
          <>
            <img
              src={gifUrl}
              alt={alt}
              className="w-full h-full object-cover animate-float"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="backdrop-blur-glass px-3 py-1 rounded-full text-xs text-foreground/80">
                GIF Animado
              </div>
              <div className="backdrop-blur-glass px-3 py-1 rounded-full text-xs text-primary">
                ✨ Alta Qualidade
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Nenhum GIF gerado ainda</p>
            <p className="text-xs mt-2">Configure os parâmetros abaixo e gere seu GIF</p>
          </div>
        )}
      </div>
    </Card>
  );
};
