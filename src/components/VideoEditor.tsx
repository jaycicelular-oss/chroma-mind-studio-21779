import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Play, Save, Download, Trash2, Edit, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Frame {
  id: string;
  url: string;
  duration: number;
  position: number;
}

export const VideoEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrame, setCurrentFrame] = useState<string>("");
  const [videoName, setVideoName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  const addFrame = (url: string) => {
    const newFrame: Frame = {
      id: crypto.randomUUID(),
      url,
      duration: 5, // 5 seconds default
      position: frames.length * 5
    };
    setFrames([...frames, newFrame]);
    toast({
      title: "Frame adicionado",
      description: "Frame adicionado à timeline com sucesso!"
    });
  };

  const removeFrame = (id: string) => {
    setFrames(frames.filter(f => f.id !== id));
    toast({
      title: "Frame removido",
      description: "Frame removido da timeline."
    });
  };

  const handleAIChat = async () => {
    if (!aiMessage.trim()) return;

    const newMessage = { role: "user", content: aiMessage };
    setChatHistory([...chatHistory, newMessage]);
    setAiMessage("");

    try {
      const { data, error } = await supabase.functions.invoke('video-ai-assistant', {
        body: { 
          message: aiMessage,
          frames: frames.length,
          videoName 
        }
      });

      if (error) throw error;

      const aiResponse = { role: "assistant", content: data.response };
      setChatHistory(prev => [...prev, aiResponse]);

    } catch (error: any) {
      toast({
        title: "Erro no chat",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const generateVideo = async () => {
    if (frames.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um frame para gerar o vídeo.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // In a real implementation, this would call an edge function to create the video
      toast({
        title: "Gerando vídeo",
        description: "Seu vídeo está sendo processado. Isso pode levar alguns minutos.",
      });

      // Simulate video generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Vídeo criado!",
        description: "Seu vídeo foi gerado com sucesso.",
      });

    } catch (error: any) {
      toast({
        title: "Erro ao gerar vídeo",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const totalDuration = frames.reduce((acc, frame) => acc + frame.duration, 0);
  const maxDuration = 25 * 60; // 25 minutes in seconds

  return (
    <div className="space-y-6">
      {/* Video Name Input */}
      <div className="space-y-2">
        <Input
          value={videoName}
          onChange={(e) => setVideoName(e.target.value)}
          placeholder="Nome do vídeo"
          className="backdrop-blur-glass border-gradient"
        />
      </div>

      {/* Video Player / Preview */}
      <Card className="backdrop-blur-glass border-gradient p-6">
        <div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center">
          {currentFrame ? (
            <img src={currentFrame} alt="Current frame" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-center text-muted-foreground">
              <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Adicione frames para visualizar seu vídeo</p>
            </div>
          )}
        </div>
      </Card>

      {/* Timeline */}
      <Card className="backdrop-blur-glass border-gradient p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Timeline - {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')} / 25:00</h3>
            <Button size="sm" onClick={() => document.getElementById('frame-input')?.click()}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Frame
            </Button>
            <input
              id="frame-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  addFrame(url);
                }
              }}
            />
          </div>
          
          <div className="relative h-24 bg-black/10 rounded-lg overflow-hidden" ref={timelineRef}>
            <div className="absolute inset-0 flex gap-1 p-2">
              {frames.map((frame, index) => (
                <div
                  key={frame.id}
                  className="relative h-full cursor-pointer group"
                  style={{ width: `${(frame.duration / maxDuration) * 100}%` }}
                  onClick={() => setCurrentFrame(frame.url)}
                >
                  <img
                    src={frame.url}
                    alt={`Frame ${index + 1}`}
                    className="h-full w-full object-cover rounded border-2 border-primary/50 group-hover:border-primary"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-0 right-0 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFrame(frame.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-2 bg-black/20 rounded-full">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(totalDuration / maxDuration) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* AI Chat Assistant */}
      <Card className="backdrop-blur-glass border-gradient p-4">
        <h3 className="font-semibold mb-4">Assistente IA de Vídeo</h3>
        <ScrollArea className="h-[200px] mb-4 pr-4">
          <div className="space-y-3">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary/20 ml-auto max-w-[80%]'
                    : 'bg-card/60 mr-auto max-w-[80%]'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Textarea
            value={aiMessage}
            onChange={(e) => setAiMessage(e.target.value)}
            placeholder="Peça ajuda à IA para ajustar seu vídeo..."
            className="backdrop-blur-glass border-gradient resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAIChat();
              }
            }}
          />
          <Button onClick={handleAIChat} disabled={!aiMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={generateVideo} disabled={isGenerating || frames.length === 0} className="flex-1">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando Vídeo Final...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Gerar Vídeo Final com IA
            </>
          )}
        </Button>
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Salvar
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Baixar
        </Button>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>
    </div>
  );
};