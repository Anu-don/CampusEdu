@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Starting CampusEdu Smart Chatbot...
echo ==========================================

:: 1. Verify Python installation
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to your system's PATH.
    echo Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

:: 2. Ensure data/ directory exists
if not exist "data" (
    echo [INFO] Creating data directory...
    mkdir "data"
)

:: 3. Run check_requirements.py
echo [INFO] Verifying packages...
python check_requirements.py
set CHECK_ERR=%errorlevel%

if %CHECK_ERR% neq 0 (
    echo [INFO] Installing/updating requirements from requirements.txt...
    python -m pip install -r requirements.txt
) else (
    echo [INFO] All requirements verified.
)

:: 4. Launch main.py
echo [INFO] Launching CLI Chatbot...
python main.py

pause
