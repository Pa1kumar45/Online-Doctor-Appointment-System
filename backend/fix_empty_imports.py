import os
import re

# Mapping of common corrupted imports to their correct paths
IMPORT_FIXES = {
    # Controllers
    "import { Appointment } from ''": "import { Appointment } from '../models/Appointment'",
    "import { Doctor } from ''": "import { Doctor } from '../models/Doctor'",
    "import { Patient } from ''": "import { Patient } from '../models/Patient'",
    "import Admin from ''": "import Admin from '../models/Admin'",
    "import Session from ''": "import Session from '../models/Session'",
    "import OTP from ''": "import OTP from '../models/OTP'",
    "import AuthLog from ''": "import AuthLog from '../models/AuthLog'",
    "import AdminActionLog from ''": "import AdminActionLog from '../models/AdminActionLog'",
    
    # Routes and middleware
    "import { protect } from ''": "import { protect } from '../middleware/auth'",
    "import { protect, patientOnly } from ''": "import { protect, patientOnly } from '../middleware/auth'",
    "import { protect, adminOnly } from ''": "import { protect, adminOnly } from '../middleware/auth'",
    "import { protect, doctorOnly, patientOnly } from ''": "import { protect, doctorOnly, patientOnly } from '../middleware/auth'",
    "import sessionRoutes from ''": "import sessionRoutes from './sessions'",
    
    # Multiline imports - need special handling
    '} from \'\'': None,  # Will handle separately
}

def fix_empty_imports(directory):
    """Fix all empty import statements"""
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Apply all simple replacements
                    for broken, fixed in IMPORT_FIXES.items():
                        if fixed:  # Skip None values
                            content = content.replace(broken, fixed)
                    
                    # Handle multi-line imports with empty string
                    # Pattern: controller imports
                    if 'controllers/' in filepath or 'Controller' in filepath:
                        if "} from ''" in content:
                            # appointmentController
                            content = re.sub(r"getAvailableSlots,\s*// updateAppointmentStatus\s*}\s*from\s*''", 
                                           "getAvailableSlots,\n  // updateAppointmentStatus\n} from '../controllers/appointmentController'", content)
                            # patientController
                            content = re.sub(r"updatePatientProfile,\s*deletePatient,\s*}\s*from\s*''",
                                           "updatePatientProfile,\n  deletePatient,\n} from '../controllers/patientController'", content)
                            # adminController
                            content = re.sub(r"getFailedLoginAttempts,\s*clearFailedAttempts,\s*}\s*from\s*''",
                                           "getFailedLoginAttempts,\n  clearFailedAttempts,\n} from '../controllers/adminController'", content)
                            # authController
                            content = re.sub(r"changePassword,\s*}\s*from\s*''",
                                           "changePassword,\n} from '../controllers/authController'", content)
                            # doctorController
                            content = re.sub(r"updateDoctorReview,\s*deleteDoctorReview,\s*}\s*from\s*''",
                                           "updateDoctorReview,\n  deleteDoctorReview,\n} from '../controllers/doctorController'", content)
                            # sessionController
                            content = re.sub(r"revokeSession,\s*}\s*from\s*''",
                                           "revokeSession,\n} from '../controllers/sessionController'", content)
                    
                    # Handle validation.js
                    if 'validation.js' in filepath:
                        content = re.sub(r"validateChangePassword,\s*}\s*from\s*''",
                                       "validateChangePassword,\n} from './validators'", content)
                    
                    if content != original_content:
                        with open(filepath, 'w', encoding='utf-8', newline='') as f:
                            f.write(content)
                        print(f'Fixed: {file}')
                        count += 1
                except Exception as e:
                    print(f'Error processing {file}: {e}')
    
    print(f'\nTotal files fixed: {count}')

if __name__ == '__main__':
    fix_empty_imports('src')
