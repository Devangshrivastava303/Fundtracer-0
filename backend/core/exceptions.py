from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework import status


class APIErrorResponse(APIException):
    """Custom API error response handler"""
    
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "An error occurred"
    
    def __init__(self, detail=None, status_code=None):
        self.detail = detail or self.default_detail
        if status_code:
            self.status_code = status_code


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST, errors=None):
    """Helper to return consistent error responses"""
    response_data = {
        'error': message,
        'status': status_code
    }
    if errors:
        response_data['errors'] = errors
    return Response(response_data, status=status_code)


def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    """Helper to return consistent success responses"""
    response_data = {
        'message': message,
        'data': data
    }
    return Response(response_data, status=status_code)
