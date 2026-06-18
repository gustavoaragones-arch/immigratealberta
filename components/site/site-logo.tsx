import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  textClassName?: string;
  className?: string;
};

export function SiteLogo({
  textClassName = "text-[15px] font-medium tracking-tight text-stone-900",
  className,
}: Props) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 transition-opacity hover:opacity-80",
        className,
      )}
    >
      <Image
        src="/logo.png"
        alt=""
        width={43}
        height={86}
        className="h-9 w-auto shrink-0 md:h-auto md:w-auto"
        priority
      />
      <span className={textClassName}>ImmigrateAlberta</span>
    </Link>
  );
}
