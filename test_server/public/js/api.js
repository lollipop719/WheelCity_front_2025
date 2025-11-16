/**
 * API Service for Backend Communication
 * Handles all API calls to the backend server
 */

// Backend API base URL - update this to match your backend server
// For production, you may want to use an environment variable or config file
const API_BASE_URL = 'http://127.0.0.1:8000';

// API Key for backend authentication
// Update this to match your backend's API_KEY_INTERNAL
// Default is "dev-secret-key" - change this to match your backend .env file
const API_KEY = 'your_internal_api_key';

/**
 * Generic API request function
 */
async function apiRequest(endpoint, options = {}) {
	const url = `${API_BASE_URL}${endpoint}`;
	const config = {
		...options,
		headers: {
			'Content-Type': 'application/json',
			'X-API-Key': API_KEY,  // Add API key header for authentication
			...options.headers,
		},
	};

	try {
		const response = await fetch(url, config);
		
		if (!response.ok) {
			// Try to get detailed error message from backend
			let errorData;
			try {
				errorData = await response.json();
			} catch (e) {
				const text = await response.text().catch(() => '');
				errorData = { error: response.statusText, detail: text };
			}
			
			console.error('API request failed:', {
				status: response.status,
				statusText: response.statusText,
				url: url,
				error: errorData
			});
			
			// Extract detailed error message if available
			let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
			
			if (errorData) {
				if (errorData.detail) {
					// FastAPI validation errors
					if (Array.isArray(errorData.detail)) {
						const errors = errorData.detail.map(e => 
							`${e.loc ? e.loc.join('.') : 'field'}: ${e.msg || e.message || 'validation error'}`
						).join(', ');
						errorMessage = `Validation error: ${errors}`;
					} else if (typeof errorData.detail === 'string') {
						errorMessage = errorData.detail;
					} else {
						errorMessage = JSON.stringify(errorData.detail);
					}
				} else if (errorData.error) {
					errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
				} else if (errorData.message) {
					errorMessage = errorData.message;
				}
			}
			
			throw new Error(errorMessage);
		}

		return await response.json();
	} catch (error) {
		console.error('API request error:', error);
		throw error;
	}
}

/**
 * Get shop information by ID
 */
async function getShop(shopId) {
	return apiRequest(`/shops/${shopId}`);
}

/**
 * Create a new shop from place information
 */
async function createShop(placeInfo) {
	return apiRequest('/shops/', {
		method: 'POST',
		body: JSON.stringify({
			name: placeInfo.place_name,
			location: {
				type: 'Point',
				coordinates: [parseFloat(placeInfo.x), parseFloat(placeInfo.y)]
			},
			address: placeInfo.address_name || placeInfo.road_address_name,
			phone: placeInfo.phone,
			category: placeInfo.category_name,
		}),
	});
}

/**
 * Get or create shop by place information
 * This will create a shop if it doesn't exist
 * Note: You may want to implement shop lookup/search in your backend
 */
async function getOrCreateShop(placeInfo) {
	try {
		// For now, we'll create a shop
		// In production, you should implement shop lookup/search first
		// Example: Check if shop exists by coordinates/name, then create if not found
		const shop = await createShop(placeInfo);
		return shop;
	} catch (error) {
		console.error('Error creating/getting shop:', error);
		throw error;
	}
}

/**
 * Get S3 upload URLs for images
 */
async function getUploadUrls(shopId, filenames) {
	return apiRequest(`/reviews/${shopId}/upload-urls`, {
		method: 'POST',
		body: JSON.stringify({
			files: filenames,
		}),
	});
}

/**
 * Upload image to S3 using presigned URL
 */
async function uploadImageToS3(uploadUrl, imageFile) {
	// Determine content type
	const contentType = imageFile.type || getContentTypeFromFilename(imageFile.name);
	
	console.log('Uploading to S3:', {
		url: uploadUrl.substring(0, 100) + '...',
		contentType: contentType,
		fileSize: imageFile.size
	});
	
	try {
		const response = await fetch(uploadUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': contentType,
			},
			body: imageFile,
		});

		if (!response.ok) {
			const errorText = await response.text().catch(() => response.statusText);
			console.error('S3 upload failed:', {
				status: response.status,
				statusText: response.statusText,
				error: errorText
			});
			throw new Error(`Failed to upload image to S3: ${response.status} ${response.statusText}`);
		}

		console.log('S3 upload successful:', response.status);
		return response;
	} catch (error) {
		console.error('S3 upload error:', error);
		// Check if it's a CORS error
		if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
			throw new Error('S3 upload failed: CORS error. Please check S3 bucket CORS configuration.');
		}
		throw error;
	}
}

/**
 * Get content type from filename
 */
function getContentTypeFromFilename(filename) {
	const ext = filename.split('.').pop().toLowerCase();
	const contentTypes = {
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		webp: 'image/webp',
	};
	return contentTypes[ext] || 'image/jpeg';
}

/**
 * Get or create user by Kakao ID
 */
async function getOrCreateUserByKakao(kakaoId, email, name) {
	return apiRequest('/users/get-or-create', {
		method: 'POST',
		body: JSON.stringify({
			kakao_id: kakaoId,
			email: email || null,
			name: name || null,
		}),
	});
}

/**
 * Submit review to backend
 */
async function submitReview(shopId, reviewData) {
	return apiRequest(`/reviews/${shopId}`, {
		method: 'POST',
		body: JSON.stringify(reviewData),
	});
}

// Export functions for use in other files
window.ReviewAPI = {
	getShop,
	createShop,
	getOrCreateShop,
	getUploadUrls,
	uploadImageToS3,
	getOrCreateUserByKakao,
	submitReview,
};

