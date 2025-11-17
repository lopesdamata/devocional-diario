import Dexie, { type EntityTable } from 'dexie';
import type { OfflineVerse } from '../types';

// Fix: Switched from subclassing Dexie to creating a direct instance with type augmentation.
// This resolves an issue where TypeScript couldn't find 'version' or 'transaction' methods on the subclass.
export const db = new Dexie('BibleDB') as Dexie & {
    verses: EntityTable<OfflineVerse, 'id'>;
};

db.version(1).stores({
    verses: '++id, [version+book_abbrev+chapter], version',
});
