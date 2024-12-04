import json
from collections import defaultdict

def aggregateRestaurantsByLocation(input_file, output_file):
    """
    Aggregates restaurants visited by 'person-3' into a dictionary based on a predefined list of locations.
    Calculates the average rating for restaurants in each location.

    Parameters:
    - input_file (str): Path to the input JSON file with restaurant information.
    - output_file (str): Path to save the output JSON file with aggregated results.
    """
    try:
        # List of target places to check
        target_locations = [
            "Manhattan", "Brooklyn", "Queens", "Kilchberg", "London",
            "Dubai", "Miami", "New Delhi", "Woodstock", "Washington",
            "Hartford", "Tysons", "Elberta", "Windsor", "Pensacola"
        ]

        # Read input JSON
        with open(input_file, 'r', encoding='utf-8') as file:
            data = json.load(file)

        # Initialize dictionaries to store restaurants and ratings
        location_to_restaurants = defaultdict(list)
        location_ratings = defaultdict(list)

        # Process 'person-3' data
        person3_data = data.get("person-3", {}).get("Restaurant Information", [])
        for entry in person3_data:
            location = entry.get("Location", "")
            restaurant_name = entry.get("Name", "Unknown Restaurant")
            rating = entry.get("Rating (of 10)", None)

            # Check if the location matches any of the target locations
            for target in target_locations:
                if target.lower() in location.lower():  # Case-insensitive match
                    location_to_restaurants[target].append(restaurant_name)
                    if rating:  # If a rating is available
                        try:
                            location_ratings[target].append(float(rating))
                        except ValueError:
                            print(f"Invalid rating value for {restaurant_name}: {rating}")
                    break  # Avoid adding the same restaurant to multiple locations

        # Calculate average ratings and count for each location
        location_summary = {}
        for location, restaurants in location_to_restaurants.items():
            num_restaurants = len(restaurants)
            avg_rating = None
            if location in location_ratings and location_ratings[location]:
                avg_rating = sum(location_ratings[location]) / len(location_ratings[location])
            location_summary[location] = {
                "rating": round(avg_rating, 2) if avg_rating is not None else "No ratings",
                "number": num_restaurants
            }

        # Print results
        print("Average Ratings by Location:")
        for location, summary in location_summary.items():
            print(f"{location}: [rating: {summary['rating']}, number: {summary['number']}]")

        # Optionally save to the output file
        # with open(output_file, 'w', encoding='utf-8') as json_file:
        #     json.dump(location_summary, json_file, indent=4)

    except Exception as e:
        print(f"Error occurred: {e}")

# Example usage
if __name__ == "__main__":
    input_json = "../user-data.json"  # Replace with the actual input file path
    output_json = "person3-restaurants-by-location.json"  # Replace with the desired output file path
    aggregateRestaurantsByLocation(input_json, output_json)
