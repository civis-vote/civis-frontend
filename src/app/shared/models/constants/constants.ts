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

export const WHITE_LABEL_CONSULTATION_ID = 1245;
export const WHITE_LABEL_HOSTNAME = 'vikasitmaharashtra.civis.vote';
export const WHITE_LABEL_CONSULTATION_URL = '/consultations/1245';
export const WHITE_LABEL_ALLOWED_PATHS = [WHITE_LABEL_CONSULTATION_URL, '/auth'];
