# Cloudinary Integration for Document Management

## Overview
The Migrant Worker Healthcare System now uses Cloudinary for secure, scalable file storage and optimization. This replaces the previous local file storage system with a cloud-based solution.

## Features Implemented

### 🔒 Security Features
- **Secure Upload**: Files are uploaded directly to Cloudinary with authentication
- **Access Control**: Only authorized users can upload/view documents
- **File Validation**: Type and size validation before upload
- **Audit Logging**: All file operations are logged for compliance

### 📁 File Organization
- **Folder Structure**: `medical-documents/{workerId}/`
- **Unique IDs**: Each document gets a unique public_id
- **Metadata Tagging**: Documents tagged with type, worker ID, uploader
- **Context Data**: Additional metadata stored with each file

### 🚀 Performance Optimization
- **Automatic Optimization**: Images automatically optimized for web delivery
- **Responsive Images**: Multiple sizes generated automatically
- **Fast CDN**: Global CDN ensures fast loading worldwide
- **Format Conversion**: Automatic format selection (WebP, AVIF, etc.)

## API Endpoints

### Upload Document
```
POST /api/workers/{workerId}/documents

Headers:
- Authorization: Bearer {jwt_token}
- Content-Type: multipart/form-data

Body (FormData):
- file: File (PDF, JPG, PNG, WebP)
- documentType: string (identity_proof, medical_record, etc.)
- description: string (optional)

Response:
{
  "success": true,
  "document": {
    "documentId": "DOC123456789",
    "fileName": "aadhaar-card.jpg",
    "cloudinary_secure_url": "https://res.cloudinary.com/...",
    "thumbnailUrl": "https://res.cloudinary.com/.../c_thumb,w_150,h_150/...",
    "optimizedUrl": "https://res.cloudinary.com/.../c_scale,w_800,q_auto/...",
    "fileSize": 1024000,
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Documents
```
GET /api/workers/{workerId}/documents

Headers:
- Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "documents": [
    {
      "documentId": "DOC123456789",
      "documentType": "identity_proof",
      "fileName": "aadhaar-card.jpg",
      "thumbnailUrl": "https://res.cloudinary.com/.../c_thumb,w_150,h_150/...",
      "optimizedUrl": "https://res.cloudinary.com/.../c_scale,w_800,q_auto/...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isVerified": false
    }
  ]
}
```

## Database Schema Updates

### Document Model
```typescript
interface IDocument {
  documentId: string
  workerId: string
  uploadedBy: string
  fileName: string
  originalName: string
  mimeType: string
  fileSize: number
  documentType: string
  description?: string
  
  // Cloudinary fields
  cloudinary_public_id: string
  cloudinary_secure_url: string
  cloudinary_url: string
  cloudinary_folder: string
  
  checksum: string
  isVerified: boolean
  tags: string[]
  accessLog: AccessLogEntry[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

## Environment Configuration

Add these variables to your `.env` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
CLOUDINARY_UPLOAD_PRESET=medical-documents
```

## Cloudinary Service Usage

### Upload File
```typescript
import CloudinaryService from '@/lib/cloudinary'

const result = await CloudinaryService.uploadFile(
  buffer,
  {
    folder: 'medical-documents/WORKER123',
    public_id: 'DOC123456789',
    resource_type: 'auto',
    tags: ['identity_proof', 'WORKER123', 'USER456']
  }
)
```

### Generate Optimized URLs
```typescript
// Thumbnail (150x150)
const thumbnailUrl = CloudinaryService.getThumbnailUrl(public_id)

// Optimized for web (max 800px width, auto quality)
const optimizedUrl = CloudinaryService.getOptimizedUrl(public_id)

// Custom transformation
const customUrl = CloudinaryService.getTransformedUrl(public_id, {
  width: 400,
  height: 300,
  crop: 'fill',
  quality: 'auto:good'
})
```

### Delete File
```typescript
const success = await CloudinaryService.deleteFile(public_id)
```

## Frontend Integration

### File Upload Component
```typescript
const uploadDocument = async (file: File, documentType: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', documentType)
  formData.append('description', description)

  const response = await fetch(`/api/workers/${workerId}/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })

  const result = await response.json()
  
  if (result.success) {
    // File uploaded successfully
    console.log('Document uploaded:', result.document)
    
    // Display thumbnail
    setThumbnailUrl(result.document.thumbnailUrl)
    
    // Display optimized image
    setImageUrl(result.document.optimizedUrl)
  }
}
```

### Display Documents
```typescript
const DocumentList = ({ documents }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <div key={doc.documentId} className="border rounded-lg p-4">
          <img 
            src={doc.thumbnailUrl} 
            alt={doc.fileName}
            className="w-full h-32 object-cover rounded"
          />
          <h3 className="font-semibold mt-2">{doc.documentType}</h3>
          <p className="text-sm text-gray-600">{doc.fileName}</p>
          <button 
            onClick={() => window.open(doc.optimizedUrl, '_blank')}
            className="mt-2 text-blue-600 hover:underline"
          >
            View Full Size
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Security Considerations

### 1. Authentication
- All uploads require valid JWT token
- Role-based permissions enforced
- User can only access their own documents (workers) or assigned patients (doctors)

### 2. File Validation
- File type validation (PDF, JPG, PNG, WebP only)
- File size limits (10MB max)
- Malware scanning via Cloudinary

### 3. Access Control
- Documents stored in organized folders by worker ID
- Cloudinary URLs are signed for additional security
- Access logs maintained for audit compliance

### 4. Data Integrity
- SHA-256 checksums for file integrity verification
- Audit trail for all file operations
- Automatic backup and versioning

## Migration from Local Storage

### Steps Completed
1. ✅ Updated database schema with Cloudinary fields
2. ✅ Implemented CloudinaryService with upload/optimization
3. ✅ Updated document upload API to use Cloudinary
4. ✅ Added environment configuration for Cloudinary
5. ✅ Updated file validation and error handling

### Next Steps
1. Update frontend components to use new API responses
2. Implement file deletion functionality
3. Add batch upload capabilities
4. Migrate existing local files to Cloudinary (if any)

## Testing

Use the test file at `test/cloudinary-upload-test.ts` to verify:
- File upload functionality
- Document retrieval with optimized URLs
- Direct Cloudinary service testing

## Performance Benefits

### Before (Local Storage)
- Files stored on server disk
- No optimization
- Single server dependency
- Manual backup required

### After (Cloudinary)
- Global CDN delivery
- Automatic image optimization
- 99.9% uptime SLA
- Built-in backup and redundancy
- Bandwidth savings through compression

## Cost Optimization

### Cloudinary Usage
- Transformation quota: 25,000/month (free tier)
- Storage: 25GB (free tier)
- Bandwidth: 25GB/month (free tier)

### Best Practices
- Use appropriate image sizes
- Leverage automatic format selection
- Implement lazy loading
- Cache transformed images

## Support and Troubleshooting

### Common Issues
1. **Upload failures**: Check API keys and network connectivity
2. **Missing thumbnails**: Verify public_id format
3. **Slow loading**: Use CDN URLs and check transformations

### Monitoring
- Upload success/failure rates in audit logs
- File access patterns
- Storage usage via Cloudinary dashboard
- Performance metrics via Next.js analytics

## Future Enhancements

### Planned Features
1. **Video Support**: Add support for medical video files
2. **OCR Integration**: Extract text from medical documents
3. **AI Analysis**: Automatic document classification
4. **Watermarking**: Add hospital watermarks for authenticity
5. **Advanced Search**: Search documents by content/metadata
