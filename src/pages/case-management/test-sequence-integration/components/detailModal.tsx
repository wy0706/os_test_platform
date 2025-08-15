import { Modal } from "antd";
import { useEffect, useState } from "react";
import s from "../index.less";
// import { statusEnum } from "../schemas";

interface SetMemberModalProps {
  open: boolean;
  details?: any;
  onCancel?: () => void;
}

const DetailModal: React.FC<SetMemberModalProps> = ({
  open,
  onCancel,
  details,
}) => {
  const [data, setData] = useState<any>({});
  useEffect(() => {
    details && setData(details);
  }, [open]);
  return (
    <Modal
      title="序列集成详情"
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      footer={null}
      width={"50%"}
    >
      <div className={s.container}>
        <div className={s.items}>
          <div className={s.name}>名称:</div>
          <div>{data?.title || "-"}</div>
        </div>

        <div className={s.items}>
          <div className={s.name}>描述: </div>
          <div>{data?.title4 || "-"}</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>更新时间:</div>
          <div>{data?.createTime || "-"}</div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailModal;
