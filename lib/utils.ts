import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Detect browser runtime before accessing window/localStorage
const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined"

// Safe base64 helpers that work both in browser and Node (used during build/SSR)
function safeBtoa(input: string): string {
  if (isBrowser && typeof btoa === "function") return btoa(input)
  try {
    // Node.js fallback
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const buf = Buffer.from(input, "binary")
    return buf.toString("base64")
  } catch (e) {
    return input
  }
}

function safeAtob(input: string): string {
  if (isBrowser && typeof atob === "function") return atob(input)
  try {
    // Node.js fallback
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const buf = Buffer.from(input, "base64")
    return buf.toString("binary")
  } catch (e) {
    return input
  }
}

export class SecurityUtils {
  // Simple encryption for demo purposes - in production, use proper encryption libraries
  private static readonly ENCRYPTION_KEY = "healthcare-security-key-2024"

  static encrypt(text: string): string {
    if (!text) return text
    try {
      // Simple XOR encryption for demo - use proper encryption in production
      let encrypted = ""
      for (let i = 0; i < text.length; i++) {
        const keyChar = this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
        const textChar = text.charCodeAt(i)
        encrypted += String.fromCharCode(textChar ^ keyChar)
      }
  return safeBtoa(encrypted) // Base64 encode (safe for SSR)
    } catch (error) {
      console.error("Encryption error:", error)
      return text
    }
  }

