import { Button, Col, Row, Spin, List, message, ColProps, Modal } from "antd";
import { ExclamationCircleOutlined, InfoCircleOutlined, LeftCircleFilled, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { findLast } from "lodash-es";

import { ChatMessageEntity, SupaChatMessage } from "../../../types/backend-alias";
import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AppContext } from "../../../appContext";
// import { mockGenerateInstance } from "../services/generate/mock-generate";
import { mockGenerateInstance } from "../services/generate/admin-generate";
import { openAiGenerateInstance } from "../services/generate/openai-generate";
import { chatService } from "../services/chat-service";
import {
  ChatContainer,
  BotChoicesOverlay,
  BotChoicesContainer,
  CustomDivider,
  ChatLayout,
  BotMessageControlWrapper,
} from "./ChatPage.style";
import { MessageDisplay } from "../components/MessageDisplay";
import { ChatOptionMenu } from "../components/ChatOptionMenu/ChatOptionMenu";
import { PrivateIndicator } from "../../../shared/components";
import { UserConfigAndLocalData } from "../../../shared/services/user-config";
import { GenerateInterface } from "../services/generate/generate-interface";
import { koboldGenerateInstance } from "../services/generate/kobold-generate";
import { ChatInput } from "../components/ChatInput";
import { Helmet } from "react-helmet";
import { getBotAvatarUrl } from "../../../shared/services/utils";
import { characterUrl } from "../../../shared/services/url-utils";
import { Profile } from "../../../types/profile";
import { axiosInstance, supabase } from "../../../config";

interface ChatState {
  messages: SupaChatMessage[]; // All server-side messages
  messagesToDisplay: SupaChatMessage[]; // For displaying: service-side messages + client-side messages
  choiceIndex: number;
}

const initialChatState: ChatState = {
  messages: [],
  messagesToDisplay: [],
  choiceIndex: 0,
};

type Action =
  | { type: "set_messages"; messages: SupaChatMessage[] }
  | { type: "set_index"; newIndex: number }
  | { type: "delete_message"; messageId: number }
  | { type: "new_client_messages"; messages: SupaChatMessage[] }
  | { type: "new_server_messages"; messages: SupaChatMessage[] }
  | { type: "message_edited"; message: SupaChatMessage };

const dispatchFunction = (state: ChatState, action: Action): ChatState => {
  switch (action.type) {
    case "set_messages":
      return { ...state, messages: [...action.messages], messagesToDisplay: [...action.messages] };

    case "set_index":
      return { ...state, choiceIndex: action.newIndex };

    case "new_client_messages":
      return { ...state, messagesToDisplay: [...state.messages, ...action.messages] };

    case "new_server_messages":
      return {
        ...state,
        messages: [...state.messages, ...action.messages],
        messagesToDisplay: [...state.messages, ...action.messages],
      };

    case "message_edited":
      const editIndex = state.messages.findIndex((m) => m.id === action.message.id);
      const newMessages = state.messages.map((content, i) =>
        i === editIndex ? action.message : content
      );
      return dispatchFunction(state, { type: "set_messages", messages: newMessages });

    default:
      return state;
  }
};

const CHAT_COLUMN_PROPS: ColProps = { lg: 14, xs: 24, md: 18 };

