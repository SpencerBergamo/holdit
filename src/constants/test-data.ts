

export type Collection = {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  itemCount?: number;
};

export const testCollections: Collection[] = [
  { id: '1', name: 'Wishlist', description: 'Things I want to buy', isPublic: true, itemCount: 12 },
  { id: '2', name: 'Birthday', description: 'Gift ideas for my birthday', isPublic: true, itemCount: 8 },
  { id: '3', name: 'Kitchen', description: 'All the products I need for my kitchen', isPublic: true, itemCount: 15 },
  { id: '4', name: 'Bathroom', description: 'All the products I need for my bathroom', isPublic: false, itemCount: 6 },
  { id: '5', name: 'Living Room', description: 'All the products I need for my living room', isPublic: true, itemCount: 20 },
  { id: '6', name: 'Bedroom', description: 'All the products I need for my bedroom', isPublic: false, itemCount: 10 },
  { id: '7', name: 'Wishlist', description: 'Things I want to buy', isPublic: true, itemCount: 12 },
  { id: '8', name: 'Birthday', description: 'Gift ideas for my birthday', isPublic: true, itemCount: 8 },
  { id: '9', name: 'Kitchen', description: 'All the products I need for my kitchen', isPublic: true, itemCount: 15 },
  { id: '10', name: 'Bathroom', description: 'All the products I need for my bathroom', isPublic: false, itemCount: 6 },
  { id: '11', name: 'Living Room', description: 'All the products I need for my living room', isPublic: true, itemCount: 20 },
  { id: '12', name: 'Bedroom', description: 'All the products I need for my bedroom', isPublic: false, itemCount: 10 },
  { id: '13', name: 'Wishlist', description: 'Things I want to buy', isPublic: true, itemCount: 12 },
  { id: '14', name: 'Birthday', description: 'Gift ideas for my birthday', isPublic: true, itemCount: 8 },
  { id: '15', name: 'Kitchen', description: 'All the products I need for my kitchen', isPublic: true, itemCount: 15 },
  { id: '16', name: 'Bathroom', description: 'All the products I need for my bathroom', isPublic: false, itemCount: 6 },
  { id: '17', name: 'Living Room', description: 'All the products I need for my living room', isPublic: true, itemCount: 20 },
  { id: '18', name: 'Bedroom', description: 'All the products I need for my bedroom', isPublic: false, itemCount: 10 },
];