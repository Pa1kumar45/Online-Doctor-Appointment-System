# Simple PowerShell test script for validation
# Run this after starting the server with: npm start

Write-Host "`n🧪 Testing Validation System`n" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Gray -NoNewline; Write-Host ("=" * 79) -ForegroundColor Gray

# Wait for server to start
Start-Sleep -Seconds 3

# Test 1: Weak password
Write-Host "`n Test 1: Weak Password (no uppercase, <8 chars)`n" -ForegroundColor Yellow
Write-Host "-" -ForegroundColor Gray -NoNewline; Write-Host ("-" * 79) -ForegroundColor Gray

$test1 = @{
    name = "John Doe"
    email = "john@example.com"
    password = "weak"
    role = "patient"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' `
        -Method POST `
        -Body $test1 `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "Response: " -NoNewline
    $response1 | ConvertTo-Json -Depth 5
} catch {
    if ($_.ErrorDetails.Message) {
        Write-Host "✅ Validation Error (Expected):" -ForegroundColor Green
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
    } else {
        Write-Host "❌ Connection Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Invalid email
Write-Host "`n`n Test 2: Invalid Email Format`n" -ForegroundColor Yellow
Write-Host "-" -ForegroundColor Gray -NoNewline; Write-Host ("-" * 79) -ForegroundColor Gray

$test2 = @{
    name = "John Doe"
    email = "not-an-email"
    password = "StrongPass123!"
    role = "patient"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' `
        -Method POST `
        -Body $test2 `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "Response: " -NoNewline
    $response2 | ConvertTo-Json -Depth 5
} catch {
    if ($_.ErrorDetails.Message) {
        Write-Host "✅ Validation Error (Expected):" -ForegroundColor Green
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
    } else {
        Write-Host "❌ Connection Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Name with numbers
Write-Host "`n`n Test 3: Invalid Name (contains numbers)`n" -ForegroundColor Yellow
Write-Host "-" -ForegroundColor Gray -NoNewline; Write-Host ("-" * 79) -ForegroundColor Gray

$test3 = @{
    name = "John123"
    email = "john@example.com"
    password = "StrongPass123!"
    role = "patient"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' `
        -Method POST `
        -Body $test3 `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "Response: " -NoNewline
    $response3 | ConvertTo-Json -Depth 5
} catch {
    if ($_.ErrorDetails.Message) {
        Write-Host "✅ Validation Error (Expected):" -ForegroundColor Green
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
    } else {
        Write-Host "❌ Connection Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Valid registration
Write-Host "`n`n Test 4: Valid Patient Registration`n" -ForegroundColor Yellow
Write-Host "-" -ForegroundColor Gray -NoNewline; Write-Host ("-" * 79) -ForegroundColor Gray

$test4 = @{
    name = "John Doe"
    email = "john.doe.test@example.com"
    password = "StrongPass123!"
    role = "patient"
    contactNumber = "9876543210"
    gender = "male"
    bloodGroup = "O+"
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' `
        -Method POST `
        -Body $test4 `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "✅ Registration Successful!" -ForegroundColor Green
    $response4 | ConvertTo-Json -Depth 5
} catch {
    if ($_.ErrorDetails.Message) {
        Write-Host "❌ Unexpected Validation Error:" -ForegroundColor Red
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
    } else {
        Write-Host "❌ Connection Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n" -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline; Write-Host ("=" * 79) -ForegroundColor Gray
Write-Host "🏁 Testing Complete!`n" -ForegroundColor Cyan
