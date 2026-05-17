import { useState } from "react";

export default function TaleebLogo({
  className = "",
  markClassName = "h-12 w-auto",
  alt = "Taleeb",
}) {
  const [missingLogo, setMissingLogo] = useState(false);

  if (missingLogo) {
    return (
      <span className={`font-black text-[#1557A6] ${className}`}>
        Taleeb
      </span>
    );
  }

  return (
    <img
      src="/taleeb-logo.png"
      alt={alt}
      className={`object-contain ${markClassName} ${className}`}
      onError={() => setMissingLogo(true)}
    />
  );
}
