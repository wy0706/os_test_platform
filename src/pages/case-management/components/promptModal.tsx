import { Button, Modal } from "antd";
import { ReactNode, useMemo } from "react";

interface PromptModalProps {
  open: boolean;
  onOk?: (values?: any) => void;
  onCancel?: () => void;
  onNo?: (values?: any) => void;
  type: any; //'add' 'edit' 'empty'
  title?: any;
  customButtons?: ModalButton[]; // 可完全自定义按钮
  children?: ReactNode;
}
interface ModalButton {
  key: string;
  text: string | ReactNode;
  type?: "primary" | "default" | "dashed" | "link" | "text" | "ghost";
  danger?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
const PromptModal: React.FC<PromptModalProps> = ({
  open,
  onOk,
  onCancel,
  onNo,
  type,
  title,
  customButtons,
  children,
}) => {
  const modalTitle = useMemo(() => {
    if (title) return title;

    switch (type) {
      case "add":
        return "新建文件需要保存吗？";
      case "edit":
        return "文件已经改动，需要保存吗？";
      case "empty":
        return "您尚未创建测试流程，是否确认返回？";
      default:
        return "";
    }
  }, [type, title]);

  // 根据 type 生成默认按钮
  const defaultButtons: ModalButton[] = useMemo(() => {
    if (customButtons && customButtons.length > 0) return customButtons;

    if (type === "add" || type === "edit") {
      return [
        {
          key: "yes",
          text: "是",
          type: "primary",
          onClick: onOk,
          style: { marginRight: 10 },
        },
        {
          key: "no",
          text: "否",
          danger: true,
          onClick: onNo,
          style: { marginRight: 10 },
        },
        { key: "cancel", text: "取消", onClick: onCancel },
      ];
    }

    if (type === "empty") {
      return [
        {
          key: "cancel",
          text: "取消",
          onClick: onCancel,
          style: { marginRight: 10 },
        },
        { key: "confirm", text: "确认", type: "primary", onClick: onOk },
      ];
    }

    return [];
  }, [type, customButtons, onOk, onNo, onCancel]);

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={() => {
        onCancel?.();
      }}
      footer={defaultButtons.map((btn) => (
        <Button
          key={btn.key}
          type={btn.type}
          danger={btn.danger}
          style={btn.style}
          onClick={btn.onClick}
        >
          {btn.text}
        </Button>
      ))}
    >
      {children}
    </Modal>
  );
};

export default PromptModal;
