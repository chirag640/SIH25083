import { NextRequest, NextResponse } from 'next/server'
import { DatabaseManager, DocumentModel, AuditLogModel } from '@/lib/database'
import { TokenManager } from '@/lib/auth'
import { SecureCrypto } from '@/lib/crypto'

// PUT verify document
export async function PUT(request: NextRequest) {
  try {
    await DatabaseManager.connect()

    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const documentId = pathParts[pathParts.length - 2] // /api/documents/{documentId}/verify

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

    // Check permissions (only doctors and admins can verify documents)
    const canVerify = payload.permissions.includes('verify:documents')
    
    if (!canVerify) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { verified, notes } = await request.json()

    if (typeof verified !== 'boolean') {
      return NextResponse.json({ error: 'Verification status must be boolean' }, { status: 400 })
    }

    // Find document
    const document = await DocumentModel.findOne({ 
      documentId,
      isActive: true 
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Update verification status
    document.isVerified = verified
    document.verifiedBy = payload.userId
    document.verifiedAt = new Date()

    // Add to access log
    document.accessLog.push({
      accessedBy: payload.userId,
      accessedAt: new Date(),
      action: verified ? 'verified' : 'rejected'
    })

    await document.save()

    // Log audit trail
    const auditLog = new AuditLogModel({
      logId: SecureCrypto.generateSecureId('AUDIT'),
      userId: payload.userId,
      action: 'document_verified',
      resource: 'document',
      resourceId: documentId,
      metadata: {
        verified,
        notes: notes || '',
        workerId: document.workerId,
        documentType: document.documentType
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: request.headers.get('x-session-id') || 'unknown',
      severity: 'high',
      category: 'document_verification'
    })

    await auditLog.save()

    return NextResponse.json({
      success: true,
      document: {
        ...document.toJSON(),
        filePath: undefined,
        encryptionKey: undefined
      }
    })

  } catch (error) {
    console.error('Document verification error:', error)
    return NextResponse.json({ error: 'Failed to verify document' }, { status: 500 })
  }
}
