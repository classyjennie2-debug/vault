# Script to setup Vercel environment variables
Write-Host "Setting up Vercel environment variables..."

# Add EMAIL_HOST
Write-Host "Adding EMAIL_HOST..."
npx vercel env add EMAIL_HOST production smtp.mailersend.net <<< "n"

# Add EMAIL_PORT
Write-Host "Adding EMAIL_PORT..."
npx vercel env add EMAIL_PORT production 587 <<< "n"

# Add EMAIL_USER
Write-Host "Adding EMAIL_USER..."
npx vercel env add EMAIL_USER production MS_zlGla7@test-69oxl5edkvdl785k.mlsender.net <<< "y"

# Add EMAIL_PASS
Write-Host "Adding EMAIL_PASS..."
npx vercel env add EMAIL_PASS production mssp.BuLeWRD.3zxk54v2nqzljy6v.OJZUXFk <<< "y"

Write-Host "Environment variables setup complete!"
