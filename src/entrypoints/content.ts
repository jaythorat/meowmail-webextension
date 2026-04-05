export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main() {
    const ICON_SIZE = 20;
    const ICON_CLASS = 'meowmail-fill-icon';
    const FILLED_ATTR = 'data-meowmail-filled';

    // Use Map (not WeakMap) so we can iterate for cleanup/reposition
    const iconMap = new Map<HTMLInputElement, HTMLElement>();

    // --- Icon creation ---
    function createIcon(input: HTMLInputElement): HTMLElement {
      const icon = document.createElement('div');
      icon.className = ICON_CLASS;
      icon.title = 'Fill with MeowMail address';
      icon.setAttribute('role', 'button');
      icon.setAttribute('aria-label', 'Fill with MeowMail address');

      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', String(ICON_SIZE));
      svg.setAttribute('height', String(ICON_SIZE));
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');

      const path1 = document.createElementNS(NS, 'path');
      path1.setAttribute('d', 'M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.1 6.27-.46.7 1.07.68 2.97-.1 4.2.58 1.05.9 2.25.83 3.5-.17 3.08-2.77 5.54-5.8 5.5H8.8C5.77 18.04 3.17 15.58 3 12.5c-.07-1.25.25-2.45.83-3.5-.78-1.23-.8-3.13-.1-4.2C4.97 3.16 8.22 3.26 10 5.26 10.65 5.09 11.33 5 12 5z');

      const eye1 = document.createElementNS(NS, 'circle');
      eye1.setAttribute('cx', '9');
      eye1.setAttribute('cy', '12');
      eye1.setAttribute('r', '1');
      eye1.setAttribute('fill', 'currentColor');

      const eye2 = document.createElementNS(NS, 'circle');
      eye2.setAttribute('cx', '15');
      eye2.setAttribute('cy', '12');
      eye2.setAttribute('r', '1');
      eye2.setAttribute('fill', 'currentColor');

      const mouth = document.createElementNS(NS, 'path');
      mouth.setAttribute('d', 'M10 15.5c.5.3 1 .5 2 .5s1.5-.2 2-.5');
      mouth.setAttribute('stroke-width', '1.5');

      svg.append(path1, eye1, eye2, mouth);
      icon.appendChild(svg);

      icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fillField(input);
      });

      return icon;
    }

    // --- Position icon inside the input field (right side) ---
    function positionIcon(input: HTMLInputElement, icon: HTMLElement) {
      const rect = input.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      icon.style.position = 'absolute';
      icon.style.top = `${rect.top + scrollY + (rect.height - ICON_SIZE) / 2}px`;
      icon.style.left = `${rect.right + scrollX - ICON_SIZE - 8}px`;
      icon.style.zIndex = '2147483647';
    }

    // --- Fill the input with the current MeowMail address ---
    async function fillField(input: HTMLInputElement) {
      try {
        const address = await browser.runtime.sendMessage({ type: 'GET_CURRENT_ADDRESS' });
        if (!address) return;

        const email = `${address.localPart}@${address.domain}`;
        const nativeSetter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          'value',
        )?.set;

        if (nativeSetter) {
          nativeSetter.call(input, email);
        } else {
          input.value = email;
        }

        // Dispatch events so frameworks (React, Vue, Angular) detect the change
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        input.setAttribute(FILLED_ATTR, 'true');
        const icon = iconMap.get(input);
        if (icon) {
          icon.style.color = '#34d399';
          setTimeout(() => {
            icon.style.color = '';
          }, 1500);
        }
      } catch {
        // Extension context invalidated or no address set
      }
    }

    // --- Detect email input fields ---
    function isEmailField(el: Element): el is HTMLInputElement {
      if (!(el instanceof HTMLInputElement)) return false;
      if (el.type === 'hidden' || el.type === 'password') return false;

      if (el.type === 'email') return true;
      if (el.autocomplete === 'email') return true;

      const name = (el.name || '').toLowerCase();
      const id = (el.id || '').toLowerCase();
      const placeholder = (el.placeholder || '').toLowerCase();

      const emailPatterns = ['email', 'e-mail', 'mail'];
      const check = (val: string) => emailPatterns.some((p) => val.includes(p));

      return check(name) || check(id) || check(placeholder);
    }

    // --- Check if input is visible and in the DOM ---
    function isInputVisible(input: HTMLInputElement): boolean {
      if (!document.body.contains(input)) return false;
      const style = getComputedStyle(input);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (input.offsetWidth === 0 || input.offsetHeight === 0) return false;
      return true;
    }

    // --- Remove an icon for an input ---
    function removeIcon(input: HTMLInputElement) {
      const icon = iconMap.get(input);
      if (icon) {
        icon.remove();
        iconMap.delete(input);
      }
    }

    // --- Clean up icons for inputs no longer in the DOM or hidden ---
    function cleanupStaleIcons() {
      for (const [input] of iconMap) {
        if (!isInputVisible(input)) {
          removeIcon(input);
        }
      }
    }

    // --- Scan and attach icons ---
    function scanFields() {
      const inputs = document.querySelectorAll('input');
      for (const input of inputs) {
        if (!isEmailField(input)) continue;
        if (iconMap.has(input)) continue;
        if (!isInputVisible(input)) continue;

        const icon = createIcon(input);
        iconMap.set(input, icon);
        document.body.appendChild(icon);
        positionIcon(input, icon);
      }
    }

    // --- Reposition all visible icons ---
    function repositionAll() {
      for (const [input, icon] of iconMap) {
        if (!isInputVisible(input)) {
          icon.style.display = 'none';
          continue;
        }
        icon.style.display = '';
        positionIcon(input, icon);
      }
    }

    // --- Listen for messages from background (context menu fill, clipboard copy) ---
    browser.runtime.onMessage.addListener((message: { type: string; text?: string }) => {
      if (message.type === 'FILL_ACTIVE_FIELD') {
        const active = document.activeElement;
        if (active instanceof HTMLInputElement && isEmailField(active)) {
          fillField(active);
        } else {
          const inputs = document.querySelectorAll('input');
          for (const input of inputs) {
            if (isEmailField(input)) {
              fillField(input);
              break;
            }
          }
        }
      } else if (message.type === 'COPY_TO_CLIPBOARD' && message.text) {
        navigator.clipboard.writeText(message.text).catch(() => {});
      }
    });

    // --- Inject styles ---
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .${ICON_CLASS} {
        width: ${ICON_SIZE}px;
        height: ${ICON_SIZE}px;
        cursor: pointer;
        color: #f5a623;
        opacity: 0.7;
        transition: opacity 0.2s, transform 0.2s, color 0.3s;
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .${ICON_CLASS}:hover {
        opacity: 1;
        transform: scale(1.15);
      }
    `;
    document.head.appendChild(styleEl);

    // --- Initial scan ---
    scanFields();

    // --- Observe DOM changes: scan new inputs, clean up removed ones, reposition ---
    const observer = new MutationObserver(() => {
      cleanupStaleIcons();
      scanFields();
      repositionAll();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    // --- Reposition on scroll/resize ---
    window.addEventListener('scroll', repositionAll, { passive: true });
    window.addEventListener('resize', repositionAll, { passive: true });
  },
});
