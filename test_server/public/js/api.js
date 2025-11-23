/**
 * API Service for Backend Communication
 * Handles all API calls to the backend server
 */

// Backend API base URL - update this to match your backend server
// For production, you may want to use an environment variable or config file
/* 로컬 테스트용이면 http://127.0.0.1:8000 사용 */
/* 실제 서버 호스팅할때는 /api 사용 (Nginx 프록시) */
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
 * Normalize shop name for comparison (remove extra spaces, lowercase)
 */
function normalizeShopName(name) {
	if (!name) return '';
	return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Check if two shop names match (flexible matching)
 */
function shopNamesMatch(name1, name2) {
	if (!name1 || !name2) return false;
	const normalized1 = normalizeShopName(name1);
	const normalized2 = normalizeShopName(name2);
	
	// Exact match
	if (normalized1 === normalized2) return true;
	
	// One contains the other (for cases like "엔제리너스 대전카이스트점" vs "엔제리너스 대전 카이스트점")
	if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true;
	
	// Check if they share significant words (at least 2 words match)
	const words1 = normalized1.split(/\s+/).filter(w => w.length > 1);
	const words2 = normalized2.split(/\s+/).filter(w => w.length > 1);
	const commonWords = words1.filter(w => words2.includes(w));
	return commonWords.length >= 2;
}

/**
 * Calculate distance between two coordinates (Haversine formula, returns meters)
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
	const R = 6371000; // Earth radius in meters
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLng = (lng2 - lng1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLng / 2) * Math.sin(dLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

/**
 * Get or create shop by place information
 * Uses name matching and manual coordinate checking (no geospatial queries)
 */
async function getOrCreateShop(placeInfo) {
	try {
		const placeName = placeInfo.place_name;
		const lat = parseFloat(placeInfo.y);
		const lng = parseFloat(placeInfo.x);
		
		console.log('[SHOP] Getting or creating shop for:', placeName);
		console.log('[SHOP] Coordinates:', { lat, lng });
		
		// Step 1: Search shops by name
		let searchResults = [];
		try {
			const searchResponse = await apiRequest(`/shops/search?text=${encodeURIComponent(placeName)}&limit=50`, {
				method: 'GET',
			});
			// Backend returns {items: [...], count: ...}, extract items
			searchResults = Array.isArray(searchResponse) ? searchResponse : (searchResponse.items || []);
			console.log('[SHOP] Search response:', searchResponse);
			console.log('[SHOP] Search results count:', searchResults.length);
			console.log('[SHOP] Search results type:', typeof searchResults);
			console.log('[SHOP] Is array?', Array.isArray(searchResults));
		} catch (searchError) {
			console.error('[SHOP] Search failed:', searchError);
		}
		
		// Step 2: Find shop with matching name (coordinates are secondary)
		// Since the search API already filtered by name, we can trust the results
		if (Array.isArray(searchResults) && searchResults.length > 0) {
			console.log('[SHOP] ✓ Found', searchResults.length, 'shops with matching name');
			console.log('[SHOP] First 3 shop names:', searchResults.slice(0, 3).map(s => s.name));
			console.log('[SHOP] First shop ID:', searchResults[0]._id || searchResults[0].id);
			
			let bestMatch = null;
			let bestDistance = Infinity;
			
			// First, try to find shop with matching coordinates (within 200m)
			for (const shop of searchResults) {
				if (shop.location && shop.location.coordinates && Array.isArray(shop.location.coordinates)) {
					const shopLng = shop.location.coordinates[0];
					const shopLat = shop.location.coordinates[1];
					const distance = calculateDistance(lat, lng, shopLat, shopLng);
					
					console.log('[SHOP] Shop:', shop.name, 'Distance:', distance.toFixed(2), 'm');
					
					// If within 200 meters, consider it a match
					if (distance < 200 && distance < bestDistance) {
						bestMatch = shop;
						bestDistance = distance;
						console.log('[SHOP] ✓ Coordinate match found:', shop.name, 'Distance:', distance.toFixed(2), 'm');
					}
				}
			}
			
			// If no coordinate match, use the first search result (search already filtered by name)
			// CRITICAL: Always return first result if search found anything to prevent duplicates
			const finalMatch = bestMatch || searchResults[0];
			
			if (!finalMatch) {
				console.error('[SHOP] CRITICAL ERROR: finalMatch is null even though searchResults.length > 0');
				console.error('[SHOP] searchResults[0]:', searchResults[0]);
				// Force use first result
				if (searchResults[0]) {
					console.log('[SHOP] FORCING use of first search result to prevent duplicate');
					return searchResults[0];
				}
			}
			
			const matchId = finalMatch._id || finalMatch.id;
			if (!matchId) {
				console.error('[SHOP] CRITICAL ERROR: Shop has no ID!', finalMatch);
				// Try to find a shop with an ID
				const shopWithId = searchResults.find(s => s._id || s.id);
				if (shopWithId) {
					console.log('[SHOP] Using shop with ID:', shopWithId.name);
					return shopWithId;
				}
			}
			
			if (bestMatch && bestDistance !== Infinity) {
				console.log('[SHOP] ✓✓✓ RETURNING EXISTING SHOP (name + coordinates):', finalMatch.name, 'Distance:', bestDistance.toFixed(2), 'm', 'ID:', matchId);
			} else {
				console.log('[SHOP] ✓✓✓ RETURNING EXISTING SHOP (name only, first result):', finalMatch.name, 'ID:', matchId);
				console.log('[SHOP] ⚠ No coordinate match found, using first result to prevent duplicates');
			}
			console.log('[SHOP] About to return shop, preventing new shop creation');
			return finalMatch;
		} else {
			console.warn('[SHOP] No search results found or searchResults is not an array');
			console.warn('[SHOP] searchResults:', searchResults);
		}
		
		// Step 3: Create new shop if not found
		console.warn('[SHOP] ⚠⚠⚠ WARNING: No existing shop found, creating NEW shop!');
		console.warn('[SHOP] This should not happen if shops with same name exist.');
		console.warn('[SHOP] Place name:', placeName);
		console.warn('[SHOP] Coordinates:', { lat, lng });
		if (searchResults.length > 0) {
			console.warn('[SHOP] Search found', searchResults.length, 'shops but none were used!');
			console.warn('[SHOP] First shop name:', searchResults[0].name);
		}
		const shop = await createShop(placeInfo);
		console.warn('[SHOP] ⚠⚠⚠ CREATED NEW SHOP:', shop.name, 'ID:', shop._id || shop.id);
		return shop;
	} catch (error) {
		console.error('[SHOP ERROR] Error creating/getting shop:', error);
		console.error('[SHOP ERROR] Error details:', {
			message: error.message,
			stack: error.stack,
			placeInfo: placeInfo
		});
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

/**
 * Get user info by user_id (includes review_score)
 */
async function getUserById(userId) {
	return apiRequest(`/users/${userId}`, {
		method: 'GET',
	});
}

/**
 * Get reviews for a shop
 */
async function getReviewsByShop(shopId, limit = 50) {
	return apiRequest(`/reviews/${shopId}?limit=${limit}`, {
		method: 'GET',
	});
}

/**
 * Get reviews written by a user
 */
async function getReviewsByUser(userId, limit = 50) {
	return apiRequest(`/reviews/user/${userId}?limit=${limit}`, {
		method: 'GET',
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
	getUserById,
	getReviewsByShop,
	getReviewsByUser,
	apiRequest, // Export for use in events.js
	calculateDistance, // Export for use in events.js
};

