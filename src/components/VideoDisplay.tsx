import { Card } from "@/components/ui/card";

interface VideoDisplayProps {
  videoUrl?: string;
  alt: string;
}

export const VideoDisplay = ({ videoUrl, alt }: VideoDisplayProps) => {
  return (
    <Card className="relative overflow-hidden border-gradient backdrop-blur-glass p-1">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted/20 flex items-center justify-center">
        {videoUrl ? (
          <>
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
            >
              Seu navegador não suporta vídeos.
            </video>
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="backdrop-blur-glass px-3 py-1 rounded-full text-xs text-foreground/80">
                Vídeo HD
              </div>
              <div className="backdrop-blur-glass px-3 py-1 rounded-full text-xs text-primary">
                ✨ Alta Qualidade
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Nenhum vídeo gerado ainda</p>
            <p className="text-xs mt-2">Configure os parâmetros abaixo e gere seu vídeo</p>
          </div>
        )}
      </div>
    </Card>
  );
};
