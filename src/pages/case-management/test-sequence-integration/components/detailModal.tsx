import { message, Modal } from "antd";
import { useEffect, useState } from "react";
import s from "../index.less";
// import { statusEnum } from "../schemas";
import { getOne } from "@/services/case-management/test-sequence-integration.service";
interface SetMemberModalProps {
  open: boolean;
  details?: any;
  onCancel?: () => void;
  detailsId?: any;
}

const DetailModal: React.FC<SetMemberModalProps> = ({
  open,
  onCancel,
  details,
  detailsId,
}) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log("details", detailsId);
    if (detailsId) {
      getDetils(detailsId);
    }
  }, [open, detailsId]);

  const getDetils = async (id: any) => {
    try {
      setLoading(true);
      const { code, data, message: msg } = await getOne(id);
      if (code === 0) {
        setData(data);
      } else {
        message.error(msg || "获取详情失败");
      }
    } catch (error) {
      message.error("获取详情失败");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      title="序列集成详情"
      open={open}
      loading={loading}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { padding: 20 } }}
      footer={null}
      width={"50%"}
    >
      <div className={s.container}>
        <div className={s.items}>
          <div className={s.name}>名称:</div>
          <div>{data?.tpf_name || "-"}</div>
        </div>

        <div className={s.items}>
          <div className={s.name}>描述: </div>
          <div>{data?.Comments || "-"}</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>更新时间:</div>
          <div>{data?.Refresh_Time || "-"}</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>创建人:</div>
          <div>{data?.Auther || "-"}</div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailModal;