  static decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText
    try {
  const decoded = safeAtob(encryptedText) // Base64 decode (safe for SSR)
      let decrypted = ""
      for (let i = 0; i < decoded.length; i++) {
        const keyChar = this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
        const encryptedChar = decoded.charCodeAt(i)
        decrypted += String.fromCharCode(encryptedChar ^ keyChar)
      }
      return decrypted
    } catch (error) {
      console.error("Decryption error:", error)
      return encryptedText
    }
  }

  static sanitizeInput(input: string): string {
    if (!input) return input
    // Remove potentially harmful characters and scripts
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim()
  }

  static validatePhoneNumber(phone: string): boolean {
    if (!phone) return true // Optional field
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
  }

  static validateEmail(email: string): boolean {
    if (!email) return true // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validateName(name: string): boolean {
    if (!name) return false
    // Allow letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s\-'.]+$/
    return nameRegex.test(name) && name.length >= 2 && name.length <= 100
  }

  static logAccess(
    action: string,
    workerId?: string,
    userType: "health_worker" | "doctor" = "health_worker",
    metadata?: any,
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      workerId: workerId || "unknown",
      userType,
      sessionId: this.getSessionId(),
      ipAddress: "client-side", // In production, get from server
      metadata: metadata || {},
      severity: this.getActionSeverity(action),
      category: this.getActionCategory(action),
    }

    // Store audit log in localStorage (in production, send to secure server)
    if (!isBrowser) {
      // On server, just print a condensed log and skip storage
      // This avoids ReferenceError during static builds / SSR
      // eslint-disable-next-line no-console
      console.debug("logAccess (server):", logEntry.action, logEntry.workerId)
      return
    }

    const existingLogs = JSON.parse(localStorage.getItem("audit_logs") || "[]")
    existingLogs.push(logEntry)

    // Keep only last 2000 entries to prevent storage overflow
    if (existingLogs.length > 2000) {
      existingLogs.splice(0, existingLogs.length - 2000)
    }

    localStorage.setItem("audit_logs", JSON.stringify(existingLogs))

    // Also log critical actions separately for immediate attention
    if (logEntry.severity === "critical") {
      this.logCriticalAction(logEntry)
    }
  }

  private static getActionSeverity(action: string): "low" | "medium" | "high" | "critical" {
    if (action.includes("failed") || action.includes("unauthorized") || action.includes("breach")) {
      return "critical"
    }
    if (action.includes("prescription") || action.includes("medication")) {
      return "high"
    }
    if (action.includes("view") || action.includes("access") || action.includes("update")) {
      return "medium"
    }
    return "low"
  }

  private static getActionCategory(action: string): string {
    if (action.includes("prescription") || action.includes("medication")) return "medication"
    if (action.includes("diagnosis") || action.includes("visit")) return "clinical"
    if (action.includes("view") || action.includes("access")) return "access"
    if (action.includes("registration") || action.includes("create")) return "registration"
    if (action.includes("update") || action.includes("modify")) return "modification"
    if (action.includes("delete") || action.includes("remove")) return "deletion"
    if (action.includes("export") || action.includes("download")) return "data_export"
    if (action.includes("failed") || action.includes("error")) return "security"
    return "general"
  }

  private static logCriticalAction(logEntry: any): void {
    if (!isBrowser) {
      // No-op during SSR
      return
    }

    const criticalLogs = JSON.parse(localStorage.getItem("critical_audit_logs") || "[]")
    criticalLogs.push({
      ...logEntry,
      alertLevel: "IMMEDIATE_ATTENTION_REQUIRED",
      notificationSent: false,
    })

    // Keep only last 100 critical entries
    if (criticalLogs.length > 100) {
      criticalLogs.splice(0, criticalLogs.length - 100)
    }

    localStorage.setItem("critical_audit_logs", JSON.stringify(criticalLogs))
  }

  static logDoctorAction(
    action: string,
    workerId: string,
    doctorId: string,
    doctorName: string,
    medicalContext?: {
      diagnosis?: string
      prescription?: string
      visitType?: string
      followUpDate?: string
      medications?: any[]
      vaccinations?: any[]
      labTests?: any[]
    },
  ): void {
    const enhancedMetadata = {
      doctorId,
      doctorName,
      medicalContext: medicalContext || {},
      timestamp: new Date().toISOString(),
      actionId: this.generateSecureId(),
    }

    this.logAccess(action, workerId, "doctor", enhancedMetadata)
  }

  static checkDataIntegrity(data: any): boolean {
    try {
      // Basic integrity check - ensure required fields are present
      if (typeof data !== "object" || !data) return false

      // Check for required fields in worker data
      if (data.workerId && (!data.fullName || !data.dateOfBirth || !data.gender)) {
        return false
      }

      return true
    } catch (error) {
      console.error("Data integrity check failed:", error)
      return false
    }
  }

  static generateSecureId(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substr(2, 9)
    const checksum = this.calculateChecksum(timestamp + random)
    return `MW${timestamp.slice(-8)}${random.slice(0, 4)}${checksum}`
  }

  private static calculateChecksum(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).slice(0, 3)
  }

  static validateFileType(file: File): boolean {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    return allowedTypes.includes(file.type)
  }

  static validateFileSize(file: File, maxSizeMB = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  }

  static generateDocumentId(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substr(2, 9)
    return `DOC${timestamp.slice(-8)}${random.slice(0, 6)}`
  }

  private static getSessionId(): string {
    if (!isBrowser) {
      // Return a transient session id on server side
      return `session_server_${Date.now()}`
    }

  if (typeof sessionStorage === "undefined") return `session_server_${Date.now()}`
  let sessionId = sessionStorage.getItem("session_id")
    if (!sessionId) {
      sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem("session_id", sessionId)
    }
    return sessionId
  }

}

export interface EncryptedWorkerData {
  workerId: string
  fullName: string
  dateOfBirth: string
  gender: string
  nativeState: string
  nativeDistrict: string
  currentAddress: string
  phoneNumber: string
  // Encrypted sensitive fields
  healthHistory_encrypted: string
  allergies_encrypted: string
  currentMedication_encrypted: string
  bloodGroup: string
  consent: boolean
  createdAt: string
  lastModified: string
  dataIntegrityHash: string
}

