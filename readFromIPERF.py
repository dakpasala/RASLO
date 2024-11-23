import re
import pandas as pd
import sys

# Paths to the input log file and output CSV file
log_file_path = sys.argv[1]  
output_csv_path = 'NetworkSpeed.csv'

# Initialize list to store consolidated data
test_data = []

# Regular expressions to extract data
region_pattern = r'==========Beginning test to (.+?) Database=========='
timestamp_pattern = r'\w+,\s\w+\s\d+,\s\d+\s[\d:]+(?:\s[A|P]M)?'
post_time_pattern = r'Seconds to Post File: ([\d.]+)s'
download_time_pattern = r'Seconds to Download File: ([\d.]+)s'
post_rate_pattern_files = r'Post Directory rate: ([\d.]+) files/sec'
download_rate_pattern_files = r'Download Directory rate: ([\d.]+) files/sec'
mb_mbits_pattern = r'([\d.]+) MB/sec, ([\d.]+) Mbits/sec'

# Initialize an empty dictionary for the current test metrics
current_test = {
    'Region': None,
    'Timestamp': None,
    'Post_Time_Seconds': None,
    'Download_Time_Seconds': None,
    'Post_Rate_Files_per_Sec': None,
    'Download_Rate_Files_per_Sec': None,
    'Post_Rate_MB_per_Sec': None,
    'Post_Rate_Mbits_per_Sec': None,
    'Download_Rate_MB_per_Sec': None,
    'Download_Rate_Mbits_per_Sec': None
}

# Function to save the current test entry if it has at least one metric
def save_current_test():
    if any(current_test[key] is not None for key in ['Post_Time_Seconds', 'Download_Time_Seconds', 
                                                     'Post_Rate_Files_per_Sec', 'Download_Rate_Files_per_Sec',
                                                     'Post_Rate_MB_per_Sec', 'Post_Rate_Mbits_per_Sec',
                                                     'Download_Rate_MB_per_Sec', 'Download_Rate_Mbits_per_Sec']):
        # Append a copy of current test to test_data to avoid overwriting issues
        test_data.append(current_test.copy())

# Read through the log file and collect data
with open(log_file_path, 'r') as file:
    for line in file:
        # Extract region information
        region_match = re.search(region_pattern, line)
        if region_match:
            current_test['Region'] = region_match.group(1).strip()

        # Extract timestamp
        timestamp_match = re.search(timestamp_pattern, line)
        if timestamp_match:
            # If a new timestamp appears, save the current test if it has valid metrics, then reset for a new one
            if current_test['Timestamp'] is not None and current_test['Timestamp'] != timestamp_match.group(0):
                save_current_test()  # Save the current test entry
                # Reset for the next test with new timestamp
                current_test = {
                    'Region': current_test['Region'], 
                    'Timestamp': timestamp_match.group(0),
                    'Post_Time_Seconds': None, 
                    'Download_Time_Seconds': None, 
                    'Post_Rate_Files_per_Sec': None,
                    'Download_Rate_Files_per_Sec': None,
                    'Post_Rate_MB_per_Sec': None,
                    'Post_Rate_Mbits_per_Sec': None,
                    'Download_Rate_MB_per_Sec': None,
                    'Download_Rate_Mbits_per_Sec': None
                }
            current_test['Timestamp'] = timestamp_match.group(0)

        # Extract metrics and update current test data
        post_time_match = re.search(post_time_pattern, line)
        download_time_match = re.search(download_time_pattern, line)
        post_rate_match_files = re.search(post_rate_pattern_files, line)
        download_rate_match_files = re.search(download_rate_pattern_files, line)
        
        if post_time_match:
            current_test['Post_Time_Seconds'] = float(post_time_match.group(1))
        if download_time_match:
            current_test['Download_Time_Seconds'] = float(download_time_match.group(1))
        if post_rate_match_files:
            current_test['Post_Rate_Files_per_Sec'] = float(post_rate_match_files.group(1))
            # look for MB/sec and Mbits/sec on the next line
            next_line = next(file, '').strip()
            mb_mbits_match = re.search(mb_mbits_pattern, next_line)
            if mb_mbits_match:
                current_test['Post_Rate_MB_per_Sec'] = float(mb_mbits_match.group(1))
                current_test['Post_Rate_Mbits_per_Sec'] = float(mb_mbits_match.group(2))
        if download_rate_match_files:
            current_test['Download_Rate_Files_per_Sec'] = float(download_rate_match_files.group(1))
            # look for MB/sec and Mbits/sec on the next line
            next_line = next(file, '').strip()
            mb_mbits_match = re.search(mb_mbits_pattern, next_line)
            if mb_mbits_match:
                current_test['Download_Rate_MB_per_Sec'] = float(mb_mbits_match.group(1))
                current_test['Download_Rate_Mbits_per_Sec'] = float(mb_mbits_match.group(2))

        # After each complete set of data, save it and reset the current test for the next line
        if all(current_test[key] is not None for key in ['Post_Time_Seconds', 'Download_Time_Seconds', 
                                                         'Post_Rate_Files_per_Sec', 'Download_Rate_Files_per_Sec']):
            save_current_test()
            # Reset only metrics, keeping Region and Timestamp for further entries with the same timestamp
            current_test['Post_Time_Seconds'] = None
            current_test['Download_Time_Seconds'] = None
            current_test['Post_Rate_Files_per_Sec'] = None
            current_test['Download_Rate_Files_per_Sec'] = None
            current_test['Post_Rate_MB_per_Sec'] = None
            current_test['Post_Rate_Mbits_per_Sec'] = None
            current_test['Download_Rate_MB_per_Sec'] = None
            current_test['Download_Rate_Mbits_per_Sec'] = None

# Append the final test's data if it has values
save_current_test()

# Convert the list to a DataFrame
columns = ['Region', 'Timestamp', 'Post_Time_Seconds', 'Download_Time_Seconds', 'Post_Rate_Files_per_Sec', 
           'Download_Rate_Files_per_Sec', 'Post_Rate_MB_per_Sec', 'Post_Rate_Mbits_per_Sec', 
           'Download_Rate_MB_per_Sec', 'Download_Rate_Mbits_per_Sec']
new_data_df = pd.DataFrame(test_data, columns=columns)

# Append the new data to the existing CSV file without overwriting
try:
    with open(output_csv_path, 'a') as f:
        new_data_df.to_csv(f, index=False, header=f.tell() == 0)  # Add header only if file is empty
    print(f"Data has been appended to {output_csv_path}")
except Exception as e:
    print(f"Error appending data to CSV: {e}")
