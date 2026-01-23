"""
Custom exceptions for FundTracer API.
"""


class FundTracerException(Exception):
    """Base exception for FundTracer."""
    pass


class CampaignNotFound(FundTracerException):
    """Raised when a campaign is not found."""
    pass


class InvalidDonation(FundTracerException):
    """Raised when donation data is invalid."""
    pass


class UnauthorizedAction(FundTracerException):
    """Raised when user is not authorized to perform an action."""
    pass


class PaymentProcessingError(FundTracerException):
    """Raised when payment processing fails."""
    pass
