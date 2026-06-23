import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig_content = content

    # 1. BORDERS & SHADOWS
    content = re.sub(r'\brounded-(?:xl|2xl|3xl)\b', 'rounded-lg', content)
    content = re.sub(r'\bshadow-(?:md|lg|xl|2xl)\b', 'shadow-sm', content)
    content = re.sub(r'\bborder-(?:slate|gray|zinc)-(?:100|200)(?!\/\d+)\b', 'border-zinc-200/60', content)

    # 3. COLOR PALETTE PURGE (Neutral Shifts)
    content = re.sub(r'\bbg-(?:slate|gray)-50(?!\/\d+)\b', 'bg-zinc-50/50', content)
    content = re.sub(r'\bbg-(?:slate|gray|zinc)-100(?!\/\d+)\b', 'bg-zinc-100/50', content)
    
    # Switch all slate/gray text and backgrounds to zinc
    content = re.sub(r'\btext-(?:slate|gray)-(\d{3})\b', r'text-zinc-\1', content)
    content = re.sub(r'\bbg-(?:slate|gray)-(\d{3})(?!\/\d+)\b', r'bg-zinc-\1', content)
    
    if orig_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def main():
    targets = ['src/app', 'src/components']
    for t in targets:
        for root, dirs, files in os.walk(t):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.ts'):
                    process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
