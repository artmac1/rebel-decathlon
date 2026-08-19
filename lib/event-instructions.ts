// Instructional text sourced directly from Rebel-Decathlon-Scoring-SAA-New.xlsx
// One entry per event_key matching scoring-tables.json

export type EventInstruction = {
  displayName: string
  instructions: string[]
  note?: string
  vimeoId?: string
}

export const EVENT_INSTRUCTIONS: Record<string, EventInstruction> = {
  whr: {
    displayName: 'Waist-to-Hip Ratio',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Using a non-stretching, cloth tape measure, determine a waist and hip circumference as described below. Divide the waist measurement by the hip measurement to calculate the ratio.',
      'The waist is most conveniently measured at the smallest circumference of the natural waist, usually just above the belly button.',
      'The hip circumference is measured at the widest part of the buttocks or hip.',
      'Example: A male with a waist of 40″ and a hip of 44″ has a ratio of 0.91 (with proper rounding). This falls into the "Average" category and is worth 5 points.',
    ],
    note: 'WHR has been found to be a more efficient predictor of mortality in older people than waist circumference or BMI.',
  },

  pushup: {
    displayName: 'Push-Up Challenge (4 minutes)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Execute as many repetitions as possible in a 4-minute time period. Rests are allowed, but the clock does NOT stop.',
      'Place a pad or soft object underneath the torso, not more than 3 inches high. A repetition is NOT counted unless the torso touches the pad.',
      'Males perform a standard push-up. Females perform a modified push-up with the knees in contact with the ground.',
      'Hands must be in line with the shoulders and the neck cannot poke forward. Look for the elbows to reach a 90-degree angle at the bottom.',
    ],
    note: 'Please see the instructional video for complete technical guidance.',
  },

  squat: {
    displayName: 'Chair Squat Test (30 seconds)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Stand with feet approximately shoulder-width apart, with the back of the legs in contact with a standard-height chair (roughly 17 inches high).',
      'Fold your arms across the chest. Sit in the chair and immediately return to a standing position as quickly as possible.',
      'Count the total number of complete repetitions in 30 seconds.',
      'If the individual cannot return to a standing position without assistance or additional support, record a score of 0.',
    ],
    note: 'This test examines muscular endurance of the lower body and daily functional ability.',
  },

  hr: {
    displayName: 'Home Step Test (Heart Rate)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Step up and down, one foot at a time, onto a 12″ step or bench for 3 minutes. (Individuals over age 70 should use an 8″ step; if over 80 the test can be limited to 2:30.)',
      'Maintain a steady four-beat cycle — approximately 22 to 24 steps per minute. Use a metronome app to keep the pace.',
      'On finishing the test, immediately count the number of heartbeats for 15 seconds using the carotid pulse or a heart rate monitor.',
      'Multiply that 15-second count by 4 to get beats per minute, then use the age-appropriate table to find your score.',
    ],
    note: 'IMPORTANT: This test should only be given to individuals cleared for exercise. Terminate immediately if dizziness or light-headedness occurs.',
  },

  situp: {
    displayName: 'Sit-Up Challenge (3 minutes)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Lie on your back on a firm but padded surface. Bend your elbows so your arms rest on your torso with fists underneath the chin — this is the start and end position.',
      'When the clock starts, bend your knees and raise your torso to form a "V" shape. Grab your shins, then return to the supine position. That is one repetition.',
      'Rests are allowed, but the clock does NOT stop.',
      'Execute as many repetitions as possible in 3 minutes.',
    ],
    note: 'If this technique causes lower-back pain due to hip-flexor tightness, halt the test.',
  },

  sit_rise: {
    displayName: 'Sitting-Rising Test (SRT)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Begin standing on a comfortable mat or padded surface. Without using any support, lower yourself to a seated position on the floor with legs extended in front of you.',
      'When ready, return to a standing position.',
      'Score each direction (sitting and rising) separately on a 0–5 scale. Each hand, forearm, knee, or side-of-leg used for support costs 1 point. Each unsteady movement costs 0.5 points.',
      '2–3 coached trials are encouraged. Record the best result.',
      'Maximum total = 5 (sitting) + 5 (rising) = 10 points.',
    ],
    note: 'Speed is not important. This test measures general mobility and relative body strength.',
  },

  balance: {
    displayName: 'Stork Test (Balance)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Remove your shoes. Choose which leg to stand on — typically the dominant side produces a better score, but try both if needed.',
      'Place your hands on your hips. Raise the non-standing foot and rest it against the inside of the standing knee.',
      'Close your eyes and hold the position as long as possible. The clock stops when the raised foot touches the ground or the hands leave the hips.',
      'Record the best time in seconds.',
    ],
    note: 'Multiple trials may be needed to determine which leg produces the better score.',
  },

  speed: {
    displayName: '1-Mile Walk Test',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'The goal is to establish a sustainable walking speed the individual can comfortably maintain day-to-day.',
      'This test is ideally performed on a treadmill so all variables can be controlled.',
      'Walk 1 mile at a steady, comfortable pace. Record the speed in miles per hour (mph).',
      'If the individual cannot complete the 1-mile walk at any pace, record a score of 0.',
    ],
    note: 'Studies show that people who walk faster tend to live longer. Terminate the test immediately if the subject feels dizzy or lightheaded.',
  },

  arm_hang: {
    displayName: 'Dead Hang / Arm Hang (Grip Test)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Grip an overhead bar with both hands, palms facing away (overhand grip), arms fully extended.',
      'Lift your feet off the ground and hold the position for as long as possible.',
      'The clock stops when any part of the body (other than hands) contacts the bar, or when the arms are no longer fully extended.',
      'Record total hang time in seconds.',
    ],
    note: 'Men: maximum is 2:00 (120 s) for 10 points, in 12-second intervals. Women: maximum is 1:30 (90 s) for 10 points, in 9-second intervals.',
  },

  flexibility: {
    displayName: 'General Flexibility (5 Bilateral Tests)',
    vimeoId: 'TODO', // Art: replace with Vimeo video ID after uploading
    instructions: [
      'Lie on a comfortable padded surface. A partner/trainer assists with each movement. Never force range of motion — movements should be uncomfortable but NOT painful.',
      '1. Sagittal Hamstring — Lying on your back, raise one leg straight up to 90°. Repeat the other side. Each side that cannot reach 90° loses 1 point.',
      '2. Piriformis (Hip Rotation) — With the thigh pointing straight up and knee bent at 90°, internally rotate the shin to bring it parallel with the waist. Each side that cannot reach parallel loses 1 point.',
      '3. Quadriceps — Lying face down, bend one knee to touch the heel to the buttocks. Each side where the heel cannot reach the buttocks loses 1 point.',
      '4. Hip Flexor (Modified Thomas Test) — Sitting at the edge of a table, hold one knee to your chest and let the other leg hang free. The hanging femur should drop to or below the horizon. Each side that cannot do this loses 1 point.',
      '5. Back Scratch Test — Reach one hand over the shoulder and down the back; reach the other hand up the back. Each side where the fingertips cannot touch (or come within 3 inches) loses 1 point.',
    ],
    note: 'Maximum score is 10 (all 10 sides passing). This is NOT a pain-tolerance test — stop if any movement causes pain.',
  },
}

export const ALL_EVENT_KEYS = [
  'whr', 'pushup', 'squat', 'hr', 'situp',
  'sit_rise', 'balance', 'speed', 'arm_hang', 'flexibility',
] as const

export type EventKey = typeof ALL_EVENT_KEYS[number]
