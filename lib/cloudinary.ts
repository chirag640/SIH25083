import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  bytes: number
  format: string
  resource_type: string
  created_at: string
  folder?: string
  original_filename?: string
}

export interface UploadOptions {
  folder?: string
  public_id?: string
  resource_type?: 'image' | 'video' | 'raw' | 'auto'
  format?: string
  transformation?: any[]
  tags?: string[]
  context?: Record<string, string>
}

/**
 * Cloudinary service for secure file uploads and management
 */
export class CloudinaryService {
  
  /**
   * Upload file to Cloudinary
   */
  static async uploadFile(
    fileBuffer: Buffer,
    options: UploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        resource_type: options.resource_type || 'auto',
        folder: options.folder || 'healthcare-documents',
        public_id: options.public_id,
        format: options.format,
        transformation: options.transformation,
        tags: options.tags || ['healthcare', 'document'],
        context: options.context,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        ...options
      }

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(new Error(`Upload failed: ${error.message}`))
          } else if (result) {
            resolve(result as CloudinaryUploadResult)
          } else {
            reject(new Error('Upload failed: No result received'))
          }
        }
      ).end(fileBuffer)
    })
  }

  /**
   * Upload medical document with specific transformations
   */
  static async uploadMedicalDocument(
    fileBuffer: Buffer,
    fileName: string,
    workerId: string,
    documentType: string
  ): Promise<CloudinaryUploadResult> {
    const folder = `healthcare-documents/${workerId}/${documentType}`
    const publicId = `${documentType}_${Date.now()}_${fileName.split('.')[0]}`

    const transformations = []
    
    // Apply transformations based on document type
    if (documentType === 'prescription' || documentType === 'lab_report') {
      transformations.push(
        { quality: 'auto:best' },
        { format: 'auto' },
        { fetch_format: 'auto' }
      )
    }

    return await this.uploadFile(fileBuffer, {
      folder,
      public_id: publicId,
      transformation: transformations,
      tags: ['healthcare', 'medical', documentType, workerId],
      context: {
        worker_id: workerId,
        document_type: documentType,
        upload_date: new Date().toISOString()
      }
    })
  }

  /**
   * Upload profile image with specific transformations
   */
  static async uploadProfileImage(
    fileBuffer: Buffer,
    fileName: string,
    userId: string
  ): Promise<CloudinaryUploadResult> {
    const folder = `healthcare-profiles/${userId}`
    const publicId = `profile_${Date.now()}`

    return await this.uploadFile(fileBuffer, {
      folder,
      public_id: publicId,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ],
      tags: ['healthcare', 'profile', userId],
      context: {
        user_id: userId,
        type: 'profile_image',
        upload_date: new Date().toISOString()
      }
    })
  }

  /**
   * Delete file from Cloudinary
   */
  static async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result.result === 'ok'
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      return false
    }
  }

  /**
   * Get optimized URL for display
   */
  static getOptimizedUrl(
    publicId: string,
    transformations: any[] = []
  ): string {
    return cloudinary.url(publicId, {
      transformation: [
        { quality: 'auto' },
        { format: 'auto' },
        ...transformations
      ],
      secure: true
    })
  }

  /**
   * Generate thumbnail URL
   */
  static getThumbnailUrl(
    publicId: string,
    width: number = 150,
    height: number = 150
  ): string {
    return cloudinary.url(publicId, {
      transformation: [
        { width, height, crop: 'fill' },
        { quality: 'auto:low' },
        { format: 'auto' }
      ],
      secure: true
    })
  }

  /**
   * Get file details from Cloudinary
   */
  static async getFileDetails(publicId: string): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId)
    } catch (error) {
      console.error('Cloudinary get details error:', error)
      throw new Error(`Failed to get file details: ${error}`)
    }
  }

  /**
   * List files in a folder
   */
  static async listFiles(
    folder: string,
    maxResults: number = 100
  ): Promise<any[]> {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: maxResults
      })
      return result.resources
    } catch (error) {
      console.error('Cloudinary list files error:', error)
      throw new Error(`Failed to list files: ${error}`)
    }
  }

  /**
   * Generate secure download URL with expiration
   */
  static generateSecureDownloadUrl(
    publicId: string,
    expirationHours: number = 1
  ): string {
    const timestamp = Math.round(Date.now() / 1000) + (expirationHours * 3600)
    
    return cloudinary.utils.private_download_url(publicId, 'auto', {
      expires_at: timestamp,
      attachment: true
    })
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 5MB limit' }
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'application/pdf'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed' 
      }
    }

    return { valid: true }
  }

  /**
   * Get upload signature for client-side uploads
   */
  static getUploadSignature(
    timestamp: number,
    folder: string,
    publicId?: string
  ): string {
    const params = {
      timestamp: timestamp.toString(),
      folder,
      ...(publicId && { public_id: publicId })
    }

    return cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!)
  }

  /**
   * Clean up old files (for maintenance)
   */
  static async cleanupOldFiles(
    folder: string,
    olderThanDays: number = 30
  ): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      const resources = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: 500
      })

      let deletedCount = 0
      for (const resource of resources.resources) {
        const createdAt = new Date(resource.created_at)
        if (createdAt < cutoffDate) {
          await this.deleteFile(resource.public_id)
          deletedCount++
        }
      }

      return deletedCount
    } catch (error) {
      console.error('Cloudinary cleanup error:', error)
      throw new Error(`Failed to cleanup old files: ${error}`)
    }
  }
}

export default CloudinaryService
