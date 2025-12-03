
import React, { HTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { User } from 'lucide-react';

const Avatar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(({ className, src, alt, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);

    if (hasError || !src) return null;

    return (
        <img
            ref={ref}
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className={cn("aspect-square h-full w-full object-cover", className)}
            {...props}
        />
    )
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-semibold",
      className
    )}
    {...props}
  >
    {children || <User className="h-1/2 w-1/2" />}
  </div>
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
