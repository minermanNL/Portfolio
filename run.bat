@echo off
echo Starting development server...

REM Check for Python 3
python --version 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Using Python server...
    start http://localhost:3000
    python -m http.server 3000
    exit
)

REM Check for Python 2
python2 --version 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Using Python 2 server...
    start http://localhost:3000
    python2 -m SimpleHTTPServer 3000
    exit
)

REM Check for Node.js/NPX
npx --version 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Using Node.js server...
    start http://localhost:3000
    npx http-server -p 3000
    exit
)

REM Check for PHP
php --version 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Using PHP server...
    start http://localhost:3000
    php -S localhost:3000
    exit
)

REM If no server is found
echo No suitable server found. Please install one of the following:
echo - Python 3 (recommended)
echo - Node.js
echo - PHP
echo.
echo Press any key to exit...
pause >nul 