import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type EntityAvatarProps = {
  name: string;
  symbol: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-6 w-6 md:h-8 md:w-8 text-[10px] md:text-xs",
  md: "h-8 w-8 md:h-10 md:w-10 text-xs md:text-sm",
  lg: "h-10 w-10 md:h-12 md:w-12 text-sm md:text-base",
};

export function EntityAvatar({ name, symbol, logoUrl, size = "md" }: EntityAvatarProps) {
  const initials = symbol.slice(0, 2).toUpperCase();
  
  return (
    <Avatar className={sizeMap[size]}>
      {logoUrl && (
        <AvatarImage 
          src={logoUrl} 
          alt={`${name} logo`}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-primary/10 text-primary font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
