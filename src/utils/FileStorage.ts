import { Id } from "../../convex/_generated/dataModel";


export const sendFileToStorage = async ({ url, file }: { url: string, file: File }): Promise<Id<'_storage'> | null> => {
  try {
    const mimeType = file.type || 'application/octet-stream';
    const result = await fetch(url, {
      method: "POST",
      headers: { 'Content-Type': mimeType },
      body: file,
    });

    if (!result.ok) throw new Error(result.statusText);

    const { storageId }: { storageId: Id<'_storage'> } = await result.json();
    return storageId;
  } catch (e) {
    console.error(e);
    return null;
  }
}