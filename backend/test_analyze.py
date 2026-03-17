import os
import sys

sys.path.insert(0, os.getcwd())

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "phishguard_backend.settings"
)

import django
django.setup()

from api.views import _analyze

content = """Yes we can do that 
We need to update your profile information, please follow the link and fill out the packet.

Setup Click Here Carrierbrokeragreements.us


After clicking the link you need to download the PDF and sign it electronically.

You can only complete the setup via PC or Laptop; using your phone will not work
"""

try:
    print(_analyze('email', content))
except Exception as e:
    print("ERROR:", str(e))
