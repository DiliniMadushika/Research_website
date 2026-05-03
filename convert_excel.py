import openpyxl
import csv

# Load Excel file
wb = openpyxl.load_workbook('assets/Documents/Checklist2.xlsx')
ws = wb.active

# Write to CSV
with open('assets/Documents/checklist_data.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    for row in ws.iter_rows(values_only=True):
        writer.writerow(row)

print('Conversion complete: checklist_data.csv')
