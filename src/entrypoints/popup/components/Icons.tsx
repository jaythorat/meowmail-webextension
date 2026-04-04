import type { ComponentChildren } from 'preact';

interface IconProps {
  class?: string;
}

const Svg = ({ class: cls, children }: { class?: string; children: ComponentChildren }) => (
  <svg
    class={cls}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const CopyIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Svg>
);

export const CheckIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const RefreshIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </Svg>
);

export const ClockIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Svg>
);

export const XIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);

export const ExternalLinkIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Svg>
);

export const CatIcon = ({ class: cls }: IconProps) => (
  <svg
    class={cls}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.1 6.27-.46.7 1.07.68 2.97-.1 4.2.58 1.05.9 2.25.83 3.5-.17 3.08-2.77 5.54-5.8 5.5H8.8C5.77 18.04 3.17 15.58 3 12.5c-.07-1.25.25-2.45.83-3.5-.78-1.23-.8-3.13-.1-4.2C4.97 3.16 8.22 3.26 10 5.26 10.65 5.09 11.33 5 12 5z" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
    <path d="M10 15.5c.5.3 1 .5 2 .5s1.5-.2 2-.5" strokeWidth="1.5" />
  </svg>
);
