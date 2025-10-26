#!/usr/bin/env python3
"""Replace any types with unknown in TypeScript files"""

import re
from pathlib import Path

# Files to fix
files_to_fix = [
    'src/components/OTPVerification.tsx',
    'src/context/AppContext.tsx',
    'src/pages/AdminLogin.tsx',
    'src/pages/DoctorPage.tsx',
    'src/pages/ForgotPassword.tsx',
    'src/pages/Login.tsx',
    'src/pages/SessionManagement.tsx',
    'src/pages/SignUp.tsx',
]

for file_path in files_to_fix:
    filepath = Path(file_path)
    if filepath.exists():
        content = filepath.read_text(encoding='utf-8')
        
        # Replace catch (err: any) and catch (error: any) with unknown
        content = re.sub(r'catch \(err: any\)', 'catch (err: unknown)', content)
        content = re.sub(r'catch \(error: any\)', 'catch (error: unknown)', content)
        
        filepath.write_text(content, encoding='utf-8')
        print(f'✅ Fixed {file_path}')
    else:
        print(f'❌ File not found: {file_path}')

print('\n✅ All catch block any types replaced with unknown')
