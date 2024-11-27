import axios, { AxiosError } from "axios";
import { UserConfigAndLocalData } from "../../../shared/services/user-config";
import { SupaChatMessage, ChatEntityWithCharacter } from "../../../types/backend-alias";
import { Profile } from "../../../types/profile";
import { OpenAIInputMessage } from "./types/openai";
import { OpenAIError, OpenAIResponse } from "./types/openai";

// Estimate token length only, should divide by 4.4 but left some as buffer
export const getTokenLength = (messages: OpenAIInputMessage[]) =>
  JSON.stringify(messages).length / 3.8;

export const chatToMessage = (chatMes: SupaChatMessage): OpenAIInputMessage => {
  return {
    role: chatMes.is_bot ? "assistant" : "user",
    content: chatMes.message,
  };
};

export const shouldUseTextStreaming = (config: UserConfigAndLocalData) => {
  // if (config.open_ai_mode === "proxy") {
  //   return false;
  // }

  return config.text_streaming || false;
};

export const buildSystemInstruction = (
  profile: Profile,
  chat: ChatEntityWithCharacter,
  config: UserConfigAndLocalData,
  includeExampleDialog = false
) => {
  const { summary, characters } = chat;

  const { name = "", personality = "", scenario = "", example_dialogs = "" } = characters;

  const jailbreakPrompt = config.jailbreak_prompt;

  // {{char}}'s name: ${name}. {{user}}'s name : ${profile.name}. {{char}} calls always {{user}} by {{user}}'s name or any name introduced by {{user}} in the first part of each conversation. Additionally, when {{user}} ask {{char}} what is his name, {{char}} answers as his name is ${profile.name} politely.
  // Remove linebreak and tab to save token lol
  const promptWithCharInfo = `${jailbreakPrompt}.
    {{char}}'s name: ${name}. {{user}}'s name : ${profile.name}. {{char}} calls always {{user}} by {{user}}'s name or any name introduced by {{user}} in the first part of each conversation. Additionally, when {{user}} ask {{char}} like this:"what is my name?" or"Do you know my name?", {{char}} answers as "your name is " ${profile.name} politely.
    ${personality ? `{{char}}'s personality: ${personality}.` : ""}
    ${scenario ? `Scenario of the roleplay: ${scenario}.` : ""}
    ${summary ? `Summary of what happened: ${summary}.` : ""}
    ${profile.profile ? `About {{user}}: ${profile.profile}.` : ""}`
    .replace(/[\n\t]/g, "")
    .replaceAll("    ", "");

  const systemInstruction = `${promptWithCharInfo}.${includeExampleDialog && example_dialogs
    ? `Example conversations between {{char}} and {{user}}: ${example_dialogs}.`
    : ""
    }`;

  return systemInstruction;
};

export const callOpenAI = async (
  messages: OpenAIInputMessage[],
  config: UserConfigAndLocalData
) => {
  // try {
    const baseUrl =
      config.open_ai_mode === "api_key" ? "https://api.openai.com/v1" : config.open_ai_reverse_proxy;

    const authorizationHeader = (() => {
      if (config.open_ai_mode === "api_key" && config.openAIKey) {
        return `Bearer ${config.openAIKey}`;
      }

      if (config.open_ai_mode === "proxy" && config.reverseProxyKey) {
        return `Bearer ${config.reverseProxyKey}`;
      }

      return "";
    })();

    console.log(config, config.model, config.generation_settings.temperature, config.generation_settings.max_new_token, messages)

    const response = await fetch(`${baseUrl}/chat/completions`, {
      referrer: "",
      body: JSON.stringify({
        model: config.model,
        temperature: config.generation_settings.temperature,
        max_tokens: config.generation_settings.max_new_token || undefined,
        stream: shouldUseTextStreaming(config),
        messages,
      }),
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(authorizationHeader.length > 0 && { Authorization: authorizationHeader }),
      },
    });

    console.log(response,"openairesponse")

    return response;
  //   const response = await axios.post<OpenAIResponse>(
  //     `${baseUrl}/chat/completions`,
  //     {
  //       model: config.model,
  //       temperature: config.generation_settings.temperature,
  //       max_tokens: config.generation_settings.max_new_token || undefined,
  //       stream: shouldUseTextStreaming(config),
  //       messages,
  //     },
  //     {
  //       headers: {
  //         ...(authorizationHeader.length > 0 && { Authorization: authorizationHeader }),
  //       },
  //       responseType: shouldUseTextStreaming(config) ? 'stream' : 'json',
  //     }
  //   );

  //   console.log(response, "openairesponse")
  //   return response
  // } catch (err) {
  //   const axiosError = err as AxiosError<{ error: OpenAIError }>;

  //   console.error(axiosError.response?.data);

  //   const error = axiosError.response?.data?.error;
  //   if (error) {
  //     return { error };
  //   }
  // }
};
