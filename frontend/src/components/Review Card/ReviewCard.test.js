import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewCard, { formatReviewDate } from './ReviewCard';

afterEach(cleanup);

const review = {
  id: 'r1',
  authorName: 'Jane S.',
  rating: 4,
  title: 'A joy to work with',
  body: 'Sunika understood the brief immediately.',
  role: 'Small business owner',
  subject: 'Branding',
  likes: 3,
  createdAt: { seconds: 1_700_000_000 },
};

describe('formatReviewDate', () => {
  it('formats a Firestore timestamp', () => {
    expect(formatReviewDate({ seconds: 1_700_000_000, toDate: () => new Date('2023-11-14T22:13:20Z') }))
      .toMatch(/2023/);
  });

  it('returns an empty string rather than "Invalid Date" for junk', () => {
    expect(formatReviewDate(null)).toBe('');
    expect(formatReviewDate('not a date')).toBe('');
  });
});

describe('ReviewCard', () => {
  it('renders the author, title and body', () => {
    render(<ReviewCard review={review} />);
    expect(screen.getByText('Jane S.')).toBeTruthy();
    expect(screen.getByText('A joy to work with')).toBeTruthy();
    expect(screen.getByText(/understood the brief/)).toBeTruthy();
  });

  it('shows the like count and reports the pressed state to assistive tech', () => {
    render(<ReviewCard review={review} liked />);
    const like = screen.getByRole('button', { name: /remove your like/i });
    expect(like.getAttribute('aria-pressed')).toBe('true');
    expect(like.textContent).toContain('3');
  });

  it('calls onToggleLike with the review id', async () => {
    const onToggleLike = vi.fn();
    render(<ReviewCard review={review} onToggleLike={onToggleLike} />);
    await userEvent.click(screen.getByRole('button', { name: /^like/i }));
    expect(onToggleLike).toHaveBeenCalledWith('r1');
  });

  it('hides all interaction in the compact home-page variant', () => {
    // The compact card is decoration on the landing page; a like button there would
    // write to Firestore from a context with no way to show the result.
    render(<ReviewCard review={review} variant="compact" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('keeps a failed reply in the box instead of discarding what was typed', async () => {
    const onSubmitComment = vi.fn().mockResolvedValue(false); // submit rejected
    render(<ReviewCard review={review} onSubmitComment={onSubmitComment} />);

    await userEvent.click(screen.getByRole('button', { name: /reply/i }));
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Bob');
    await userEvent.type(screen.getByPlaceholderText('Add a reply…'), 'Agreed!');
    await userEvent.click(screen.getByRole('button', { name: /post reply/i }));

    expect(onSubmitComment).toHaveBeenCalledWith('r1', { authorName: 'Bob', body: 'Agreed!' });
    expect(screen.getByPlaceholderText('Add a reply…').value).toBe('Agreed!');
  });

  it('clears the reply box once the reply is accepted', async () => {
    const onSubmitComment = vi.fn().mockResolvedValue(true);
    render(<ReviewCard review={review} onSubmitComment={onSubmitComment} />);

    await userEvent.click(screen.getByRole('button', { name: /reply/i }));
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Bob');
    await userEvent.type(screen.getByPlaceholderText('Add a reply…'), 'Agreed!');
    await userEvent.click(screen.getByRole('button', { name: /post reply/i }));

    // The clear happens after an awaited promise, so it lands a tick after the click
    // settles, waitFor rather than a bare assertion.
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Add a reply…').value).toBe(''));
  });

  it('badges a reply from the owner so it is not mistaken for a stranger', async () => {
    const comments = [
      { id: 'c1', authorName: 'Sunika', body: 'Thank you!', fromOwner: true, createdAt: { seconds: 1 } },
    ];
    render(<ReviewCard review={review} comments={comments} />);
    await userEvent.click(screen.getByRole('button', { name: /1 reply/i }));
    expect(screen.getByText('Artist')).toBeTruthy();
    expect(screen.getByText('Thank you!')).toBeTruthy();
  });

  /*
   * The reveal opt-in, guarded because getting it wrong hides content silently.
   *
   * [data-reveal] is `opacity: 0` in Theme.css until useReveal's observer adds
   * `.is-revealed`. A card that sets the attribute by default is therefore invisible
   * on every page that does not run that hook, which is what emptied the home page's
   * review strip. The default must stay off.
   */
  it('does not mark itself for scroll-reveal by default', () => {
    render(<ReviewCard review={review} />);
    expect(document.querySelector('[data-reveal]')).toBeNull();
  });

  it('marks itself for scroll-reveal only when the page asks', () => {
    render(<ReviewCard review={review} reveal index={2} />);
    const el = document.querySelector('[data-reveal]');
    expect(el).toBeTruthy();
    expect(el.style.getPropertyValue('--reveal-delay')).toBe('0.12s');
  });

  it('does not badge an ordinary reply', async () => {
    const comments = [
      { id: 'c1', authorName: 'Bob', body: 'Same here.', createdAt: { seconds: 1 } },
    ];
    render(<ReviewCard review={review} comments={comments} />);
    await userEvent.click(screen.getByRole('button', { name: /1 reply/i }));
    expect(screen.queryByText('Artist')).toBeNull();
  });
});
