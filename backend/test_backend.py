import requests
import json

# The URL of your backend server's API endpoint
url = "http://localhost:3001/api/artifacts"

print(f"Attempting to connect to backend at: {url}")
print("---")

try:
    # Make the GET request to the server
    response = requests.get(url)

    # Check if the request was successful (HTTP status code 200)
    if response.status_code == 200:
        print("✅ Connection successful!")
        
        # Try to parse the JSON data
        try:
            artifacts = response.json()
            print("✅ Data fetched and parsed successfully:")
            print("---")
            
            # Pretty-print the JSON data
            print(json.dumps(artifacts, indent=2))
            
            if not artifacts:
                print("\n(Note: The list is empty. This is fine if your database table is also empty.)")

        except requests.exceptions.JSONDecodeError:
            print("❌ Error: Server responded, but it was not valid JSON.")
            print("Response text:", response.text)

    else:
        # The server responded, but with an error code
        print(f"❌ Error: Server responded with status code {response.status_code}")
        print("Response text:", response.text)

except requests.exceptions.ConnectionError as e:
    # This error happens if the server isn't running at all
    print("❌ CRITICAL ERROR: Could not connect to the server.")
    print("   Please make sure your backend server is running with 'node server.js'")
    print(f"   Error details: {e}")

except Exception as e:
    print(f"An unexpected error occurred: {e}")