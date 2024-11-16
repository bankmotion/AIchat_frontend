import { BookOutlined, CopyOutlined, LinkOutlined, LoadingOutlined, SaveOutlined, SlidersOutlined, ToolOutlined, WechatOutlined } from "@ant-design/icons";
import { App, Button, Form, Input, Menu, Modal, Slider, Space, Switch, Tooltip, Typography } from "antd";

import { useContext, useMemo, useState } from "react";
import { AppContext } from "../../../../../appContext";
import {
  GenerationSetting,
} from "../../../../../shared/services/generation-setting";
import { UserConfig } from "../../../../../shared/services/user-config";
import { useQueryClient } from "react-query";
import { chatService } from "../../../services/chat-service";
import { AxiosError } from "axios";
import { ChatEntityWithCharacter } from "../../../../../types/backend-alias";
import { copyToClipboard } from "../../../../../shared/services/utils";
import { ChatSummaryModal } from "./ChatSummaryModal";
import { GenerationSettingsModal } from "./GenerationSettingsModal";
import { ChatSettingsModal } from "./ChatSettingsModal";
import { ChatHistoryModal } from "./ChatHistoryModal";


interface AdvancedSettingsModalProps {
  open: boolean;
  onModalClose: () => void;
  chat: ChatEntityWithCharacter;
  onReload: () => void;
  readyToChat: boolean;
}

type FormValues = GenerationSetting;

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  open,
  onModalClose,
  chat, onReload, readyToChat
}) => {
  const { profile, config, updateConfig, localData } = useContext(AppContext);
  const queryClient = useQueryClient();
  const { modal, message } = App.useApp();

  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isSharingChat, setIsSharingChat] = useState(false);
  const [openChatHistoryModal, setOpenChatHistoryModal] = useState(false);
  const [openChatSettingsModal, setOpenChatSettingsModal] = useState(false); // For testing
  const [openChatSummaryModal, setOpenChatSummaryModal] = useState(false);
  const [openGenerationSettingsModal, setOpenGenerationSettingsModal] = useState(false);

  const [form] = Form.useForm<FormValues>();

  const createChat = async () => {
    try {
      setIsCreatingChat(true);
      const newChat = await chatService.createChat(chat.character_id!, chat.user_id);

      if (newChat) {
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

  return (
    <>
      <Modal
        title="Advanced Settings"
        open={open}
        okText={
          <span>
            OK
          </span>
        }
        onOk={onModalClose}
        onCancel={onModalClose}
        width={800}
      >
        <div className="pb-1">
          <Menu mode="vertical" selectable={false}>
            <Menu.Item key="api">
              <Tooltip title="Setup this one time so you can start chatting" placement="right">
                <div onClick={() => setOpenChatSettingsModal(true)}>
                  <ToolOutlined /> API Settings
                </div>
              </Tooltip>
            </Menu.Item>

            <Menu.Item key="generation">
              <Tooltip title="Generation settings (For advanced users)" placement="right">
                <div onClick={() => setOpenGenerationSettingsModal(true)}>
                  <SlidersOutlined /> Generation Settings
                </div>
              </Tooltip>
            </Menu.Item>

            <Menu.Item key="chat_summary">
              <Tooltip title="Generate/Edit a summary of the chat (Only support OpenAI for now)" placement="right">
                <div onClick={() => setOpenChatSummaryModal(true)}>
                  <SaveOutlined /> Chat Memory
                </div>
              </Tooltip>
            </Menu.Item>

            <Menu.Item key="all_chat">
              <Tooltip title="All your chats with this character" placement="right">
                <div onClick={() => setOpenChatHistoryModal(true)}>
                  <BookOutlined /> All Chats
                </div>
              </Tooltip>
            </Menu.Item>

            {/* <Menu.Item key="share">
              <Tooltip title="Make this chat public (your account name will be hidden) and give you a link for sharing" placement="right">
                <div onClick={() => shareChat()}>
                  {isSharingChat ? <LoadingOutlined /> : <LinkOutlined />} Share Chat
                </div>
              </Tooltip>
            </Menu.Item> */}

            <Menu.Item key="immer">
              <Tooltip title="Hide message edit/delete to make it more immersive" placement="right">
                <div style={{ whiteSpace: 'pre' }} onClick={(e) => e.stopPropagation()}>
                  <Switch
                    className="mr-2"
                    defaultChecked={config?.immersive_mode}
                    onChange={(checked) => updateConfig({ ...config, immersive_mode: checked })}
                  />
                  Immersive Mode
                </div>
              </Tooltip>
            </Menu.Item>

            <Menu.Item key="stream">
              <Tooltip title="Make text gradually appear (like CAI or ChatGPT)" placement="right">
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch
                    className="mr-2"
                    defaultChecked={config?.text_streaming}
                    onChange={(checked) => updateConfig({ ...config, text_streaming: checked })}
                  />
                  Text Streaming
                </div>
              </Tooltip>
            </Menu.Item>
          </Menu>
        </div>
      </Modal>
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
