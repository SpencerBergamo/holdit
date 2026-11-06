import { supabase } from '@/utils/supabase';

const CAPTURES_BUCKET = 'captures';

function guessContentType(localUri: string): string {
   const lower = localUri.toLowerCase();
   if (lower.endsWith('.png')) return 'image/png';
   if (lower.endsWith('.webp')) return 'image/webp';
   return 'image/jpeg';
}

function extensionForContentType(contentType: string): string {
   if (contentType === 'image/png') return 'png';
   if (contentType === 'image/webp') return 'webp';
   return 'jpg';
}

function uniqueFileName(contentType: string): string {
   const id =
      typeof globalThis.crypto?.randomUUID === 'function'
         ? globalThis.crypto.randomUUID()
         : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
   return `${id}.${extensionForContentType(contentType)}`;
}

/**
 * Uploads a local camera/library photo to Storage, creates a Save with photo capture,
 * and links it to the given collection.
 */
export async function createSaveWithPhotoCapture(input: {
   localUri: string;
   collectionId: string;
}): Promise<{ saveId: string }> {
   const {
      data: { user },
      error: userError,
   } = await supabase.auth.getUser();

   if (userError) {
      throw userError;
   }
   if (!user) {
      throw new Error('You must be signed in to save items.');
   }

   const contentType = guessContentType(input.localUri);
   const response = await fetch(input.localUri);
   if (!response.ok) {
      throw new Error('Could not read the photo file.');
   }
   const arrayBuffer = await response.arrayBuffer();

   const storagePath = `${user.id}/${uniqueFileName(contentType)}`;

   const { error: uploadError } = await supabase.storage
      .from(CAPTURES_BUCKET)
      .upload(storagePath, arrayBuffer, {
         contentType,
         upsert: false,
      });

   if (uploadError) {
      throw uploadError;
   }

   const {
      data: { publicUrl },
   } = supabase.storage.from(CAPTURES_BUCKET).getPublicUrl(storagePath);

   const captureData = {
      source_type: 'photo' as const,
      url: null,
      photo_path: storagePath,
      manual_text: null,
   };

   const productSnapshot = {
      title: null,
      images: [publicUrl],
      primary_url: null,
      merchant_links: [],
      specs: {},
      price_cents: null,
      currency: null,
      category: null,
   };

   const { data: saveRow, error: saveError } = await supabase
      .from('saves')
      .insert({
         owner_id: user.id,
         capture_data: captureData,
         product_snapshot: productSnapshot,
         notes: null,
      })
      .select('id')
      .single();

   if (saveError) {
      throw saveError;
   }

   if (!saveRow?.id) {
      throw new Error('Save was not created.');
   }

   const { error: membershipError } = await supabase
      .from('collection_memberships')
      .insert({
         save_id: saveRow.id,
         collection_id: input.collectionId,
         added_by: user.id,
      });

   if (membershipError) {
      throw membershipError;
   }

   return { saveId: saveRow.id };
}
