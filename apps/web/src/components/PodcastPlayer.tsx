import { useState, useRef, useEffect } from "react";

type PodcastPlayerProps = {
  audioUrl: string;
  jobId: string;
};

export function PodcastPlayer({ audioUrl, jobId }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newProgress = Number(e.target.value);
    const newTime = (newProgress / 100) * duration;
    audio.currentTime = newTime;
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="podcast-player">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="podcast-controls">
        <button
          onClick={togglePlay}
          className="podcast-play-btn"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸" : "▶️"}
        </button>

        <div className="podcast-info">
          <div className="podcast-title">Codebase Overview Podcast</div>
          <div className="podcast-meta">Job: {jobId.slice(0, 8)}...</div>
        </div>

        <div className="podcast-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="podcast-progress-container">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="podcast-progress"
          aria-label="Seek"
        />
        <div
          className="podcast-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
