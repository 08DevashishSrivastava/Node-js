const ImageKit = require('@imagekit/nodejs').default;
const { toFile } = require('@imagekit/nodejs');

function isConfigured() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();
  return Boolean(
    privateKey &&
      !/^(your_|replace_|<|placeholder)/i.test(privateKey)
  );
}

function getClient() {
  if (!isConfigured()) {
    const error = new Error(
      'ImageKit is not configured. Replace the IMAGEKIT_PRIVATE_KEY placeholder in the project-root .env file with your rotated ImageKit private key, then restart the backend.'
    );
    error.statusCode = 503;
    error.expose = true;
    throw error;
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY.trim();
  return new ImageKit({ privateKey });
}

async function uploadImage(buffer, fileName) {
  const client = getClient();
  try {
    return await client.files.upload({
      file: await toFile(buffer, fileName),
      fileName,
      folder: '/node-js-app/posts',
      useUniqueFileName: true,
    });
  } catch (cause) {
    const error = new Error('ImageKit upload failed. Verify the backend credentials and ImageKit availability.');
    error.statusCode = 502;
    error.expose = true;
    error.cause = cause;
    throw error;
  }
}

async function deleteImage(fileId) {
  const client = getClient();
  try {
    return await client.files.delete(fileId);
  } catch (cause) {
    const error = new Error('ImageKit could not delete the uploaded image.');
    error.statusCode = 502;
    error.expose = true;
    error.cause = cause;
    throw error;
  }
}

module.exports = { uploadImage, deleteImage, isConfigured };