import { forwardRef } from "react";
import SequenceTablePage, {
  SequenceTablePageProps,
  TablePageRef,
} from "./sequenceTablePage";

const PrePage = forwardRef<TablePageRef, Omit<SequenceTablePageProps, "tab">>(
  (props, ref) => {
    return <SequenceTablePage ref={ref} {...props} tab="Pre" />;
  }
);

export type { TablePageRef };
export default PrePage;
