@echo off
setlocal
set "ATLAS_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "ATLAS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
"%ATLAS_NODE%" "%~dp0scripts\start-preview.mjs"
if errorlevel 1 pause
