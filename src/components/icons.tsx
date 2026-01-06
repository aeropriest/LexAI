import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M12 18a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4Z"></path>
        <path d="M12 8v2"></path>
        <path d="M12 14v-2"></path>
        <path d="m14.6 11.2-.8.8"></path>
        <path d="m9.4 11.2.8.8"></path>
    </svg>
  );
}
