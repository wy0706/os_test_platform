export const schemasTitle: any = {
  label: "示例测试库",
  value: "testCaseExample",
};

export const schemasColumns: any = [
  // {
  //   title: "编号",
  //   dataIndex: "index",
  //   search: false,
  //   key: "index",
  //   // sorter: true,
  // },
  {
    title: "名称",
    dataIndex: "title",
    ellipsis: true,
  },
  {
    title: "类型",
    dataIndex: "type",
    ellipsis: true,
    valueType: "select",
    fieldProps: {
      options: [
        { label: "Pre测试", value: 1 },
        { label: "UUT测试", value: 2 },
        { label: "Post测试", value: 3 },
      ],
    },
  },
  {
    title: "是否发布",
    dataIndex: "version",
    // search: false,
    sorter: true,
    valueType: "select",
    valueEnum: {
      1: {
        text: "✓",
        status: "Success",
      },
      0: {
        text: "✗",
        status: "Error",
      },
    },

    fieldProps: {
      options: [
        { label: "是", value: "1" },
        { label: "否", value: "0" },
      ],
    },
  },
];

export const schemasForm: any = {
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
      title: "名称",
      dataIndex: "title",
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
      title: "图片",
      dataIndex: "image",
      valueType: "upload",
      fieldProps: {
        name: "file",
        listType: "picture-card",
        maxCount: 1,
        accept: "image/*",
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必填项",
          },
        ],
      },
    },
  ],
};

export const schemasDescriptions: any = [
  {
    title: "名称",
    key: "title",
    dataIndex: "title",
    copyable: true,
    ellipsis: true,
  },
  {
    title: "图片",
    key: "image",
    dataIndex: "image",
  },
  {
    title: "创建时间",
    key: "createTime",
    dataIndex: "createTime",
    copyable: true,
    ellipsis: true,
  },
];

export const tree = [
  {
    title: "用户类",
    key: "1",
    level: 1,
    children: [
      {
        title: "测试序列中",
        key: "2",
        level: 2,
      },
      {
        title: "测试测试",
        key: "3",
        level: 2,
      },
    ],
  },
  {
    title: "系统类",
    key: "4",
    level: 1,
    children: [
      {
        title: "测试序列种类1",
        key: "34",
        level: 2,
        children: [
          {
            title: "测试序列种类2",
            key: "35",
            level: 3,
          },
        ],
      },
    ],
  },
];
// const columns1 = [
//   {
//     title: "编号",
//     dataIndex: "id",
//     // key: "id",
//     width: 120,
//     render: (text: string, record: UseCase) => (
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           backgroundColor: selectedRow === text ? "#e6f7ff" : "transparent",
//           padding: "4px 8px",
//           borderRadius: "4px",
//         }}
//       >
//         <div
//           style={{
//             width: 16,
//             height: 16,
//             borderRadius: 4,
//             backgroundColor: record.icon === "user" ? "#52c41a" : "#1890ff",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             marginRight: 8,
//             color: "white",
//             fontSize: 10,
//           }}
//         >
//           {record.icon === "user" ? (
//             <UserOutlined />
//           ) : (
//             <ThunderboltOutlined />
//           )}
//         </div>
//         {text}
//       </div>
//     ),
//   },
//   {
//     title: "标题",
//     // dataIndex: "title",
//     key: "title",
//     render: (text: string, record: UseCase) => (
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           backgroundColor:
//             selectedRow === record.id ? "#e6f7ff" : "transparent",
//           padding: "4px 8px",
//           borderRadius: "4px",
//         }}
//       >
//         <div
//           style={{
//             width: 16,
//             height: 16,
//             borderRadius: 4,
//             backgroundColor: record.icon === "user" ? "#52c41a" : "#1890ff",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             marginRight: 8,
//             color: "white",
//             fontSize: 10,
//           }}
//         >
//           {record.icon === "user" ? (
//             <UserOutlined />
//           ) : (
//             <ThunderboltOutlined />
//           )}
//         </div>
//         {text}
//       </div>
//     ),
//   },
//   {
//     title: "版本",
//     dataIndex: "version",
//     // key: "version",
//     width: 80,
//     render: (text: string, record: UseCase) => (
//       <div
//         style={{
//           backgroundColor:
//             selectedRow === record.id ? "#e6f7ff" : "transparent",
//           padding: "4px 8px",
//           borderRadius: "4px",
//         }}
//       >
//         {text}
//       </div>
//     ),
//   },
//   {
//     title: "重要程度",
//     dataIndex: "importance",
//     // key: "importance",
//     width: 100,
//     render: (text: string, record: UseCase) => (
//       <div
//         style={{
//           backgroundColor:
//             selectedRow === record.id ? "#e6f7ff" : "transparent",
//           padding: "4px 8px",
//           borderRadius: "4px",
//         }}
//       >
//         <Tag
//           color={text === "P0" ? "red" : text === "P1" ? "orange" : "blue"}
//         >
//           {text}
//         </Tag>
//       </div>
//     ),
//   },
//   {
//     title: "操作",
//     key: "action",
//     width: 80,
//     render: (text: string, record: UseCase) => (
//       <div
//         style={{
//           backgroundColor:
//             selectedRow === record.id ? "#e6f7ff" : "transparent",
//           padding: "4px 8px",
//           borderRadius: "4px",
//         }}
//       >
//         {record.id <= "DEMO-9" && (
//           <Dropdown
//             overlay={
//               <Menu>
//                 <Menu.Item key="edit">编辑</Menu.Item>
//                 <Menu.Item key="delete">删除</Menu.Item>
//               </Menu>
//             }
//             trigger={["click"]}
//           >
//             <Button type="text" icon={<MoreOutlined />} />
//           </Dropdown>
//         )}
//       </div>
//     ),
//   },
// ];