export class DataManager {
  static encryptSensitiveData(workerData: any): EncryptedWorkerData {
    const sensitiveFields = ["healthHistory", "allergies", "currentMedication"]
    const encrypted: any = { ...workerData }

    // Encrypt sensitive fields
    sensitiveFields.forEach((field) => {
      if (workerData[field]) {
        encrypted[`${field}_encrypted`] = SecurityUtils.encrypt(workerData[field])
        delete encrypted[field] // Remove unencrypted version
      } else {
        encrypted[`${field}_encrypted`] = ""
      }
    })

    // Add metadata
    encrypted.lastModified = new Date().toISOString()
    encrypted.dataIntegrityHash = this.generateIntegrityHash(encrypted)

    return encrypted
  }

  static decryptSensitiveData(encryptedData: EncryptedWorkerData): any {
    const decrypted: any = { ...encryptedData }

    // Decrypt sensitive fields
    const sensitiveFields = ["healthHistory", "allergies", "currentMedication"]
    sensitiveFields.forEach((field) => {
      const encryptedField = `${field}_encrypted`
      if ((encryptedData as any)[encryptedField]) {
        decrypted[field] = SecurityUtils.decrypt((encryptedData as any)[encryptedField])
      } else {
        decrypted[field] = ""
      }
      delete decrypted[encryptedField] // Remove encrypted version
    })

    return decrypted
  }

  private static generateIntegrityHash(data: any): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort())
    return SecurityUtils.encrypt(dataString).slice(0, 16)
  }

  static verifyDataIntegrity(data: EncryptedWorkerData): boolean {
    const { dataIntegrityHash, ...dataWithoutHash } = data
    const expectedHash = this.generateIntegrityHash(dataWithoutHash)
    return dataIntegrityHash === expectedHash
  }
}

export interface DocumentRecord {
  id: string
  workerId: string
  fileName: string
  fileType: string
  documentType: "prescription" | "lab_report" | "vaccination" | "medical_certificate" | "other"
  uploadDate: string
  fileSize: number
  description: string
  isEncrypted: boolean
  fileData: string
  version: number
  tags: string[]
  checksum: string
  lastAccessed: string
  accessCount: number
}

export class EnhancedStorageManager {
  private static readonly STORAGE_PREFIX = "healthrecord_"
  private static readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024 // 50MB limit
  private static readonly CLEANUP_THRESHOLD = 0.8 // Cleanup when 80% full

  static getStorageStats(): {
    used: number
    available: number
    percentage: number
    itemCount: number
    workerCount: number
    documentCount: number
  } {
    if (!isBrowser) {
      return {
        used: 0,
        available: this.MAX_STORAGE_SIZE,
        percentage: 0,
        itemCount: 0,
        workerCount: 0,
        documentCount: 0,
      }
    }

    let totalSize = 0
    let itemCount = 0
    let workerCount = 0
    let documentCount = 0

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += new Blob([value]).size
          itemCount++

          if (key.startsWith(`${this.STORAGE_PREFIX}worker_`)) {
            workerCount++
          } else if (key.startsWith(`${this.STORAGE_PREFIX}document_`)) {
            documentCount++
          }
        }
      }
    }

    return {
      used: totalSize,
      available: this.MAX_STORAGE_SIZE - totalSize,
      percentage: (totalSize / this.MAX_STORAGE_SIZE) * 100,
      itemCount,
      workerCount,
      documentCount,
    }
  }

  static performStorageCleanup(): boolean {
  if (!isBrowser) return false
  const stats = this.getStorageStats()

    if (stats.percentage < this.CLEANUP_THRESHOLD * 100) {
      return false // No cleanup needed
    }

    try {
      // Remove old audit logs first
      const auditLogs = JSON.parse(localStorage.getItem("audit_logs") || "[]")
      if (auditLogs.length > 500) {
        const trimmedLogs = auditLogs.slice(-500)
        localStorage.setItem("audit_logs", JSON.stringify(trimmedLogs))
      }

      // Remove old temporary data
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key?.includes("temp_") || key?.includes("cache_")) {
          localStorage.removeItem(key)
        }
      }

      SecurityUtils.logAccess("storage_cleanup_performed", undefined, "health_worker")
      return true
    } catch (error) {
      console.error("Storage cleanup failed:", error)
      return false
    }
  }

  // Convenience higher-level storage helpers used by UI pages
}

