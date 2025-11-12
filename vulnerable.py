#!/usr/bin/env python3
"""
vulnerable.py
Deliberately vulnerable Python sample for security tooling tests.
DO NOT USE IN PRODUCTION.
"""

import sys
import sqlite3
import subprocess
import pickle
import requests
import yaml  # PyYAML vulnerable versions allow unsafe yaml.load

# 1) Hardcoded credentials (easy to flag)
API_USER = "admin"
API_PASS = "admin123"

def get_db_connection():
    # In-memory DB for example only
    return sqlite3.connect(":memory:")

# 2) SQL injection via f-string/concatenation (Semgrep will catch this)
def get_user_by_name(conn, name):
    query = f"SELECT * FROM users WHERE name = '{name}'"
    cur = conn.cursor()
    cur.execute(query)   # vulnerable: dynamic SQL
    return cur.fetchall()

# 3) subprocess with shell=True (command injection)
def run_shell_command(user_input):
    cmd = f"ls {user_input}"
    return subprocess.check_output(cmd, shell=True).decode()

# 4) insecure deserialization with pickle
def unsafe_unpickle(data_bytes):
    return pickle.loads(data_bytes)

# 5) eval on user input
def dangerous_eval(expr):
    return eval(expr)

# 6) requests with verify=False (disables TLS verification)
def fetch_without_tls_verification(url):
    return requests.get(url, auth=(API_USER, API_PASS), verify=False).text

# 7) unsafe YAML load (PyYAML <=3.12 yaml.load without Loader is unsafe)
def load_yaml_untrusted(yaml_bytes):
    # Using yaml.load on untrusted input is insecure in older PyYAML versions
    return yaml.load(yaml_bytes)  # vulnerable: unsafe loader

if __name__ == "__main__":
    conn = get_db_connection()
    # create table for demo
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
    conn.execute("INSERT INTO users (name) VALUES ('alice'), ('bob')")
    conn.commit()

    # Example usage — do not pass untrusted input when testing
    if len(sys.argv) > 1:
        name = sys.argv[1]
        try:
            print("Query result:", get_user_by_name(conn, name))
        except Exception as e:
            print("Query failed:", e)

    # Example calls commented out for safety (they demonstrate patterns Semgrep will detect)
    # run_shell_command("$(rm -rf /)")   # don't run this
    # unsafe_unpickle(b"")              # don't load untrusted pickles
    # dangerous_eval("__import__('os').system('ls')")  # don't eval untrusted input

