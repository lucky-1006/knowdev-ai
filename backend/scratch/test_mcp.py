import requests
import json
import threading
import time

base_url = "http://127.0.0.1:8000"

# Share session information between threads
session_info = {
    "endpoint_url": None,
    "active": False,
    "error": None
}

def listen_to_sse():
    """
    Connects to the SSE stream and prints events as they arrive.
    """
    try:
        print("[SSE Thread] Connecting to /mcp/sse...")
        r = requests.get(f"{base_url}/mcp/sse", stream=True, timeout=15)
        session_info["active"] = True
        
        current_event = None
        for line in r.iter_lines():
            if not session_info["active"]:
                break
                
            if line:
                decoded_line = line.decode('utf-8')
                if decoded_line.startswith("event:"):
                    current_event = decoded_line.replace("event:", "").strip()
                elif decoded_line.startswith("data:"):
                    data_val = decoded_line.replace("data:", "").strip()
                    print(f"\n[SSE Thread] Received Event: {current_event}")
                    
                    # If this is the endpoint event, save the URL
                    if current_event == "endpoint" or data_val.startswith("/"):
                        if data_val.startswith("/"):
                            session_info["endpoint_url"] = base_url + data_val
                        else:
                            session_info["endpoint_url"] = data_val
                        print(f"[SSE Thread] Messages endpoint found: {session_info['endpoint_url']}")
                    else:
                        try:
                            parsed_json = json.loads(data_val)
                            print(json.dumps(parsed_json, indent=2))
                        except Exception:
                            print(data_val)
        r.close()
    except Exception as e:
        session_info["error"] = str(e)
    finally:
        session_info["active"] = False
        print("[SSE Thread] Connection closed.")

# Start the SSE client in a background thread
sse_thread = threading.Thread(target=listen_to_sse)
sse_thread.daemon = True
sse_thread.start()

# Wait for messages endpoint (max 5 seconds)
start_time = time.time()
while not session_info["endpoint_url"] and time.time() - start_time < 5:
    if session_info["error"]:
        print("SSE Connection Error:", session_info["error"])
        exit(1)
    time.sleep(0.1)

if not session_info["endpoint_url"]:
    print("Error: Timeout waiting for SSE connection.")
    exit(1)

endpoint_url = session_info["endpoint_url"]
time.sleep(0.5)  # Let connection stabilize

try:
    print("\n--- 1. Sending 'initialize' request ---")
    init_payload = {
        "jsonrpc": "2.0",
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "test-client", "version": "1.0.0"}
        },
        "id": 1
    }
    res = requests.post(endpoint_url, json=init_payload, timeout=5)
    print("Send status:", res.status_code)
    time.sleep(1.5)  # Wait for SSE response

    print("\n--- 2. Sending 'notifications/initialized' notification ---")
    initialized_payload = {
        "jsonrpc": "2.0",
        "method": "notifications/initialized"
    }
    res = requests.post(endpoint_url, json=initialized_payload, timeout=5)
    print("Send status:", res.status_code)
    time.sleep(0.5)

    print("\n--- 3. Sending 'tools/list' request ---")
    list_payload = {
        "jsonrpc": "2.0",
        "method": "tools/list",
        "params": {},
        "id": 2
    }
    res = requests.post(endpoint_url, json=list_payload, timeout=5)
    print("Send status:", res.status_code)
    time.sleep(1.5)

    print("\n--- 4. Sending 'tools/call' request for 'get_repositories_metrics' ---")
    call_payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "get_repositories_metrics",
            "arguments": {}
        },
        "id": 3
    }
    res = requests.post(endpoint_url, json=call_payload, timeout=5)
    print("Send status:", res.status_code)
    time.sleep(1.5)

    print("\n--- 5. Sending 'tools/call' request for 'explain_code_snippet' ---")
    explain_payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "explain_code_snippet",
            "arguments": {
                "code": "def hello():\n    print('hello world')"
            }
        },
        "id": 4
    }
    res = requests.post(endpoint_url, json=explain_payload, timeout=5)
    print("Send status:", res.status_code)
    time.sleep(3.0)  # Wait longer for model response

finally:
    session_info["active"] = False
    print("\nTest completed. Cleaning up...")
