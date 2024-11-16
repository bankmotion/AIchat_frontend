import { UserConfigAndLocalData } from "../../../../shared/services/user-config";
import { ChatEntityWithCharacter, SupaChatMessage } from "../../../../types/backend-alias";
import { Profile } from "../../../../types/profile";

import {
  chatToMessage,
  buildSystemInstruction,
  getTokenLength,
  callOpenAI,
} from "../openai-service";
import { OpenAIError, OpenAIInputMessage, OpenAIProxyError, OpenAIResponse } from "../types/openai";
import { GenerateInterface, Prompt } from "./generate-interface";

class OpenAIGenerate extends GenerateInterface {
  private profile: Profile;

  setProfile(profile: Profile) {
    this.profile = profile;
  }

  buildPrompt(
    message: string,
    chat: ChatEntityWithCharacter,
    chatHistory: SupaChatMessage[],
    config: UserConfigAndLocalData
  ): Prompt {
    let chatCopy = chatHistory.filter((message) => message.is_main).map(chatToMessage);
    const maxNewToken = config.generation_settings.max_new_token || 320;
    // Hack, otherwise the genrated message will be cut-off, lol
    const maxContentLength = (config.generation_settings.context_length || 4095) - maxNewToken;

    const userMessage: OpenAIInputMessage = { role: "user", content: message };

    let messages: OpenAIInputMessage[] = [
      { role: "system", content: buildSystemInstruction(this.profile, chat, config, true) },
      // No need to add first message here, front-end should submit it
      ...chatCopy,
      userMessage,
    ];

    let promptTokenLength = getTokenLength(messages);

    if (promptTokenLength < maxContentLength) {
      return { messages };
    }

    // When the conversation get too long, remove example conversations
    const systemInstructionWithoutExample = buildSystemInstruction(
      this.profile,
      chat,
      config,
      false
    );
    messages = [
      { role: "system", content: systemInstructionWithoutExample },
      ...chatCopy,
      userMessage,
    ];
    promptTokenLength = getTokenLength(messages);

    while (promptTokenLength >= maxContentLength) {
      // Remove couple of chat until it fit max token
      chatCopy.shift();
      chatCopy.shift();

      messages = [
        { role: "system", content: systemInstructionWithoutExample },
        ...chatCopy,
        userMessage,
      ];
      promptTokenLength = getTokenLength(messages);
    }

    return { messages };
  }

  async *generate(
    input: Prompt,
    config: UserConfigAndLocalData
  ): AsyncGenerator<string, void, void> {
    const result = await callOpenAI(input.messages!, config);
    console.log(result,"openAiresult")
    if (result.status !== 200) {
      const response = await result.json();
      if ("error" in response) {
        const error = response as { error: OpenAIError | OpenAIProxyError | string };
        if (typeof error.error === "string") {
          const errorString = error.error;
          if (errorString === "Unauthorized") {
            throw new Error("This proxy requires a proxy key. Contact proxy owner to get the key!");
          } else {
            throw new Error(errorString);
          }
        } else {
          throw new Error(error.error.message);
        }
      }
    }

    // Slaude return null Content-Type lol
    const stream =
      result.headers.get("Content-Type") === "text/event-stream; charset=utf-8" ||
      result.headers.get("Content-Type") === null;
    console.log(stream, "stream")
    console.log(result.headers.get("Content-Type"), "result.headers.get(")
    if (!stream) {
      const response = await result.json();
      console.log(response,"openAIresponse")
      if ("choices" in response) {
        const openAIResponse = response as OpenAIResponse;
        yield openAIResponse.choices[0].message.content;
      }
    } else {
      const openAIStream = result.body;
      if (openAIStream) {
        const reader = openAIStream.getReader();
        const decoder = new TextDecoder();

        const start = new Date().getTime();
        let continueLoop = true;
        while (continueLoop) {
          // Prevent blocking if call take more than 2 minutes
          if (new Date().getTime() - start > 120 * 1000) {
            continueLoop = false;
          }

          const chunk = await reader.read();
          if (chunk.done) {
            continueLoop = false;
          }

          // This values can contains 1 or 2 link lol
          const value = decoder.decode(chunk.value);

          const dataLines = value.split("\n").filter((line) => line.startsWith("data: "));

          for (const line of dataLines) {
            // Upstream error for reverse proxy lol
            if (line.includes("chatcmpl-upstream error")) {
              throw new Error(line);
            }

            if (line === "data: [DONE]") {
              continueLoop = false;
            } else if (line?.length > 0) {
              const data = JSON.parse(line.substring(6)) as any; // Remove "data: "
              // the first and last messages are undefined, protect against that
              const text = data.choices[0]["delta"]["content"] || "";
              yield text;
            }
          }
        }
      }
    }
  }
}

export const openAiGenerateInstance = new OpenAIGenerate();
