import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { toast } from "sonner";

interface ImageViewerProps {
  imageUrl: string;
  prompt: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer = ({ imageUrl, prompt, isOpen, onClose }: ImageViewerProps) => {
  const handleDownload = async (format: 'png' | 'gif') => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-image-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Imagem baixada como ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Erro ao baixar imagem');
      console.error('Download error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined} className="max-w-[95vw] max-h-[95vh] p-0 border-gradient backdrop-blur-glass overflow-hidden">
        <div className="relative w-full h-full flex flex-col">
          {/* Header com botões */}
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload('png')}
                className="backdrop-blur-glass"
              >
                <Download className="h-4 w-4 mr-2" />
                PNG
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload('gif')}
                className="backdrop-blur-glass"
              >
                <Download className="h-4 w-4 mr-2" />
                GIF
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="backdrop-blur-glass hover:glow-blue"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Imagem */}
          <div className="flex items-center justify-center w-full h-[85vh] p-4">
            <img
              src={imageUrl}
              alt={prompt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Footer com prompt */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-sm text-foreground/80 text-center line-clamp-2">
              {prompt}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
