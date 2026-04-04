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

export const MailIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Svg>
);

export const PaperclipIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </Svg>
);

export const InboxIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Svg>
);

export const ArrowLeftIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </Svg>
);

export const TrashIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Svg>
);

export const DownloadIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </Svg>
);

export const ShieldIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </Svg>
);

export const FileIcon = ({ class: cls }: IconProps) => (
  <Svg class={cls}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
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