export class StorageUtils {
  private static readonly PREFIX = "healthrecord_"

  static getAllWorkers(): any[] {
  if (!isBrowser) return []
  const workers: any[] = []
    // Support both legacy keys (worker_...) and namespaced keys (healthrecord_worker_...)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue

      const isWorkerKey = key.startsWith(`${this.PREFIX}worker_`) || key.startsWith(`worker_`)
      if (!isWorkerKey) continue

      const raw = localStorage.getItem(key)
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw)
        workers.push(parsed)
      } catch (e) {
        // ignore parse errors
      }
    }
    return workers
  }

  static getAllDocuments(): DocumentRecord[] {
  if (!isBrowser) return []
  const docs: DocumentRecord[] = []
    // Support both legacy and namespaced document keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue

      const isDocKey = key.startsWith(`${this.PREFIX}document_`) || key.startsWith(`document_`)
      if (!isDocKey) continue

      const raw = localStorage.getItem(key)
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw)
        docs.push(parsed)
      } catch (e) {
        // ignore
      }
    }
    return docs
  }

  static getAuditLogs(): any[] {
    if (!isBrowser) return []
    try {
      const raw = localStorage.getItem("audit_logs") || "[]"
      return JSON.parse(raw)
    } catch (e) {
      return []
    }
  }

  static getStorageInfo() {
    // Basic info for UI
    const stats = EnhancedStorageManager.getStorageStats()
    return {
      usedSpace: Math.round(stats.percentage),
      totalMB: Math.round(stats.used / (1024 * 1024)),
      lastBackup: null,
    }
  }

  static exportSystemData(): void {
    if (!isBrowser) {
      // During SSR/build, simply return (no-op)
      return
    }

    const payload = {
      workers: this.getAllWorkers(),
      documents: this.getAllDocuments(),
      auditLogs: this.getAuditLogs(),
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sih_export_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    SecurityUtils.logAccess("export_system_data", undefined, "health_worker", { size: payload.workers.length })
  }

  static async importSystemData(file: File): Promise<void> {
    if (!isBrowser) {
      throw new Error("importSystemData can only be run in the browser")
    }

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (parsed.workers) {
        parsed.workers.forEach((w: any) => {
          if (w.workerId) {
            localStorage.setItem(`${this.PREFIX}worker_${w.workerId}`, JSON.stringify(w))
          }
        })
      }
      if (parsed.documents) {
        parsed.documents.forEach((d: any) => {
          if (d.id) {
            localStorage.setItem(`${this.PREFIX}document_${d.id}`, JSON.stringify(d))
          }
        })
      }
      if (parsed.auditLogs) {
        const existing = this.getAuditLogs()
        const combined = existing.concat(parsed.auditLogs)
        localStorage.setItem("audit_logs", JSON.stringify(combined.slice(-2000)))
      }

      SecurityUtils.logAccess("import_system_data", undefined, "health_worker", { importedFile: file.name })
    } catch (error) {
      console.error("Failed to import system data:", error)
      throw error
    }
  }

  // CSV export helper used by dashboards
  static exportToCSV(rows: any[], headers: string[], fileName = "export.csv") {
    if (!isBrowser) return

    const csv = [headers.join(",")].concat(
      rows.map((r) => headers.map((h) => {
        const v = r[h] ?? ""
        // escape quotes
        if (typeof v === "string") return `"${v.replace(/"/g, '""') }"`
        return v
      }).join(","))
    ).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    SecurityUtils.logAccess("export_csv", undefined, "health_worker", { fileName })
  }

  static exportAllData(): string {
    if (!isBrowser) {
      return JSON.stringify({ version: "1.0", exportDate: new Date().toISOString(), workers: [], documents: [], auditLogs: [] })
    }

    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      workers: [] as any[],
      documents: [] as any[],
      auditLogs: JSON.parse(localStorage.getItem("audit_logs") || "[]"),
    }

    // Export all worker data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("worker_")) {
        const workerData = localStorage.getItem(key)
        if (workerData) {
          exportData.workers.push({
            key,
            data: JSON.parse(workerData),
          })
        }
      } else if (key?.startsWith("document_")) {
        const documentData = localStorage.getItem(key)
        if (documentData) {
          exportData.documents.push({
            key,
            data: JSON.parse(documentData),
          })
        }
      }
    }

    return JSON.stringify(exportData, null, 2)
  }

  static importData(jsonData: string): { success: boolean; message: string; imported: number } {
    try {
      const importData = JSON.parse(jsonData)
      let importedCount = 0

      // Validate import data structure
      if (!importData.version || !importData.workers || !importData.documents) {
        return { success: false, message: "Invalid import data format", imported: 0 }
      }

      // Import workers
      importData.workers.forEach((item: any) => {
        if (item.key && item.data) {
          // Verify data integrity before import
          if (DataManager.verifyDataIntegrity(item.data)) {
            if (isBrowser) localStorage.setItem(item.key, JSON.stringify(item.data))
            importedCount++
          }
        }
      })

      // Import documents
      importData.documents.forEach((item: any) => {
        if (item.key && item.data) {
          if (isBrowser) localStorage.setItem(item.key, JSON.stringify(item.data))
          importedCount++
        }
      })

  SecurityUtils.logAccess("data_import_completed", undefined, "health_worker")
      return { success: true, message: "Data imported successfully", imported: importedCount }
    } catch (error) {
      console.error("Data import failed:", error)
      return { success: false, message: "Import failed: Invalid JSON data", imported: 0 }
    }
  }

    static deleteWorker(workerId: string): boolean {
      try {
        // Remove worker record (support both legacy and namespaced keys)
          if (!isBrowser) return false

          const keysToRemove: string[] = []

          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (!key) continue

            // worker keys
            if (key === `worker_${workerId}` || key === `${this.PREFIX}worker_${workerId}`) {
              keysToRemove.push(key)
            }

            // medical visits
            if (key === `medical_visits_${workerId}`) {
              keysToRemove.push(key)
            }

            // documents for worker: document_<workerId>_<docId>
            if (key.startsWith(`document_${workerId}_`) || key.startsWith(`${this.PREFIX}document_${workerId}_`)) {
              keysToRemove.push(key)
            }
          }

          // Remove keys
          keysToRemove.forEach((k) => localStorage.removeItem(k))

          // Also remove any namespaced document entries (alternate pattern)
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i)
            if (!key) continue
            if (key.includes(`document_${workerId}_`) || key.includes(`worker_${workerId}`)) {
              localStorage.removeItem(key)
            }
          }

        SecurityUtils.logAccess("delete_worker", workerId, "health_worker")
        return true
      } catch (error) {
        console.error("Failed to delete worker:", error)
        return false
      }
    }

  static createBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      data: this.exportAllData(),
      checksum: this.generateBackupChecksum(),
    }

    return JSON.stringify(backup)
  }

  private static generateBackupChecksum(): string {
    const allData = this.exportAllData()
    return SecurityUtils.encrypt(allData).slice(0, 32)
  }

  static verifyBackup(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData)
      const expectedChecksum = this.generateBackupChecksum()
      return backup.checksum === expectedChecksum
    } catch (error) {
      return false
    }
  }
}

