import { useEffect, useRef, useState } from "react";
import { Play, Pause, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MusicToggle({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [needsNudge, setNeedsNudge] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.45;
    audioRef.current = audio;

    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        setPlaying(false);
        setNeedsNudge(true);
        const tryPlay = () => {
          audio.play().then(() => {
            setPlaying(true);
            setNeedsNudge(false);
          }).catch(() => {});
          window.removeEventListener("pointerdown", tryPlay);
          window.removeEventListener("keydown", tryPlay);
        };
        window.addEventListener("pointerdown", tryPlay, { once: true });
        window.addEventListener("keydown", tryPlay, { once: true });
      });

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [src]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      a.pause();
      setPlaying(false);
    }
    setNeedsNudge(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "Pause office theme" : "Play office theme"}
      className={cn(
        "fixed right-4 top-1/2 z-50 -translate-y-1/2 group flex items-center gap-2 rounded-full border border-foreground/20 bg-paper/95 py-2 pl-2 pr-3 shadow-paper backdrop-blur transition hover:translate-x-[-2px]",
        needsNudge && "animate-pulse",
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
      </span>
      <span className="hidden font-display text-[10px] tracking-widest text-foreground/70 sm:flex sm:items-center sm:gap-1">
        <Music2 className="h-3 w-3" />
        {playing ? "THEME ON" : "THEME OFF"}
      </span>
    </button>
  );
}
