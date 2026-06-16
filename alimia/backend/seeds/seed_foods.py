import sys
sys.path.append('/home/adele/holbertonschool-Portfolio/alimia/backend')
import pandas
from database import SessionLocal
from models.food import Food

def read_table():
    read_file = pandas.read_excel('seeds/Table Ciqual 2025_FR_2025_11_03.xlsx', sheet_name='composition nutritionnelle')
    result = read_file[read_file['alim_grp_nom_fr'] != 'entrées et plats\ncomposés']

    db = SessionLocal()
    
    for index, row in result.iterrows():
    # row['nom_colonne'] pour accéder à une valeur
        ciqual_code = row[read_file.columns[6]]
        name = row[read_file.columns[7]]
        energy_cal = clean_value(row[read_file.columns[10]])
        proteins = clean_value(row[read_file.columns[14]])
        carbohydrates = clean_value(row[read_file.columns[16]])
        fats = clean_value(row[read_file.columns[17]])
        sugars = clean_value(row[read_file.columns[18]])
        saturated_fats = clean_value(row[read_file.columns[31]])
        fiber = clean_value(row[read_file.columns[26]])
        sodium = clean_value(row[read_file.columns[60]])
        calcium = clean_value(row[read_file.columns[50]])
        iron = clean_value(row[read_file.columns[53]])
        magnesium = clean_value(row[read_file.columns[55]])
        vitamin_a = clean_value(row[read_file.columns[62]])
        vitamin_c = clean_value(row[read_file.columns[72]])
        vitamin_d = clean_value(row[read_file.columns[65]])
        vitamin_e = clean_value(row[read_file.columns[68]])
        vitamin_b9 = clean_value(row[read_file.columns[79]])
        vitamin_b12 = clean_value(row[read_file.columns[82]])
        food = Food(
            ciqual_code=ciqual_code,
            name=name,
            energy_cal=energy_cal,
            proteins=proteins,
            carbohydrates=carbohydrates,
            fats=fats,
            sugars=sugars,
            saturated_fats=saturated_fats,
            fiber=fiber,
            sodium=sodium,
            calcium=calcium,
            iron=iron,
            magnesium=magnesium,
            vitamin_a=vitamin_a,
            vitamin_c=vitamin_c,
            vitamin_d=vitamin_d,
            vitamin_e=vitamin_e,
            vitamin_b9=vitamin_b9,
            vitamin_b12=vitamin_b12
        )
        db.add(food)
    db.commit()
    db.close()

def clean_value(val):
    if isinstance(val, (float, int)):
        return val
    if val is None:
        return None
    if val == '-' or val == 'traces':
        return None
    if val.startswith("<"):
        return None
    else:
        return float(val.replace(',', '.'))

read_table()
