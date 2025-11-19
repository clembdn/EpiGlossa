"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import clsx from "clsx";

const ACCENTS = {
  purple: {
    wrapper: "from-purple-50 to-indigo-50",
    button: "bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600",
    text: "text-purple-900",
    textMuted: "text-purple-600",
    progress: "from-purple-400 to-indigo-400",
  },
  blue: {
    wrapper: "from-blue-50 to-cyan-50",
    button: "bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
    text: "text-blue-900",
    textMuted: "text-blue-600",
    progress: "from-blue-400 to-cyan-400",
  },
  emerald: {
    wrapper: "from-emerald-50 to-teal-50",
    button: "bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    text: "text-emerald-900",
    textMuted: "text-emerald-600",
    progress: "from-emerald-400 to-teal-400",
  },
};

type AccentKey = keyof typeof ACCENTS;

type AudioPlayerProps = {
  src: string;
  autoPlay?: boolean;
  locked?: boolean;
  label?: string;
  description?: string;
  status?: string;
  accent?: AccentKey;
  className?: string;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(function AudioPlayer(
  {
    src,
    autoPlay = false,
    locked = false,
    label = "Lecture audio",
    description,
    status,
    accent = "purple",
    className,
    onEnded,
    onPause,
    onPlay,
  },
  ref,
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => setDuration(audio.duration || 0);
    const handleTime = () => setCurrentTime(audio.currentTime || 0);
    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration || 0);
      onEnded?.();
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onEnded, onPause, onPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    if (autoPlay) {
      audio.play().catch(() => undefined);
    }
  }, [src, autoPlay]);

  const togglePlayback = () => {
    if (locked) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => undefined);
    }
  };

  const handleSeek = (value: number) => {
    if (locked) return;
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const tokens = ACCENTS[accent];
  const effectiveStatus = status || (isPlaying ? "Lecture en cours" : currentTime > 0 ? "En pause" : "Prêt à jouer");
  const helperText = description || "Profite de cet extrait pour t'immerger dans la consigne.";
  const progressValue = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={clsx(
        "rounded-3xl bg-gradient-to-br shadow-lg border-2 border-gray-100", 
        tokens.wrapper,
        className,
      )}
    >
      <div className="flex items-center gap-4 p-5">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={locked}
          className={clsx(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-all text-white",
            tokens.button,
            locked ? "cursor-not-allowed opacity-50" : "hover:scale-105 hover:shadow-lg",
          )}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <div className="flex-1">
          <p className={clsx("text-xs uppercase tracking-wider font-semibold flex items-center gap-2", tokens.textMuted)}>
            <Volume2 className="w-4 h-4" />
            {label}
          </p>
          <p className={clsx("text-lg font-bold", tokens.text)}>{effectiveStatus}</p>
          <p className={clsx("text-xs mt-0.5", tokens.textMuted)}>{helperText}</p>
        </div>
        <div className={clsx("text-right text-sm font-semibold", tokens.text)}>
          <span>{formatTime(currentTime)}</span>
          <span className={tokens.textMuted}> / {formatTime(duration)}</span>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="relative h-2">
          <div className="absolute inset-0 bg-gray-200 rounded-full h-2" />
          <div 
            className={clsx("absolute inset-y-0 left-0 rounded-full h-2 bg-gradient-to-r transition-all", tokens.progress)}
            style={{ width: `${progressValue}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step="0.1"
            value={currentTime}
            disabled={locked}
            onChange={(event) => handleSeek(Number(event.target.value))}
            className={clsx(
              "relative w-full appearance-none cursor-pointer z-10",
              "bg-transparent",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-300",
              "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-300 [&::-moz-range-thumb]:border-none",
              locked ? "pointer-events-none opacity-50" : "[&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:hover:scale-110",
            )}
            style={{
              height: '2rem',
              marginTop: '-0.75rem',
            }}
          />
        </div>
      </div>

      <audio ref={audioRef} src={src} className="hidden" preload="auto" />
    </div>
  );
});

export default AudioPlayer;
