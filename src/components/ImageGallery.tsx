import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImageGalleryProps {
  images?: Array<{
    id: string;
    image_url: string;
    prompt: string;
    created_at: string;
  }>;
  loading?: boolean;
  onImageClick?: (imageUrl: string, prompt: string) => void;
}

export const ImageGallery = ({ images = [], loading, onImageClick }: ImageGalleryProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <span className="text-primary">●</span>
            Histórico
          </h3>
        </div>
        <div className="flex items-center justify-center h-[500px]">
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <span className="text-primary">●</span>
            Histórico
          </h3>
        </div>
        <div className="flex items-center justify-center h-[500px]">
          <p className="text-sm text-muted-foreground text-center">
            Nenhuma imagem gerada ainda.<br />
            Comece criando sua primeira imagem!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2">
          <span className="text-primary">●</span>
          Histórico
        </h3>
        <span className="text-xs text-muted-foreground">{images.length} {images.length === 1 ? 'imagem' : 'imagens'}</span>
      </div>
      <ScrollArea className="h-[500px] pr-4">
        <div className="grid gap-3">
          {images.map((image) => (
            <Card
              key={image.id}
              className="relative overflow-hidden border-gradient backdrop-blur-glass p-1 cursor-pointer hover:glow-blue transition-all group"
              onClick={() => onImageClick?.(image.image_url, image.prompt)}
            >
              <div className="relative aspect-video overflow-hidden rounded-md">
                <img
                  src={image.image_url}
                  alt={image.prompt.substring(0, 50)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                  <span className="text-xs text-foreground/80 text-center line-clamp-3">
                    {image.prompt}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
