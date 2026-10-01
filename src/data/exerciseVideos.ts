/**
 * YouTube Shorts Video Mapping & Helpers for Exercise Library
 * High-quality form guides and demonstration shorts for each exercise.
 */

export interface ExerciseVideoInfo {
  videoId: string;
  shortUrl: string;
  channelName?: string;
}

export const EXERCISE_YOUTUBE_VIDEOS: Record<string, ExerciseVideoInfo> = {
  // --- CHEST ---
  ex_bench_press: {
    videoId: 'rT7DgCr-3pg',
    shortUrl: 'https://www.youtube.com/shorts/rT7DgCr-3pg',
    channelName: 'ScottHermanFitness',
  },
  ex_incline_db_press: {
    videoId: '8iPEnn-ltC8',
    shortUrl: 'https://www.youtube.com/shorts/8iPEnn-ltC8',
    channelName: 'ScottHermanFitness',
  },
  ex_cable_fly: {
    videoId: 'Iwe6AmxVf7o',
    shortUrl: 'https://www.youtube.com/shorts/Iwe6AmxVf7o',
    channelName: 'ScottHermanFitness',
  },
  ex_push_up: {
    videoId: 'IODxDxX7oi4',
    shortUrl: 'https://www.youtube.com/shorts/IODxDxX7oi4',
    channelName: 'Calisthenicmovement',
  },

  // --- SHOULDERS ---
  ex_overhead_press: {
    videoId: 'QAQ64hK4Xxs',
    shortUrl: 'https://www.youtube.com/shorts/QAQ64hK4Xxs',
    channelName: 'Jeremy Ethier',
  },
  ex_lateral_raise: {
    videoId: '3VcKaXpzqRo',
    shortUrl: 'https://www.youtube.com/shorts/3VcKaXpzqRo',
    channelName: 'ScottHermanFitness',
  },
  ex_face_pull: {
    videoId: 'rep-qVOkqgk',
    shortUrl: 'https://www.youtube.com/shorts/rep-qVOkqgk',
    channelName: 'ScottHermanFitness',
  },

  // --- BICEPS ---
  ex_barbell_curl: {
    videoId: 'kwG2ipFRgfo',
    shortUrl: 'https://www.youtube.com/shorts/kwG2ipFRgfo',
    channelName: 'Howcast',
  },
  ex_hammer_curl: {
    videoId: 'zC3nLlEvin4',
    shortUrl: 'https://www.youtube.com/shorts/zC3nLlEvin4',
    channelName: 'ScottHermanFitness',
  },

  // --- TRICEPS ---
  ex_tricep_pushdown: {
    videoId: '2-LAMcpzODU',
    shortUrl: 'https://www.youtube.com/shorts/2-LAMcpzODU',
    channelName: 'ScottHermanFitness',
  },
  ex_skull_crusher: {
    videoId: 'RavQHfFxbdA',
    shortUrl: 'https://www.youtube.com/shorts/RavQHfFxbdA',
    channelName: 'ScottHermanFitness',
  },
  ex_dips: {
    videoId: '2z8JmcrW-As',
    shortUrl: 'https://www.youtube.com/shorts/2z8JmcrW-As',
    channelName: 'Calisthenicmovement',
  },

  // --- FOREARMS ---
  ex_wrist_curl: {
    videoId: 'qMtmHwaCmYI',
    shortUrl: 'https://www.youtube.com/shorts/qMtmHwaCmYI',
    channelName: 'ScottHermanFitness',
  },
  ex_farmers_walk: {
    videoId: 'Tgi5SNDbBZQ',
    shortUrl: 'https://www.youtube.com/shorts/Tgi5SNDbBZQ',
    channelName: 'ScottHermanFitness',
  },

  // --- ABS / CORE ---
  ex_cable_crunch: {
    videoId: 'x10ihjIYy8s',
    shortUrl: 'https://www.youtube.com/shorts/x10ihjIYy8s',
    channelName: 'ScottHermanFitness',
  },
  ex_hanging_leg_raise: {
    videoId: 'hdng3Nm1x_E',
    shortUrl: 'https://www.youtube.com/shorts/hdng3Nm1x_E',
    channelName: 'ScottHermanFitness',
  },
  ex_plank: {
    videoId: 'pSHjTRCQxIw',
    shortUrl: 'https://www.youtube.com/shorts/pSHjTRCQxIw',
    channelName: 'ScottHermanFitness',
  },

  // --- QUADS & LEGS ---
  ex_back_squat: {
    videoId: 'bEv6CCg2BC8',
    shortUrl: 'https://www.youtube.com/shorts/bEv6CCg2BC8',
    channelName: 'Jeff Nippard',
  },
  ex_leg_press: {
    videoId: 'IZxyjW7MPJQ',
    shortUrl: 'https://www.youtube.com/shorts/IZxyjW7MPJQ',
    channelName: 'ScottHermanFitness',
  },
  ex_leg_extension: {
    videoId: 'YyvSfVjQeL0',
    shortUrl: 'https://www.youtube.com/shorts/YyvSfVjQeL0',
    channelName: 'ScottHermanFitness',
  },
  ex_bulgarian_split_squat: {
    videoId: 'or1frhkjBDc',
    shortUrl: 'https://www.youtube.com/shorts/or1frhkjBDc',
    channelName: 'Andrew Kwong (DeltaBolic)',
  },

  // --- CALVES ---
  ex_standing_calf_raise: {
    videoId: '-M4-G8p8fmc',
    shortUrl: 'https://www.youtube.com/shorts/-M4-G8p8fmc',
    channelName: 'Howcast',
  },
  ex_seated_calf_raise: {
    videoId: 'JbyjNymZOt0',
    shortUrl: 'https://www.youtube.com/shorts/JbyjNymZOt0',
    channelName: 'LIVESTRONG',
  },

  // --- TRAPS & UPPER BACK ---
  ex_barbell_shrug: {
    videoId: 'cJRVVxmytaM',
    shortUrl: 'https://www.youtube.com/shorts/cJRVVxmytaM',
    channelName: 'ScottHermanFitness',
  },
  ex_rack_pull: {
    videoId: 'P-Ir835AWhQ',
    shortUrl: 'https://www.youtube.com/shorts/P-Ir835AWhQ',
    channelName: 'ScottHermanFitness',
  },

  // --- LATS & BACK ---
  ex_pull_up: {
    videoId: 'eGo4IYlbE5g',
    shortUrl: 'https://www.youtube.com/shorts/eGo4IYlbE5g',
    channelName: 'Calisthenicmovement',
  },
  ex_lat_pulldown: {
    videoId: 'bNmvKpJSWKM',
    shortUrl: 'https://www.youtube.com/shorts/bNmvKpJSWKM',
    channelName: 'Andrew Kwong (DeltaBolic)',
  },
  ex_seated_cable_row: {
    videoId: 'GZbfZ033f74',
    shortUrl: 'https://www.youtube.com/shorts/GZbfZ033f74',
    channelName: 'ScottHermanFitness',
  },
  ex_barbell_row: {
    videoId: '9efgcAjQe7E',
    shortUrl: 'https://www.youtube.com/shorts/9efgcAjQe7E',
    channelName: 'ScottHermanFitness',
  },

  // --- LOWER BACK & POSTERIOR CHAIN ---
  ex_back_extension: {
    videoId: 'ph3pddpKzzw',
    shortUrl: 'https://www.youtube.com/shorts/ph3pddpKzzw',
    channelName: 'LIVESTRONG',
  },
  ex_good_morning: {
    videoId: 'dEJ0FTm-CEk',
    shortUrl: 'https://www.youtube.com/shorts/dEJ0FTm-CEk',
    channelName: 'Renaissance Periodization',
  },

  // --- GLUTES ---
  ex_hip_thrust: {
    videoId: '-GEVlyzVbcg',
    shortUrl: 'https://www.youtube.com/shorts/-GEVlyzVbcg',
    channelName: 'Mixed Fitness Arts',
  },
  ex_cable_kickback: {
    videoId: 'sllbiOqpUso',
    shortUrl: 'https://www.youtube.com/shorts/sllbiOqpUso',
    channelName: 'Diana Alexandrova',
  },
  ex_hip_abduction: {
    videoId: 'GmRSV_n2E_0',
    shortUrl: 'https://www.youtube.com/shorts/GmRSV_n2E_0',
    channelName: 'ScottHermanFitness',
  },
  ex_db_sumo_squat: {
    videoId: 'wsaQ8Z7TZJY',
    shortUrl: 'https://www.youtube.com/shorts/wsaQ8Z7TZJY',
    channelName: 'DEMIC',
  },

  // --- HAMSTRINGS ---
  ex_romanian_deadlift: {
    videoId: 'JCXUYuzwNrM',
    shortUrl: 'https://www.youtube.com/shorts/JCXUYuzwNrM',
    channelName: 'ScottHermanFitness',
  },
  ex_lying_leg_curl: {
    videoId: '1Tq3QdYUuHs',
    shortUrl: 'https://www.youtube.com/shorts/1Tq3QdYUuHs',
    channelName: 'ScottHermanFitness',
  },
  ex_stiff_leg_deadlift: {
    videoId: 'CN_7cz3P-1U',
    shortUrl: 'https://www.youtube.com/shorts/CN_7cz3P-1U',
    channelName: 'Renaissance Periodization',
  },

  // --- WARMUP & MOBILITY ---
  ex_arm_circles: {
    videoId: 'lzR7tzI1JUI',
    shortUrl: 'https://www.youtube.com/shorts/lzR7tzI1JUI',
    channelName: 'Derek Ward',
  },
  ex_jumping_jacks: {
    videoId: 'iSSAk4XCsRA',
    shortUrl: 'https://www.youtube.com/shorts/iSSAk4XCsRA',
    channelName: 'XHIT Daily',
  },
  ex_leg_swings: {
    videoId: '3l31E2cMGMk',
    shortUrl: 'https://www.youtube.com/shorts/3l31E2cMGMk',
    channelName: 'Sports Rehab Expert',
  },
  ex_cat_cow: {
    videoId: 'kqnua4rHVVA',
    shortUrl: 'https://www.youtube.com/shorts/kqnua4rHVVA',
    channelName: 'Howcast',
  },
  ex_childs_pose: {
    videoId: '2MJGg-dUKh0',
    shortUrl: 'https://www.youtube.com/shorts/2MJGg-dUKh0',
    channelName: 'Yoga & You',
  },
  ex_hamstring_stretch: {
    videoId: 'qQ26F282VRo',
    shortUrl: 'https://www.youtube.com/shorts/qQ26F282VRo',
    channelName: 'Fit Family Physical Therapy',
  },
  ex_chest_doorway_stretch: {
    videoId: 'PWGuI3rTRx0',
    shortUrl: 'https://www.youtube.com/shorts/PWGuI3rTRx0',
    channelName: 'Daily Workout Builder',
  },
  ex_quad_stretch: {
    videoId: 'aNXGOpP37CY',
    shortUrl: 'https://www.youtube.com/shorts/aNXGOpP37CY',
    channelName: 'VIGEO',
  },

  // --- EXTRA COMMON VARIATIONS ---
  ex_machine_incline_press: {
    videoId: 'ig0NyNlSce4',
    shortUrl: 'https://www.youtube.com/shorts/ig0NyNlSce4',
    channelName: 'ScottHermanFitness',
  },
  ex_machine_chest_press: {
    videoId: 'Qu7-ceCvq7w',
    shortUrl: 'https://www.youtube.com/shorts/Qu7-ceCvq7w',
    channelName: 'Andrew Kwong (DeltaBolic)',
  },
  ex_machine_shoulder_press: {
    videoId: 'Wqq43dKW1TU',
    shortUrl: 'https://www.youtube.com/shorts/Wqq43dKW1TU',
    channelName: 'ScottHermanFitness',
  },
  ex_db_overhead_triceps_ext: {
    videoId: '-Vyt2QdsR7E',
    shortUrl: 'https://www.youtube.com/shorts/-Vyt2QdsR7E',
    channelName: 'ScottHermanFitness',
  },
  ex_db_romanian_deadlift: {
    videoId: 'FQKfr1YDhEk',
    shortUrl: 'https://www.youtube.com/shorts/FQKfr1YDhEk',
    channelName: 'ScottHermanFitness',
  },
  ex_db_biceps_curl: {
    videoId: 'ykJmrZ5v0Oo',
    shortUrl: 'https://www.youtube.com/shorts/ykJmrZ5v0Oo',
    channelName: 'Howcast',
  },
  ex_db_rear_delt_fly: {
    videoId: 'ttvfGg9d76c',
    shortUrl: 'https://www.youtube.com/shorts/ttvfGg9d76c',
    channelName: 'ScottHermanFitness',
  },
};

