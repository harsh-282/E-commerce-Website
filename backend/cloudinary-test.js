import { v2 as cloudinary } from 'cloudinary';

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: 'dlvwjuaup',
  api_key: '893685211412866',
  api_secret: '_RzTh5qIzV-JuivbEcjCSmj8-ao',
  secure: true
});

async function run() {
  try {
    const imageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    console.log(`Uploading image from URL: ${imageUrl}...`);

    // 2. Upload an image
    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      public_id: 'cloudinary_onboarding_sample'
    });

    console.log('Upload successful!');
    console.log(`Secure URL: ${uploadResult.secure_url}`);
    console.log(`Public ID: ${uploadResult.public_id}`);

    // 3. Get image details
    console.log('\nFetching image details...');
    const details = await cloudinary.api.resource(uploadResult.public_id);
    console.log('--- Metadata ---');
    console.log(`Width: ${details.width}px`);
    console.log(`Height: ${details.height}px`);
    console.log(`Format: ${details.format}`);
    console.log(`File Size: ${details.bytes} bytes`);

    // 4. Transform the image
    // - fetch_format: 'auto' (f_auto) automatically delivers the image in the most optimal format (like WebP or AVIF) supported by the requesting browser.
    // - quality: 'auto' (q_auto) automatically optimizes the visual quality of the image to minimize file size while maintaining a high level of visual fidelity.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto',
      secure: true
    });

    console.log('\nDone! Click link below to see optimized version of the image. Check the size and the format.');
    console.log(transformedUrl);

  } catch (error) {
    console.error('Error during Cloudinary onboarding process:', error);
  }
}

run();
