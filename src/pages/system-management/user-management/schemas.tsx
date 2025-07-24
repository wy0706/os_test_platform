import { updateOne } from "@/services/system-management/user-management.service";
import { Switch, message } from "antd";

export const userSchemasTitle: any = {
  label: "用户管理",
  value: "roleManagement",
};

export const userSchemasColumns: any = [
  // {
  //   title: "名称",
  //   dataIndex: "title",
  //   ellipsis: true,
  //   sorter: true,
  // },
  // {
  //   title: "创建时间",
  //   dataIndex: "createTime",
  //   ellipsis: true,
  //   sorter: true,
  // },
  { title: "姓名", dataIndex: "username", key: "username" },
  { title: "用户名", dataIndex: "email", key: "email" },
  { title: "所属角色", dataIndex: "email1", key: "email1" },
  { title: "密码", dataIndex: "email2", key: "email2" },
  { title: "手机号", dataIndex: "email3", key: "email3" },
  {
    title: "账户状态",
    dataIndex: "email4",
    key: "email4",
    render: (value: boolean, record: any, _, action) => (
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
      dataIndex: "username",
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
      dataIndex: "email",
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
      title: "手机号",
      dataIndex: "email3",
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
      dataIndex: "email1",
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
            required: true,
            message: "此项为必选项",
          },
        ],
      },
    },

    // {
    //   title: "创建时间",
    //   dataIndex: "createTime",
    //   formItemProps: {
    //     rules: [
    //       {
    //         required: true,
    //         message: "此项为必填项",
    //       },
    //     ],
    //   },
    // },
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
