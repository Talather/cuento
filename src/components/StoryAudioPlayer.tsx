import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface StoryAudioPlayerProps {
  storyId: string;
  storyText: string;
  onWordHighlight?: (index: number) => void;
}

interface SRTCue {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}

function parseSRT(srtContent: string): SRTCue[] {
  if (!srtContent) return [];
  
  const cues: SRTCue[] = [];
  const blocks = srtContent.trim().split('\n\n');
  
  blocks.forEach(block => {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      const index = parseInt(lines[0]);
      const [startStr, endStr] = lines[1].split(' --> ');
      const text = lines.slice(2).join(' ');
      
      const startTime = timeStringToSeconds(startStr);
      const endTime = timeStringToSeconds(endStr);
      
      cues.push({ index, startTime, endTime, text });
    }
  });
  
  return cues;
}

function timeStringToSeconds(timeStr: string): number {
  const [time, ms] = timeStr.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + parseInt(ms) / 1000;
}

export function StoryAudioPlayer({ storyId, storyText }: StoryAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState<string>("0:00");
  const [currentTime, setCurrentTime] = useState<string>("0:00");
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState("1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("es-AR-ElenaNeural");
  const { toast } = useToast();

  const { data: audioData, isLoading: isCheckingAudio } = useQuery({
    queryKey: ['story-audio', storyId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('story_audio')
          .select('audio_url, srt_content')
          .eq('story_id', storyId)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching audio data:", error);
        return null;
      }
    }
  });

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (audio) {
      audio.onloadedmetadata = () => {
        setDuration(formatTime(audio.duration));
      };

      audio.ontimeupdate = () => {
        setCurrentTime(formatTime(audio.currentTime));
        setProgress((audio.currentTime / audio.duration) * 100);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  }, [audio]);

  const handleSpeedChange = (value: string) => {
    setPlaybackSpeed(value);
    if (audio) {
      audio.playbackRate = parseFloat(value);
    }
  };

  const handleSeek = (value: number) => {
    if (audio) {
      const newTime = (value / 100) * audio.duration;
      audio.currentTime = newTime;
    }
  };

  const skipTime = (seconds: number) => {
    if (audio) {
      audio.currentTime = Math.min(
        Math.max(0, audio.currentTime + seconds),
        audio.duration
      );
    }
  };

  const handleTogglePlay = async () => {
    try {
      if (!audio) {
        let audioUrl = audioData?.audio_url || null;

        if (!audioUrl) {
          setIsGenerating(true);
          const { data, error } = await supabase.functions.invoke('generate-speech', {
            body: { 
              storyId, 
              text: storyText,
              voice: selectedVoice 
            }
          });

          if (error) throw error;
          
          if (data) {
            audioUrl = data.url;
          } else {
            throw new Error("No data returned from speech generation");
          }
          
          setIsGenerating(false);
        }

        if (!audioUrl) {
          throw new Error("No audio URL available");
        }

        const newAudio = new Audio(audioUrl);
        newAudio.onended = () => {
          setIsPlaying(false);
        };
        newAudio.onerror = () => {
          toast({
            title: "Error",
            description: "No se pudo reproducir el audio",
            variant: "destructive",
          });
          setIsPlaying(false);
        };
        newAudio.playbackRate = parseFloat(playbackSpeed);
        
        setAudio(newAudio);
        await newAudio.play();
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          await audio.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Error",
        description: error.message.includes('Quota Exceeded') 
          ? "No se pudo generar el audio. Prueba de nuevo en unos minutos."
          : "No se pudo generar el audio",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        {!audioData && (
          <Select
            value={selectedVoice}
            onValueChange={setSelectedVoice}
            disabled={!!audio}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Voz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es-AR-ElenaNeural">Voz femenina</SelectItem>
              <SelectItem value="es-AR-TomasNeural">Voz masculina</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleTogglePlay}
          disabled={isCheckingAudio || isGenerating}
        >
          {isCheckingAudio || isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          <span className="ml-2">
            {isCheckingAudio ? "Cargando..." : 
             isGenerating ? "Generando..." :
             isPlaying ? "Pausar" : "Escuchar"}
          </span>
        </Button>

        <Select
          value={playbackSpeed}
          onValueChange={handleSpeedChange}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Velocidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1x</SelectItem>
            <SelectItem value="1.1">1.1x</SelectItem>
            <SelectItem value="1.5">1.5x</SelectItem>
            <SelectItem value="2">2x</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => skipTime(-10)}
          disabled={!audio || isCheckingAudio}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => skipTime(10)}
          disabled={!audio || isCheckingAudio}
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <div className="text-sm text-muted-foreground min-w-[80px]">
          {currentTime} / {duration}
        </div>
      </div>

      <div className="px-2">
        <Progress 
          value={progress} 
          className="cursor-pointer" 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            handleSeek(percent);
          }}
        />
      </div>
    </div>
  );
}
