import { Button, Modal } from "antd";
import { useEffect, useState } from "react";

interface PromptModalProps {
  open: boolean;
  onOk?: (values?: any) => void;
  onCancel?: () => void;
  onNo?: (values?: any) => void;
  type: any;
}

const PromptModal: React.FC<PromptModalProps> = ({
  open,
  onOk,
  onCancel,
  onNo,
  type,
}) => {
  const [title, setTitle] = useState("");
  useEffect(() => {
    const name =
      type == "add" ? "新建文件需要保存吗 ？" : "文件已经改动，需要保存吗 ？";

    setTitle(name);
  }, [open]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={() => {
        onCancel?.();
      }}
      footer={[
        <Button
          key="save"
          type="primary"
          style={{ marginRight: "10px" }}
          onClick={() => {
            onOk?.();
          }}
        >
          是
        </Button>,
        <Button
          key="nosave"
          danger
          style={{ marginRight: "10px" }}
          onClick={() => {
            onNo?.();
          }}
        >
          否
        </Button>,
        <Button
          key="cancel"
          onClick={() => {
            onCancel?.();
          }}
        >
          取消
        </Button>,
      ]}
    ></Modal>
  );
};

export default PromptModal;
