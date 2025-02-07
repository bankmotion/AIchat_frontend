import {
  WechatOutlined,
  MenuOutlined,
  LoadingOutlined,
  CopyOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Tag, Dropdown, Tooltip, Button, App } from "antd";

import { useContext, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../../../../appContext";
import { chatService } from "../../services/chat-service";
import { ChatEntityWithCharacter } from "../../../../types/backend-alias";
import { AdvancedSettingsModal } from "./Modals/AdvancedSettingsModal";
import { copyToClipboard } from "../../../../shared/services/utils";
import { UserConfigAndLocalData } from "../../../../shared/services/user-config";

interface ChatOptionMenuProps {
  chat: ChatEntityWithCharacter;
  onReload: () => void;
  readyToChat: boolean;
  isMessageLimit: boolean;
}

export const ChatOptionMenu: React.FC<ChatOptionMenuProps> = ({ chat, onReload, readyToChat, isMessageLimit }) => {
  const { profile, config, updateConfig, localData } = useContext(AppContext);
  const userType = profile?.user_type;
  const queryClient = useQueryClient();
  const { modal, message } = App.useApp();
  const navigate = useNavigate();

  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isSharingChat, setIsSharingChat] = useState(false);
  const [openChatSettingsModal, setOpenChatSettingsModal] = useState(false); // For testing
  const [openAdvancedSettingsModal, setOpenAdvancedSettingsModal] = useState(false);

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

  // Do not display when user not logged in
  // if (!profile || !config) {
  //   return null;
  // }

  if (!profile) {
    return null;
  }

  const fullConfig: UserConfigAndLocalData = useMemo(() => {
    return { ...localData, ...config! };
  }, [localData, config]);

  return (
    <>
      <span style={{ marginLeft: "auto" }}>
        {readyToChat ? (
          !isMessageLimit ? (
            <Tag color="green">API is ready. Using {config !== undefined ? config?.api:"openrouter"}.</Tag>
          ) : (
            <Tag
              style={{ cursor: "pointer" }}
              color="red"
              onClick={() => setOpenChatSettingsModal(true)}
            >
              Your Message Limit is up! Check Right Menu.
            </Tag>
          )
        ) : (
          <Tag
            style={{ cursor: "pointer" }}
            color="red"
            onClick={() => setOpenChatSettingsModal(true)}
          >
            API not ready! Click to setup.
          </Tag>
        )}
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
                <Tooltip title="" placement="right">
                  <div
                    style={{ display: "flex", alignItems: "center", width: "auto", whiteSpace: "nowrap" }} // Aligns items in a row with spacing
                  >
                    <span style={{ whiteSpace: "nowrap" }}>{userType === 1 && 'Free Trial'}{userType === 2 && 'Premium'}{userType === 3 && 'Deluxe'}</span>
                    <Button
                      type="primary"
                      onClick={() => {
                        navigate("/pricing");
                      }}
                      block
                      style={{ whiteSpace: "nowrap", height: "auto", marginLeft:"5px" }}
                    >
                      {userType === 1 ? 'Upgrade' : (userType === 2 || userType === 3) ? 'Upgrade Plan' : ''}
                    </Button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",    // Arrange text vertically
                      justifyContent: "center",   // Centers the text horizontally
                      width: "100%",              // Makes the div full width
                      paddingTop: "20px",         // Adds top padding
                      color: "#333",              // Default text color for readability
                    }}
                  >
                    {isMessageLimit ? (
                      <>
                        <p
                          style={{
                            fontSize: "15px",
                            marginBottom: "8px",
                            color: "#e74c3c", // Red color for urgency
                          }}
                        >
                          Your Message Limit Hit
                        </p>
                        <p
                          style={{
                            fontSize: "15px",
                            color: "#e74c3c", // Keep the red color for consistency
                            marginBottom: "20px", // Add space between the lines
                          }}
                        >
                          Upgrade Now To Keep Chatting!
                        </p>
                      </>
                    ) : (
                      <>
                        <p
                          style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                            color: "#27ae60", // Green color for positivity
                            marginBottom: "10px", // Space for the next line
                          }}
                        >
                          Just Enjoy :)
                        </p>
                      </>
                    )}
                  </div>

                </Tooltip>
              ),
            },
            {
              key: "advance settings",
              label: (
                <Tooltip title="" placement="right">
                  <div
                    onClick={() => {
                      setOpenAdvancedSettingsModal(true);
                    }}
                  >
                    <SettingOutlined /> Advanced Settings
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
          ],
        }}
      >
        <Button type="text" size="large">
          <MenuOutlined />
        </Button>
      </Dropdown>

      {openAdvancedSettingsModal && (
        <AdvancedSettingsModal
          open={openAdvancedSettingsModal}
          onModalClose={() => setOpenAdvancedSettingsModal(false)}
          readyToChat={readyToChat}
          chat={chat}
          onReload={onReload}
        />
      )}
    </>
  );
};
