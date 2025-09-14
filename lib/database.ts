import mongoose, { Schema, Document, Model } from 'mongoose'
import { User, UserRole } from './auth'

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/migrant-worker-system'
const DB_NAME = process.env.DB_NAME || 'migrant-worker-system'

/**
 * Database connection manager
 */
export class DatabaseManager {
  private static isConnected = false

  /**
   * Connect to MongoDB
   */
  static async connect(): Promise<void> {
    if (this.isConnected) {
      return
    }

    try {
      await mongoose.connect(MONGODB_URI, {
        dbName: DB_NAME,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })

      this.isConnected = true
      console.log('Connected to MongoDB successfully')
    } catch (error) {
      console.error('MongoDB connection failed:', error)
      throw new Error('Database connection failed')
    }
  }

  /**
   * Disconnect from MongoDB
   */
  static async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    try {
      await mongoose.disconnect()
      this.isConnected = false
      console.log('Disconnected from MongoDB')
    } catch (error) {
      console.error('MongoDB disconnection failed:', error)
    }
  }

  /**
   * Check connection status
   */
  static isConnectedToDatabase(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1
  }
}

// User Schema and Model
interface IUser extends Document {
  id: string
  email: string
  passwordHash: string
  passwordSalt: string
  role: UserRole
  name: string
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  permissions: string[]
  profileData: any
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true
  },
  passwordSalt: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['worker', 'doctor', 'admin'],
    required: true,
  // indexed via UserSchema.index({ email: 1, isActive: 1 }) or explicit schema.index calls
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  permissions: [{
    type: String
  }],
  profileData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id?.toString() || ''
      delete ret._id
      delete (ret as any).__v
      delete (ret as any).passwordHash
      delete (ret as any).passwordSalt
      delete (ret as any).emailVerificationToken
      delete (ret as any).passwordResetToken
      return ret
    }
  }
})

// Worker Profile Schema
interface IWorkerProfile extends Document {
  workerId: string
  userId: string
  fullName: string
  dateOfBirth: Date
  gender: string
  phoneNumber: string
  emergencyContact: {
    name: string
    relationship: string
    phoneNumber: string
  }
  currentAddress: {
    street: string
    city: string
    state: string
    pincode: string
    country: string
  }
  permanentAddress: {
    street: string
    city: string
    state: string
    pincode: string
    country: string
  }
  bloodGroup: string
  allergies: string[]
  medicalConditions: string[]
  employmentDetails: {
    employer: string
    jobTitle: string
    workLocation: string
    contractStartDate: Date
    contractEndDate?: Date
  }
  documents: {
    idProof: {
      type: string
      number: string
      verified: boolean
      uploadedAt: Date
    }
    medicalClearance: {
      verified: boolean
      issuedBy: string
      validUntil: Date
      uploadedAt: Date
    }
  }
  qrCodeData: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const WorkerProfileSchema = new Schema<IWorkerProfile>({
  workerId: {
    type: String,
    required: true,
  unique: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
  // indexed via WorkerProfileSchema.index({ userId: 1 })
  },
  fullName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phoneNumber: { type: String, required: true }
  },
  currentAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  permanentAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [String],
  medicalConditions: [String],
  employmentDetails: {
    employer: String,
    jobTitle: String,
    workLocation: String,
    contractStartDate: Date,
    contractEndDate: Date
  },
  documents: {
    idProof: {
      type: { type: String },
      number: String,
      verified: { type: Boolean, default: false },
      uploadedAt: Date
    },
    medicalClearance: {
      verified: { type: Boolean, default: false },
      issuedBy: String,
      validUntil: Date,
      uploadedAt: Date
    }
  },
  qrCodeData: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id?.toString() || ''
      delete ret._id
      delete (ret as any).__v
      return ret
    }
  }
})

// Medical Visit Schema
interface IMedicalVisit extends Document {
  visitId: string
  workerId: string
  doctorId: string
  visitDate: Date
  visitType: string
  symptoms: string[]
  diagnosis: string
  prescription: {
    medications: Array<{
      name: string
      dosage: string
      frequency: string
      duration: string
      instructions: string
    }>
    advice: string
  }
  vitals: {
    temperature: number
    bloodPressure: {
      systolic: number
      diastolic: number
    }
    heartRate: number
    weight: number
    height: number
  }
  followUpDate?: Date
  isFollowUp: boolean
  parentVisitId?: string
  status: string
  createdAt: Date
  updatedAt: Date
}

