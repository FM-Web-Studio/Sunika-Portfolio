import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Loading from './Loading';

afterEach(cleanup);

describe('Loading', () => {
  it('renders the message and a live region', () => {
    render(<Loading message="Checking access" showVerse={false} />);
    const status = screen.getByRole('status');
    expect(status).toBeTruthy();
    expect(status.textContent).toContain('Checking access');
  });

  it('renders a verse by default and omits it when asked', () => {
    const { unmount } = render(<Loading />);
    expect(screen.getByRole('status').querySelector('cite')).toBeTruthy();
    unmount();

    render(<Loading showVerse={false} />);
    expect(screen.getByRole('status').querySelector('cite')).toBeNull();
  });

  /*
   * The overlay must be a direct child of <body>, not of the container it was
   * rendered into.
   *
   * This is the regression guard for a real bug: Loading renders inside
   * AppLayout's .pageContent, which is `position: relative; z-index: 2` and so
   * creates a stacking context. That trapped the overlay, and the Footer, a sibling
   * at the same z-index but later in the DOM, painted over the bottom of it. No
   * z-index value on the overlay can fix that, only escaping the subtree can, so if
   * someone removes the portal the screen silently gets cut off again.
   */
  it('portals to document.body so no ancestor stacking context can clip it', () => {
    const { container } = render(<Loading showVerse={false} />);
    expect(container.firstChild).toBeNull();

    const status = screen.getByRole('status');
    expect(status.parentElement).toBe(document.body);
  });

  it('removes itself from the body on unmount', () => {
    const { unmount } = render(<Loading showVerse={false} />);
    expect(screen.queryByRole('status')).toBeTruthy();
    unmount();
    expect(screen.queryByRole('status')).toBeNull();
  });
});
