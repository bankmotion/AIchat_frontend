import delay from "delay";
import { UserConfigAndLocalData } from "../../../../shared/services/user-config";
import { ChatEntityWithCharacter, SupaChatMessage } from "../../../../types/backend-alias";
import { Profile } from "../../../../types/profile";
import { GenerateInterface, Prompt } from "./generate-interface";
import {
    chatToMessage,
    buildSystemInstruction,
    getTokenLength,
} from "../openai-service";
import { OpenAIError, OpenAIInputMessage, OpenAIProxyError, OpenAIResponse } from "../types/openai";
import { generateMessageByAdmin } from "../chat-service"

export class MockGenerate extends GenerateInterface {
    private profile: Profile

    setProfile(profile: Profile) {
        this.profile = profile;
    }

    async *generate(
        input: Prompt,
        config: UserConfigAndLocalData
    ): AsyncGenerator<string, void, void> {
        const result = await generateMessageByAdmin(input.messages!, config, this.profile.id);
        console.log("generateMessageByAdmin", result, "generateMessageByAdmin")
        if (result.status === 200) {
            const finalResult = result.data;
            if (finalResult === '') {
                yield "Your messages are ended. Please upgrade your current plan.";
            }
            else {
                const words = finalResult.split(" ");
                for (const word of words) {
                    await delay(50);
                    yield word + " ";
                }
            }

        }
        else {
            yield "Connection Error."
        }


    }

    buildPrompt(
        message: string,
        chat: ChatEntityWithCharacter,
        chatHistory: SupaChatMessage[],
        config: UserConfigAndLocalData
    ): Prompt {
        let chatCopy = chatHistory.filter((message) => message.is_main).map(chatToMessage);
        const maxNewToken = config.generation_settings.max_new_token || 500;
        // Hack, otherwise the genrated message will be cut-off, lol
        let context_length, maxContentLength;
        if (config.api !== "openrouter") {
            if (config.openrouter_model === "gryphe/mythomax-l2-13b") {
                context_length = 4096;
            }
            else context_length = 8192;

            maxContentLength = context_length - maxNewToken;
        }
        else {
            maxContentLength = (config.generation_settings.context_length || 4095) - maxNewToken;
        }

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
}

export const mockGenerateInstance: MockGenerate = new MockGenerate();
