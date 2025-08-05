// const fs = require('fs').promises; // 使用promises API版本
import fs from "fs/promises";

let source = [
  {
    moduleName: "task-management",
    label: "任务管理",
    children: [
      {
        pageName: "test-requirement",
        label: "测试需求",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
      {
        pageName: "test-task",
        label: "测试任务",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
      {
        pageName: "test-task-one",
        label: "测试任务",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
      // {
      //   pageName: "test-execution",
      //   label: "测试执行",
      //   fileds: [
      //     {
      //       title: "名称",
      //       dataIndex: "title",
      //     },
      //     {
      //       title: "创建时间",
      //       dataIndex: "createTime",
      //     },
      //   ],
      // },
      // {
      //   pageName: "test-execution-result",
      //   label: "测试执行结果",
      //   fileds: [
      //     {
      //       title: "名称",
      //       dataIndex: "title",
      //     },
      //     {
      //       title: "创建时间",
      //       dataIndex: "createTime",
      //     },
      //   ],
      // },
      // {
      //   pageName: "test-report",
      //   label: "测试报告",
      //   fileds: [
      //     {
      //       title: "名称",
      //       dataIndex: "title",
      //     },
      //     {
      //       title: "创建时间",
      //       dataIndex: "createTime",
      //     },
      //   ],
      // },
    ],
  },
  {
    moduleName: "case-management",
    label: "用例管理",
    children: [
      {
        pageName: "case-library",
        label: "用例执行",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
      {
        pageName: "test-case",
        label: "测试用例",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
      {
        pageName: "test-case-example",
        label: "示例测试库",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
      {
        pageName: "test-sequence",
        label: "序列编辑",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
      {
        pageName: "test-sequence-integration",
        label: "序列集成",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
    ],
  },
  {
    moduleName: "equipment-management",
    label: "设备管理",
    children: [
      {
        pageName: "equipment-library",
        label: "设备库",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
    ],
  },
  // {
  //   moduleName: "tool-management",
  //   label: "检测工具",
  //   children: [
  //     {
  //       pageName: "ide-tool",
  //       label: "集成开发环境",
  //       fileds: [
  //         {
  //           title: "名称",
  //           dataIndex: "title",
  //         },
  //         {
  //           title: "创建时间",
  //           dataIndex: "createTime",
  //         },
  //       ],
  //     },
  //     {
  //       pageName: "deploy-tool",
  //       label: "部署工具",
  //       fileds: [
  //         {
  //           title: "名称",
  //           dataIndex: "title",
  //         },
  //         {
  //           title: "创建时间",
  //           dataIndex: "createTime",
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    moduleName: "system-management",
    label: "系统管理",
    children: [
      // {
      //   pageName: "user-management",
      //   label: "用户管理",
      //   fileds: [
      //     {
      //       title: "名称",
      //       dataIndex: "title",
      //     },
      //     {
      //       title: "创建时间",
      //       dataIndex: "createTime",
      //     },
      //   ],
      // },
      // {
      //   pageName: "role-management",
      //   label: "角色管理",
      //   fileds: [
      //     {
      //       title: "名称",
      //       dataIndex: "title",
      //     },
      //     {
      //       title: "创建时间",
      //       dataIndex: "createTime",
      //     },
      //   ],
      // },
      // {
      //   pageName: "permission-management",
      //   label: "权限管理",
      //   fileds: [
      //     {
      //       title: "名称",
      //       dataIndex: "title",
      //     },
      //     {
      //       title: "创建时间",
      //       dataIndex: "createTime",
      //     },
      //   ],
      // },
      {
        pageName: "operation-log",
        label: "操作日志",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
      {
        pageName: "login-log",
        label: "登录日志",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
    ],
  },

  {
    moduleName: "backend-management",
    label: "后台管理",
    children: [
      {
        pageName: "user-management",
        label: "用户管理",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
      {
        pageName: "permission-management",
        label: "权限管理",
        fileds: [
          {
            title: "名称",
            dataIndex: "title",
          },
          {
            title: "创建时间",
            dataIndex: "createTime",
          },
        ],
      },
    ],
  },
];
function schemaTemplate(
  label,
  pageName,
  schemasColumns,
  schemasFormColumns,
  schemasDescriptions
) {
  return `
export const schemasTitle: any = {
  label: '${label}',
  value: '${pageName}',
};

export const schemasColumns: any = [
  ${schemasColumns}
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
    ${schemasFormColumns}
  ],
};

export const schemasDescriptions: any = [
  ${schemasDescriptions}
];

`;
}
function serviceTemplate(moduleName, pageName) {
  return `
import { request } from "@umijs/max";

const baseUrl = "/api/${moduleName}/${pageName}";

export async function getList(params: any) {
  const result: any = await request<{}>(\`\${baseUrl}/getList\`, {
    method: 'GET',
    params: params,
  });
  return result;
}

export async function createOne(data: any) {
  const result: any = await request<{}>(\`\${baseUrl}/createOne\`, {
    method: "POST",
    data: data,
  });
  return result;
}

export async function getAll(params: any) {
  const result: any = await request<{}>(\`\${baseUrl}/getAll\`, {
    method: "GET",
    params: params,
  });
  return result;
}

export async function getOne(id: any) {
  const result: any = await request<{}>(\`\${baseUrl}/getOne/\${id}\`, {
    method: "GET",
  });
  return result;
}

export async function updateOne(data: any) {
  const result: any = await request<{}>(\`\${baseUrl}/updateOne\`, {
    method: "POST",
    data: data,
  });
  return result;
}

export async function deleteOne(id: any) {
  const result: any = await request<{}>(\`\${baseUrl}/deleteOne/\${id}\`, {
    method: "DELETE",
  });
  return result;
}

export async function deleteBatch(ids: any) {
  const result: any = await request<{}>(\`\${baseUrl}/deleteBatch\`, {
    method: "DELETE",
    data: ids,
  });
  return result;
}
`;
}

function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function indexTemplate(moduleName, pageName, testData) {
  return `
import {
  createOne,
  deleteOne,
  getList,
  getOne,
  updateOne,
} from "@/services/${moduleName}/${pageName}.service";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  BetaSchemaForm,
  PageContainer,
  ProDescriptions,
  ProTable,
  TableDropdown
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Form, message, Modal } from "antd";
import React, { useRef } from "react";
import {
  schemasColumns,
  schemasDescriptions,
  schemasForm,
  schemasTitle,
} from "./schemas";

const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isUpdate: false,
    isUpdateModalOpen: false,
    updateValue: {},
    formSchema: schemasForm,
    isPreviewModalOpen: false,
    detailsId: null,
    descriptionsColumns: schemasDescriptions,
    columns: schemasColumns.concat([
    {
        title: "操作",
        valueType: "option",
        key: "option",
        width: 180,
        render: (text: any, record: any, index: any, action: any) => [
          <Button
            color="primary"
            variant="link"
            key="preview"
            icon={<EyeOutlined />}
            onClick={() => {
              setState({
                detailsId: record.id,
                isPreviewModalOpen: true,
              });
            }}
          >
            详情
          </Button>,
          <Button
            color="primary"
            variant="link"
            key="edit"
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue(record);
              setState({
                updateValue: record,
                isUpdate: true,
                isUpdateModalOpen: true,
              });
            }}
          >
            编辑
          </Button>,
          <TableDropdown
            key={index}
            onSelect={(key: string) => {
              console.log("key----", key);
              console.log(key);
              switch (key) {
                case "delete":
                  Modal.confirm({
                    title: "确认删除吗？",
                    onOk: async () => {
                      await deleteOne(record.id);
                      if (actionRef.current) {
                        actionRef.current.reload();
                      }
                    },
                  });
                  return;
                default:
                  return;
              }
            }}
            menus={[{ key: "delete", name: "删除" }]}
          />,
        ],
      },
    ]),
  });
  const {
    columns,
    title,
    isUpdate,
    isUpdateModalOpen,
    updateValue,
    formSchema,
    isPreviewModalOpen,
    detailsId,
    descriptionsColumns,
  } = state;
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [${testData}],
        total: 1,
        success: true,
      };
    }
  };

  return (
    <PageContainer>
      <ProTable<any>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={requestData}
        rowKey="id"
        pagination={{
          pageSize: 10,
          onChange: (page) => requestData,
        }}
        headerTitle={title.label}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setState({
                isUpdate: false,
                isUpdateModalOpen: true,
              });
            }}
            type="primary"
          >
            新建
          </Button>,
        ]}
      />
      <Modal
        title={isUpdate ? "编辑" : "新建"}
        open={isUpdateModalOpen}
        onCancel={() => {
          setState({ isUpdateModalOpen: false });
        }}
        footer={null}
        width={800}
      >
        <BetaSchemaForm<any>
          {...formSchema}
          defaultValue={updateValue}
          form={form}
          onFinish={async (value) => {
            if (isUpdate) {
              value.id = updateValue.id;
              const res: any = await updateOne({
                ...value,
                id: updateValue.id,
              });
              if (res.code === "0") {
                message.success("操作成功");
                setState({ isUpdateModalOpen: false });
              } else {
                return;
              }
            } else {
              const res: any = await createOne({ ...value, config: "{}" });
              if (res.code === "0") {
                message.success("操作成功");
                setState({ isUpdateModalOpen: false });
              } else {
                return;
              }
            }
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      </Modal>

      <Modal
        title="详情"
        open={isPreviewModalOpen}
        onCancel={() => {
          setState({ isPreviewModalOpen: false });
        }}
        footer={null}
        width={800}
      >
        <ProDescriptions
          columns={descriptionsColumns}
          request={async () => {
            try {
              const res = await getOne(detailsId);
              return res;
            } catch {
              return {
                data: ${testData},
                success: true,
              };
            }
          }}
        ></ProDescriptions>
      </Modal>
    </PageContainer>
  );
};

export default Page;

`;
}

await fs.mkdir(`./results/others`, { recursive: true });

await fs.mkdir(`./results/others/routes`, { recursive: true });

async function generation() {
  let resourceList = `const resourceList = [`;

  const promise = source.map(async (item) => {
    let routesContent = `const routes = 
{
    path: '/${item.moduleName}',
    name: '${item.label}',
    icon: 'table',
    access: '${kebabToCamel(item.moduleName)}',
    routes: [
`;
    await fs.mkdir(`./results/services/${item.moduleName}`, {
      recursive: true,
    });
    resourceList += `{resourceCode:'${kebabToCamel(item.moduleName)}'},`;

    const promiseChildren = item.children.map(async (child) => {
      await fs.mkdir(`./results/pages/${item.moduleName}/${child.pageName}`, {
        recursive: true,
      });
      console.log(`${child.label}页面目录创建成功！`);

      resourceList += `{resourceCode:'${kebabToCamel(child.pageName)}-edit'},`;
      routesContent += `
            {
                path: '/${item.moduleName}/${child.pageName}',
                name: '${child.label}',
                access: ['${kebabToCamel(
                  child.pageName
                )}-preview','${kebabToCamel(child.pageName)}-edit'],
                component: './${item.moduleName}/${child.pageName}',
            },

        `;
      try {
        await fs.writeFile(
          `./results/pages/${item.moduleName}/${child.pageName}/index.less`,
          ``
        );
        console.log(`${child.label}/index.less文件创建成功！`);
        let testData = `{id: 1,`;
        let schemasColumns = ``;
        let schemasDescriptions = ``;
        let schemasFormColumns = ``;
        child.fileds.forEach((filed) => {
          testData += `${filed.dataIndex}: '测试数据',`;
          schemasColumns += `
  {
    title: "${filed.title}",
    dataIndex: "${filed.dataIndex}",
    ellipsis: true,
    sorter: true,
  },`;

          schemasDescriptions += `
  {
    title: "${filed.title}",
    key: "${filed.dataIndex}",
    dataIndex: "${filed.dataIndex}",
    copyable: true,
    ellipsis: true,
  },`;
          schemasFormColumns += `
    {
      title: "${filed.title}",
      dataIndex: "${filed.dataIndex}",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必填项",
          },
        ],
      },
    },
  `;
        });
        testData = testData + "}";
        await fs.writeFile(
          `./results/pages/${item.moduleName}/${child.pageName}/schemas.ts`,
          schemaTemplate(
            child.label,
            kebabToCamel(child.pageName),
            schemasColumns,
            schemasFormColumns,
            schemasDescriptions
          )
        );
        console.log(`${child.label}/schemas.ts文件创建成功！`);
        await fs.writeFile(
          `./results/pages/${item.moduleName}/${child.pageName}/index.tsx`,
          indexTemplate(item.moduleName, child.pageName, testData)
        );
        console.log(`${child.label}/index.tsx文件创建成功！`);
        await fs.writeFile(
          `./results/services/${item.moduleName}/${child.pageName}.service.ts`,
          serviceTemplate(
            kebabToCamel(item.moduleName),
            kebabToCamel(child.pageName)
          )
        );
        console.log(`${child.label}/service文件创建成功！`);
      } catch (err) {
        console.error(err);
      }
    });
    await Promise.all(promiseChildren);
    routesContent =
      routesContent +
      `
    ],
},`;
    await fs.writeFile(
      `./results/others/routes/${item.moduleName}.ts`,
      routesContent
    );
    console.log(`routes文件创建成功！`);
  });
  await Promise.all(promise);
  resourceList = resourceList + "]";

  await fs.writeFile(`./results/others/resourceList.ts`, resourceList);
  console.log(`resourceList文件创建成功！`);
}

await generation();
