export const LANGUAGE_IDS = {
  ENGLISH: 'en',
  HINDI: 'hi',
  ODIA: 'od',
  MARATHI: 'mr',
};

export const LANGUAGES = [
  { id: LANGUAGE_IDS.ENGLISH, name: "English" },
  { id: LANGUAGE_IDS.HINDI, name: "Hindi" },
  { id: LANGUAGE_IDS.ODIA, name: "Odia" },
  { id: LANGUAGE_IDS.MARATHI, name: "Marathi" },
];

export interface WhiteLabelConfig {
  consultationId: number;
  hostname: string;
  consultationUrl: string;
  allowedPaths: string[];
}

// White label configurations for different consultations
export const WHITE_LABEL_CONFIGS: WhiteLabelConfig[] = [
  {
    consultationId: 1245,
    hostname: 'vikasitmaharashtra.civis.vote',
    consultationUrl: '/consultations/1245',
    allowedPaths: ['/consultations/1245', '/auth']
  },
  {
    consultationId: 1318,
    hostname: 'banapeleblueprint-part1.civis.vote',
    consultationUrl: '/consultations/1318',
    allowedPaths: ['/consultations/1318', '/auth']
  },
  {
    consultationId: 1317,
    hostname: 'banapeleblueprint-part2.civis.vote',
    consultationUrl: '/consultations/1317',
    allowedPaths: ['/consultations/1317', '/auth']
  }
];
