import { HfInference } from "@huggingface/inference";

const hfClient = new HfInference(process.env.HF_TOKEN);

export const GetChatMPhi = (
  messages: {
    role: string;
    content: string;
  }[]
) => {
  return hfClient.chatCompletionStream({
    model: "microsoft/Phi-3.5-mini-instruct",
    messages: messages,
    max_tokens: 2000,
  });
};
