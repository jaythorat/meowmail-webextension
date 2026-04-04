import type { AddressInfo } from '@/utils/types';
import CONFIG from '@/utils/config';
import { ExternalLinkIcon } from './Icons';

interface FooterProps {
  address: AddressInfo | null;
}

const Footer = ({ address }: FooterProps) => {
  const url = address
    ? `${CONFIG.API_BASE_URL}/inbox/${address.domain}/${address.localPart}`
    : CONFIG.API_BASE_URL;

  return (
    <footer class="shrink-0 border-t border-border-subtle px-4 py-2.5">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center gap-1.5 text-xs font-mono text-text-muted hover:text-amber transition-colors"
      >
        <span>Open full inbox</span>
        <ExternalLinkIcon class="w-3 h-3" />
      </a>
    </footer>
  );
};

export default Footer;
