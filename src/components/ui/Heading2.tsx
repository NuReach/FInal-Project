interface Heading2Props {
  text: string;
}
export default function Heading2({ text }: Heading2Props) {
  return (
    <h1 className="font-bold text-lg md:text-xl lg:text-xl text-black">
      {text}
    </h1>
  );
}
