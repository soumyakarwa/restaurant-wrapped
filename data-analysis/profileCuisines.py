import json
from collections import defaultdict

def profile_cuisines_by_category(input_file, output_file):
    """
    Creates a dictionary of cuisines for each person, categorized by the 'Category' field,
    and tracks the names of restaurants for each cuisine.

    Parameters:
    - input_file (str): Path to the input JSON file with restaurant information.
    - output_file (str): Path to save the output JSON file with categorized cuisine profiles.
    """
    try:
        # Read input JSON
        with open(input_file, 'r', encoding='utf-8') as file:
            data = json.load(file)

        cuisine_profiles = {}

        # Process each person
        for person_key, person_data in data.items():
            category_dict = defaultdict(lambda: defaultdict(list))  # Nested default dict to hold lists of restaurants

            # Check if 'Restaurant Information' exists
            restaurant_info = person_data.get("Restaurant Information", [])
            for entry in restaurant_info:
                category = entry.get("Category", "Uncategorized")  # Default to 'Uncategorized' if missing
                cuisines = entry.get("Cuisine", [])
                restaurant_name = entry.get("Name", "Unknown Restaurant")  # Default to 'Unknown Restaurant'

                if isinstance(cuisines, list):  # Ensure Cuisine is a list
                    for cuisine in cuisines:
                        category_dict[category][cuisine].append(restaurant_name)

            # Convert defaultdict to a regular dict and store in the result
            cuisine_profiles[person_key] = {category: dict(cuisines) for category, cuisines in category_dict.items()}

        # Save the results to a JSON file
        with open(output_file, 'w', encoding='utf-8') as json_file:
            json.dump(cuisine_profiles, json_file, indent=4)

        print(f"Cuisine profiles by category successfully saved to {output_file}")

    except Exception as e:
        print(f"Error occurred: {e}")

# Example usage
if __name__ == "__main__":
    input_json = "../user-data.json"  # Replace with the actual input file path
    output_json = "../visuals/assets/cuisine-profiles-by-category.json"  # Replace with the desired output file path
    profile_cuisines_by_category(input_json, output_json)
