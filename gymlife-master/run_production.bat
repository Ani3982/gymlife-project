@echo off
echo ====================================================
echo   GymLife Production Deployment Launch Script
echo ====================================================
echo.

echo [1/3] Building React Frontend Production Bundle...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error building React frontend!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Collecting Django Static Files...
cd ..\backend
call ..\venv\Scripts\activate
call python manage.py collectstatic --noinput
if %errorlevel% neq 0 (
    echo Error collecting static files!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Launching Production WSGI Web Server on http://127.0.0.1:8000 ...
call waitress-serve --port=8000 gymlife_project.wsgi:application
pause
