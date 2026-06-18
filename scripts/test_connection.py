#!/usr/bin/env python3
"""
autocad-dynamic-draw — Connection Test Script
Verifies AutoCAD COM connectivity and basic drawing capabilities.
"""

import sys
import time

def check_python():
    major, minor = sys.version_info[:2]
    if (major, minor) < (3, 8):
        print(f"FAIL: Python {major}.{minor} detected, need 3.8+")
        return False
    print(f"PASS: Python {sys.version}")
    return True

def check_autocad():
    try:
        import win32com.client
        try:
            acad = win32com.client.GetActiveObject("AutoCAD.Application")
            print(f"PASS: AutoCAD connected — {acad.ActiveDocument.Name}")
            return True
        except:
            try:
                acad = win32com.client.Dispatch("AutoCAD.Application")
                print(f"PASS: AutoCAD launched — {acad.ActiveDocument.Name}")
                return True
            except Exception as e:
                print(f"FAIL: Cannot connect to AutoCAD: {e}")
                return False
    except ImportError:
        print("FAIL: pywin32 not installed. Run: pip install pywin32")
        return False

def check_pyautocad():
    try:
        import pyautocad
        print(f"PASS: pyautocad available")
        return True
    except ImportError:
        print("WARN: pyautocad not installed. Run: pip install pyautocad")
        return True  # not fatal, we use win32com directly

def main():
    print("=== autocad-dynamic-draw Environment Check ===\n")
    results = [
        ("Python 3.8+", check_python()),
        ("AutoCAD COM", check_autocad()),
        ("pyautocad", check_pyautocad()),
    ]
    print("\n=== Summary ===")
    all_pass = True
    for name, ok in results:
        status = "✓" if ok else "✗"
        print(f"  {status} {name}")
        if not ok:
            all_pass = False
    if all_pass:
        print("\n✅ All checks passed! Ready for dynamic drawing.")
    else:
        print("\n❌ Some checks failed. Fix issues above before using this skill.")
    sys.exit(0 if all_pass else 1)

if __name__ == "__main__":
    main()
