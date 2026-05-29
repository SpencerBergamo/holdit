import type { Collection, CollectionWithSaveCount } from '@/types/collection';

const TEST_OWNER_ID = '00000000-0000-4000-8000-000000000001';
const TEST_TIMESTAMP = '2025-01-01T00:00:00.000Z';

function collection(
  partial: Pick<Collection, 'id' | 'name'> &
    Partial<Pick<Collection, 'description' | 'visible_to_friends'>>,
): Collection {
  return {
    owner_id: TEST_OWNER_ID,
    description: null,
    visible_to_friends: false,
    created_at: TEST_TIMESTAMP,
    updated_at: TEST_TIMESTAMP,
    ...partial,
  };
}

export const testCollections: Collection[] = [
  collection({
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Wishlist',
    description: 'Things I want to buy',
    visible_to_friends: true,
  }),
  collection({
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Birthday',
    description: 'Gift ideas for my birthday',
    visible_to_friends: true,
  }),
  collection({
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Kitchen',
    description: 'All the products I need for my kitchen',
    visible_to_friends: true,
  }),
  collection({
    id: '10000000-0000-4000-8000-000000000004',
    name: 'Bathroom',
    description: 'All the products I need for my bathroom',
  }),
  collection({
    id: '10000000-0000-4000-8000-000000000005',
    name: 'Living Room',
    description: 'All the products I need for my living room',
    visible_to_friends: true,
  }),
  collection({
    id: '10000000-0000-4000-8000-000000000006',
    name: 'Bedroom',
    description: 'All the products I need for my bedroom',
  }),
];

export const testCollectionsWithSaveCount: CollectionWithSaveCount[] = [
  { ...testCollections[0], save_count: 12 },
  { ...testCollections[1], save_count: 8 },
  { ...testCollections[2], save_count: 15 },
  { ...testCollections[3], save_count: 6 },
  { ...testCollections[4], save_count: 20 },
  { ...testCollections[5], save_count: 10 },
];
