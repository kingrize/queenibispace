import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface CardProps extends HTMLMotionProps<"div"> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hoverEffect = false, children, ...props }, ref) => {
    
    const baseClasses = "glass-panel rounded-2xl overflow-hidden p-6 transition-all duration-300";
    const hoverClasses = hoverEffect ? "hover-lift cursor-pointer" : "";
    
    return (
      <motion.div
        ref={ref}
        className={`${baseClasses} ${hoverClasses} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = "Card";
