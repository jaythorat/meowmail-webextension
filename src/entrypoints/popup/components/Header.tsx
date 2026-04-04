import { CatIcon } from './Icons';

const Header = () => (
  <header class="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0">
    <div class="flex items-center gap-2">
      <CatIcon class="text-amber" />
      <span class="font-display font-bold text-sm text-gradient-amber tracking-wide">
        MeowMail
      </span>
    </div>
    {/* Connection status badge — Step 3 */}
  </header>
);

export default Header;
