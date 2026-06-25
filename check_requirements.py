from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parent
requirements_path = BASE_DIR / "requirements.txt"

if not requirements_path.exists():
    print("Error: requirements.txt not found.")
    sys.exit(1)

requirements = []
for line in requirements_path.read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    requirements.append(line)

if not requirements:
    print("No required packages listed in requirements.txt.")
    sys.exit(0)

try:
    import pkg_resources
except ImportError:
    print("Error: pkg_resources is not available in this Python environment.")
    sys.exit(1)

try:
    pkg_resources.require(requirements)
    print("All required packages are installed.")
    sys.exit(0)
except Exception as error:
    print("Missing or outdated packages detected.")
    print(error)
    sys.exit(2)
