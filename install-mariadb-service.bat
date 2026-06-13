@echo off
REM ============================================================
REM  Installs XAMPP's MariaDB as a Windows service named "mysql"
REM  so it starts automatically on boot and never gets reaped.
REM  Just double-click this file and approve the UAC prompt.
REM ============================================================

REM --- Self-elevate to Administrator if not already ---
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo.
echo === Installing MariaDB service ===
"C:\xampp\mysql\bin\mysqld.exe" --install mysql --defaults-file="C:\xampp\mysql\bin\my.ini"

echo.
echo === Setting service to start automatically ===
sc config mysql start= auto

echo.
echo === Starting the service ===
net start mysql

echo.
echo === Current status ===
sc query mysql | findstr STATE

echo.
echo Done. MariaDB will now start automatically on every boot.
pause