// Backwards-compatible named exports used by UI pages
export function getAllWorkers(): any[] {
  const raw = StorageUtils.getAllWorkers()
  const normalized = raw.map((item: any) => {
    try {
      // If item is in EncryptedWorkerData shape, try to verify & decrypt
      if (item && item.workerId) {
        const integrity = DataManager.verifyDataIntegrity(item as any)
        const decrypted = integrity ? DataManager.decryptSensitiveData(item as any) : item

        const dob = decrypted.dateOfBirth || decrypted.dob || ""
        let age = ""
        if (dob) {
          const b = new Date(dob)
          const today = new Date()
          let a = today.getFullYear() - b.getFullYear()
          const m = today.getMonth() - b.getMonth()
          if (m < 0 || (m === 0 && today.getDate() < b.getDate())) a--
          age = String(a)
        }

        return {
          id: decrypted.workerId || decrypted.id || "",
          name: decrypted.fullName || decrypted.name || "",
          gender: decrypted.gender || "",
          bloodGroup: decrypted.bloodGroup || "",
          age: age,
          registrationDate: decrypted.createdAt || decrypted.registrationDate || "",
        }
      }

      // Fallback: map common legacy shapes
      return {
        id: item.workerId || item.id || "",
        name: item.fullName || item.name || "",
        gender: item.gender || "",
        bloodGroup: item.bloodGroup || item.blood || "",
        age: item.age || "",
        registrationDate: item.createdAt || item.registrationDate || "",
      }
    } catch (e) {
      return {
        id: item.workerId || item.id || "",
        name: item.fullName || item.name || "",
        gender: item.gender || "",
        bloodGroup: item.bloodGroup || item.blood || "",
        age: item.age || "",
        registrationDate: item.createdAt || item.registrationDate || "",
      }
    }
  })

  return normalized
}

