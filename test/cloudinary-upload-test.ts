/**
 * Test File Upload with Cloudinary Integration
 * This script tests the document upload API with Cloudinary backend
 */

import { NextRequest } from 'next/server';

// Mock test data
const testDocument = {
  workerId: 'WORKER123456789',
  documentType: 'identity_proof',
  description: 'Test Aadhaar card upload'
};

const testImageBuffer = Buffer.from('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', 'base64');

// Test authentication token (you'll need a real one for actual testing)
const testToken = 'your-test-jwt-token-here';

/**
 * Test function to upload a document
 */
async function testDocumentUpload() {
  try {
    // Create FormData with test file
    const formData = new FormData();
    
    // Create a test file blob
    const testFile = new File([testImageBuffer], 'test-aadhaar.jpg', {
      type: 'image/jpeg'
    });
    
    formData.append('file', testFile);
    formData.append('documentType', testDocument.documentType);
    formData.append('description', testDocument.description);

    // Make request to upload API
    const response = await fetch(`http://localhost:3000/api/workers/${testDocument.workerId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'x-session-id': 'test-session-123'
      },
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Document upload successful!');
      console.log('Document ID:', result.document.documentId);
      console.log('Cloudinary URL:', result.document.cloudinary_secure_url);
      console.log('Thumbnail URL:', result.document.thumbnailUrl);
      console.log('Optimized URL:', result.document.optimizedUrl);
      
      return result.document;
    } else {
      console.error('❌ Upload failed:', result.error);
      return null;
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    return null;
  }
}

/**
 * Test function to retrieve documents
 */
async function testDocumentRetrieval(workerId: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/workers/${workerId}/documents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Document retrieval successful!');
      console.log('Documents found:', result.documents.length);
      
      result.documents.forEach((doc: any, index: number) => {
        console.log(`Document ${index + 1}:`);
        console.log('  ID:', doc.documentId);
        console.log('  Type:', doc.documentType);
        console.log('  Original Name:', doc.fileName);
        console.log('  Thumbnail URL:', doc.thumbnailUrl);
        console.log('  Optimized URL:', doc.optimizedUrl);
        console.log('  Upload Date:', doc.createdAt);
      });
      
      return result.documents;
    } else {
      console.error('❌ Retrieval failed:', result.error);
      return null;
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    return null;
  }
}

/**
 * Test Cloudinary service directly
 */
async function testCloudinaryService() {
  try {
    // This would be used in a Node.js environment
    const CloudinaryService = require('../lib/cloudinary').default;
    
    const uploadResult = await CloudinaryService.uploadFile(
      testImageBuffer,
      {
        folder: `medical-documents/${testDocument.workerId}`,
        public_id: 'test-document-' + Date.now(),
        resource_type: 'image',
        tags: [testDocument.documentType, testDocument.workerId]
      }
    );

    console.log('✅ Direct Cloudinary upload successful!');
    console.log('Public ID:', uploadResult.public_id);
    console.log('Secure URL:', uploadResult.secure_url);
    console.log('Folder:', uploadResult.folder);

    // Test URL generation
    const thumbnailUrl = CloudinaryService.getThumbnailUrl(uploadResult.public_id);
    const optimizedUrl = CloudinaryService.getOptimizedUrl(uploadResult.public_id);

    console.log('Thumbnail URL:', thumbnailUrl);
    console.log('Optimized URL:', optimizedUrl);

    return uploadResult;

  } catch (error) {
    console.error('❌ Cloudinary service test failed:', error);
    return null;
  }
}

// Export test functions
export {
  testDocumentUpload,
  testDocumentRetrieval,
  testCloudinaryService,
  testDocument,
  testToken
};

// Example usage (uncomment to run):
// console.log('🧪 Starting Cloudinary integration tests...');
// testCloudinaryService().then(() => {
//   testDocumentUpload().then((uploadedDoc) => {
//     if (uploadedDoc) {
//       testDocumentRetrieval(testDocument.workerId);
//     }
//   });
// });
