import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { LiveImageEditDialog } from "@/components/LiveImageEditDialog";

interface ImageDisplayProps {
  imageUrl: string;
  alt: string;
  onImageEdited?: (newImageUrl: string) => void;
}

export const ImageDisplay = ({ imageUrl, alt, onImageEdited }: ImageDisplayProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  return (
    <>
      <Card className="relative overflow-hidden border-gradient backdrop-blur-glass p-1 group">
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={alt}
            className="w-full h-full object-cover animate-float"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Edit Button - appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={() => setIsEditDialogOpen(true)}
              className="backdrop-blur-glass"
              size="lg"
            >
              <Edit className="mr-2 h-5 w-5" />
              Editar Imagem
            </Button>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="backdrop-blur-glass px-3 py-1 rounded-full text-xs text-foreground/80">
            1920 x 1088
          </div>
          <div className="backdrop-blur-glass px-3 py-1 rounded-full text-xs text-primary">
            ✨ Alta Qualidade
          </div>
        </div>
      </Card>

      <LiveImageEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        imageUrl={imageUrl}
        onImageEdited={(newUrl) => {
          onImageEdited?.(newUrl);
          setIsEditDialogOpen(false);
        }}
      />
    </>
  );
};
