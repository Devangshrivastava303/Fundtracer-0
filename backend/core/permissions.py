"""
Permissions for FundTracer API.
"""

from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Allow users to edit only their own objects.
    """

    def has_object_permission(self, request, view, obj):
        # Allow GET, HEAD, OPTIONS to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Allow edit only to the creator
        return obj.created_by == request.user or request.user.is_staff


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow admin users to perform all actions, others can only read.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsVerified(permissions.BasePermission):
    """
    Allow only verified users to perform certain actions.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.profile.is_organization_verified
