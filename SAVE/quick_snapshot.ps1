# Quick snapshot script (PowerShell)
# Run from inside the `quiz-application` folder.
# This script zips common frontend folders (client and frontend) and the SAVE folder into a single zip next to the project.

$root = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
# go up to project root
Set-Location $root
$dest = Join-Path $root "..\quiz-application-snapshot.zip"

Write-Host "Creating snapshot at: $dest"
# include only these directories to avoid huge node_modules if present
$include = @(
    (Join-Path $root 'client'),
    (Join-Path $root 'frontend'),
    (Join-Path $root 'SAVE')
)

# Filter out paths that don't exist
$include = $include | Where-Object { Test-Path $_ }

if ($include.Count -eq 0) {
    Write-Error "No target folders found to archive. Make sure you're in the project folder and that 'client' or 'frontend' exists."
    exit 1
}

# Compress
try {
    Compress-Archive -Path $include -DestinationPath $dest -Force
    Write-Host "Snapshot created: $dest"
} catch {
    Write-Error "Compress failed: $_"
}
