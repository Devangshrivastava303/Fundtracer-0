from rest_framework import serializers
from django.contrib.auth import authenticate
from accounts.models import User
from accounts.tokens import get_tokens_for_user


class UserSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'first_name', 'phone_number', 'role', 'is_verified', 'is_staff', 'is_superuser', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_staff', 'is_superuser']
    
    def get_first_name(self, obj):
        """Extract first name from full_name"""
        if obj.full_name:
            return obj.full_name.split()[0]
        return ''


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'full_name', 'phone_number', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            phone_number=validated_data.get('phone_number', ''),
            role=validated_data.get('role', 'donor')
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        attrs['user'] = user
        return attrs


class LoginResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    expires_in = serializers.IntegerField()


class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User not found")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs
