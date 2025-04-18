import { cn } from "../../lib/utils";

interface Heading1Props {
  text: string;
  className?: string;
}

export default function Heading({ text, className }: Heading1Props) {
  return (
    <h1
      className={cn(
        "text-3xl p-3 md:text-xl lg:text-5xl text-white font-extrabold",
        className
      )}
    >
      {text}
    </h1>
  );
}