export function getAllDocuments(): DocumentRecord[] {
  const raw = StorageUtils.getAllDocuments()
  // Normalize to admin-friendly shape: { name, workerId, type, size, uploadDate }
  return raw.map((d: any) => ({
    id: d.id,
    workerId: d.workerId,
    fileName: d.fileName || d.name || d.id,
    fileType: d.fileType || "application/octet-stream",
    documentType: d.documentType || d.type || "other",
    uploadDate: d.uploadDate || d.createdAt || "",
    fileSize: d.fileSize || d.size || 0,
    description: d.description || "",
    isEncrypted: Boolean(d.isEncrypted),
    fileData: d.fileData || "",
    version: d.version || 1,
    tags: d.tags || [],
    checksum: d.checksum || "",
    lastAccessed: d.lastAccessed || "",
    accessCount: d.accessCount || 0,
  }))
}

export function getAuditLogs(): any[] {
  return StorageUtils.getAuditLogs()
}

export function getStorageStats(): { usedMB: number; totalMB: number } {
  const stats = EnhancedStorageManager.getStorageStats()
  const usedMB = Math.round((stats.used / (1024 * 1024)) * 10) / 10
  const totalMB = Math.round(((stats.used + stats.available) / (1024 * 1024)) * 10) / 10
  return { usedMB, totalMB }
}

export function exportSystemData(): void {
  return StorageUtils.exportSystemData()
}

export async function importSystemData(file: File): Promise<void> {
  return StorageUtils.importSystemData(file)
}

export class DocumentManager {
  static async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  static encryptDocument(document: DocumentRecord): DocumentRecord {
    const encryptedDoc = {
      ...document,
      fileData: SecurityUtils.encrypt(document.fileData),
      isEncrypted: true,
      version: (document.version || 0) + 1,
      checksum: this.generateDocumentChecksum(document),
      lastAccessed: new Date().toISOString(),
    }

    return encryptedDoc
  }

  static decryptDocument(encryptedDocument: DocumentRecord): DocumentRecord {
    return {
      ...encryptedDocument,
      fileData: SecurityUtils.decrypt(encryptedDocument.fileData),
      isEncrypted: false,
      lastAccessed: new Date().toISOString(),
      accessCount: (encryptedDocument.accessCount || 0) + 1,
    }
  }

