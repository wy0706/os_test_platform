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
      title="产品需求详情"
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      footer={null}
      width={"50%"}
    >
      {/* <ProCard split="vertical" style={{ height: "100%" }}>
        <ProDescriptions
          // layout="vertical"
          columns={schemasDescriptions}
          column={1}
          dataSource={{ id: 1, title: "测试数据", createTime: "测试数据" }}
          // request={async () => {
          //   try {
          //     const res = await getOne(detailsId);
          //     return res;
          //   } catch {
          //     return {
          //       data: { id: 1, title: "测试数据", createTime: "测试数据" },
          //       success: true,
          //     };
          //   }
          // }}
        ></ProDescriptions>
      </ProCard> */}
      <div className={s.container}>
        <div className={s.items}>
          <div className={s.name}>标题:</div>
          <div>1222</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>描述:</div>
          <div>1222</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>关联测试任务:</div>
          <div>1222</div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailModal;
