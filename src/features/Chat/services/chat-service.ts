import { axiosInstance, supabase } from "../../../config";
import { UserConfig } from "../../../shared/services/user-config";
import { UserLocalData } from "../../../shared/services/user-local-data";
import {OpenAIInputMessage} from "./types/openai";
import { UserConfigAndLocalData } from "../../../shared/services/user-config";
import {
  ChatEntity,
  ChatMessageEntity,
  ChatResponse,
  CreateChatMessageDto,
  UpdateChatDto,
  UpdateChatMessageDto,
} from "../../../types/backend-alias";

type ChatID = number | string | undefined;
type UserID = number | string | undefined;

const createChat = async (characterId: string, ProfileId:string) => {
  const newChat = await axiosInstance.post<ChatEntity>("chats", {
    character_id: characterId,
    profile_id:ProfileId
  });
  console.log(ProfileId,"ProfileId")
  return newChat.data;
};

const updateChat = async (
  chatId: ChatID,
  { is_public, summary, summary_chat_id }: UpdateChatDto
) => {
  const updatedChat = await axiosInstance.patch<ChatEntity>(`chats/${chatId}`, {
    is_public,
    summary,
    summary_chat_id,
  });
  return updatedChat.data;
};

const deleteChat = async (chatId: ChatID) => {
  if (!chatId) {
    throw new Error("chatId is undefined");
  }
  await supabase.from("chat_messages").delete().eq("chat_id", chatId);
  await supabase.from("chats").delete().eq("id", chatId);
};

const getChatById = async (chatId: ChatID,userId:UserID) => {
  console.log(userId,"userId geggweg")
  const chatResponse = await axiosInstance.get<ChatResponse>(`/chats/${chatId}`,{
    params: { userId },
  });
  return chatResponse.data;
};

const deleteMessages = async (chatId: ChatID, messageIDs: number[]) => {
  return await axiosInstance.delete<{ success: boolean }>(`/chats/${chatId}/messages`, {
    data: {
      message_ids: messageIDs,
    },
  });
};

const createMessage = async (
  chatId: ChatID,
  { message, is_bot, is_main, is_mock }: CreateChatMessageDto
) => {
  const messageResponse = await axiosInstance.post<ChatMessageEntity>(`/chats/${chatId}/messages`, {
    message,
    is_bot,
    is_main,
    is_mock
  });
  return messageResponse.data;
};

const updateMassage = async (
  chatId: ChatID,
  messageId: number,
  { message, is_main }: UpdateChatMessageDto
) => {
  const messageResponse = await axiosInstance.patch<{ success: boolean }>(
    `/chats/${chatId}/messages/${messageId}`,
    {
      message: message,
      is_main,
    }
  );
  return messageResponse.data;
};

const readyToChat = (config: UserConfig | undefined, localData: UserLocalData) => {
  console.log(config,localData,"readyToChat")
  if (!config) {
    return false;
  }

  if (config.api === "mock") {
    return true;
  }

  if (config.api === "openrouter") {
    return true;
  }

  if (config.api === "openai") {
    if (config.open_ai_mode === "api_key" && localData.openAIKey) {
      return true;
    }
    if (config.open_ai_mode === "proxy" && config.open_ai_reverse_proxy) {
      return true;
    }
  }

  if ((config.api === "kobold" || config.api === "ooba") && config.api_url) {
    return true;
  }

  return false;
};

export const formatChat = (inputMessage: string, user = "Anon", characterName = "") => {
  return inputMessage
    .replace(/{{char}}:/gi, "")

    .replace(/{{user}}/gi, user)
    .replace(/<user>/gi, user)
    .replace(/{{bot}}/gi, characterName)
    .replace(/{{char}}/gi, characterName)
    .replace(/<bot>/gi, characterName)
    .replace(/<START>/gi, "");
};

export const generateMessageByAdmin = async (
  messages: OpenAIInputMessage[],
  config: UserConfigAndLocalData,
  user_id:string
) => {
  const Response = await axiosInstance.post(
    `/chats/messages/generateByAdmin`,
    {
      messages: messages,
      config:config,
      user_id:user_id
    }
  );
  return Response;
};

export const chatService = {
  createChat,
  deleteChat,
  getChatById,
  createMessage,
  updateChat,
  updateMassage,
  deleteMessages,
  readyToChat,
  formatChat,
  generateMessageByAdmin,
};
