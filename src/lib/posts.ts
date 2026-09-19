import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export const PAGE_SIZE = 5;

export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('posts', ({ data }) => !import.meta.env.PROD || !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
