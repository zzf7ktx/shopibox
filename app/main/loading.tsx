import { CgSpinnerTwoAlt } from "react-icons/cg";

export default function Loading() {
  return (
    <div className="h-[calc(100vh-48px)] w-full flex items-center justify-center">
      <CgSpinnerTwoAlt className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary" />
    </div>
  );
}
