$ErrorActionPreference = 'Stop'
$apiBase = 'https://learningmanagementsystem-production-76e0.up.railway.app/api'

$body = @{ fullName='Automated Run 6'; email='automated+run6@example.com'; password='TestPass1234' } | ConvertTo-Json
Write-Host '--- Register ---'
try {
    $reg = Invoke-RestMethod -Uri "$apiBase/auth/student/register" -Method Post -ContentType 'application/json' -Body $body -Verbose
    Write-Host ($reg | ConvertTo-Json -Depth 5)
} catch {
    Write-Host 'REGISTER ERROR:'
    Write-Host $_ | Out-String
}

Start-Sleep -Seconds 1
Write-Host '--- Login ---'
$loginBody = @{ email='automated+run6@example.com'; password='TestPass1234' } | ConvertTo-Json
try {
    $login = Invoke-RestMethod -Uri "$apiBase/auth/student/login" -Method Post -ContentType 'application/json' -Body $loginBody -Verbose
    Write-Host ($login | ConvertTo-Json -Depth 5)
} catch {
    Write-Host 'LOGIN ERROR:'
    Write-Host $_ | Out-String
}
