import fitz
import sys
import json

def extract_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

if __name__ == "__main__":
    pdf1 = 'C:/Users/HP/.gemini/antigravity/brain/934c1033-91dd-43a1-9c32-23877c128927/.user_uploaded/media_1786184237494.pdf'
    pdf2 = 'C:/Users/HP/.gemini/antigravity/brain/934c1033-91dd-43a1-9c32-23877c128927/.user_uploaded/media_1786188793353.pdf'
    try:
        t1 = extract_text(pdf1)
        with open('d:/mern-library/backend/pdf1.txt', 'w', encoding='utf-8') as f:
            f.write(t1)
        print("PDF1 Extracted:", len(t1))
    except Exception as e:
        print("Error PDF1:", e)
        
    try:
        t2 = extract_text(pdf2)
        with open('d:/mern-library/backend/pdf2.txt', 'w', encoding='utf-8') as f:
            f.write(t2)
        print("PDF2 Extracted:", len(t2))
    except Exception as e:
        print("Error PDF2:", e)