/**
 * Extracts a YouTube Video ID from any format:
 * - https://www.youtube.com/shorts/LBhaLLc153A
 * - https://youtu.be/LBhaLLc153A
 * - https://www.youtube.com/watch?v=LBhaLLc153A
 * - Plain video ID (e.g. "LBhaLLc153A")
 */
export function extractYoutubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already clean 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Check shorts pattern: youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // Check watch pattern: youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // Check youtu.be/ID
  const shortlinkMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortlinkMatch && shortlinkMatch[1]) return shortlinkMatch[1];

  // Generic 11 char capture
  const genericMatch = trimmed.match(/([a-zA-Z0-9_-]{11})/);
  return genericMatch ? genericMatch[1] : null;
}

/**
 * Returns the effective YouTube video ID for an exercise:
 * 1. Custom ID saved by user in localStorage
 * 2. exercise.youtube_id
 * 3. EXERCISE_YOUTUBE_VIDEOS dictionary
 * 4. Fallback default video ID
 */
export function getExerciseVideo(exerciseId: string, customInput?: string): ExerciseVideoInfo {
  // Check custom override input
  if (customInput) {
    const extracted = extractYoutubeId(customInput);
    if (extracted) {
      return {
        videoId: extracted,
        shortUrl: `https://www.youtube.com/shorts/${extracted}`,
        channelName: 'คลิปที่กำหนดเอง',
      };
    }
  }

  // Check localStorage override
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`ft_custom_media_${exerciseId}`);
      if (saved) {
        const extracted = extractYoutubeId(saved);
        if (extracted) {
          return {
            videoId: extracted,
            shortUrl: `https://www.youtube.com/shorts/${extracted}`,
            channelName: 'คลิปที่กำหนดเอง',
          };
        }
      }
    }
  } catch {
    // ignore
  }

  // Check dictionary
  if (EXERCISE_YOUTUBE_VIDEOS[exerciseId]) {
    return EXERCISE_YOUTUBE_VIDEOS[exerciseId];
  }

  // Fallback to bench press tutorial
  return {
    videoId: 'rT7DgCr-3pg',
    shortUrl: 'https://www.youtube.com/shorts/rT7DgCr-3pg',
    channelName: 'เทคนิคการออกกำลังกาย',
  };
}
