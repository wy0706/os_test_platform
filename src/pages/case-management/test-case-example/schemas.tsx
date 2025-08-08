export const schemasTitle: any = {
  label: "示例测试库",
  value: "testCaseExample",
};

export const schemasColumns: any = [
  {
    title: "编号",
    dataIndex: "id",
    search: false,
    // sorter: true,
  },
  {
    title: "标题",
    dataIndex: "title",
    ellipsis: true,
    sorter: true,
  },
  {
    title: "版本",
    dataIndex: "version",
    search: false,
  },
  {
    title: "重要程度",
    dataIndex: "importance",
    ellipsis: true,
    sorter: true,
    search: false,
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
