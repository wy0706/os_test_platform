import { forwardRef } from "react";
import SequenceTablePage, {
  SequenceTablePageProps,
  TablePageRef,
} from "./sequenceTablePage";

const UutPage = forwardRef<TablePageRef, Omit<SequenceTablePageProps, "tab">>(
  (props, ref) => {
    return <SequenceTablePage ref={ref} {...props} tab="UUT" />;
  }
);

export type { TablePageRef };
export default UutPage;
