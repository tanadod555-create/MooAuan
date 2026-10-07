import React, { useState, useEffect } from 'react';
import { Exercise } from '../../types';
import { Play, Pause, ExternalLink, Search, Film } from 'lucide-react';
import { getExerciseVideo, ExerciseVideoInfo } from '../../data/exerciseVideos';

interface ExerciseVideoDemoProps {
  exercise: Exercise;
}

export const StickmanExerciseAnimation: React.FC<ExerciseVideoDemoProps> = ({ exercise }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<ExerciseVideoInfo>(() =>
    getExerciseVideo(exercise.exercise_id, exercise.youtube_id || exercise.youtube_short_url)
  );

  useEffect(() => {
    setCurrentVideo(
      getExerciseVideo(exercise.exercise_id, exercise.youtube_id || exercise.youtube_short_url)
    );
  }, [exercise.exercise_id, exercise.youtube_id, exercise.youtube_short_url]);

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    exercise.name_en + ' exercise tutorial form demonstration'
  )}`;

  return (
    <div className="w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
      {/* Top Header */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-black text-white flex items-center gap-1.5">
            <Film size={14} className="text-red-400" />
            <span>วิดีโอสาธิตท่าฝึก (Exercise Demo)</span>
          </span>
        </div>

        <a
          href={youtubeSearchUrl}
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px] font-bold"
        >
          <span>ดูคลิปอื่นใน YouTube</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Video Demonstration Area */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {currentVideo?.videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&mute=1&loop=1&playlist=${currentVideo.videoId}&controls=1&rel=0`}
            title={exercise.name_en}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="p-6 text-center space-y-2">
            <Film size={32} className="mx-auto text-slate-600" />
            <p className="text-xs text-slate-400">
              กดปุ่มด้านล่างเพื่อค้นหาและดูคลิปสาธิตท่า {exercise.name_en} บน YouTube
            </p>
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
            >
              <span>เปิดดูวิดีโอสาธิตบน YouTube ▶</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
        <span className="truncate">
          ท่า: <strong className="text-slate-200">{exercise.name_th}</strong> ({exercise.name_en})
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Form & Technique</span>
      </div>
    </div>
  );
};
