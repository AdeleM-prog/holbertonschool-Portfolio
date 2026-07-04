import pandas
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models.food import Food
from ciqual_curated_codes import CIQUAL_CURATED_CODES

def clean_value(val):
    if val is None:
        return None
    val = str(val).strip()
    if val in ["-", "traces", ""] or val.startswith("<"):
        return None
    val = val.replace(",", ".")
    try:
        return float(val)
    except ValueError:
        return None

def seed_foods():
    read_file = pandas.read_excel(
        os.path.join(os.path.dirname(__file__), "Table Ciqual 2025_FR_2025_11_03.xlsx"),
        sheet_name="composition nutritionnelle"
    )
    result = read_file[read_file[read_file.columns[6]].isin(CIQUAL_CURATED_CODES)]

    db = SessionLocal()
    try:
        for index, row in result.iterrows():
            food = Food(
                ciqual_code=row[read_file.columns[6]],
                name=row[read_file.columns[7]],
                energy_cal=clean_value(row[read_file.columns[10]]),
                proteins=clean_value(row[read_file.columns[14]]),
                carbohydrates=clean_value(row[read_file.columns[16]]),
                fats=clean_value(row[read_file.columns[17]]),
                sugars=clean_value(row[read_file.columns[18]]),
                saturated_fats=clean_value(row[read_file.columns[31]]),
                fiber=clean_value(row[read_file.columns[26]]),
                sodium=clean_value(row[read_file.columns[60]]),
                calcium=clean_value(row[read_file.columns[50]]),
                iron=clean_value(row[read_file.columns[53]]),
                magnesium=clean_value(row[read_file.columns[55]]),
                vitamin_a=clean_value(row[read_file.columns[62]]),
                vitamin_c=clean_value(row[read_file.columns[72]]),
                vitamin_d=clean_value(row[read_file.columns[65]]),
                vitamin_e=clean_value(row[read_file.columns[68]]),
                vitamin_b9=clean_value(row[read_file.columns[79]]),
                vitamin_b12=clean_value(row[read_file.columns[82]]),
            )
            db.add(food)
        db.commit()
        print(f"Import terminé : {len(result)} aliments insérés.")
    except Exception as e:
        db.rollback()
        print(f"Erreur : {e}")
    finally:
        db.close()

seed_foods()