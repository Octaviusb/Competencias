#!/bin/bash

echo "🚀 Desplegando Competency Manager..."

# Desplegar backend a Fly.io
echo "📦 Desplegando backend a Fly.io..."
cd backend
fly deploy
fly ssh console -C "npm run setup-prod"
cd ..

# Desplegar frontend a Vercel
echo "🌐 Desplegando frontend a Vercel..."
cd frontend
vercel --prod
cd ..

echo "✅ Despliegue completado!"
echo ""
echo "🔗 URLs de acceso:"
echo "Backend: https://competency-manager.fly.dev"
echo "Frontend: https://competencias-frontend.vercel.app"
echo ""
echo "🔑 Credenciales:"
echo "Admin: admin@demo.com / demo123"
echo "Psicólogo: psicologo@demo.com / psycho123"
echo "Organización: demo-org"