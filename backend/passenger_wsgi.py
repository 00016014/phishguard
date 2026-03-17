import sys
import os

sys.path.insert(0, os.getcwd())

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "phishguard_backend.settings"
)

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
