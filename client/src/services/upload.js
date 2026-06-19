export async function uploadImage(file, type = 'profile') {
  if (!file) {
    throw new Error('No image file selected');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be smaller than 5MB');
  }

  const formData = new FormData();
  formData.append('image', file);

  const token = localStorage.getItem('bakibook_token');
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api/upload/${type}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Image upload failed');
  }

  return data.url;
}
