import csv
import html

idiomas = {
    
}

def generate_sql_from_csv(csv_file_path, table_name, output_file_path):
    queries = []
    equivalentes = []
    current = 119
    with open(csv_file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            sanitized_row = {key: html.escape(value) for key, value in row.items()}
            columns = ', '.join(key for key in sanitized_row.keys() if key not in ['english', 'german', 'french'])
            values = ', '.join(f"'{value}'" for key, value in sanitized_row.items() if key not in ['english', 'german', 'french'])
            query = f"""
    INSERT INTO {table_name} (id, {columns}) VALUES ({current}, {values});
    INSERT INTO equivalencias (expresion_id, idioma, texto_equivalente) VALUES ({current}, 'english', '{sanitized_row['english']}');
    INSERT INTO equivalencias (expresion_id, idioma, texto_equivalente) VALUES ({current}, 'german', '{sanitized_row['german']}');
    INSERT INTO equivalencias (expresion_id, idioma, texto_equivalente) VALUES ({current}, 'french', '{sanitized_row['french']}');
            """
            queries.append(query)
            current += 1
    
    # Write queries to the output file
    with open(output_file_path, mode='w', encoding='utf-8') as output_file:
        output_file.write('\n'.join(queries))
    
    return queries

# Example usage
csv_file = 'C:/Users/alons/cosasExpensionary/server/slang.csv'  # Replace with your CSV file path
table = 'expresiones'  # Replace with your table name
output_file = 'C:/Users/alons/cosasExpensionary/server/output_queries.txt'  # Replace with your output file path

sql_queries = generate_sql_from_csv(csv_file, table, output_file)

# Print the generated SQL queries
for query in sql_queries:
    print(query)