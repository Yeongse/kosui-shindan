import type { AccordCode, NoteArticle, NoteSlug } from './schema';
import { NOTES_1 } from './notes/part-1';
import { NOTES_2 } from './notes/part-2';

/** §8.6 / §12.3 — 8香調のノート解説記事 */
export const NOTES: readonly NoteArticle[] = [...NOTES_1, ...NOTES_2];

export const NOTE_BY_SLUG: Record<string, NoteArticle> = Object.fromEntries(NOTES.map((n) => [n.slug, n]));

export const NOTE_BY_ACCORD: Record<AccordCode, NoteArticle> = Object.fromEntries(
  NOTES.map((n) => [n.accord, n]),
) as Record<AccordCode, NoteArticle>;

export function getNoteBySlug(slug: string): NoteArticle | undefined {
  return NOTE_BY_SLUG[slug];
}

export const NOTE_SLUGS: readonly NoteSlug[] = NOTES.map((n) => n.slug);
