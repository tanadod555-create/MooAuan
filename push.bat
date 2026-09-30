@echo off
title FitTrack - Push to GitHub
echo ===================================================
echo       FitTrack (MooAuan) - Push to GitHub
echo ===================================================
echo.

echo [1/3] Adding all files...
git add -A

echo.
echo [2/3] Committing changes...
git commit -m "update: sync FitTrack project"

echo.
echo [3/3] Pushing to GitHub (origin main)...
echo.
git push -u origin main

if errorlevel 1 goto error

:success
echo.
echo ===================================================
echo   [SUCCESS] Push to GitHub completed successfully!
echo.
echo   Check Actions: https://github.com/tanadod555-create/MooAuan/actions
echo   Website:       https://tanadod555-create.github.io/MooAuan/
echo ===================================================
goto end

:error
echo.
echo ===================================================
echo   [ERROR] Push failed.
echo   - If a browser window opens, please sign in.
echo   - Please check your internet connection.
echo ===================================================

:end
echo.
pause
