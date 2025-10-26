import os
import re

def fix_js_imports(directory):
    """Remove .js extensions from import statements"""
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Replace .js in imports
                    updated = re.sub(r"from\s+'(\.\./[^']+)\.js'", r"from '\1'", content)
                    updated = re.sub(r'from\s+"(\.\./[^"]+)\.js"', r'from "\1"', updated)
                    updated = re.sub(r"from\s+'(\./[^']+)\.js'", r"from '\1'", updated)
                    updated = re.sub(r'from\s+"(\./[^"]+)\.js"', r'from "\1"', updated)
                    
                    if content != updated:
                        with open(filepath, 'w', encoding='utf-8', newline='') as f:
                            f.write(updated)
                        print(f'Fixed: {file}')
                        count += 1
                except Exception as e:
                    print(f'Error processing {file}: {e}')
    
    print(f'\nTotal files fixed: {count}')

if __name__ == '__main__':
    fix_js_imports('src')
