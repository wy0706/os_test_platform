interface TransformOptions {
  pageIndexKey?: string; // 后端分页字段名，默认 page_index
  pageSizeKey?: string; // 后端分页字段名，默认 page_size
}

export function transformParams(params: any, options: TransformOptions = {}) {
  const { params: param, sort } = params;

  return {
    ...param,
    [options.pageIndexKey || "page_index"]: param.current,
    [options.pageSizeKey || "page_size"]: param.pageSize,
    sort,
    current: null,
    pageSize: null,
  };
}
