import sys
import json
import sqlite3

def parse_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
        
    books = []
    
    # skip header
    start = 0
    while start < len(lines):
        if 'SR No' in lines[start] or 'CODE' in lines[start] or 'BOOK NAME' in lines[start] or 'AUTHOR' in lines[start] or 'LANGUAGE' in lines[start] or 'TYPE' in lines[start]:
            start += 1
        else:
            break
            
    i = start
    while i < len(lines):
        if 'SR No' in lines[i] or 'CODE' in lines[i] or 'BOOK NAME' in lines[i]:
            i+=1
            continue
            
        # Line 1: usually something like "1 S-1" or "1" and next line "S-1"
        parts = lines[i].split()
        if len(parts) >= 2 and parts[0].isdigit():
            # Perfect case: "1 S-1"
            code = parts[1]
            title = lines[i+1]
            author = lines[i+2]
            lang = lines[i+3]
            category = lines[i+4]
            books.append({
                'isbn': code,
                'title': title,
                'author': author,
                'language': lang,
                'category': category,
                'quantity': 1,
                'availableCopies': 1
            })
            i += 5
        elif parts[0].isdigit():
            # Sometimes "1" then "S-1" on next line
            if i+5 < len(lines):
                code = lines[i+1]
                title = lines[i+2]
                author = lines[i+3]
                lang = lines[i+4]
                category = lines[i+5]
                books.append({
                    'isbn': code,
                    'title': title,
                    'author': author,
                    'language': lang,
                    'category': category,
                    'quantity': 1,
                    'availableCopies': 1
                })
                i += 6
            else:
                break
        else:
            print("Mismatch at line", i, lines[i])
            i += 1
            
    return books

all_books = []
for i in [1, 2, 3]:
    all_books.extend(parse_file(f'd:/mern-library/backend/pdf_{i}.txt'))

print("Total parsed:", len(all_books))

# Now generate a js script to insert into Turso
import sqlite3

# But since we use libsql in node, we will just write a node script
with open('d:/mern-library/backend/books_data.json', 'w', encoding='utf-8') as f:
    json.dump(all_books, f, ensure_ascii=False, indent=2)
