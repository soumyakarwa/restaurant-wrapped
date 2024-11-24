import csv
import json

def process_multiple_csv_to_json(input_files, output_file):
    """
    Reads multiple structured CSV files and converts them into a JSON format with distinct sections for each person.

    Parameters:
    - input_files (list): List of input CSV file paths.
    - output_file (str): Path to save the output JSON file.
    """
    result = {}

    try:
        for index, input_file in enumerate(input_files, start=1):
            person_key = f"person-{index}"  # Key for each person's data
            result[person_key] = {"Personal Information": {}, "Restaurant Information": []}
            current_section = None
            headers = []

            with open(input_file, mode='r', encoding='utf-8') as file:
                reader = csv.reader(file)

                for row in reader:
                    # Skip rows that are completely blank
                    if all(cell.strip() == '' for cell in row):
                        continue

                    # Check if the row is a section header
                    if "PERSONAL INFORMATION" in row[0]:
                        current_section = "Personal Information"
                        headers = []  # Reset headers for the new section
                        continue
                    elif "RESTAURANT INFORMATION" in row[0]:
                        current_section = "Restaurant Information"
                        headers = []  # Reset headers for the new section
                        continue

                    # Process headers if not yet defined for the section
                    if current_section and not headers:
                        headers = [header.strip() for header in row if header.strip()]
                        continue

                    # Process data rows
                    if current_section == "Personal Information":
                        for key, value in zip(headers, row):
                            result[person_key][current_section][key] = value.strip()
                    elif current_section == "Restaurant Information":
                        entry = {key: value.strip() for key, value in zip(headers, row)}
                        result[person_key][current_section].append(entry)

        # Write the result to a JSON file
        with open(output_file, 'w', encoding='utf-8') as json_file:
            json.dump(result, json_file, indent=4)

        print(f"Conversion successful! JSON saved at {output_file}")
    except Exception as e:
        print(f"Error occurred: {e}")

# Example usage
if __name__ == "__main__":
    input_csv_files = ["person-1.csv", "person-2.csv", "person-3.csv"]  # Replace with your actual file paths
    output_json = "user-data.json"  # Desired output JSON file path
    process_multiple_csv_to_json(input_csv_files, output_json)
