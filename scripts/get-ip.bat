@echo off
echo Getting your computer's IP address...
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo Found IP: !IP!
)
echo.
echo Update your .env file with:
echo EXPO_PUBLIC_SUPABASE_URL=http://!IP!:54321
pause
