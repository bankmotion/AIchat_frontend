import { SaveOutlined } from "@ant-design/icons";
import { App, Button, Form, Modal, Slider, Space, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../../../appContext";
import {
  GenerationSetting,
  KOBOLD_AI_DEFAULT_GENERATION_SETTING,
  OPEN_AI_DEFAULT_GENERATION_SETTINGS,
  OPENROUTER_DEFAULT_GENERATION_SETTINGS,
} from "../../../../../shared/services/generation-setting";
import { UserConfig } from "../../../../../shared/services/user-config";

const { Title } = Typography;

interface ChatSettingsModalProps {
  open: boolean;
  onModalClose: () => void;
}

type FormValues = GenerationSetting;

export const GenerationSettingsModal: React.FC<ChatSettingsModalProps> = ({
  open,
  onModalClose,
}) => {
  const { config, updateConfig } = useContext(AppContext);
  const [activePreset, setActivePreset] = useState<string>("openrouter"); // Default preset
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    // Set OpenrouterAI settings as default when the modal opens
    if (open) {
      form.setFieldsValue(OPENROUTER_DEFAULT_GENERATION_SETTINGS);
    }
  }, [open]);

  const onFinish = (formValues: FormValues) => {
    const newConfig: Partial<UserConfig> = {
      ...config,
      generation_settings: formValues,
    };

    updateConfig(newConfig);
    onModalClose();
  };

  const handlePresetClick = (preset: string) => {
    setActivePreset(preset);
    if (preset === "openai") {
      form.setFieldsValue(OPEN_AI_DEFAULT_GENERATION_SETTINGS);
    } else if (preset === "koboldai") {
      form.setFieldsValue(KOBOLD_AI_DEFAULT_GENERATION_SETTING);
    } else {
      form.setFieldsValue(OPENROUTER_DEFAULT_GENERATION_SETTINGS);
    }
  };

  return (
    <Modal
      title="Generation Settings"
      open={open}
      okText={
        <span>
          <SaveOutlined /> Save Settings
        </span>
      }
      onOk={() => {
        form.submit();
      }}
      onCancel={onModalClose}
      width={800}
    >
      <div className="pb-1">
        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} form={form} onFinish={onFinish}>
          {/* Preset Buttons */}
          <Form.Item label="Preset settings" className="mb-6 pt-2">
            <Space.Compact block>
              <Button onClick={() => handlePresetClick("openai")}>OpenAI default</Button>
              <Button onClick={() => handlePresetClick("koboldai")}>KoboldAI default</Button>
              <Button onClick={() => handlePresetClick("openrouter")}>OpenrouterAI default</Button>
            </Space.Compact>
          </Form.Item>

          {/* Temperature */}
          <Form.Item
            className="pb-2"
            name="temperature"
            label="Temperature"
            help="The creativity of the answer. Lower value - the answers are more logical, but less creative. Higher value - the answers are more creative, but less logical."
          >
            <Slider marks={{ 0: "0", 2: "2" }} min={0} max={2} step={0.05} />
          </Form.Item>

          {/* Max New Tokens */}
          <Form.Item
            className="pb-2"
            name="max_new_token"
            label="Max new token"
            help="The maximum amount of tokens that a AI will generate to respond. One word is approximately 3-4 tokens. Set to 0 as unlimited."
          >
            <Slider marks={{ 0: "0", 1000: "1000" }} min={0} max={1000} step={5} />
          </Form.Item>

          {/* Context Size - Visible for OpenAI and KoboldAI */}
          {activePreset !== "openrouter" && (
            <Form.Item
              className="pb-2"
              name="context_length"
              label="Context Size"
              help={
                <>
                  <span>
                    How much will the AI remember. Context size also affects the speed of
                    generation. Lower this if you get memory error!
                  </span>
                  <br />
                  <span>
                    GPT-3.5 supports maximum 4096 context. GPT-4 and Claude support up to 8k
                    context.
                  </span>
                </>
              }
            >
              <Slider
                marks={{ 0: "0", 2048: "2048", 4096: "4096", 8192: "8192" }}
                min={0}
                max={8192}
                step={1}
              />
            </Form.Item>
          )}

          {/* Repetition Penalty - Visible for KoboldAI */}
          {activePreset === "koboldai" && (
            <Form.Item
              className="pb-2"
              name="repetition_penalty"
              label="Repetition Penalty"
              help="Repetition penalty is responsible for the penalty of repeated words. If the character is fixated on something or repeats the same phrase, then increasing this parameter will fix it. Do not set this to >1.2 for Pygmalion models."
            >
              <Slider marks={{ 1: "1", 1.5: "1.5" }} min={1} max={1.5} step={0.05} />
            </Form.Item>
          )}
        </Form>
      </div>
    </Modal>
  );
};