const MedicalVisitSchema = new Schema<IMedicalVisit>({
  visitId: {
    type: String,
    required: true,
  unique: true,
  },
  workerId: {
    type: String,
    required: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  visitDate: {
    type: Date,
    required: true,
  },
  visitType: {
    type: String,
    enum: ['checkup', 'emergency', 'follow-up', 'vaccination', 'screening'],
    required: true
  },
  symptoms: [String],
  diagnosis: String,
  prescription: {
    medications: [{
      name: { type: String, required: true },
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    advice: String
  },
  vitals: {
    temperature: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    weight: Number,
    height: Number
  },
  followUpDate: Date,
  isFollowUp: {
    type: Boolean,
    default: false
  },
  parentVisitId: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'completed'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id?.toString() || ''
      delete ret._id
      delete (ret as any).__v
      return ret
    }
  }
})

// Document Schema
interface IDocument extends Document {
  documentId: string
  workerId: string
  uploadedBy: string
  fileName: string
  fileType: string
  documentType: string
  description: string
  filePath: string
  fileSize: number
  isEncrypted: boolean
  encryptionKey?: string
  checksum: string
  isVerified: boolean
  verifiedBy?: string
  verifiedAt?: Date
  tags: string[]
  accessLog: Array<{
    accessedBy: string
    accessedAt: Date
    action: string
  }>
  // Cloudinary specific fields
  cloudinary_public_id?: string
  cloudinary_secure_url?: string
  cloudinary_url?: string
  cloudinary_folder?: string
  thumbnailUrl?: string
  optimizedUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const DocumentSchema = new Schema<IDocument>({
  documentId: {
    type: String,
    required: true,
  unique: true,
  },
  workerId: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    enum: ['prescription', 'lab_report', 'vaccination', 'medical_certificate', 'id_proof', 'other'],
    required: true,
  },
  description: String,
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  encryptionKey: String,
  checksum: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: String,
  verifiedAt: Date,
  tags: [String],
  accessLog: [{
    accessedBy: { type: String, required: true },
    accessedAt: { type: Date, default: Date.now },
    action: { type: String, required: true }
  }],
  // Cloudinary specific fields
  cloudinary_public_id: {
    type: String,
  // indexed if needed via DocumentSchema.index({ cloudinary_public_id: 1 })
  },
  cloudinary_secure_url: String,
  cloudinary_url: String,
  cloudinary_folder: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id?.toString() || ''
      delete ret._id
      delete (ret as any).__v
      return ret
    }
  }
})

// Audit Log Schema
interface IAuditLog extends Document {
  logId: string
  userId?: string
  action: string
  resource: string
  resourceId?: string
  metadata: any
  ipAddress: string
  userAgent: string
  sessionId: string
  severity: string
  category: string
  timestamp: Date
}

const AuditLogSchema = new Schema<IAuditLog>({
  logId: {
    type: String,
    required: true,
  unique: true,
  },
  userId: {
    type: String,
  },
  action: {
    type: String,
    required: true,
  // indexed via schema.index({ action: 1 }) if needed
  },
  resource: {
    type: String,
    required: true,
  // indexed via schema.index({ resource: 1 }) if needed
  },
  resourceId: String,
  metadata: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  // optional index; handled via schema.index if required
  },
  category: {
    type: String,
    default: 'general',
  // optional index; handled via schema.index if required
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: false,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id?.toString() || ''
      delete ret._id
      delete (ret as any).__v
      return ret
    }
  }
})

// Create indexes for performance
UserSchema.index({ email: 1, isActive: 1 })
WorkerProfileSchema.index({ workerId: 1, isActive: 1 })
WorkerProfileSchema.index({ userId: 1 })
MedicalVisitSchema.index({ workerId: 1, visitDate: -1 })
MedicalVisitSchema.index({ doctorId: 1, visitDate: -1 })
DocumentSchema.index({ workerId: 1, createdAt: -1 })
DocumentSchema.index({ documentType: 1, isVerified: 1 })
AuditLogSchema.index({ timestamp: -1 })
AuditLogSchema.index({ userId: 1, timestamp: -1 })

// Create Models
export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export const WorkerProfileModel: Model<IWorkerProfile> = mongoose.models.WorkerProfile || mongoose.model<IWorkerProfile>('WorkerProfile', WorkerProfileSchema)
export const MedicalVisitModel: Model<IMedicalVisit> = mongoose.models.MedicalVisit || mongoose.model<IMedicalVisit>('MedicalVisit', MedicalVisitSchema)
export const DocumentModel: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema)
export const AuditLogModel: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)

// Export interfaces
export type { IUser, IWorkerProfile, IMedicalVisit, IDocument, IAuditLog }
