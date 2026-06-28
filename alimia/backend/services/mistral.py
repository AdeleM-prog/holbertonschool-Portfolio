import os
from mistralai import Mistral
from sqlalchemy.orm import Session
from models.user_liked_foods import LikedFoods
from models.user_disliked_foods import DislikedFoods
from models.food import Food

client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

def generate_recipe(db: Session, user, members, ingredients=None):

    liked_foods = db.query(Food.name).join(LikedFoods, LikedFoods.food_id == Food.id).filter(LikedFoods.user_id == user.id).all()
    liked = ", ".join([f[0] for f in liked_foods]) if liked_foods else "aucun"
    disliked_foods = db.query(Food.name).join(DislikedFoods, DislikedFoods.food_id == Food.id).filter(DislikedFoods.user_id == user.id).all()
    disliked = ", ".join([f[0] for f in disliked_foods]) if disliked_foods else "aucun"

    response = client.chat.complete(
        model="mistral-large-latest",
        messages=[
            {"role": "user", "content":f"""Tu es expert en nutrition reconnu pour la grande qualité de ses recommandations personnalisées en terme d'alimentation, tu es consulté par une application web nutritionnelle pour générer des recettes personnalisées en fonction du profil utilisateur suivant : Genre : {user.gender}, âge : {user.birth_date}, régime : {user.diet_type}, contraintes : {user.dietary_constraints}, aliments aimés : {liked}, aliments évités : {disliked}, nombre de personnes dans le foyer : {user.household_size}.
Je veux que tu génères une recette en fonction de ses contraintes alimentaires, son régime alimentaire, ses aliments préférés ou à éviter, et les éventuels aliments fournis : {", ".join(ingredients) if ingredients else "aucun ingrédient fourni"}.
La réponse doit être en français, en format JSON selon la structure suivante :
{{"title": "...", "ingredients": [{{"name": "...", "state": "...", "quantity": ..., "unit": "..."}}], "steps": ["...", "..."]}}
Réponds uniquement en JSON, sans texte avant ni après.
Pour chaque ingrédient, utilise un nom générique en français, utilise le nom des ingrédients au singulier, sans marque ni préparation complexe, le plus proche possible du nom d'un aliment brut tel qu'on le trouverait dans la base de données nutritionnelle ciqual. Pour chaque ingrédient, dans le champ 'state' en choisis l'état le plus pertinent selon le contexte de la recette parmi cette liste : cru, cuit, frais, sec, séché, déshydraté, fumé, grillé, frit, mariné, moulu, pané, précuit, aromatisé, salé, sucré, entier, pelé, nature, vierge, écrémé, pasteurisé, doux, décaféiné, réhydraté, sauvage, épluché, iodé, dénoyauté, dégraissé, vapeur, uht. Si aucun état n'est pertinent, laisse le champ vide."""}
        ],
    )

    return response.choices[0].message.content

def generate_menu(db: Session, user, members, menu_type: str, start_date, priority_ingredients=None):
    liked_foods = db.query(Food.name).join(LikedFoods, LikedFoods.food_id == Food.id).filter(LikedFoods.user_id == user.id).all()
    liked = ", ".join([f[0] for f in liked_foods]) if liked_foods else "aucun"
    disliked_foods = db.query(Food.name).join(DislikedFoods, DislikedFoods.food_id == Food.id).filter(DislikedFoods.user_id == user.id).all()
    disliked = ", ".join([f[0] for f in disliked_foods]) if disliked_foods else "aucun"

    if menu_type == "daily":
        end_date = start_date
        period = f"le {start_date}"
    else:
        from datetime import timedelta
        end_date = start_date + timedelta(days=6)
        period = f"du {start_date} au {end_date}"

    members_info = ", ".join([f"{m.gender} {m.birth_date}" for m in members]) if members else "aucun"

    prompt = f"""Tu es expert en nutrition reconnu pour la grande qualité de ses recommandations personnalisées en terme d'alimentation, tu es consulté par une application web nutritionnelle pour générer un menu personnalisé en fonction du profil utilisateur suivant : Genre : {user.gender}, âge : {user.birth_date}, régime : {user.diet_type}, contraintes : {user.dietary_constraints}, aliments aimés : {liked}, aliments évités : {disliked}, repas par jour : {user.meals}, membres du foyer : {members_info}.
Génère un menu {menu_type} pour la période {period}, en respectant les contraintes alimentaires et les préférences de l'utilisateur.{f" Utilise en priorité ces aliments : {priority_ingredients}." if priority_ingredients else ""}
Les types de repas possibles sont uniquement ceux de la liste suivante : {user.meals}. N'utilise aucun autre type de repas.
La réponse doit être en français, en format JSON selon la structure suivante :
{{"meals": [{{"date": "YYYY-MM-DD", "meal_type": "...", "recipe_title": "..."}}]}}
Réponds uniquement en JSON, sans texte avant ni après."""

    response = client.chat.complete(
        model="mistral-large-latest",
        messages=[
            {"role": "user", "content": prompt}
        ],
    )
    return response.choices[0].message.content