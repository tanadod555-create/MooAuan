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
    videoId: 'LBhaLLc153A',
    shortUrl: 'https://www.youtube.com/shorts/LBhaLLc153A',
    channelName: 'Squat University',
  },
  ex_incline_db_press: {
    videoId: '8iPEnn-ltC8',
    shortUrl: 'https://www.youtube.com/shorts/8iPEnn-ltC8',
    channelName: 'Jeff Nippard',
  },
  ex_cable_fly: {
    videoId: 'Iwe6AmxVf7o',
    shortUrl: 'https://www.youtube.com/shorts/Iwe6AmxVf7o',
    channelName: 'Form Check',
  },
  ex_push_up: {
    videoId: 'IODxDxX7oi4',
    shortUrl: 'https://www.youtube.com/shorts/IODxDxX7oi4',
    channelName: 'Calisthenics Form',
  },

  // --- SHOULDERS ---
  ex_overhead_press: {
    videoId: 'QAQ64hK4Xxs',
    shortUrl: 'https://www.youtube.com/shorts/QAQ64hK4Xxs',
    channelName: 'Barbell Form',
  },
  ex_lateral_raise: {
    videoId: '3VcKaXpzqRo',
    shortUrl: 'https://www.youtube.com/shorts/3VcKaXpzqRo',
    channelName: 'Jeff Nippard',
  },
  ex_face_pull: {
    videoId: 'rep-qVOkqgk',
    shortUrl: 'https://www.youtube.com/shorts/rep-qVOkqgk',
    channelName: 'AthleanX',
  },

  // --- BICEPS ---
  ex_barbell_curl: {
    videoId: 'kwG2ipFRgfo',
    shortUrl: 'https://www.youtube.com/shorts/kwG2ipFRgfo',
    channelName: 'Biceps Form',
  },
  ex_hammer_curl: {
    videoId: 'zC3nLlEvin4',
    shortUrl: 'https://www.youtube.com/shorts/zC3nLlEvin4',
    channelName: 'Arms Workout',
  },

  // --- TRICEPS ---
  ex_tricep_pushdown: {
    videoId: '2-LAMcpzODU',
    shortUrl: 'https://www.youtube.com/shorts/2-LAMcpzODU',
    channelName: 'Triceps Form',
  },
  ex_skull_crusher: {
    videoId: 'd_KZxkH_toI',
    shortUrl: 'https://www.youtube.com/shorts/d_KZxkH_toI',
    channelName: 'Strength Technique',
  },
  ex_dips: {
    videoId: '2z8JmcrW-As',
    shortUrl: 'https://www.youtube.com/shorts/2z8JmcrW-As',
    channelName: 'Calisthenics Basics',
  },

  // --- FOREARMS ---
  ex_wrist_curl: {
    videoId: 'FW_A8mQ9v4Y',
    shortUrl: 'https://www.youtube.com/shorts/FW_A8mQ9v4Y',
    channelName: 'Grip & Forearms',
  },
  ex_farmers_walk: {
    videoId: 'p5M8yvV_9uU',
    shortUrl: 'https://www.youtube.com/shorts/p5M8yvV_9uU',
    channelName: 'Strongman Basics',
  },

  // --- ABS / CORE ---
  ex_cable_crunch: {
    videoId: '2fOReCg_sX8',
    shortUrl: 'https://www.youtube.com/shorts/2fOReCg_sX8',
    channelName: 'Abs Isolation',
  },
  ex_hanging_leg_raise: {
    videoId: 'hdng3Nm1x_E',
    shortUrl: 'https://www.youtube.com/shorts/hdng3Nm1x_E',
    channelName: 'Core Strength',
  },
  ex_plank: {
    videoId: 'pSHjTRCQxIw',
    shortUrl: 'https://www.youtube.com/shorts/pSHjTRCQxIw',
    channelName: 'Core Stability',
  },

  // --- QUADS & LEGS ---
  ex_back_squat: {
    videoId: 'bEv6CCg2BC8',
    shortUrl: 'https://www.youtube.com/shorts/bEv6CCg2BC8',
    channelName: 'Squat Mastery',
  },
  ex_leg_press: {
    videoId: 'IZxyjW7MPJQ',
    shortUrl: 'https://www.youtube.com/shorts/IZxyjW7MPJQ',
    channelName: 'Quad Builder',
  },
  ex_leg_extension: {
    videoId: 'YyvSfV64_9c',
    shortUrl: 'https://www.youtube.com/shorts/YyvSfV64_9c',
    channelName: 'Quad Focus',
  },
  ex_bulgarian_split_squat: {
    videoId: 'or1frhkjBDc',
    shortUrl: 'https://www.youtube.com/shorts/or1frhkjBDc',
    channelName: 'Leg Day Essentials',
  },

  // --- CALVES ---
  ex_standing_calf_raise: {
    videoId: '-M4-G8p8fmc',
    shortUrl: 'https://www.youtube.com/shorts/-M4-G8p8fmc',
    channelName: 'Calves Growth',
  },
  ex_seated_calf_raise: {
    videoId: 'JbyjNymZOt0',
    shortUrl: 'https://www.youtube.com/shorts/JbyjNymZOt0',
    channelName: 'Soleus Training',
  },

  // --- TRAPS & UPPER BACK ---
  ex_barbell_shrug: {
    videoId: 'cJRVVxmytaM',
    shortUrl: 'https://www.youtube.com/shorts/cJRVVxmytaM',
    channelName: 'Traps Isolation',
  },
  ex_rack_pull: {
    videoId: 'e6B_wL8k-Yc',
    shortUrl: 'https://www.youtube.com/shorts/e6B_wL8k-Yc',
    channelName: 'Back Thickness',
  },

  // --- LATS & BACK ---
  ex_pull_up: {
    videoId: 'eGo4IYlbE5g',
    shortUrl: 'https://www.youtube.com/shorts/eGo4IYlbE5g',
    channelName: 'Pull-Up Mastery',
  },
  ex_lat_pulldown: {
    videoId: 'bNmvKpJSWKM',
    shortUrl: 'https://www.youtube.com/shorts/bNmvKpJSWKM',
    channelName: 'Deltabolic Lat Guide',
  },
  ex_seated_cable_row: {
    videoId: 'GZbfZ033f74',
    shortUrl: 'https://www.youtube.com/shorts/GZbfZ033f74',
    channelName: 'Cable Rows Guide',
  },
  ex_barbell_row: {
    videoId: 'FWJR5Ve8gkQ',
    shortUrl: 'https://www.youtube.com/shorts/FWJR5Ve8gkQ',
    channelName: 'Bent-Over Row Form',
  },

  // --- LOWER BACK & POSTERIOR CHAIN ---
  ex_back_extension: {
    videoId: 'ph3pddpKzzw',
    shortUrl: 'https://www.youtube.com/shorts/ph3pddpKzzw',
    channelName: 'Lower Back Health',
  },
  ex_good_morning: {
    videoId: 'dEJ0FTm-CEk',
    shortUrl: 'https://www.youtube.com/shorts/dEJ0FTm-CEk',
    channelName: 'Hinge Movement',
  },

  // --- GLUTES ---
  ex_hip_thrust: {
    videoId: '-GEVlyzVbcg',
    shortUrl: 'https://www.youtube.com/shorts/-GEVlyzVbcg',
    channelName: 'Bret Contreras Glutes',
  },
  ex_cable_kickback: {
    videoId: '1_bA0M3h90U',
    shortUrl: 'https://www.youtube.com/shorts/1_bA0M3h90U',
    channelName: 'Glute Kickback Form',
  },
  ex_hip_abduction: {
    videoId: 't5e0q1_z8oY',
    shortUrl: 'https://www.youtube.com/shorts/t5e0q1_z8oY',
    channelName: 'Glute Medius Guide',
  },
  ex_db_sumo_squat: {
    videoId: '9ZuD9urW8G4',
    shortUrl: 'https://www.youtube.com/shorts/9ZuD9urW8G4',
    channelName: 'Sumo Squat Guide',
  },

  // --- HAMSTRINGS ---
  ex_romanian_deadlift: {
    videoId: 'JCXUYuzwNrM',
    shortUrl: 'https://www.youtube.com/shorts/JCXUYuzwNrM',
    channelName: 'RDL Proper Form',
  },
  ex_lying_leg_curl: {
    videoId: '1Tq3QdYUuHs',
    shortUrl: 'https://www.youtube.com/shorts/1Tq3QdYUuHs',
    channelName: 'Hamstring Isolation',
  },
  ex_stiff_leg_deadlift: {
    videoId: 'CN_7cz3P-1U',
    shortUrl: 'https://www.youtube.com/shorts/CN_7cz3P-1U',
    channelName: 'Stiff Leg Technique',
  },

  // --- WARMUP & MOBILITY ---
  ex_arm_circles: {
    videoId: '140mY5Vms-0',
    shortUrl: 'https://www.youtube.com/shorts/140mY5Vms-0',
    channelName: 'Warmup Mobility',
  },
  ex_jumping_jacks: {
    videoId: 'iSSAk4XCsRA',
    shortUrl: 'https://www.youtube.com/shorts/iSSAk4XCsRA',
    channelName: 'Cardio Warmup',
  },
  ex_leg_swings: {
    videoId: 'g5_K5T4M8l0',
    shortUrl: 'https://www.youtube.com/shorts/g5_K5T4M8l0',
    channelName: 'Dynamic Stretch',
  },
  ex_cat_cow: {
    videoId: 'kqnua4rHVVA',
    shortUrl: 'https://www.youtube.com/shorts/kqnua4rHVVA',
    channelName: 'Spine Mobility',
  },
  ex_childs_pose: {
    videoId: '2MJGg-dUKh0',
    shortUrl: 'https://www.youtube.com/shorts/2MJGg-dUKh0',
    channelName: 'Recovery & Stretch',
  },
  ex_hamstring_stretch: {
    videoId: 'FDw_fMv3w9I',
    shortUrl: 'https://www.youtube.com/shorts/FDw_fMv3w9I',
    channelName: 'Flexibility Guide',
  },
  ex_chest_doorway_stretch: {
    videoId: '_zT3XbY5HdU',
    shortUrl: 'https://www.youtube.com/shorts/_zT3XbY5HdU',
    channelName: 'Chest Opening',
  },
  ex_quad_stretch: {
    videoId: 'XzR0H8N0oVw',
    shortUrl: 'https://www.youtube.com/shorts/XzR0H8N0oVw',
    channelName: 'Quad Flexibility',
  },

  // --- EXTRA COMMON VARIATIONS ---
  ex_machine_incline_press: {
    videoId: 'aK9zL5q1YxI',
    shortUrl: 'https://www.youtube.com/shorts/aK9zL5q1YxI',
    channelName: 'Machine Chest Form',
  },
  ex_machine_chest_press: {
    videoId: 'xZ6tL7r3m_U',
    shortUrl: 'https://www.youtube.com/shorts/xZ6tL7r3m_U',
    channelName: 'Chest Press Form',
  },
  ex_machine_shoulder_press: {
    videoId: '7H6q_4mG9x0',
    shortUrl: 'https://www.youtube.com/shorts/7H6q_4mG9x0',
    channelName: 'Shoulder Machine Form',
  },
  ex_db_overhead_triceps_ext: {
    videoId: 'b_1g_qL5x7Y',
    shortUrl: 'https://www.youtube.com/shorts/b_1g_qL5x7Y',
    channelName: 'Triceps Overhead Form',
  },
  ex_db_romanian_deadlift: {
    videoId: 'e8pY5q7_v3M',
    shortUrl: 'https://www.youtube.com/shorts/e8pY5q7_v3M',
    channelName: 'Dumbbell RDL Guide',
  },
  ex_db_biceps_curl: {
    videoId: 'ykJmrZ5v0Oo',
    shortUrl: 'https://www.youtube.com/shorts/ykJmrZ5v0Oo',
    channelName: 'Dumbbell Curl Mastery',
  },
  ex_db_rear_delt_fly: {
    videoId: '0G2_XV7slIg',
    shortUrl: 'https://www.youtube.com/shorts/0G2_XV7slIg',
    channelName: 'Rear Delt Fly Form',
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
    videoId: 'LBhaLLc153A',
    shortUrl: 'https://www.youtube.com/shorts/LBhaLLc153A',
    channelName: 'เทคนิคการออกกำลังกาย',
  };
}
