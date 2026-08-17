import pymupdf
import sys

def extract_text(pdf_path):
    doc = pymupdf.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

if __name__ == "__main__":
    base_dir = 'C:/Users/HP/.gemini/antigravity/brain/934c1033-91dd-43a1-9c32-23877c128927/.user_uploaded/'
    pdfs = [
        'media_1786503649385.pdf',
        'media_1786503649409.pdf',
        'media_1786503649486.pdf'
    ]
    
    for i, pdf in enumerate(pdfs):
        try:
            t = extract_text(base_dir + pdf)
            with open(f'd:/mern-library/backend/pdf_{i+1}.txt', 'w', encoding='utf-8') as f:
                f.write(t)
            print(f"PDF {i+1} Extracted: {len(t)} characters")
        except Exception as e:
            print(f"Error PDF {i+1}:", e)
