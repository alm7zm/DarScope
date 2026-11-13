@echo off
rem Runs Maven without installing it. The first run downloads Maven 3.9.11 into
rem %USERPROFILE%\.m2\wrapper\dists, and later runs reuse it.
rem Usage, inside backend\:  mvnw.cmd spring-boot:run   or   mvnw.cmd test
setlocal
set "MVN_VERSION=3.9.11"
set "MVN_DISTS=%USERPROFILE%\.m2\wrapper\dists"
set "MVN_HOME=%MVN_DISTS%\apache-maven-%MVN_VERSION%"

if not exist "%MVN_HOME%\bin\mvn.cmd" (
  echo Downloading Maven %MVN_VERSION%, once...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; [Net.ServicePointManager]::SecurityProtocol = 'Tls12'; $zip = Join-Path $env:TEMP 'apache-maven-%MVN_VERSION%-bin.zip'; Invoke-WebRequest -UseBasicParsing -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MVN_VERSION%/apache-maven-%MVN_VERSION%-bin.zip' -OutFile $zip; New-Item -ItemType Directory -Force -Path '%MVN_DISTS%' | Out-Null; Expand-Archive -Force -Path $zip -DestinationPath '%MVN_DISTS%'; Remove-Item $zip"
  if errorlevel 1 (
    echo Could not download Maven. Check the internet connection and try again.
    exit /b 1
  )
)

call "%MVN_HOME%\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%
