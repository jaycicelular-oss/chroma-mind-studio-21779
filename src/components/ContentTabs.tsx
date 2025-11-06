import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Film, Layers, Video, UserCircle } from "lucide-react";

interface ContentTabsProps {
  children: {
    imageTab: React.ReactNode;
    gifTab: React.ReactNode;
    framesTab: React.ReactNode;
    videoTab: React.ReactNode;
    characterTab: React.ReactNode;
  };
  onTabChange?: (value: string) => void;
}

export const ContentTabs = ({ children, onTabChange }: ContentTabsProps) => {
  return (
    <Tabs defaultValue="image" className="w-full" onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-5 backdrop-blur-glass bg-card/40">
        <TabsTrigger value="image" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          <span className="hidden sm:inline">Imagem</span>
        </TabsTrigger>
        <TabsTrigger value="gif" className="flex items-center gap-2">
          <Film className="h-4 w-4" />
          <span className="hidden sm:inline">GIF</span>
        </TabsTrigger>
        <TabsTrigger value="frames" className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">Frames</span>
        </TabsTrigger>
        <TabsTrigger value="video" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          <span className="hidden sm:inline">Vídeo</span>
        </TabsTrigger>
        <TabsTrigger value="character" className="flex items-center gap-2">
          <UserCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Personagem</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="image" className="mt-6">
        {children.imageTab}
      </TabsContent>

      <TabsContent value="gif" className="mt-6">
        {children.gifTab}
      </TabsContent>

      <TabsContent value="frames" className="mt-6">
        {children.framesTab}
      </TabsContent>

      <TabsContent value="video" className="mt-6">
        {children.videoTab}
      </TabsContent>

      <TabsContent value="character" className="mt-6">
        {children.characterTab}
      </TabsContent>
    </Tabs>
  );
};