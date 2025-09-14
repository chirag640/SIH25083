import { NextRequest, NextResponse } from 'next/server'
import { DatabaseManager, DocumentModel, AuditLogModel } from '@/lib/database'
import { TokenManager, PermissionManager } from '@/lib/auth'
import { SecureCrypto } from '@/lib/crypto'
import CloudinaryService from '@/lib/cloudinary'

// GET documents for a worker
export async function GET(request: NextRequest) {
  try {
    await DatabaseManager.connect()

    const url = new URL(request.url)
    const workerId = url.pathname.split('/')[3] // /api/workers/{workerId}/documents

    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = TokenManager.verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Check permissions
    const canReadOwnDocs = payload.permissions.includes('read:own_documents')
    const canReadPatientDocs = payload.permissions.includes('read:patient_documents')
    const canReadAllDocs = payload.permissions.includes('read:all_documents')

    if (!canReadOwnDocs && !canReadPatientDocs && !canReadAllDocs) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Find documents
    const documents = await DocumentModel.find({
      workerId,
      isActive: true
    }).sort({ createdAt: -1 })

    // Add optimized URLs for display
    const documentsWithUrls = documents.map(doc => {
      const docData = doc.toJSON()
      
      // Generate optimized URLs if cloudinary_public_id exists
      if (docData.cloudinary_public_id) {
        docData.thumbnailUrl = CloudinaryService.getThumbnailUrl(docData.cloudinary_public_id)
        docData.optimizedUrl = CloudinaryService.getOptimizedUrl(docData.cloudinary_public_id)
      }
      
      // Remove sensitive data
      delete (docData as any).filePath
      delete (docData as any).encryptionKey
      delete (docData as any).cloudinary_public_id
      
      return docData
    })

    return NextResponse.json({
      success: true,
      documents: documentsWithUrls
    })

  } catch (error) {
    console.error('Document fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST upload document
export async function POST(request: NextRequest) {
  try {
    await DatabaseManager.connect()

    const url = new URL(request.url)
    const workerId = url.pathname.split('/')[3]

    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = TokenManager.verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Check permissions
    const canUploadOwnDocs = payload.permissions.includes('upload:own_documents')
    const canUploadPatientDocs = payload.permissions.includes('create:medical_visits')

    if (!canUploadOwnDocs && !canUploadPatientDocs) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
    }

    // Validate file size (10MB limit for cloud storage)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, JPG, PNG, and WebP files are allowed' 
      }, { status: 400 })
    }

    // Generate document ID
    const documentId = SecureCrypto.generateSecureId('DOC')

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate checksum for integrity verification
    const checksum = await SecureCrypto.hash(buffer.toString('base64'))

    // Upload file to Cloudinary
    const cloudinaryResult = await CloudinaryService.uploadFile(
      buffer,
      {
        folder: `medical-documents/${workerId}`,
        public_id: documentId,
        resource_type: 'auto',
        tags: [documentType, workerId, payload.userId],
        context: {
          workerId,
          documentType,
          uploadedBy: payload.userId,
          originalName: file.name
        }
      }
    )

    // Create document record
    const document = new DocumentModel({
      documentId,
      workerId,
      uploadedBy: payload.userId,
      fileName: file.name,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      documentType,
      description: description || '',
      cloudinary_public_id: cloudinaryResult.public_id,
      cloudinary_secure_url: cloudinaryResult.secure_url,
      cloudinary_url: cloudinaryResult.url,
      cloudinary_folder: cloudinaryResult.folder,
      checksum,
      isVerified: false,
      tags: [documentType],
      accessLog: [{
        accessedBy: payload.userId,
        accessedAt: new Date(),
        action: 'uploaded'
      }],
      isActive: true
    })

    await document.save()

    // Log audit trail
    const auditLog = new AuditLogModel({
      logId: SecureCrypto.generateSecureId('AUDIT'),
      userId: payload.userId,
      action: 'document_uploaded',
      resource: 'document',
      resourceId: documentId,
      metadata: {
        fileName: file.name,
        fileType: file.type,
        documentType,
        workerId,
        fileSize: file.size,
        cloudinary_public_id: cloudinaryResult.public_id
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: request.headers.get('x-session-id') || 'unknown',
      severity: 'medium',
      category: 'document_management'
    })

    await auditLog.save()

    // Return document data with optimized URLs
    const responseDoc = document.toJSON()
    responseDoc.thumbnailUrl = CloudinaryService.getThumbnailUrl(cloudinaryResult.public_id)
    responseDoc.optimizedUrl = CloudinaryService.getOptimizedUrl(cloudinaryResult.public_id)
    
    // Remove sensitive data
    delete responseDoc.cloudinary_public_id

    return NextResponse.json({
      success: true,
      document: responseDoc
    }, { status: 201 })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to upload document' 
    }, { status: 500 })
  }
}
