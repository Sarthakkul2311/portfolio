"""Add professional headshot to top-right of Sarthak-Kulkarni-CV.docx"""
from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.shared import Pt, Inches, RGBColor, Twips, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import OxmlElement, parse_xml
from PIL import Image

CV_PATH = Path(r"c:\Users\KulkarS4.EU\Documents\portfolio-web\portfolio\Sarthak-Kulkarni-CV.docx")
PHOTO_SRC = Path(
    r"C:\Users\KulkarS4.EU\.cursor\projects\c-Users-KulkarS4-EU-Documents-portfolio-web-portfolio"
    r"\assets\c__Users_KulkarS4.EU_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"578783136975bacdb0f772bfd5b3adf0_images_image-938ff0f1-8964-42c3-880b-a2d5a1cd7286.png"
)
PHOTO_JPG = Path(r"c:\Users\KulkarS4.EU\Documents\portfolio-web\portfolio\assets\cv-photo.jpg")


def set_run_font(run, name="Calibri", size=10, bold=False, color=None):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    if color:
        run.font.color.rgb = RGBColor(*color)


def set_cell_borders_none(cell):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    # remove existing borders
    for child in list(tcPr):
        if child.tag == qn("w:tcBorders"):
            tcPr.remove(child)
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        '<w:top w:val="nil"/>'
        '<w:left w:val="nil"/>'
        '<w:bottom w:val="nil"/>'
        '<w:right w:val="nil"/>'
        "</w:tcBorders>"
    )
    tcPr.append(borders)


def set_table_borders_none(table):
    tbl = table._tbl
    tblPr = tbl.tblPr
    if tblPr is None:
        tblPr = OxmlElement("w:tblPr")
        tbl.insert(0, tblPr)
    for child in list(tblPr):
        if child.tag == qn("w:tblBorders"):
            tblPr.remove(child)
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        '<w:top w:val="nil"/>'
        '<w:left w:val="nil"/>'
        '<w:bottom w:val="nil"/>'
        '<w:right w:val="nil"/>'
        '<w:insideH w:val="nil"/>'
        '<w:insideV w:val="nil"/>'
        "</w:tblBorders>"
    )
    tblPr.append(borders)


def prepare_photo():
    PHOTO_JPG.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(PHOTO_SRC).convert("RGB")
    # Slight upscale for crisp print quality while keeping aspect
    im = im.resize((400, 404), Image.Resampling.LANCZOS)
    im.save(PHOTO_JPG, "JPEG", quality=95)
    return PHOTO_JPG


def build_header_table(doc, photo_path):
    """Insert a 1x2 borderless header table at the top of the document."""
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders_none(table)

    # Column widths: text ~5.7", photo ~1.4"  (page content width ~6.95")
    table.columns[0].width = Inches(5.55)
    table.columns[1].width = Inches(1.4)

    left, right = table.rows[0].cells
    left.width = Inches(5.55)
    right.width = Inches(1.4)
    set_cell_borders_none(left)
    set_cell_borders_none(right)
    left.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    right.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP

    # Clear default empty paragraph in left and rebuild
    left_para = left.paragraphs[0]
    left_para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    left_para.paragraph_format.space_before = Pt(0)
    left_para.paragraph_format.space_after = Pt(2)
    r = left_para.add_run("SARTHAK KULKARNI")
    set_run_font(r, size=18, bold=True, color=(31, 78, 121))

    p2 = left.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p2.paragraph_format.space_before = Pt(0)
    p2.paragraph_format.space_after = Pt(2)
    r = p2.add_run("GenAI & DevOps Engineer  |  Agentic AI Systems")
    set_run_font(r, size=11, bold=True, color=(60, 60, 60))

    p3 = left.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p3.paragraph_format.space_before = Pt(0)
    p3.paragraph_format.space_after = Pt(0)
    r = p3.add_run(
        "Pune, Maharashtra, India  |  (+91) 93256-02791  |  sarthakkul2311@gmail.com"
    )
    set_run_font(r, size=9.5, color=(70, 70, 70))

    p4 = left.add_paragraph()
    p4.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p4.paragraph_format.space_before = Pt(0)
    p4.paragraph_format.space_after = Pt(0)
    r = p4.add_run("linkedin.com/in/sarthak-kulkarni-/")
    set_run_font(r, size=9.5, color=(70, 70, 70))

    # Photo cell — right-aligned
    right_para = right.paragraphs[0]
    right_para.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    right_para.paragraph_format.space_before = Pt(0)
    right_para.paragraph_format.space_after = Pt(0)
    run = right_para.add_run()
    # Match older CV scale (~1.33"); square professional headshot
    run.add_picture(str(photo_path), width=Inches(1.28))

    # Move table to document start (before remaining body paragraphs)
    tbl = table._tbl
    body = doc.element.body
    body.remove(tbl)
    # Insert before first paragraph element
    first = body[0]
    first.addprevious(tbl)
    return table


def main():
    photo = prepare_photo()
    doc = Document(str(CV_PATH))

    # Remove existing header paragraphs (name, title, contact)
    # They are the first 3 paragraphs of the AI CV
    to_remove = []
    for i, p in enumerate(doc.paragraphs[:3]):
        text = (p.text or "").strip()
        if i == 0 and "SARTHAK" in text.upper():
            to_remove.append(p)
        elif i == 1 and "GenAI" in text:
            to_remove.append(p)
        elif i == 2 and ("Pune" in text or "linkedin" in text.lower() or "@" in text):
            to_remove.append(p)

    for p in to_remove:
        p._element.getparent().remove(p._element)

    build_header_table(doc, photo)
    doc.save(str(CV_PATH))
    print(f"Updated: {CV_PATH}")
    print(f"Photo: {photo}")


if __name__ == "__main__":
    main()
