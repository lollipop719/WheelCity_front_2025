/**
 * Review Service
 * Handles the complete review submission flow including S3 image uploads
 */

/**
 * Upload images to S3 and return public URLs
 * @param {string} shopId - The shop ID
 * @param {File[]} imageFiles - Array of image files to upload
 * @returns {Promise<string[]>} Array of public URLs
 */
async function uploadReviewImages(shopId, imageFiles) {
	if (!imageFiles || imageFiles.length === 0) {
		return [];
	}

	try {
		// Step 1: Get upload URLs from backend
		const filenames = imageFiles.map((file, index) => {
			const ext = file.name.split('.').pop() || 'jpg';
			return `review_${Date.now()}_${index}.${ext}`;
		});

		console.log('Requesting upload URLs for files:', filenames);
		const uploadData = await window.ReviewAPI.getUploadUrls(shopId, filenames);
		console.log('Received upload data:', uploadData);
		
		if (!uploadData.upload_urls || !uploadData.public_urls) {
			console.error('Invalid upload data structure:', uploadData);
			throw new Error('Invalid response from upload-urls endpoint');
		}

		// Step 2: Upload each image to S3
		console.log('Uploading', uploadData.upload_urls.length, 'images to S3...');
		const uploadPromises = uploadData.upload_urls.map((item, index) => {
			const uploadUrl = item.upload_url || item; // Handle both object and string format
			const imageFile = imageFiles[index];
			
			console.log(`Uploading image ${index + 1}/${uploadData.upload_urls.length} to S3...`);
			return window.ReviewAPI.uploadImageToS3(uploadUrl, imageFile)
				.then(() => {
					console.log(`Image ${index + 1} uploaded successfully`);
				})
				.catch((err) => {
					console.error(`Failed to upload image ${index + 1}:`, err);
					throw err;
				});
		});

		await Promise.all(uploadPromises);
		console.log('All images uploaded successfully');

		// Step 3: Return public URLs
		return uploadData.public_urls;
	} catch (error) {
		console.error('Error uploading images:', error);
		throw error;
	}
}

/**
 * Submit a complete review with images
 * @param {string} shopId - The shop ID
 * @param {Object} reviewData - Review data
 * @param {File[]} imageFiles - Optional array of image files
 * @returns {Promise<Object>} The submitted review
 */
async function submitReviewWithImages(shopId, reviewData, imageFiles = []) {
	try {
		// Step 1: Upload images if any
		let photoUrls = [];
		if (imageFiles && imageFiles.length > 0) {
			photoUrls = await uploadReviewImages(shopId, imageFiles);
		}

		// Step 2: Prepare review payload
		// Note: Backend expects specific format - see test_image_flow.py for reference
		const payload = {
			user_id: reviewData.user_id,
			enter: reviewData.enter === null ? null : Boolean(reviewData.enter),
			alone: reviewData.alone === null ? null : Boolean(reviewData.alone),
			comfort: reviewData.comfort === null ? null : Boolean(reviewData.comfort),
			ai_correct: {
				ramp: Boolean(reviewData.ramp),
				curb: Boolean(reviewData.curb),
			},
			photo_urls: photoUrls,
			review_text: reviewData.review_text || '',
		};

		console.log('Submitting review with payload:', JSON.stringify(payload, null, 2));

		// Step 3: Submit review to backend
		const result = await window.ReviewAPI.submitReview(shopId, payload);
		return result;
	} catch (error) {
		console.error('Error submitting review:', error);
		throw error;
	}
}

// Export functions
window.ReviewService = {
	uploadReviewImages,
	submitReviewWithImages,
};

