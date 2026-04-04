import CONFIG from './config';

const adjectives = [
  'swift', 'fluffy', 'sleepy', 'brave', 'tiny', 'wild', 'cozy', 'fuzzy',
  'lucky', 'quiet', 'sly', 'bold', 'calm', 'cool', 'keen', 'warm',
  'soft', 'quick', 'lazy', 'shy', 'bright', 'witty', 'crisp', 'gentle',
];

const nouns = [
  'cat', 'paw', 'moon', 'star', 'rain', 'fox', 'owl', 'wolf',
  'bear', 'leaf', 'fern', 'moss', 'wind', 'wave', 'dawn', 'dusk',
  'mist', 'iris', 'sage', 'wren', 'moth', 'crow', 'hare', 'lynx',
];

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const digits = () => String(Math.floor(Math.random() * 900) + 100);

export const generateLocalPart = () =>
  `${pick(adjectives)}-${pick(nouns)}-${digits()}`;

export const validateLocalPart = (value: string): boolean =>
  CONFIG.LOCAL_PART_PATTERN.test(value);
