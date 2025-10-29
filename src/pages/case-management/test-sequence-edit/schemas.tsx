export const schemasTitle: any = {
  label: "序列编辑",
  value: "testSequenceEdit",
};

const data = {
  code: 0,
  data: {
    para_cnt: 4,
    para_list: [
      {
        para_id: 1,
        para_unit: "",
        test_condition: ["供电型", "问问", "com", "byte"],
        test_result: ["供电型", "问问", "com", "byte"],
        temporary_variable: ["T1", "test"],
        contants: ["int"],
        paratype: [
          "test_condition",
          "test_result",
          "temporary_variable",
          "contants",
        ],
      },
      {
        para_id: 2,
        para_unit: "",
        paratype: ["operator"],
        operator: ["<", ">", "<=", ">=", "==", "!="],
      },
      {
        para_id: 3,
        para_unit: "",
        test_condition: ["供电型", "问问", "com", "byte"],
        test_result: ["供电型", "问问", "com", "byte"],
        temporary_variable: ["T1", "test"],
        contants: ["int"],
        paratype: [
          "test_condition",
          "test_result",
          "temporary_variable",
          "contants",
        ],
      },
      {
        para_id: 4,
        para_unit: "",
        paratype: ["Label"],
        Label: ["we"],
      },
    ],
  },
};
