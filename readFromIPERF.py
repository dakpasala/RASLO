import re
import pandas as pd

# Paths to the input log file and output CSV file
log_file_path = 'iPerf.log'  
output_csv_path = 'NetworkSpeed.csv'

# Initialize list to store consolidated data
test_data = []

# Regular expressions to extract data
host_pattern = r'Machine: (.+?)\s'
timestamp_pattern = r'\w+,\s\w+\s\d+,\s\d+\s[\d:]+(?:\s[A|P]M)?'
post_time_pattern = r'Seconds to Post File: ([\d.]+)s'
download_time_pattern = r'Seconds to Download File: ([\d.]+)s'
post_rate_pattern_files = r'Post Directory rate: ([\d.]+) files/sec'
download_rate_pattern_files = r'Download Directory rate: ([\d.]+) files/sec'

# Function to save the current test data if it has any values and reset it
def save_and_reset_current_test(current_test):
    # Only save if there's at least one non-null metric
    if any(value is not None for key, value in current_test.items() if key not in ['Host', 'Timestamp']):
        test_data.append(current_test.copy())
    # Reset current test
    for key in current_test:
        current_test[key] = None

# Initialize an empty dictionary for the current test
current_test = {
    'Host': None,
    'Timestamp': None,
    'Post_Time_Seconds': None,
    'Download_Time_Seconds': None,
    'Post_Rate_Files_per_Sec': None,
    'Download_Rate_Files_per_Sec': None
}

# Read through the log file
with open(log_file_path, 'r') as file:
    for line in file:
        # Extract host/device information
        host_match = re.search(host_pattern, line)
        if host_match:
            current_test['Host'] = host_match.group(1).strip()

        # Extract timestamp
        timestamp_match = re.search(timestamp_pattern, line)
        if timestamp_match:
            # If a new timestamp appears, save the current test and start a new one
            if current_test['Timestamp'] is not None and current_test['Timestamp'] != timestamp_match.group(0):
                save_and_reset_current_test(current_test)
            current_test['Timestamp'] = timestamp_match.group(0)

        # Extract post time, download time, and rates
        post_time_match = re.search(post_time_pattern, line)
        download_time_match = re.search(download_time_pattern, line)
        post_rate_match_files = re.search(post_rate_pattern_files, line)
        download_rate_match_files = re.search(download_rate_pattern_files, line)

        # Update current test with extracted values
        if post_time_match:
            current_test['Post_Time_Seconds'] = float(post_time_match.group(1))
        if download_time_match:
            current_test['Download_Time_Seconds'] = float(download_time_match.group(1))
        if post_rate_match_files:
            current_test['Post_Rate_Files_per_Sec'] = float(post_rate_match_files.group(1))
        if download_rate_match_files:
            current_test['Download_Rate_Files_per_Sec'] = float(download_rate_match_files.group(1))

        # If all metrics for a test are filled, save and reset for a new entry
        if all(current_test[key] is not None for key in ['Post_Time_Seconds', 'Download_Time_Seconds', 
                                                         'Post_Rate_Files_per_Sec', 'Download_Rate_Files_per_Sec']):
            save_and_reset_current_test(current_test)

# Save the final test entry if it has values
save_and_reset_current_test(current_test)

# Convert test data to a DataFrame
columns = ['Host', 'Timestamp', 'Post_Time_Seconds', 'Download_Time_Seconds', 
           'Post_Rate_Files_per_Sec', 'Download_Rate_Files_per_Sec']
consolidated_df = pd.DataFrame(test_data, columns=columns)

# Write the DataFrame to the CSV file
consolidated_df.to_csv(output_csv_path, index=False)
print(f"Data has been written to {output_csv_path}")
