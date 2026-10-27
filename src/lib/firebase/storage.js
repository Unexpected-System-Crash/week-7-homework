import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { storage } from "@/src/lib/firebase/clientApp";

import { updateParkImageReference } from "@/src/lib/firebase/firestore";

export async function updateParkImage(parkId, image) {
    try {
      if (!parkId) {
        throw new Error("No restaurant ID has been provided.");
      }
  
      if (!image || !image.name) {
        throw new Error("A valid image has not been provided.");
      }
  
      const publicImageUrl = await uploadImage(parkId, image);
      await updateParkImageReference(parkId, publicImageUrl);
  
      return publicImageUrl;
    } catch (error) {
      console.error("Error processing request:", error);
    }
  }
  
  async function uploadImage(parkId, image) {
    const filePath = `images/${parkId}/${image.name}`;
    const newImageRef = ref(storage, filePath);
    await uploadBytesResumable(newImageRef, image);
  
    return await getDownloadURL(newImageRef);
  }
  
