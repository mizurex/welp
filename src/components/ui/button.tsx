import { cn } from "@/lib/utils";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "w-full mt-6 text-white font-light py-1 px-2 text-xs disabled:opacity-50 cursor-pointer disabled:cursor-default transition-all",
        spaceGrotesk.className,
        className
      )}
      style={{
        borderRadius: "14px",
        background: "linear-gradient(180deg,rgb(0, 0, 0) 0%,rgb(126, 126, 126) 100%)",
        
        fontSize: "1.1rem",
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button };
