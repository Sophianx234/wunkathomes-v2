import os, glob, re

files = [
    'src/app/admin/manage/access-control/page.tsx',
    'src/components/manage-tenants-client.tsx',
    'src/components/onboarding-client.tsx',
    'src/components/tour-table.tsx',
    'src/components/transactions-client.tsx',
    'src/components/transaction-client.tsx',
    'src/components/maintenance-client.tsx'
]

for file in files:
    if not os.path.exists(file):
        print(f'File not found: {file}')
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace import
    content = content.replace('import { Sheet, SheetContent } from "@/components/ui/sheet";', 'import { Dialog, DialogContent } from "@/components/ui/dialog";')
    
    # Replace tags
    content = content.replace('<Sheet\n', '<Dialog\n')
    content = content.replace('<Sheet ', '<Dialog ')
    content = content.replace('</Sheet>', '</Dialog>')
    content = content.replace('</SheetContent>', '</DialogContent>')
    
    # Replace SheetContent attributes
    def replace_sheet_content(m):
        attr = m.group(1)
        # remove border-l
        attr = re.sub(r'\bborder-l\b', 'border', attr)
        # replace sm:max-w-[...] or sm:max-w-md with sm:max-w-xl md:max-w-2xl
        attr = re.sub(r'sm:max-w-[^\s\"]+', 'sm:max-w-xl md:max-w-2xl', attr)
        # remove right-0, h-full, etc if present
        attr = re.sub(r'\bright-0\b', '', attr)
        attr = re.sub(r'\bh-full\b', '', attr)
        # append max-h-[85vh] overflow-hidden rounded-lg
        # find className="..." and append
        def append_classes(m_class):
            cls = m_class.group(1)
            return 'className="' + cls + ' rounded-lg max-h-[85vh] overflow-hidden"'
        
        attr = re.sub(r'className="([^"]+)"', append_classes, attr)
        return '<DialogContent ' + attr + '>'
        
    content = re.sub(r'<SheetContent([^>]+)>', replace_sheet_content, content)
    
    # Replace rounded-xl and rounded-2xl to rounded-lg globally in the file
    content = content.replace('rounded-xl', 'rounded-lg')
    content = content.replace('rounded-2xl', 'rounded-lg')
    
    # Specific fix: selectedSheet / sheetStatus might exist. We shouldn't globally replace 'Sheet'
    # but we can replace 'SHEET'
    content = content.replace('SHEET', 'MODAL')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f'Processed {file}')
