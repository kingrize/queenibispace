"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

export const TRACKS = [
  {
    "id": 1,
    "title": "I Love You So",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=I%20Love%20You%20So",
    "url": "/music/I%20Love%20You%20So.mp3"
  },
  {
    "id": 2,
    "title": "Something About You",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Something%20About%20You",
    "url": "/music/Something%20About%20You.mp3"
  },
  {
    "id": 3,
    "title": "ill die anyway.",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=ill%20die%20anyway.",
    "url": "/music/ill%20die%20anyway..mp3"
  },
  {
    "id": 4,
    "title": "Autumn Leaves",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Autumn%20Leaves",
    "url": "/music/Autumn%20Leaves.mp3"
  },
  {
    "id": 5,
    "title": "Lautre Valse Damelie",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Lautre%20Valse%20Damelie",
    "url": "/music/Lautre%20Valse%20Damelie.mp3"
  },
  {
    "id": 6,
    "title": "My Moon My Man",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=My%20Moon%20My%20Man",
    "url": "/music/My%20Moon%20My%20Man.mp3"
  },
  {
    "id": 7,
    "title": "4am slowed reverb",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=4am%20slowed%20reverb",
    "url": "/music/4am%20slowed%20reverb.mp3"
  },
  {
    "id": 8,
    "title": "The Distant Past",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=The%20Distant%20Past",
    "url": "/music/The%20Distant%20Past.mp3"
  },
  {
    "id": 9,
    "title": "Earrings",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Earrings",
    "url": "/music/Earrings.mp3"
  },
  {
    "id": 10,
    "title": "Love Birds",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Love%20Birds",
    "url": "/music/Love%20Birds.mp3"
  },
  {
    "id": 11,
    "title": "Warmpop",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Warmpop",
    "url": "/music/Warmpop.mp3"
  },
  {
    "id": 12,
    "title": "Petals",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Petals",
    "url": "/music/Petals.mp3"
  },
  {
    "id": 13,
    "title": "Save the World",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Save%20the%20World",
    "url": "/music/Save%20the%20World.mp3"
  },
  {
    "id": 14,
    "title": "Rot Daughter",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Rot%20Daughter",
    "url": "/music/Rot%20Daughter.mp3"
  },
  {
    "id": 15,
    "title": "100",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=100",
    "url": "/music/100.mp3"
  },
  {
    "id": 16,
    "title": "Leach",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Leach",
    "url": "/music/Leach.mp3"
  },
  {
    "id": 17,
    "title": "Perfect Pair",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Perfect%20Pair",
    "url": "/music/Perfect%20Pair.mp3"
  },
  {
    "id": 18,
    "title": "Sweet Boy",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Sweet%20Boy",
    "url": "/music/Sweet%20Boy.mp3"
  },
  {
    "id": 19,
    "title": "Without You",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Without%20You",
    "url": "/music/Without%20You.mp3"
  },
  {
    "id": 20,
    "title": "Jealous",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Jealous",
    "url": "/music/Jealous.mp3"
  },
  {
    "id": 21,
    "title": "You Are the Right One",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=You%20Are%20the%20Right%20One",
    "url": "/music/You%20Are%20the%20Right%20One.mp3"
  },
  {
    "id": 22,
    "title": "Roommates",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Roommates",
    "url": "/music/Roommates.mp3"
  },
  {
    "id": 23,
    "title": "Something About You",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Something%20About%20You",
    "url": "/music/Something%20About%20You.mp3"
  },
  {
    "id": 24,
    "title": "Cloud 9",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Cloud%209",
    "url": "/music/Cloud%209.mp3"
  },
  {
    "id": 25,
    "title": "Out of My League",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Out%20of%20My%20League",
    "url": "/music/Out%20of%20My%20League.mp3"
  },
  {
    "id": 26,
    "title": "we fell in love in october",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=we%20fell%20in%20love%20in%20october",
    "url": "/music/we%20fell%20in%20love%20in%20october.mp3"
  },
  {
    "id": 27,
    "title": "Cinderella - Instrumental",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Cinderella%20-%20Instrumental",
    "url": "/music/Cinderella%20-%20Instrumental.mp3"
  },
  {
    "id": 28,
    "title": "Tek It",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Tek%20It",
    "url": "/music/Tek%20It.mp3"
  },
  {
    "id": 29,
    "title": "Freaks",
    "artist": "Unknown Artist",
    "album": "Queenibi Playlist",
    "duration": "3:00",
    "cover": "https://api.dicebear.com/7.x/shapes/svg?seed=Freaks",
    "url": "/music/Freaks.mp3"
  }
];

interface MediaContextType {
  currentTrackIndex: number;
  currentTrack: typeof TRACKS[0];
  isPlaying: boolean;
  progress: number;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  handleSeek: (value: number) => void;
  handleVolume: (value: number) => void;
  playTrack: (index: number) => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
};

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const skipBackward = () => {
    const prevIndex = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const tot = audioRef.current.duration;
      setCurrentTime(current);
      if (!isNaN(tot)) {
        setDuration(tot);
        setProgress((current / tot) * 100);
      }
    }
  };

  const handleSeek = (value: number) => {
    setProgress(value);
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
    }
  };

  const handleVolume = (value: number) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    setIsMuted(value === 0);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex]);

  const value = React.useMemo(() => ({
    currentTrackIndex,
    currentTrack,
    isPlaying,
    progress,
    volume,
    isMuted,
    currentTime,
    duration,
    togglePlay,
    skipForward,
    skipBackward,
    handleSeek,
    handleVolume,
    playTrack
  }), [currentTrackIndex, currentTrack, isPlaying, progress, volume, isMuted, currentTime, duration]);

  return (
    <MediaContext.Provider value={value}>
      {/* Global Audio Element */}
      <audio 
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={skipForward}
      />
      {children}
    </MediaContext.Provider>
  );
};
