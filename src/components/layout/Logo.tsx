import React from "react";

interface LogoProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  showGigs?: boolean;
}

export function Logo({ className = "", height = 34, width = "auto", showGigs = true }: LogoProps) {
  return (
    <div className={`flex items-center select-none ${className}`} style={{ height, display: "inline-flex", alignItems: "center", gap: "8px" }}>
      <svg 
        viewBox="0 0 250 110" 
        style={{ height: "100%", width, display: "block" }}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main Background Gold Rect with slightly rounded corners */}
        <rect x="5" y="15" width="145" height="80" rx="6" fill="#DFB122" />
        
        {/* "MAIN" bold condensed caps text */}
        <text 
          x="77" 
          y="74" 
          fill="#000000" 
          fontFamily="var(--font-heading)" 
          fontWeight="900" 
          fontSize="44" 
          letterSpacing="1"
          textAnchor="middle"
        >
          MAIN
        </text>
        
        {/* "HR" Cursive script text in deep rust red, overlapping the rect tail */}
        <text 
          x="146" 
          y="78" 
          fill="#AF382B" 
          fontFamily="var(--font-cursive)" 
          fontSize="86" 
          fontWeight="normal"
        >
          HR
        </text>
      </svg>
      {showGigs && (
        <span 
          style={{ 
            fontFamily: "var(--font-heading)",
            fontWeight: 900, 
            fontSize: "1.45rem", 
            letterSpacing: "-0.5px", 
            background: "linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-accent-500) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
            display: "inline-block"
          }}
        >
          Gigs
        </span>
      )}
    </div>
  );
}
