import { Modal } from "antd";
import { useEffect, useState } from "react";
import s from "../index.less";
import { schemasDescriptions } from "../schemas";
interface SetMemberModalProps {
  open: boolean;
  onSuccess?: (values: any) => void;
  onCancel?: () => void;
  onInnerCancel?: () => void; // 新增
}

const DetailModal: React.FC<SetMemberModalProps> = ({
  open,
  onSuccess,
  onCancel,
  onInnerCancel,
}) => {
  console.log("schemasDescriptions", schemasDescriptions);

  const [data, setData] = useState({});
  useEffect(() => {
    console.log("详情");
  }, [open]);
  return (
    <Modal
      title="测试任务详情"
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
          <div>1222</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>状态:</div>
          <div>1222</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>结果分布:</div>
          <div>1222</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>负责人:</div>
          <div>1222</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>描述: </div>
          <div>1222</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>创建时间:</div>
          <div>1222</div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailModal;
