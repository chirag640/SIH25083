#!/bin/bash

# MongoDB Atlas Setup Script for Migrant Worker Healthcare System
# This script helps you set up MongoDB Atlas for the healthcare system

echo "🏥 Migrant Worker Healthcare System - MongoDB Atlas Setup"
echo "========================================================="
echo

# Check if MongoDB is available locally
echo "1. Checking MongoDB installation..."
if command -v mongosh &> /dev/null; then
    echo "✅ MongoDB shell found"
else
    echo "⚠️  MongoDB shell not found locally"
    echo "   You can still use MongoDB Atlas cloud database"
fi
echo

# MongoDB Atlas Setup Instructions
echo "2. MongoDB Atlas Cloud Setup:"
echo "------------------------------"
echo "Follow these steps to set up MongoDB Atlas:"
echo
echo "Step 1: Create MongoDB Atlas Account"
echo "   • Visit: https://www.mongodb.com/cloud/atlas"
echo "   • Sign up for a free account"
echo "   • Create a new organization and project"
echo
echo "Step 2: Create a Database Cluster"
echo "   • Click 'Build a Database'"
echo "   • Choose 'Shared' (free tier)"
echo "   • Select your preferred cloud provider and region"
echo "   • Name your cluster (e.g., 'migrant-worker-cluster')"
echo
echo "Step 3: Configure Database Access"
echo "   • Create a database user:"
echo "     - Username: healthcare_admin"
echo "     - Password: [Generate strong password]"
echo "   • Add IP Address: 0.0.0.0/0 (for development)"
echo "     - For production, use specific IP addresses"
echo
echo "Step 4: Get Connection String"
echo "   • Click 'Connect' on your cluster"
echo "   • Choose 'Connect your application'"
echo "   • Copy the connection string"
echo "   • Replace <password> with your database password"
echo
echo "Step 5: Update Environment Variables"
echo "   • Open .env.local file"
echo "   • Update MONGODB_URI with your connection string"
echo

# Environment setup
echo "3. Environment Configuration:"
echo "-----------------------------"
echo "Copy the following to your .env.local file:"
echo
cat << 'EOF'
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://healthcare_admin:<password>@migrant-worker-cluster.xxxxx.mongodb.net/
DB_NAME=migrant-worker-system

# JWT Security (Generate secure keys for production)
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Encryption Key (Generate 32-character key)
ENCRYPTION_KEY=$(openssl rand -base64 32 | head -c 32)

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
EOF

echo
echo "4. Database Collections:"
echo "-----------------------"
echo "The following collections will be created automatically:"
echo "   • users - User accounts and authentication"
echo "   • workerprofiles - Worker personal information"
echo "   • medicalvisits - Medical consultation records"
echo "   • documents - Encrypted document storage"
echo "   • auditlogs - Security and access logs"
echo

# Security recommendations
echo "5. Security Recommendations:"
echo "---------------------------"
echo "For Production Deployment:"
echo "   ✅ Use strong, unique passwords"
echo "   ✅ Enable MongoDB Atlas IP whitelist"
echo "   ✅ Enable database authentication"
echo "   ✅ Use TLS/SSL encryption"
echo "   ✅ Regular security updates"
echo "   ✅ Monitor audit logs"
echo "   ✅ Backup data regularly"
echo

# Testing instructions
echo "6. Testing Your Setup:"
echo "---------------------"
echo "After configuration, test your setup:"
echo
echo "Start the development server:"
echo "   npm run dev"
echo
echo "Test authentication endpoints:"
echo "   curl -X POST http://localhost:3000/api/auth/register \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"name\":\"Test Admin\",\"email\":\"admin@test.com\",\"password\":\"TestPass123!\",\"role\":\"admin\"}'"
echo
echo "Check database connection in browser console"
echo

# Final notes
echo "7. Additional Resources:"
echo "-----------------------"
echo "   📖 MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/"
echo "   🔒 Security Best Practices: ./SECURITY_UPGRADES.md"
echo "   🚀 API Documentation: Run 'npm run dev' and visit /api/docs"
echo
echo "✅ Setup guide complete!"
echo "   For support, check the SECURITY_UPGRADES.md file"
echo "========================================================="
