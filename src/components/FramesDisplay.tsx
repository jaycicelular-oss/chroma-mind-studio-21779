import { Card } from "@/components/ui/card";

interface FramesDisplayProps {
  frameUrls?: string[];
  alt: string;
}

export const FramesDisplay = ({ frameUrls, alt }: FramesDisplayProps) => {
  return (
    <Card className="relative overflow-hidden border-gradient backdrop-blur-glass p-1">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted/20">
        {frameUrls && frameUrls.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-1 h-full p-2">
              {frameUrls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative overflow-hidden rounded">
                  <img
                    src={url}
                    alt={`${alt} - Frame ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="backdrop-blur-glass px-3 py-1 rounded-full text-xs text-foreground/80">
                {frameUrls.length} Frames
              </div>
              <div className="backdrop-blur-glass px-3 py-1 rounded-full text-xs text-primary">
                ✨ Sequência
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Nenhum frame gerado ainda</p>
              <p className="text-xs mt-2">Configure os parâmetros abaixo e gere seus frames</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
