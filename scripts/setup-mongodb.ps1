# MongoDB Atlas Setup Script for Migrant Worker Healthcare System
# PowerShell version for Windows users

Write-Host "🏥 Migrant Worker Healthcare System - MongoDB Atlas Setup" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is available locally
Write-Host "1. Checking MongoDB installation..." -ForegroundColor Yellow
try {
    $mongoVersion = mongosh --version 2>$null
    if ($mongoVersion) {
        Write-Host "✅ MongoDB shell found" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  MongoDB shell not found locally" -ForegroundColor Yellow
    Write-Host "   You can still use MongoDB Atlas cloud database" -ForegroundColor Gray
}
Write-Host ""

# MongoDB Atlas Setup Instructions
Write-Host "2. MongoDB Atlas Cloud Setup:" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
Write-Host "Follow these steps to set up MongoDB Atlas:" -ForegroundColor White
Write-Host ""
Write-Host "Step 1: Create MongoDB Atlas Account" -ForegroundColor Cyan
Write-Host "   • Visit: https://www.mongodb.com/cloud/atlas" -ForegroundColor Gray
Write-Host "   • Sign up for a free account" -ForegroundColor Gray
Write-Host "   • Create a new organization and project" -ForegroundColor Gray
Write-Host ""
Write-Host "Step 2: Create a Database Cluster" -ForegroundColor Cyan
Write-Host "   • Click 'Build a Database'" -ForegroundColor Gray
Write-Host "   • Choose 'Shared' (free tier)" -ForegroundColor Gray
Write-Host "   • Select your preferred cloud provider and region" -ForegroundColor Gray
Write-Host "   • Name your cluster (e.g., 'migrant-worker-cluster')" -ForegroundColor Gray
Write-Host ""
Write-Host "Step 3: Configure Database Access" -ForegroundColor Cyan
Write-Host "   • Create a database user:" -ForegroundColor Gray
Write-Host "     - Username: healthcare_admin" -ForegroundColor Gray
Write-Host "     - Password: [Generate strong password]" -ForegroundColor Gray
Write-Host "   • Add IP Address: 0.0.0.0/0 (for development)" -ForegroundColor Gray
Write-Host "     - For production, use specific IP addresses" -ForegroundColor Yellow
Write-Host ""
Write-Host "Step 4: Get Connection String" -ForegroundColor Cyan
Write-Host "   • Click 'Connect' on your cluster" -ForegroundColor Gray
Write-Host "   • Choose 'Connect your application'" -ForegroundColor Gray
Write-Host "   • Copy the connection string" -ForegroundColor Gray
Write-Host "   • Replace <password> with your database password" -ForegroundColor Gray
Write-Host ""
Write-Host "Step 5: Update Environment Variables" -ForegroundColor Cyan
Write-Host "   • Open .env.local file" -ForegroundColor Gray
Write-Host "   • Update MONGODB_URI with your connection string" -ForegroundColor Gray
Write-Host ""

# Environment setup
Write-Host "3. Environment Configuration:" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Gray
Write-Host "Add the following to your .env.local file:" -ForegroundColor White
Write-Host ""
Write-Host @"
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://healthcare_admin:<password>@migrant-worker-cluster.xxxxx.mongodb.net/
DB_NAME=migrant-worker-system

# JWT Security (Generate secure keys for production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-64-chars-long
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Encryption Key (Generate 32-character key)
ENCRYPTION_KEY=your-32-character-encryption-key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
"@ -ForegroundColor Green

Write-Host ""
Write-Host "4. Database Collections:" -ForegroundColor Yellow
Write-Host "-----------------------" -ForegroundColor Gray
Write-Host "The following collections will be created automatically:" -ForegroundColor White
Write-Host "   • users - User accounts and authentication" -ForegroundColor Gray
Write-Host "   • workerprofiles - Worker personal information" -ForegroundColor Gray
Write-Host "   • medicalvisits - Medical consultation records" -ForegroundColor Gray
Write-Host "   • documents - Encrypted document storage" -ForegroundColor Gray
Write-Host "   • auditlogs - Security and access logs" -ForegroundColor Gray
Write-Host ""

# Security recommendations
Write-Host "5. Security Recommendations:" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Gray
Write-Host "For Production Deployment:" -ForegroundColor White
Write-Host "   ✅ Use strong, unique passwords" -ForegroundColor Green
Write-Host "   ✅ Enable MongoDB Atlas IP whitelist" -ForegroundColor Green
Write-Host "   ✅ Enable database authentication" -ForegroundColor Green
Write-Host "   ✅ Use TLS/SSL encryption" -ForegroundColor Green
Write-Host "   ✅ Regular security updates" -ForegroundColor Green
Write-Host "   ✅ Monitor audit logs" -ForegroundColor Green
Write-Host "   ✅ Backup data regularly" -ForegroundColor Green
Write-Host ""

# Testing instructions
Write-Host "6. Testing Your Setup:" -ForegroundColor Yellow
Write-Host "---------------------" -ForegroundColor Gray
Write-Host "After configuration, test your setup:" -ForegroundColor White
Write-Host ""
Write-Host "Start the development server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Test authentication endpoints:" -ForegroundColor Cyan
Write-Host @"
   curl -X POST http://localhost:3000/api/auth/register `
     -H 'Content-Type: application/json' `
     -d '{"name":"Test Admin","email":"admin@test.com","password":"TestPass123!","role":"admin"}'
"@ -ForegroundColor Gray
Write-Host ""
Write-Host "Check database connection in browser console" -ForegroundColor Gray
Write-Host ""

# Final notes
Write-Host "7. Additional Resources:" -ForegroundColor Yellow
Write-Host "-----------------------" -ForegroundColor Gray
Write-Host "   📖 MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/" -ForegroundColor Gray
Write-Host "   🔒 Security Best Practices: ./SECURITY_UPGRADES.md" -ForegroundColor Gray
Write-Host "   🚀 API Documentation: Run 'npm run dev' and visit /api/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Setup guide complete!" -ForegroundColor Green
Write-Host "   For support, check the SECURITY_UPGRADES.md file" -ForegroundColor Gray
Write-Host "=========================================================" -ForegroundColor Cyan

# Pause to let user read
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
