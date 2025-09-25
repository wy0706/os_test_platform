import { getCaseDetail } from "@/services/case-management/test-case-example.service";
import {
  ProDescriptions,
  ProDescriptionsActionType,
} from "@ant-design/pro-components";
import { message, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { reportDetail } from "../schemas";
interface SetMemberModalProps {
  open: boolean;
  details?: any;
  onCancel?: () => void;
  id: number | string;
}

const DetailModal: React.FC<SetMemberModalProps> = ({
  open,
  onCancel,
  details,
  id,
}) => {
  const actionRef = useRef<ProDescriptionsActionType>();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Record<string, any> | undefined>();
  useEffect(() => {
    if (!open || !id) {
      setDetail(undefined);
      return;
    }
    let alive = true; // 避免竞态（上一次请求晚到覆盖最新）
    setLoading(true);
    (async () => {
      try {
        const { code, data, message: msg } = await getCaseDetail(id);
        if (!alive) return;
        if (code !== 0) {
          message.error(msg || "获取详情失败");
          setDetail(undefined);
          return;
        }
        setDetail(data || {});
      } catch (e) {
        if (alive) {
          message.error("获取详情失败");
          setDetail(undefined);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      // 组件或参数变化时，中止对本次请求结果的处理
      alive = false;
    };
  }, [open, id]);

  return (
    <Modal
      title="测试库详情"
      open={open}
      destroyOnHidden
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { padding: 20 } }}
      footer={null}
      width={"50%"}
    >
      <ProDescriptions
        key={String(id)} // id 变化时强制重建，避免内部缓存
        column={3}
        columns={reportDetail}
        actionRef={actionRef}
        loading={loading}
        dataSource={detail}
      ></ProDescriptions>
    </Modal>
  );
};

export default DetailModal;
