# Start both client and server dev servers in separate processes (PowerShell)
$proj = Split-Path -Parent $MyInvocation.MyCommand.Definition
Start-Process -FilePath npm -ArgumentList 'start' -WorkingDirectory (Join-Path $proj 'client') -NoNewWindow
Start-Process -FilePath npm -ArgumentList 'start' -WorkingDirectory (Join-Path $proj 'server') -NoNewWindow
Write-Host 'Started client and server dev servers.'
