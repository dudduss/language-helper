export type Message = {
    id: string;
    text: string;
    isFromGpt: boolean;
    improvement?: string;
}