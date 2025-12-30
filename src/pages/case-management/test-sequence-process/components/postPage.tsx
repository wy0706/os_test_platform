import { forwardRef } from "react";
import SequenceTablePage, {
  SequenceTablePageProps,
  TablePageRef,
} from "./sequenceTablePage";

const PostPage = forwardRef<TablePageRef, Omit<SequenceTablePageProps, "tab">>(
  (props, ref) => {
    return <SequenceTablePage ref={ref} {...props} tab="Post" />;
  }
);

export type { TablePageRef };
export default PostPage;
