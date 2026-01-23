from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.created_by == request.user


class IsNGO(BasePermission):
    """
    Permission to only allow NGO users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'ngo'


class IsDonor(BasePermission):
    """
    Permission to only allow Donor users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'donor'


class IsAdmin(BasePermission):
    """
    Permission to only allow Admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'


class IsAuthenticatedOrReadOnly(BasePermission):
    """
    Allows authenticated users to perform any action.
    Unauthenticated users can only perform safe methods (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated) or \
               request.method in ['GET', 'HEAD', 'OPTIONS']
