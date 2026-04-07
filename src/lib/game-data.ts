export type AlgorithmType = 'binary' | 'caesar' | 'base64' | 'morse' | 'decimal' | 'rot' | 'mixed';

export interface LevelDef {
  id: number;
  name: string;
  algorithm: AlgorithmType;
  description: string;
  requiredProblems: number;
  reward: number;
  expReward: number;
  scoreReward: number;
  badgeName: string;
  color: string;
  iconName: 'Radio' | 'Lock' | 'Search' | 'Ghost' | 'Compass' | 'Zap' | 'Flame';
}

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: "The Binary Void",
    algorithm: 'binary',
    description: "Zeros and ones... the building blocks of reality are unraveling. Translate the binary sequence to see the truth.",
    requiredProblems: 5,
    reward: 50,
    expReward: 100,
    scoreReward: 500,
    badgeName: "Signal Finder",
    color: "#00aaff",
    iconName: 'Radio'
  },
  {
    id: 2,
    name: "Caesar's Echo",
    algorithm: 'caesar',
    description: "Shifted letters whispered from the shadows. Find the pattern to unlock the message.",
    requiredProblems: 5,
    reward: 75,
    expReward: 150,
    scoreReward: 750,
    badgeName: "Code Breaker",
    color: "#ff4400",
    iconName: 'Lock'
  },
  {
    id: 3,
    name: "Base64 Distortion",
    algorithm: 'base64',
    description: "Standard data transformed into an unrecognizable web. Decode the transmission.",
    requiredProblems: 5,
    reward: 100,
    expReward: 200,
    scoreReward: 1000,
    badgeName: "Lab Explorer",
    color: "#22c55e",
    iconName: 'Search'
  },
  {
    id: 4,
    name: "The Morse Signal",
    algorithm: 'morse',
    description: "Dots and dashes tapping against the glass. Someone is trying to reach out.",
    requiredProblems: 5,
    reward: 125,
    expReward: 250,
    scoreReward: 1250,
    badgeName: "Shadow Walker",
    color: "#06b6d4",
    iconName: 'Ghost'
  },
  {
    id: 5,
    name: "Decimal Transmission",
    algorithm: 'decimal',
    description: "The mainframe is spitting out raw numerical coordinates. Convert these base-10 signals back into words.",
    requiredProblems: 5,
    reward: 150,
    expReward: 300,
    scoreReward: 1500,
    badgeName: "Number Cruncher",
    color: "#6366f1",
    iconName: 'Compass'
  },
  {
    id: 6,
    name: "The ROT Circle",
    algorithm: 'rot',
    description: "The alphabet spins in a recursive loop. Rotate the wheel until the meaning aligns.",
    requiredProblems: 5,
    reward: 175,
    expReward: 350,
    scoreReward: 1750,
    badgeName: "Mind Decoder",
    color: "#aa00ff",
    iconName: 'Zap'
  },
  {
    id: 7,
    name: "The Ultimate Rift",
    algorithm: 'mixed',
    description: "A catastrophic convergence of all signals. Use everything you've learned to survive.",
    requiredProblems: 5,
    reward: 250,
    expReward: 500,
    scoreReward: 2500,
    badgeName: "Gate Conqueror",
    color: "#f97316",
    iconName: 'Flame'
  }
];

export const INTRO_STORY = "A mysterious signal from another dimension is spreading encrypted messages. You must decode them to uncover the hidden truth. The fate of our reality rests on your ability to see past the interference.";

export const ALGORITHM_GUIDES = {
  binary: "Binary is base-2 numeric system. Each 8-digit block (byte) represents a single ASCII character.",
  caesar: "The Caesar Cipher shifts each letter by a fixed number of positions in the alphabet.",
  base64: "Base64 encodes binary data into an ASCII string format using a 64-character set.",
  morse: "Morse Code uses sequences of dots (.) and dashes (-) to represent letters and numbers.",
  decimal: "Decimal encryption uses ASCII values (0-255) to represent each character in a message.",
  rot: "ROT (Rotate) is a simple substitution cipher that replaces a letter with the Nth letter after it in the alphabet."
};
