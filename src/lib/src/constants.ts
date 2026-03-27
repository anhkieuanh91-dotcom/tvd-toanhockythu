export const GAME_CONSTANTS = {
  QUESTIONS_PER_GAME: 20,
  TOTAL_TIME: 1200,
  PASS_PERCENTAGE: 50,
  EXCELLENT_PERCENTAGE: 80,
};

export const API_CONSTANTS = {
  GAS_URL: (import.meta as any).env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbz1FnOerPI2bC4Efa7t_CowCHIHyN3jChgL0hzyg6PS6Z_HPrMvjm1igyD_aHGlnG3A/exec',
};
