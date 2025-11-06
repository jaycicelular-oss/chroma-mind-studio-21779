import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
import { VideoEditor } from "@/components/VideoEditor";

export const VideoTab = () => {
  return (
    <Card className="backdrop-blur-glass bg-card/40 border-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Criação de Vídeo
        </CardTitle>
        <CardDescription>
          Crie vídeos de até 25 minutos combinando imagens, GIFs e frames
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VideoEditor />
      </CardContent>
    </Card>
  );
};