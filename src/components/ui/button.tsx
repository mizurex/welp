import { cn } from "@/lib/utils";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "w-full mt-6 text-white font-light py-2 px-4 hover:shadow-lg hover:brightness-110 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed border border-black/20 transition-all",
        spaceGrotesk.className,
        className
      )}
      style={{
        borderRadius: "14px",
        background: "linear-gradient(180deg,rgb(3, 7, 11) 0%,rgb(67, 69, 75) 100%)",
        boxShadow: "0 0px 1px rgba(108, 114, 123, 0.77)",
        fontSize: "1.1rem",
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button };
