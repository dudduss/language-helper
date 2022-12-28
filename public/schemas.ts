export type Message = {
  id: string;
  text: string;
  isFromGpt: boolean;
  improvement?: string;
};

export type ImprovementResponse = {
  improvement: string;
  reason: string;
};
