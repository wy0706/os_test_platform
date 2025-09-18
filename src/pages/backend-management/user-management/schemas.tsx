import { updateOne } from "@/services/system-management/user-management.service";
import { Switch, message } from "antd";

export const userSchemasTitle: any = {
  label: "用户管理",
  value: "roleManagement",
};

export const userSchemasColumns: any = [
  { title: "姓名", dataIndex: "name", ellipsis: true },
  {
    title: "用户名",
    dataIndex: "username",
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: "所属角色",
    dataIndex: ["role_info", "name"], // 多级路径
    hideInSearch: true,
    ellipsis: true,
  },
  {
    title: "密码",
    dataIndex: "id",
    render: () => "******",
    hideInSearch: true,
  },
  { title: "手机号", dataIndex: "phone_num", ellipsis: true },
  {
    title: "账户状态",
    dataIndex: "is_active",
    hideInSearch: true,
    render: (value: boolean, record: any, _: any, action: any) => (
      <Switch
        checked={value}
        onChange={async (checked) => {
          console.log("checked", checked);
          const hide = message.loading("正在更新状态...");
          try {
            await updateOne({ ...record, email4: checked });
            // message.success("状态更新成功");
            action?.reload?.();
          } catch {
            // message.error("状态更新失败");
          }
          hide();
        }}
      />
    ),
  },
];

export const userSchemasForm: any = {
  layoutType: "Form",
  rowProps: {
    gutter: [16, 16],
  },
  colProps: {
    span: 12,
  },
  grid: true,
  columns: [
    {
      title: "姓名",
      dataIndex: "name",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必填项",
          },
        ],
      },
    },
    {
      title: "用户名",
      dataIndex: "username",
      formItemProps: {
        rules: [
          {
            required: false,
            message: "此项为必填项",
          },
        ],
      },
    },
    {
      title: "手机号",
      dataIndex: "phone_num",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必填项",
          },
          {
            pattern: /^1\d{10}$/,
            message: "手机号格式错误！",
          },
        ],
      },
    },
    {
      title: "角色",
      dataIndex: "role_id",
      valueType: "select",
      fieldProps: {
        options: [
          { label: "测试开发人员", value: "testadmin" },
          { label: "测试员", value: "developer" },
          { label: "主检工程师", value: "tester" },
          { label: "管理员", value: "admin" },
        ],
        placeholder: "请选择角色",
      },
      formItemProps: {
        rules: [
          {
            required: false,
            message: "此项为必选项",
          },
        ],
      },
    },
  ],
};

export const userSchemasDescriptions: any = [
  {
    title: "名称",
    key: "title",
    dataIndex: "title",
    copyable: true,
    ellipsis: true,
  },
  {
    title: "创建时间",
    key: "createTime",
    dataIndex: "createTime",
    copyable: true,
    ellipsis: true,
  },
];