  static getDocumentsByWorkerId(workerId: string): DocumentRecord[] {
    if (!isBrowser) return []

    const documents: DocumentRecord[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`document_${workerId}_`)) {
        const docData = localStorage.getItem(key)
        if (docData) {
          try {
            const document = JSON.parse(docData)
            // Verify document integrity
            if (this.verifyDocumentIntegrity(document)) {
              documents.push(document)
            } else {
              console.warn(`Document integrity check failed for: ${key}`)
            }
          } catch (error) {
            console.error("Error parsing document:", error)
          }
        }
      }
    }

    return documents.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
  }

  static storeDocument(workerId: string, document: DocumentRecord): boolean {
    if (!isBrowser) return false
    try {
      // Create structured storage path: /documents/{workerId}/filename
      const documentPath = `document_${workerId}_${document.id}`

      // Add enhanced metadata
      const enhancedDocument: DocumentRecord = {
        ...document,
        version: 1,
        tags: document.tags || [],
        checksum: this.generateDocumentChecksum(document),
        lastAccessed: new Date().toISOString(),
        accessCount: 0,
      }

      // Encrypt before storage
      const encryptedDocument = this.encryptDocument(enhancedDocument)

      // Store with structured key
      localStorage.setItem(documentPath, JSON.stringify(encryptedDocument))

      SecurityUtils.logAccess("document_stored", workerId, "health_worker")
      return true
    } catch (error) {
      console.error("Error storing document:", error)
      return false
    }
  }

  static deleteDocument(workerId: string, documentId: string): boolean {
    if (!isBrowser) return false
    try {
      const documentPath = `document_${workerId}_${documentId}`
      localStorage.removeItem(documentPath)
      SecurityUtils.logAccess("document_delete", workerId, "health_worker")
      return true
    } catch (error) {
      console.error("Error deleting document:", error)
      return false
    }
  }

  private static verifyDocumentIntegrity(document: DocumentRecord): boolean {
    try {
      if (!document.checksum) return true // Legacy documents without checksum

      const expectedChecksum = this.generateDocumentChecksum(document)
      return document.checksum === expectedChecksum
    } catch (error) {
      console.error("Document integrity verification failed:", error)
      return false
    }
  }

  private static generateDocumentChecksum(document: DocumentRecord): string {
    const checksumData = {
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      uploadDate: document.uploadDate,
    }

    return SecurityUtils.encrypt(JSON.stringify(checksumData)).slice(0, 16)
  }

  static getDocumentStats(workerId: string): {
    totalDocuments: number
    totalSize: number
    documentTypes: Record<string, number>
    recentUploads: number
  } {
  if (!isBrowser) return { totalDocuments: 0, totalSize: 0, documentTypes: {}, recentUploads: 0 }

  const documents = this.getDocumentsByWorkerId(workerId)
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const stats = {
      totalDocuments: documents.length,
      totalSize: documents.reduce((sum, doc) => sum + doc.fileSize, 0),
      documentTypes: {} as Record<string, number>,
      recentUploads: 0,
    }

    documents.forEach((doc) => {
      // Count by document type
      stats.documentTypes[doc.documentType] = (stats.documentTypes[doc.documentType] || 0) + 1

      // Count recent uploads
      if (new Date(doc.uploadDate) > oneWeekAgo) {
        stats.recentUploads++
      }
    })

    return stats
  }

  static searchDocuments(workerId: string, query: string): DocumentRecord[] {
  if (!isBrowser) return []
  const documents = this.getDocumentsByWorkerId(workerId)
    const searchTerm = query.toLowerCase()

    return documents.filter((doc) => {
      return (
        doc.fileName.toLowerCase().includes(searchTerm) ||
        doc.description.toLowerCase().includes(searchTerm) ||
        doc.documentType.toLowerCase().includes(searchTerm) ||
        (doc.tags && doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
      )
    })
  }
}
