import Heading from "./Heading";

export default function Loading() {
  return (
    <div className="h-[600px] w-screen animate-pulse flex justify-center items-center">
      <Heading text="Loading..." className="text-[#A8BBA3]" />
    </div>
  );
}
