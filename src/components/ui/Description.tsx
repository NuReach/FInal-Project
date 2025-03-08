import { cn } from "../../lib/utils";

interface DescriptionProps {
  text: string;
  className?: string;
}

export default function Description({ text, className }: DescriptionProps) {
  return <p className={cn("text-white ", className)}>{text}</p>;
}
