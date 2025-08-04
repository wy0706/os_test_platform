import { Modal } from "antd";
import { useEffect, useState } from "react";
import s from "../index.less";
interface SetMemberModalProps {
  open: boolean;
  details: any;
  onCancel?: () => void;
}

const DetailModal: React.FC<SetMemberModalProps> = ({
  open,
  onCancel,
  details,
}) => {
  const [data, setData] = useState<any>({});
  useEffect(() => {
    console.log("details", details);

    console.log("详情");
    if (open) {
      setData(details);
    }
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
          <div>{data?.title || ""}</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>描述:</div>
          <div>1222</div>
        </div>
        <div className={s.items}>
          <div className={s.name}>已关联测试任务:</div>
          <div>1222</div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailModal;
