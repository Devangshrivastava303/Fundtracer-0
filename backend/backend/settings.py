"""
Django settings for backend project.
"""

from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ----------------------------
# SECURITY SETTINGS
# ----------------------------
SECRET_KEY = 'django-insecure-3bo167*i!szsg=qd6u47=q&w)_*jnrty&n7$dr(t)zp)q(h)dy'

DEBUG = True  # Turn off in production

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]  # For local dev


# ----------------------------
# APPLICATIONS
# ----------------------------
INSTALLED_APPS = [
    'accounts',
    'campaigns',
    'donations',

    # Third-party apps
    'rest_framework',
    'corsheaders',
    'storages',  # django-storages for S3

    # Default Django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]


# ----------------------------
# MIDDLEWARE
# ----------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ----------------------------
# URL CONFIGURATION
# ----------------------------
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # You can add a templates folder if needed
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# ----------------------------
# DATABASE (PostgreSQL)
# ----------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "fundtracerr_db",
        "USER": "postgres",       # Change if different
        "PASSWORD": "Postgre@715",  # Your DB password
        "HOST": "localhost",
        "PORT": "5432",
    }
}


# ----------------------------
# PASSWORD VALIDATION
# ----------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ----------------------------
# INTERNATIONALIZATION
# ----------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ----------------------------
# STATIC & MEDIA FILES (AWS S3)
# ----------------------------
# Check if we're using S3 or local storage
USE_S3 = os.getenv('USE_S3', 'True') == 'True'

if USE_S3:
    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'eu-north-1')
    AWS_S3_CUSTOM_DOMAIN = os.getenv('AWS_S3_CUSTOM_DOMAIN')
    AWS_DEFAULT_ACL = 'public-read'
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    
    # S3 Static & Media Settings
    STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
    STATIC_ROOT = 'static/'
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
    MEDIA_ROOT = 'media/'
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
else:
    # Local Storage Configuration
    STATIC_URL = '/static/'
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'


AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_AUTH = False

# ----------------------------
# DEFAULT PRIMARY KEY FIELD TYPE
# ----------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ----------------------------
# CORS (React frontend integration)
# ----------------------------
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins for development

# Optional for production: only allow specific frontend URL
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
# ]
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
]


# ----------------------------
# REST FRAMEWORK & JWT SETTINGS
# ----------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
}

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'
