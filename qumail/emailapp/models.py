from django.db import models
from django.contrib.auth.models import User

class Email(models.Model):

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_emails'
    )

    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_emails'
    )

    subject = models.CharField(max_length=255)

    message = models.TextField(default="")

    encrypted_message = models.TextField()

    iv = models.TextField()

    auth_tag = models.TextField()

    key_id = models.CharField(max_length=100)

    key = models.TextField(default="")

    is_deleted = models.BooleanField(default=False)

    is_replied = models.BooleanField(default=False)

    is_read = models.BooleanField(default=False)

    is_starred = models.BooleanField(default=False)

    attempts = models.IntegerField(default=0)
    is_draft = models.BooleanField(default=False)

    attachment = models.FileField(

        upload_to='attachments/',

        null=True,

        blank=True
    )

    encrypted_attachment = models.FileField(

        upload_to='encrypted_attachments/',

        null=True,

        blank=True
    )

    attachment_iv = models.TextField(

        null=True,

        blank=True
    )

    attachment_auth_tag = models.TextField(

        null=True,

        blank=True
    )
    created_at = models.DateTimeField(
    auto_now_add=True
)
    
    all_receivers = models.TextField(
    blank=True,
    null=True
)
    
    
    #def __str__(self):
       # return self.subject

class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    phone_number = models.CharField(max_length=15)

    otp = models.CharField(max_length=6, default="")
    otp_verified = models.BooleanField(default=False)



    def __str__(self):
        return self.user.username

class LoginActivity(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    ip_address = models.CharField(max_length=100)

    login_time = models.DateTimeField(
        auto_now_add=True
    )

    device = models.TextField()

    def __str__(self):

        return self.user.username

from django.utils import timezone

class OTP(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    otp = models.CharField(max_length=6)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    is_verified = models.BooleanField(
        default=False
    )

    attempts = models.IntegerField(
        default=0
    )

    def __str__(self):

        return self.otp
