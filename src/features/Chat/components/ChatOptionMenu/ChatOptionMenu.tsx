import {
  SlidersOutlined,
  BookOutlined,
  WechatOutlined,
  LinkOutlined,
  MenuOutlined,
  SaveOutlined,
  LoadingOutlined,
  ToolOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { Tag, Dropdown, Tooltip, Switch, Button, App, Input, Space } from "antd";
import { AxiosError } from "axios";

import { useContext, useState } from "react";
import { useQueryClient } from "react-query";

import { AppContext } from "../../../../appContext";
import { chatService } from "../../services/chat-service";
import { ChatEntityWithCharacter } from "../../../../types/backend-alias";
import { ChatHistoryModal } from "./Modals/ChatHistoryModal";
import { ChatSettingsModal } from "./Modals/ChatSettingsModal";
import { ChatSummaryModal } from "./Modals/ChatSummaryModal";
import { GenerationSettingsModal } from "./Modals/GenerationSettingsModal";
import { copyToClipboard } from "../../../../shared/services/utils";

interface ChatOptionMenuProps {
  chat: ChatEntityWithCharacter;
  onReload: () => void;
  readyToChat: boolean;
}

export const ChatOptionMenu: React.FC<ChatOptionMenuProps> = ({ chat, onReload, readyToChat }) => {
  const { profile, config, updateConfig } = useContext(AppContext);
  const queryClient = useQueryClient();
  const { modal, message } = App.useApp();

  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isSharingChat, setIsSharingChat] = useState(false);
  const [openChatHistoryModal, setOpenChatHistoryModal] = useState(false);
  const [openChatSettingsModal, setOpenChatSettingsModal] = useState(false); // For testing
  const [openChatSummaryModal, setOpenChatSummaryModal] = useState(false);
  const [openGenerationSettingsModal, setOpenGenerationSettingsModal] = useState(false);

  const createChat = async () => {
    try {
      setIsCreatingChat(true);
      const newChat = await chatService.createChat(chat.character_id!);

      if (newChat) {
        // Lol this will not refresh, just hard refresh instead
        // navigate(`/chats/${newChat.id}`);

        location.href = `/chats/${newChat.id}`;
      }
    } catch (err) {
      message.error(JSON.stringify(err, null, 2));
    } finally {
      setIsCreatingChat(false);
    }
  };

  const shareChat = async () => {
    try {
      setIsSharingChat(true);

      let shouldShowSuccessModal = true;
      if (!chat.is_public) {
        const updatedChat = await chatService.updateChat(chat.id, { is_public: true });
        shouldShowSuccessModal = !!updatedChat;
      }

      if (shouldShowSuccessModal) {
        // Refresh in ChatPage
        const currentUrl = location.href;

        queryClient.invalidateQueries(["chat", chat.id]);
        modal.success({
          title: "Chat ready for sharing!",
          content: (
            <div>
              <p>Your can share your chat using this link:</p>
              <Space.Compact className="my-2" block>
                <Input value={currentUrl} />
                <Button
                  onClick={() => {
                    copyToClipboard(currentUrl);
                    message.info("Link copied to clipboard!");
                  }}
                >
                  <CopyOutlined /> Copy
                </Button>
              </Space.Compact>
            </div>
          ),
        });
      }
    } catch (err) {
      console.error("error", err);
      const backEndError = (err as AxiosError).response?.data;
      message.error(JSON.stringify(backEndError, null, 2));
    } finally {
      setIsSharingChat(false);
    }
  };

  // Do not display when user not logged in
  // if (!profile || !config) {
  //   console.log(config,"config")
  //   return null;
  // }

  return (
    <>
      <span style={{ marginLeft: "auto" }}>
        {readyToChat ? (
          // <Tag color="green">API is ready. Using {config.api}.</Tag>
          <Tag color="green">green</Tag>
        ) : (
          <Tag
            style={{ cursor: "pointer" }}
            color="red"
            onClick={() => setOpenChatSettingsModal(true)}
          >
            API not ready! Click to setup.
          </Tag>
        )}
        {/* <Tag color="green">green</Tag> */}
      </span>

      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        menu={{
          selectable: false,
          items: [
            {
              key: "api",
              label: (
                <Tooltip title="Setup this one time so you can start chatting" placement="right">
                  <div
                    onClick={() => {
                      setOpenChatSettingsModal(true);
                    }}
                  >
                    <ToolOutlined /> API Settings
                  </div>
                </Tooltip>
              ),
            },
            {
              key: "generation",
              label: (
                <Tooltip title="Generation settings (For advanced users)" placement="right">
                  <div
                    onClick={() => {
                      setOpenGenerationSettingsModal(true);
                    }}
                  >
                    <SlidersOutlined /> Generation Settings
                  </div>
                </Tooltip>
              ),
            },
            {
              key: "chat_summary",
              label: (
                <Tooltip
                  title="Generate/Edit a summary of the chat (Only support OpenAI for now)"
                  placement="right"
                >
                  <div
                    onClick={() => {
                      setOpenChatSummaryModal(true);
                    }}
                  >
                    <SaveOutlined /> Chat Memory
                  </div>
                </Tooltip>
              ),
            },
            {
              key: "new_chat",
              label: (
                <Tooltip title="Create a new chat with the same character" placement="right">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCreatingChat) {
                        return;
                      }
                      createChat();
                    }}
                  >
                    {isCreatingChat ? <LoadingOutlined /> : <WechatOutlined />} New Chat
                  </div>
                </Tooltip>
              ),
            },
            {
              key: "all_chat",
              label: (
                <Tooltip title="All your chats with this characters" placement="right">
                  <div
                    onClick={() => {
                      setOpenChatHistoryModal(true);
                    }}
                  >
                    <BookOutlined /> All Chats
                  </div>
                </Tooltip>
              ),
            },

            {
              key: "share",
              label: (
                <Tooltip
                  title="Make this chat public (your account name will be hidden) and give you a link for sharing"
                  placement="right"
                >
                  <div
                    onClick={() => {
                      if (isSharingChat) {
                        return;
                      }
                      shareChat();
                    }}
                  >
                    {isSharingChat ? <LoadingOutlined /> : <LinkOutlined />} Share Chat
                  </div>
                </Tooltip>
              ),
            },
            {
              key: "immer",
              label: (
                <Tooltip
                  title="Hide message edit/delete to make it more immersive"
                  placement="right"
                >
                  <div style={{ whiteSpace: "pre" }} onClick={(e) => e.stopPropagation()}>
                    <Switch
                      className="mr-2"
                      // defaultChecked={config.immersive_mode}
                      // onChange={(checked) => updateConfig({ ...config, immersive_mode: checked })}
                    />
                    Immersive mode
                  </div>
                </Tooltip>
              ),
            },
            {
              key: "stream",
              label: (
                <Tooltip title="Make text gradually appear (like CAI or ChatGPT)" placement="right">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                      className="mr-2"
                      // defaultChecked={config.text_streaming}
                      // onChange={(checked) => updateConfig({ ...config, text_streaming: checked })}
                    />
                    Text streaming
                  </div>
                </Tooltip>
              ),
            },
          ],
        }}
      >
        <Button type="text" size="large">
          <MenuOutlined />
        </Button>
      </Dropdown>

      <ChatHistoryModal
        open={openChatHistoryModal}
        character={chat.characters}
        onModalClose={() => setOpenChatHistoryModal(false)}
      />

      {/* Hack so modal re-render when openning */}
      {openChatSettingsModal && (
        <ChatSettingsModal
          open={openChatSettingsModal}
          onModalClose={() => setOpenChatSettingsModal(false)}
        />
      )}

      {openChatSummaryModal && (
        <ChatSummaryModal
          chat={chat}
          open={openChatSummaryModal}
          onReload={onReload}
          onModalClose={() => setOpenChatSummaryModal(false)}
        />
      )}

      {openGenerationSettingsModal && (
        <GenerationSettingsModal
          open={openGenerationSettingsModal}
          onModalClose={() => setOpenGenerationSettingsModal(false)}
        />
      )}
    </>
  );
};
