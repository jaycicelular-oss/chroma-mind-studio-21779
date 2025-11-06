import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ImageDisplay } from "@/components/ImageDisplay";
import { GifDisplay } from "@/components/GifDisplay";
import { FramesDisplay } from "@/components/FramesDisplay";
import { VideoDisplay } from "@/components/VideoDisplay";
import { CharacterDisplay } from "@/components/CharacterDisplay";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { Auth } from "@/components/Auth";
import { ImageViewer } from "@/components/ImageViewer";
import { ContentTabs } from "@/components/ContentTabs";
import { ImageTab } from "@/components/tabs/ImageTab";
import { GifTab } from "@/components/tabs/GifTab";
import { FramesTab } from "@/components/tabs/FramesTab";
import { VideoTab } from "@/components/tabs/VideoTab";
import { CharacterTab } from "@/components/tabs/CharacterTab";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGeneratedImages } from "@/hooks/useGeneratedImages";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [prompt, setPrompt] = useState(
    "Um retrato hiper-realista de um mago ancião sábio conjurando um feitiço, luz volumétrica, partículas mágicas, detalhado, cinemático"
  );
  const [selectedStyle, setSelectedStyle] = useState("photorealistic");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [quality, setQuality] = useState("high");
  const [outputType, setOutputType] = useState("image");
  const [selectedGender, setSelectedGender] = useState<'none' | 'male' | 'female'>('none');
  const [currentImage, setCurrentImage] = useState(heroImage);
  const [currentGif, setCurrentGif] = useState<string | undefined>(undefined);
  const [currentFrames, setCurrentFrames] = useState<string[] | undefined>(undefined);
  const [currentVideo, setCurrentVideo] = useState<string | undefined>(undefined);
  const [currentCharacter, setCurrentCharacter] = useState<any>(undefined);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: "", prompt: "" });
  const [activeTab, setActiveTab] = useState("image");
  
  const [advancedFilters, setAdvancedFilters] = useState({
    hairColor: "none",
    hairStyle: "none",
    eyeColor: "none",
    bodyType: "none",
    height: "none",
    clothing: "none",
    pose: "none",
    background: "none",
    facialExpression: "none",
    ethnicity: "none",
    age: "none",
    bustSize: "none",
    breastSize: "none",
    musculature: "none",
    contentType: "none",
    armPosition: "none",
    viewDistance: "none",
    cameraAngle: "none",
    timeOfDay: "none",
    lighting: "none",
  });

  const handleFilterChange = (key: string, value: string) => {
    setAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderDisplay = () => {
    switch (activeTab) {
      case "gif":
        return <GifDisplay gifUrl={currentGif} alt="GIF Gerado" />;
      case "frames":
        return <FramesDisplay frameUrls={currentFrames} alt="Frames Gerados" />;
      case "video":
        return <VideoDisplay videoUrl={currentVideo} alt="Vídeo Gerado" />;
      case "character":
        return <CharacterDisplay character={currentCharacter} />;
      default:
        return <ImageDisplay imageUrl={currentImage} alt="Imagem Gerada" />;
    }
  };

  const buildEnhancedPrompt = () => {
    let enhancedPrompt = prompt;
    
    // Add gender filter if selected
    if (selectedGender === 'male') {
      enhancedPrompt = `male, man, ${enhancedPrompt}`;
    } else if (selectedGender === 'female') {
      enhancedPrompt = `female, woman, ${enhancedPrompt}`;
    }
    
    const filters = [];
    if (advancedFilters.hairColor !== "none") filters.push(`${advancedFilters.hairColor} hair`);
    if (advancedFilters.hairStyle !== "none") filters.push(`${advancedFilters.hairStyle} hair style`);
    if (advancedFilters.eyeColor !== "none") filters.push(`${advancedFilters.eyeColor} eyes`);
    if (advancedFilters.bodyType !== "none") filters.push(`${advancedFilters.bodyType} body type`);
    if (advancedFilters.height !== "none") filters.push(`${advancedFilters.height} height`);
    if (advancedFilters.clothing !== "none") filters.push(`${advancedFilters.clothing} clothing`);
    if (advancedFilters.pose !== "none") filters.push(`${advancedFilters.pose} pose`);
    if (advancedFilters.background !== "none") filters.push(`${advancedFilters.background} background`);
    if (advancedFilters.facialExpression !== "none") filters.push(`${advancedFilters.facialExpression} expression`);
    if (advancedFilters.ethnicity !== "none") filters.push(`${advancedFilters.ethnicity} ethnicity`);
    if (advancedFilters.age !== "none") filters.push(`${advancedFilters.age} age`);
    
    // Gender-specific filters
    if (selectedGender === 'female') {
      if (advancedFilters.bustSize !== "none") filters.push(`${advancedFilters.bustSize} bust`);
      if (advancedFilters.breastSize !== "none") filters.push(`${advancedFilters.breastSize} breast size`);
    } else if (selectedGender === 'male') {
      if (advancedFilters.musculature !== "none") filters.push(`${advancedFilters.musculature} musculature`);
    } else if (selectedGender === 'none') {
      if (advancedFilters.contentType !== "none") filters.push(`${advancedFilters.contentType}`);
    }
    
    if (advancedFilters.armPosition !== "none") filters.push(`arms ${advancedFilters.armPosition}`);
    if (advancedFilters.viewDistance !== "none") filters.push(`${advancedFilters.viewDistance} shot`);
    if (advancedFilters.cameraAngle !== "none") filters.push(`${advancedFilters.cameraAngle} angle`);
    if (advancedFilters.timeOfDay !== "none") filters.push(`${advancedFilters.timeOfDay} lighting`);
    if (advancedFilters.lighting !== "none") filters.push(`${advancedFilters.lighting} light`);
    
    if (filters.length > 0) {
      enhancedPrompt += ", " + filters.join(", ");
    }
    
    if (outputType === "gif") {
      enhancedPrompt += ", animated, smooth motion, realistic movement";
    } else if (outputType === "frames") {
      enhancedPrompt += ", cinematic sequence, storyboard style, multiple perspectives";
    }
    
    return enhancedPrompt;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um prompt",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const enhancedPrompt = buildEnhancedPrompt();
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: enhancedPrompt,
          style: selectedStyle,
          aspectRatio,
          quality,
          outputType,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success && data.image) {
        setCurrentImage(data.image.image_url);
        setCurrentPrompt(prompt);
        queryClient.invalidateQueries({ queryKey: ['generated-images'] });
        toast({
          title: "Sucesso!",
          description: outputType === "gif" 
            ? "GIF animado gerado com sucesso" 
            : outputType === "frames"
            ? "Sequência de frames gerada com sucesso"
            : "Imagem gerada com sucesso",
        });
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast({
        title: "Erro ao gerar imagem",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-glow w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-foreground" />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundEffects />
      <Navigation />
      
      {/* Main Content */}
      <main className="relative z-10 pt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Display Section */}
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold">
                  <span className="text-gradient">✨ Visualização </span>
                  <span className="text-foreground">em Tempo Real</span>
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Sua criação aparecerá aqui assim que a geração for concluída. 
                  Aguarde alguns segundos para ver a mágica acontecer! 🎨
                </p>
                {generating && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm text-primary font-medium">Gerando...</span>
                  </div>
                )}
              </div>
              
              {activeTab === "image" ? (
                <ImageDisplay 
                  imageUrl={currentImage} 
                  alt="Imagem Gerada"
                  onImageEdited={(newUrl) => setCurrentImage(newUrl)}
                />
              ) : (
                renderDisplay()
              )}
              
              {/* Info Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="backdrop-blur-glass rounded-lg p-4 border border-primary/30 text-center hover:border-primary/50 transition-colors group">
                  <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">8K</div>
                  <div className="text-xs text-muted-foreground mt-1">Alta Resolução</div>
                </div>
                <div className="backdrop-blur-glass rounded-lg p-4 border border-secondary/30 text-center hover:border-secondary/50 transition-colors group">
                  <div className="text-2xl font-bold text-secondary group-hover:scale-110 transition-transform">{aspectRatio}</div>
                  <div className="text-xs text-muted-foreground mt-1">Proporção</div>
                </div>
                <div className="backdrop-blur-glass rounded-lg p-4 border border-accent/30 text-center hover:border-accent/50 transition-colors group">
                  <div className="text-2xl font-bold text-accent group-hover:scale-110 transition-transform">
                    {quality === 'ultra' ? 'MAX' : quality === 'high' ? 'HD' : quality === 'standard' ? 'SD' : 'FAST'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Qualidade</div>
                </div>
              </div>

              {currentPrompt && (
                <div className="backdrop-blur-glass rounded-lg p-4 border border-border/50">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <span>💬</span>
                    Prompt Utilizado
                  </h3>
                  <p className="text-xs text-muted-foreground italic">
                    "{currentPrompt}"
                  </p>
                </div>
              )}
            </div>

            {/* Controls Section */}
            <div className="space-y-6">
              <div className="backdrop-blur-glass rounded-lg p-6 border border-border/50 shadow-lg space-y-4">
                <div className="space-y-2 pb-4 border-b border-border/30">
                  <h2 className="text-xl font-bold flex items-center gap-2 justify-center">
                    <span className="text-2xl">⚙️</span>
                    <span className="text-gradient">Criador de Conteúdo</span>
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed text-center">
                    Configure cada parâmetro seguindo os passos abaixo para criar conteúdo único e personalizado
                  </p>
                </div>
                
                <ContentTabs onTabChange={setActiveTab}>
                  {{
                    imageTab: (
                      <ImageTab
                        prompt={prompt}
                        onPromptChange={setPrompt}
                        selectedStyle={selectedStyle}
                        onStyleChange={setSelectedStyle}
                        aspectRatio={aspectRatio}
                        onAspectRatioChange={setAspectRatio}
                        quality={quality}
                        onQualityChange={setQuality}
                        outputType={outputType}
                        onOutputTypeChange={setOutputType}
                        selectedGender={selectedGender}
                        onGenderChange={setSelectedGender}
                        advancedFilters={advancedFilters}
                        onAdvancedFilterChange={handleFilterChange}
                        onGenerate={handleGenerate}
                        isGenerating={generating}
                      />
                    ),
                    gifTab: <GifTab />,
                    framesTab: <FramesTab />,
                    videoTab: <VideoTab />,
                    characterTab: <CharacterTab />,
                  }}
                </ContentTabs>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Viewer Modal */}
      <ImageViewer
        imageUrl={selectedImage.url}
        prompt={selectedImage.prompt}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-6 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Criado com IA avançada • Processamento em tempo real
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
