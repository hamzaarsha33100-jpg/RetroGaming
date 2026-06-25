@echo off
echo ========================================
echo Pushing Retro Gaming to GitHub
echo ========================================
echo.

cd "c:\Users\tahar\OneDrive\Desktop\Retro Games"

echo Step 1: Initializing Git repository...
git init

echo Step 2: Configuring Git user...
git config user.email "bunnytaha@example.com"
git config user.name "Bunnytaha"

echo Step 3: Adding all files...
git add .

echo Step 4: Creating initial commit...
git commit -m "Initial commit: Complete Retro Gaming E-commerce Platform"

echo Step 5: Adding remote repository...
git remote add origin https://github.com/Bunnytaha/RetroGaming.git

echo Step 6: Setting main branch...
git branch -M main

echo Step 7: Pushing to GitHub...
echo You will be prompted for credentials:
echo Username: Bunnytaha
echo Password: [Your GitHub Token]
git push -u origin main

echo.
echo ========================================
echo Done! Check https://github.com/Bunnytaha/RetroGaming
echo ========================================
pause