export const ChatPage: React.FC = () => {
  const { profile, config, localData } = useContext(AppContext);
  const navigate = useNavigate();
  const { chatId } = useParams();
  const messageDivRef = useRef<HTMLDivElement>(null);
  const botChoiceDivRef = useRef<HTMLDivElement>(null);

  const [shouldFocus, setShouldFocus] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [chatState, dispatch] = useReducer(dispatchFunction, initialChatState);
  const { choiceIndex, messagesToDisplay } = chatState;

  const mainMessages = messagesToDisplay.filter((message) => message.is_main);
  const botChoices = messagesToDisplay.filter((message) => message.is_bot && !message.is_main);
  const isImmersiveMode = Boolean(config?.immersive_mode);
  const readyToChat = chatService.readyToChat(config, localData);
  const isMessageLimit = (botChoices[0]?.message === "Your messages are ended. Please upgrade your current plan.")
  console.log(isMessageLimit, "isMessageLimit")
  const [upgradeRequestModalVisible, setUpgradeRequestModalVisible] = useState(false);
  const closeModal = () => {
    setUpgradeRequestModalVisible(false);
  };
  const fullConfig: UserConfigAndLocalData = useMemo(() => {
    return { ...localData, ...config! };
  }, [localData, config]);

  const generateInstance: GenerateInterface = useMemo(() => {
    if (fullConfig.api === "openai") {
      profile && openAiGenerateInstance.setProfile(profile);
      return openAiGenerateInstance;
    } else if (fullConfig.api === "kobold") {
      profile && koboldGenerateInstance.setProfile(profile);
      return koboldGenerateInstance;
    }
    else if (fullConfig.api === "openrouter") {
      profile && mockGenerateInstance.setProfile(profile);
      return mockGenerateInstance;
    }
    profile && mockGenerateInstance.setProfile(profile);

    return mockGenerateInstance;
  }, [fullConfig, profile]);

  console.log(fullConfig, "fullConfig", generateInstance, "generateInstance")

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messageDivRef.current) {
        messageDivRef.current.scrollTop = messageDivRef.current.scrollHeight;
      }
    }, 50);
  }, [messageDivRef.current]);

  const scrollToTopChoice = useCallback(() => {
    setTimeout(() => {
      if (messageDivRef.current && botChoiceDivRef.current) {
        const botChoiceOffset = botChoiceDivRef.current.getBoundingClientRect().top;
        if (botChoiceOffset < 0) {
          const massageDiv = messageDivRef.current;
          massageDiv.scrollTop =
            massageDiv.scrollHeight -
            massageDiv.clientHeight -
            botChoiceDivRef.current.getBoundingClientRect().height +
            100; // Hardcode 100 at avatar height
        }
      }
    }, 50);
  }, [messageDivRef.current, botChoiceDivRef.current]);

  console.log(profile?.id, "profile?.id")

  // const { data, refetch, isLoading, error } = useQuery(
  //   ["chat", chatId, profile?.id],
  //   async () => chatService.getChatById(chatId, profile?.id),
  //   {
  //     enabled: false,
  //     onSuccess: (chatData) => {
  //       // Only scroll and focus for own chat, not public chat lol
  //       if (chatData.chat.user_id === profile?.id) {
  //         setShouldFocus(true);
  //         scrollToBottom();
  //       }
  //     },
  //     retry: 1,
  //   }
  // );
  // const canEdit = useMemo(
  //   () => Boolean(profile && profile.id === data?.chat.user_id),
  //   [profile, data?.chat.user_id]
  // );
  const { data, isLoading, error, refetch } = useQuery(
    ["chat", chatId, profile?.id],
    async () => chatService.getChatById(chatId, profile?.id),
    {
      enabled: !!chatId && !!profile?.id, // Ensure chatId and profile are available before fetching
      retry: 1,
      onSuccess: (chatData) => {
        // Scroll and focus only if the chat belongs to the current user
        if (chatData.chat?.user_id === profile?.id) {
          setShouldFocus(true);
        }
      },
    }
  );
  // Automatically scroll to bottom if shouldFocus is true
  useEffect(() => {
    if (shouldFocus) {
      scrollToBottom();
    }
  }, [shouldFocus]);
  // Compute canEdit after data is fetched
  const canEdit = useMemo(() => {
    if (!profile || !data?.chat) return false;
    return profile.id === data.chat.user_id;
  }, [profile, data?.chat]);

  console.log(canEdit, data?.chat, "canEdit")

  const refreshChats = async () => {
    const newData = await refetch();
    const messages = newData.data?.chatMessages || [];
    messages.sort((a, b) => a.id - b.id);
    dispatch({ type: "set_messages", messages });

    if (profile && profile?.id === newData.data?.chat.user_id) {
      scrollToBottom();
    }
  };

  useEffect(() => {
    refreshChats();
  }, [profile]);

  useEffect(() => {
    setUpgradeRequestModalVisible(isMessageLimit);
  }, [isMessageLimit]);

  const deleteMessage = async (messageByCreatedAt: string) => {
    if (!messageByCreatedAt) {
      return;
    }

    // Delete non-main message too
    const messageToDeletes = chatState.messages.filter(
      (message) => new Date(message.created_at) >= new Date(messageByCreatedAt) || !message.is_main
    );
    await chatService.deleteMessages(
      chatId,
      messageToDeletes.map((message) => message.id)
    );

    refreshChats();
  };

  const swipe = async (direction: "left" | "right" | "regen") => {
    // If message already exist, just slide
    const directionIndex = { left: -1, regen: 0, right: 1 };
    const newIndex = choiceIndex + directionIndex[direction];
    if (newIndex < 0) {
      return;
    } else if (newIndex < botChoices.length) {
      dispatch({ type: "set_index", newIndex });
      return;
    } else if (!canEdit) {
      return;
    }

    if (isGenerating) {
      return;
    }

    // Otherwise, generate
    setIsGenerating(true);
    try {
      const localBotMessage: ChatMessageEntity = {
        id: -1,
        chat_id: 0,
        created_at: "",
        is_bot: true,
        is_main: false,
        message: `${data?.chat.characters.name} is replying...`,
      };
      dispatch({ type: "set_index", newIndex });
      dispatch({ type: "new_client_messages", messages: [localBotMessage] });
      if (direction === "regen") {
        scrollToBottom();
      } else if (direction === "right") {
        scrollToTopChoice();
      }

      // Simulate regenrate the massage
      const lastMessage = findLast(chatState.messagesToDisplay, (m) => !m.is_bot);
      const historyWithoutLastMessage = chatState.messages.filter(
        (massage) => massage.id < lastMessage!.id
      );

      const prompt = generateInstance.buildPrompt(
        // message,
        lastMessage?.message || "",
        data?.chat!,
        historyWithoutLastMessage,
        fullConfig
      );

      // This method might fail for multiple reasons, allow user to regenerate
      const botMessages = await generateInstance.generate(prompt, fullConfig);

      console.log(botMessages, "botMessages")

      if (direction === "right" || direction === "regen") {
        const oldHeight = botChoiceDivRef.current?.getBoundingClientRect().height || 0;
        let streamingText = "";
        for await (const message of botMessages) {
          streamingText += message;
          const newBotMessage: ChatMessageEntity = {
            id: -1,
            chat_id: 0,
            created_at: "",
            is_bot: true,
            is_main: false,
            message: streamingText,
          };
          dispatch({ type: "new_client_messages", messages: [newBotMessage] });

          const newHeight = botChoiceDivRef.current?.getBoundingClientRect().height || 0;
          if (newHeight > oldHeight) {
            scrollToBottom();
          }
        }

        if (streamingText.length > 0) {
          chatService
            .createMessage(chatId, {
              message: streamingText,
              is_bot: true,
              is_main: false,
              is_mock: (config?.api === "mock"),
            })
            .then((botMessage) => {
              dispatch({ type: "new_server_messages", messages: [botMessage] });
            });
        } else {
          dispatch({
            type: "new_server_messages",
            messages: [],
          });
        }
      }
    } catch (err) {
      const error = err as Error;
      message.error(error.message, 3);

      // Refetch on error to avoid out of sync
      refreshChats();
      dispatch({ type: "set_index", newIndex: choiceIndex });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateChat = async (inputMessage: string) => {
    try {
      console.log("Starting generateChat function...");

      // Step 1: Check if we can generate a chat
      const canGenerateChat = readyToChat && inputMessage.length > 0 && !isGenerating;
      if (!canGenerateChat) {
        console.log("Cannot generate chat: Conditions not met (readyToChat, inputMessage length, or isGenerating flag).");
        return;
      }

      console.log("Conditions met. Proceeding with chat generation...");

      setIsGenerating(true);

      // Step 2: Define local messages for user and bot
      const localUserMessage = {
        id: -2,
        chat_id: 0,
        created_at: "",
        is_bot: false,
        is_main: true,
        message: inputMessage.trimEnd(),
        is_mock: (config?.api === "mock"),
      };
      const localBotMessage = {
        id: -1,
        chat_id: 0,
        created_at: "",
        is_bot: true,
        is_main: false,
        message: `${data?.chat.characters.name} is replying...`,
        is_mock: (config?.api === "mock"),
      };


      console.log("User and bot local messages defined.", { localUserMessage, localBotMessage });

      // Step 3: Manage is_main message status
      const choiceToKeep = botChoices[choiceIndex];
      if (choiceToKeep) {
        choiceToKeep.is_main = true;
        console.log("Updating choiceToKeep message as main:", choiceToKeep);

        // Attempt to update main message
        chatService.updateMassage(chatId, choiceToKeep.id, { is_main: true })
          .then(() => console.log("Successfully updated message as main in chat service."))
          .catch((err) => console.error("Failed to update message as main:", err));
      }

      const choicesToDelete = botChoices.filter((v, i) => i !== choiceIndex);
      if (choicesToDelete.length > 0) {
        console.log("Deleting non-main choices from chat service:", choicesToDelete);
        chatService.deleteMessages(
          chatId,
          choicesToDelete.map((message) => message.id)
        ).then(() => console.log("Deleted non-main messages successfully."))
          .catch((err) => console.error("Failed to delete non-main messages:", err));
      }

      // Step 4: Dispatch messages to the state
      dispatch({
        type: "set_messages",
        messages: [...chatState.messages.filter((message) => message.is_main)],
      });
      dispatch({
        type: "new_client_messages",
        messages: [localUserMessage, localBotMessage],
      });
      dispatch({ type: "set_index", newIndex: 0 });
      console.log("Dispatched initial messages to state.");
      scrollToBottom();

      // Step 5: Create user message in chat service
      console.log("Creating user message in chat service...");
      const insertUserMessagePromise = chatService.createMessage(chatId, localUserMessage);
      insertUserMessagePromise
        .then(() => console.log("User message created successfully in chat service."))
        .catch((err) => console.error("Failed to create user message in chat service:", err));

      // Step 6: Build prompt and generate bot response
      const prompt = generateInstance.buildPrompt(inputMessage, data?.chat!, chatState.messages, fullConfig);
      console.log("Prompt built for bot generation:", prompt);
      console.log(fullConfig, 'fullConfig')

      // Step 7: Stream generated text
      const generatedTexts = await generateInstance.generate(prompt, fullConfig);
      console.log("Generating bot response...", generatedTexts);

      let streamingText = "";
      for await (const text of generatedTexts) {
        streamingText += text;
        localBotMessage.message = streamingText;
        dispatch({
          type: "new_client_messages",
          messages: [localUserMessage, localBotMessage],
        });

        console.log("Streaming bot response:", streamingText);
        scrollToBottom();
      }

      // Step 8: Handle server message creation
      const serverUserMessage = await insertUserMessagePromise;
      console.log("User message stored in server:", serverUserMessage);

      if (streamingText !== "") {
        console.log("Creating bot message in chat service...");
        chatService
          .createMessage(chatId, localBotMessage)
          .then((serverBotMessage) => {
            console.log("Bot message created in chat service:", serverBotMessage);
            dispatch({
              type: "new_server_messages",
              messages: [serverUserMessage, serverBotMessage],
            });
          })
          .catch((err) => {
            console.error("Failed to create bot message in chat service:", err);
          });
      } else {
        console.log("Bot message generation failed. Only storing user message.");
        dispatch({
          type: "new_server_messages",
          messages: [serverUserMessage],
        });
      }
    } catch (err) {
      const error = err as Error;
      console.error("An error occurred in generateChat:", error);
      message.error(error.message, 3);

      console.log("Refreshing chat data due to error.");
      refreshChats();
    } finally {
      console.log("Resetting isGenerating flag.");
      setIsGenerating(false);
    }
  };


  const editMessage = async (item: SupaChatMessage, messageId: number, newMessage: string) => {
    item.message = newMessage; // Local edit

    // Server edit, just ignore if it failed
    chatService.updateMassage(chatId, messageId, {
      message: newMessage,
    });
    dispatch({ type: "message_edited", message: item });
  };


  useEffect(() => {
    async function run() {
      const response = await supabase.auth.getSession();
      const email = response.data.session?.user?.email || null;
      if (email) {

        try {
          const response = await axiosInstance.post("/subscription/checkStatus", {
            email: email
          });

          console.log(response, "response_update_status")

          if (response.data.result == false) {
            console.error('response.data.result :', response.data.result);
          }
        }
        catch (error) {
          console.error('Error:', error);
        }
      }
    }
  }, [])

  if (!isLoading && error) {
    return (
      <ChatLayout showControl={false}>
        <p>
          Can not view this chat. It might be deleted or private.{" "}
          <Link to="/">Back to home page!</Link>
        </p>
      </ChatLayout>
    );
  }

  return (
    <ChatLayout showControl={canEdit}>
      {isLoading && (
        <div className="text-center mt-4">
          <Spin />
        </div>
      )}

      {data && canEdit && (
        <>
          {data.chat.is_public ? (
            <Helmet>
              <title>{`A public chat with ${data.chat.characters.name}`}</title>
              <meta
                property="og:title"
                content={`A public chat with ${data.chat.characters.name}`}
              />
              <meta
                property="og:description"
                content={`A public chat with ${data.chat.characters.name}. ${data.chat.characters.description}`}
              />
              <meta
                name="description"
                content={`A public chat with ${data.chat.characters.name}. ${data.chat.characters.description}`}
              />
              <meta property="og:image" content={getBotAvatarUrl(data.chat.characters.avatar)} />
            </Helmet>
          ) : (
            <Helmet>
              <title>{`A private chat with ${data.chat.characters.name}`}</title>
            </Helmet>
          )}

          <Row justify="center">
            <Col {...CHAT_COLUMN_PROPS} className="d-flex justify-space-between align-center">
              <Link to={characterUrl(data.chat.characters.id!, data.chat.characters.name!)}>
                <Button type="text" size="large">
                  <LeftCircleFilled /> Back
                </Button>
              </Link>
              <ChatOptionMenu
                readyToChat={readyToChat}
                isMessageLimit={isMessageLimit}
                chat={data.chat}
                onReload={() => refreshChats()}
              />
            </Col>
          </Row>

          <CustomDivider>
            <PrivateIndicator isPublic={data.chat.is_public} /> Chat with{" "}
            {data.chat.characters.name}
          </CustomDivider>

          <Row justify="center" style={{ overflowY: "scroll" }} ref={messageDivRef}>
            <Col {...CHAT_COLUMN_PROPS}>
              <ChatContainer>
                <List
                  className="text-left"
                  itemLayout="horizontal"
                  dataSource={mainMessages}
                  renderItem={(item, index) => (
                    <MessageDisplay
                      key={item.id}
                      canEdit={canEdit && index > 0 && !isImmersiveMode}
                      message={item}
                      user={canEdit ? profile?.name : "Anon"}
                      userAvatar={canEdit ? profile?.avatar : undefined}
                      showRegenerate={
                        item.is_main &&
                        !item.is_bot &&
                        index === mainMessages.length - 1 &&
                        botChoices.length === 0
                      }
                      onRegenerate={() => swipe("regen")}
                      characterName={data.chat.characters.name}
                      characterAvatar={data.chat.characters.avatar}
                      characterIsNsfw={data.chat.characters.is_nsfw}
                      onDelete={deleteMessage}
                      onEdit={async (messageId, newMessage) => {
                        editMessage(item, messageId, newMessage);
                      }}
                    />
                  )}
                />

                {botChoices.length > 0 && (
                  <BotChoicesContainer>
                    {!isGenerating && canEdit && (
                      <>
                        {choiceIndex > 0 && (
                          <BotMessageControlWrapper side="left">
                            <Button
                              type="text"
                              shape="circle"
                              size="large"
                              onClick={() => swipe("left")}
                            >
                              <LeftOutlined />
                            </Button>
                          </BotMessageControlWrapper>
                        )}
                        <BotMessageControlWrapper side="right">
                          <Button
                            style={{ marginLeft: "auto" }}
                            type="text"
                            shape="circle"
                            size="large"
                            onClick={() => swipe("right")}
                          >
                            <RightOutlined />
                          </Button>
                        </BotMessageControlWrapper>
                      </>
                    )}

                    <BotChoicesOverlay ref={botChoiceDivRef} index={choiceIndex}>
                      {botChoices.map((item) => (
                        <MessageDisplay
                          key={item.id}
                          message={item}
                          canEdit={canEdit && !isImmersiveMode}
                          user={canEdit ? profile?.name : "Anon"}
                          userAvatar={canEdit ? profile?.avatar : undefined}
                          showRegenerate={false}
                          characterName={data.chat.characters.name}
                          characterAvatar={data.chat.characters.avatar}
                          characterIsNsfw={data.chat.characters.is_nsfw}
                          onDelete={deleteMessage}
                          onEdit={(messageId, newMessage) => {
                            editMessage(item, messageId, newMessage);
                          }}
                        />
                      ))}
                    </BotChoicesOverlay>
                  </BotChoicesContainer>
                )}
              </ChatContainer>
            </Col>
          </Row>
          {/* Modal for confirmation */}
          <Modal
            title="Upgrade Required"
            visible={upgradeRequestModalVisible}
            okText="Upgrade"
            cancelButtonProps={{ style: { display: 'none' } }}  // Hide Cancel button
            onCancel={closeModal}
            footer={[
              <Button type="primary" key="upgrade" size="large" style={{ width: "100%", fontWeight: "bold" }} onClick={() => navigate("/pricing")}>
                Upgrade Now
              </Button>,
            ]}
            bodyStyle={{
              textAlign: "center",  // Center align text
              padding: "20px",  // Add padding around the content
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "18px", marginBottom: "10px", color: "#e74c3c" }}>
                <ExclamationCircleOutlined style={{ color: "#e74c3c", marginRight: "8px" }} />
                <strong>Your Message Limit Hit</strong>
              </p>
              <p style={{ fontSize: "16px", marginBottom: "20px", color: "#2980b9" }}>
                Upgrade Now To Keep Chatting!
              </p>
              <p style={{ fontSize: "14px", color: "#95a5a6" }}>
                After subscribing, please refresh the page to continue.
              </p>
            </div>
          </Modal>
        </>
      )
      }

      {
        !isLoading && canEdit && (
          <ChatInput
            shouldFocus={shouldFocus}
            readyToChat={readyToChat}
            isGenerating={isGenerating}
            isMessageLimit={isMessageLimit}
            onGenerateChat={(message) => generateChat(message)}
          />
        )
      }
    </ChatLayout >
  );
};
