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

export type DiffText = {
  text: string;
  type: string;
};

export type DiffResponse = {
  original: DiffText[];
  improvement: DiffText[];
};
