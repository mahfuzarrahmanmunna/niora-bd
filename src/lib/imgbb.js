// lib/imgbb.js
export async function uploadToImgBB(imageBase64) {
  try {
    // Remove the data:image/...;base64, prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const formData = new FormData();
    formData.append('key', 'f2f3f75de26957d089ecdb402788644c');
    formData.append('image', base64Data);
    
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image to ImgBB');
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error.message || 'Unknown error uploading image');
    }
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw error;
  }
}