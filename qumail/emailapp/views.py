import re
from django.contrib.auth.models import User
from requests import request
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import HttpResponse
from channels.layers import get_channel_layer

from asgiref.sync import async_to_sync

from .models import LoginActivity, UserProfile
from .utils import encrypt_message
from .utils import decrypt_message
from .models import OTP
import random
import boto3


@api_view(['POST'])
def register(request):

    name = request.data.get('name')

    email = request.data.get('email')

    password = request.data.get('password')

    confirm_password = request.data.get(
        "confirm_password"
    )

    phone_number = request.data.get('phone_number')


    # 🔴 Check empty
    #if not name or not email or not password or not phone_number:
    if not name or not email or not password or not confirm_password or not phone_number:

        return Response({
            "error": "All fields required"
        }, status=400)


    # 🔴 Password match
    if password != confirm_password:

        return Response({
            "error": "Passwords do not match"
        }, status=400)


    # 🔴 Email validation
    if not email.endswith("qumail.io"):

        return Response({
            "error": "Email must end with '.io'"
        }, status=400)


    # 🔴 Phone validation
    if len(phone_number) != 10:

        return Response({
            "error": "Phone number must be 10 digits"
        }, status=400)


    # 🔴 Password rules
    if len(password) < 8:

        return Response({
            "error": "Password must contain at least 8 characters"
        }, status=400)


    if not re.search(r"[A-Z]", password):

        return Response({
            "error": "Password must contain uppercase letter"
        }, status=400)


    if not re.search(r"[a-z]", password):

        return Response({
            "error": "Password must contain lowercase letter"
        }, status=400)


    if not re.search(r"[0-9]", password):

        return Response({
            "error": "Password must contain number"
        }, status=400)


    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):

        return Response({
            "error": "Password must contain special character"
        }, status=400)


    # 🔴 Password similarity
    if name.lower() in password.lower() or email.lower() in password.lower():

        return Response({
            "error": "Password should not contain name or email"
        }, status=400)


    # 🔴 User exists
    if User.objects.filter(username=email).exists():

        return Response({
            "error": "Email already exists. Try another email."
        }, status=400)


    # ✅ Create user
    user = User.objects.create_user(

        username=email,

        password=password,

        email=email,

        first_name=name
    )


    # ✅ Save phone number
    UserProfile.objects.create(

        user=user,

        phone_number=phone_number
    )


    return Response({
        "message": "User registered successfully"
    })

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
def login(request):
    username = request.data.get('username')  # email
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)

    sns_client = boto3.client(

    "sns",

    region_name="us-east-2",

    aws_access_key_id="AKIA525EB66VL3Y5ZOWW",

    aws_secret_access_key="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"
    )

    ip = request.META.get('REMOTE_ADDR')
    device = request.META.get('HTTP_USER_AGENT')
    LoginActivity.objects.create(
        user=user,
        ip_address=ip,
        device=device
    )

    profile = UserProfile.objects.get(
    user=user
)
    message = (

    "QMail Security Alert:\n"

    "You have successfully logged into your account."
)
    sms_response = sns_client.publish(

    PhoneNumber="+91" + profile.phone_number,

    Message=message
)
    print("LOGIN SMS RESPONSE:", sms_response)
    
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from .models import Email, UserProfile

@api_view(['POST'])
@permission_classes([IsAuthenticated])

def send_mail(request):

    sender = request.user

    receiver_emails = request.data.get(
        'receivers'
    )
    if not receiver_emails:
        return Response({

        "error": "Receivers required"

    }, status=400)
    # ✅ Single receiver
    if isinstance(receiver_emails, str):
        receiver_emails = [
        receiver_emails.strip()
    ]
    # ✅ Multiple receivers
    elif isinstance(receiver_emails, list):
        receiver_emails = [
        email.strip()
        for email in receiver_emails
        if email.strip()
    ]
        all_receivers = ",".join(
    receiver_emails
)

    subject = request.data.get('subject')

    message = request.data.get('message')

    attachment = request.FILES.get("attachment")

    

    # ✅ Encrypt Message
    encrypted_data = encrypt_message(message)

    encrypted_attachment_file = None

    # ✅ Encrypt attachment if exists
    if attachment:

        file_data = attachment.read()

        key = bytes.fromhex(
            encrypted_data["key"]
        )

        encrypted_file_data = encrypt_file(
            file_data,
            key
        )

        encrypted_attachment_file = (
            encrypted_file_data
        )

    saved_count = 0

    for receiver_email in receiver_emails:

        try:

            receiver = User.objects.get(
                username=receiver_email
            )

        except User.DoesNotExist:

            continue

        email = Email.objects.create(

            sender=sender,

            receiver=receiver,

            subject=subject,

            message=message,

            encrypted_message=encrypted_data["encrypted"],

            iv=encrypted_data["iv"],

            auth_tag=encrypted_data["auth_tag"],

            key_id=encrypted_data["key_id"],

            key=encrypted_data["key"]
        )

        if attachment and encrypted_attachment_file:

            email.attachment_iv = (

                encrypted_attachment_file[
                    "iv"
                ].hex()
            )

            email.attachment_auth_tag = (

                encrypted_attachment_file[
                    "tag"
                ].hex()
            )

            email.save()

            encrypted_filename = (
                attachment.name + ".enc"
            )

            email.encrypted_attachment.save(

                encrypted_filename,

                ContentFile(

                    encrypted_attachment_file[
                        "encrypted_file"
                    ]
                )
            )

        saved_count += 1

    if saved_count == 0:

        return Response({

            "error": "No valid receivers found"

        }, status=400)

    channel_layer = get_channel_layer()
    async_to_sync(
    channel_layer.group_send
)(

    "notifications",

    {

        "type": "send_notification",

        "message":

        f"📩 New Secure Mail from {sender.username}"
    }
)

    return Response({

        "message": "Mail saved successfully"
    })

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inbox(request):

    user = request.user

    emails = Email.objects.filter(
        receiver=user,
        is_deleted=False
    ).order_by('-id')
    data = []
    for mail in emails:
        mail.is_read = True
        mail.save()
        data.append({

    "id": mail.id,

    "sender": mail.sender.username,

    "subject": mail.subject,

    "preview": mail.message[:50],

    "time": mail.created_at.strftime("%d %b %Y, %I:%M %p"),

    "avatar": mail.sender.username[0].upper(),

    "unread": not mail.is_read,

    "is_starred": mail.is_starred,

    "hasAttachment": bool(mail.encrypted_attachment)
})
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def decrypt_mail(request, mail_id):

    try:

        mail = Email.objects.get(
            id=mail_id
        )

        if (
            mail.receiver != request.user
            and mail.sender != request.user
        ):

            return Response({

                "error": "Unauthorized"

            }, status=403)

    except Email.DoesNotExist:

        return Response({

            "error": "Mail not found"

        }, status=404)

    try:

        decrypted_text = decrypt_message(

            mail.encrypted_message,

            mail.iv,

            mail.auth_tag,

            mail.key
        )

    except Exception as e:

        return Response({

            "error": "Decryption failed",

            "details": str(e)

        }, status=400)

    attachment_url = None

    if mail.encrypted_attachment:

        attachment_url = request.build_absolute_uri(

            mail.encrypted_attachment.url
        )

    return Response({

        "sender": mail.sender.username,

        "subject": mail.subject,

        "message": decrypted_text,

        "attachment": attachment_url,

        "created_at": mail.created_at.strftime("%d %b %Y, %I:%M %p"),
        "is_read": mail.is_read,
        "username": mail.sender.first_name or mail.sender.username
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_attachment(request, mail_id):
    try:
        mail = Email.objects.get(
            id=mail_id,
            receiver=request.user
        )
    except Email.DoesNotExist:
        return Response({
            "error": "Mail not found"
        }, status=404)
    if not mail.encrypted_attachment:
        return Response({
            "error": "No attachment found"
        }, status=404)
    try:
        with open(
            mail.encrypted_attachment.path,
            'rb'
        ) as f:

            encrypted_data = f.read()

        key = bytes.fromhex(mail.key)

        iv = bytes.fromhex(
            mail.attachment_iv
)
        tag = bytes.fromhex(
    mail.attachment_auth_tag
)
        decrypted_data = decrypt_file(

            encrypted_data,

            iv,

            tag,

            key
        )

        response = HttpResponse(

            decrypted_data,

            content_type='application/octet-stream'
        )

        filename = (
            mail.encrypted_attachment.name
            .split('/')[-1]
            .replace('.enc', '')
        )

        response[
            'Content-Disposition'
        ] = f'attachment; filename="{filename}"'

        return response

    except Exception as e:

        return Response({

            "error": "Attachment decryption failed",

            "details": str(e)

        }, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reply_mail(request):

    mail_id = request.data.get('mail_id')

    reply_message = request.data.get('message')

    try:

        original_mail = Email.objects.get(
            id=mail_id,
            receiver=request.user
        )

    except Email.DoesNotExist:

        return Response({
            "error": "Mail not found"
        }, status=404)

    # � Mark original mail replied
    original_mail.is_replied = True
    original_mail.save()

    # �🔐 Encrypt reply
    encrypted_data = encrypt_message(reply_message)

    # ✅ Save reply
    Email.objects.create(

        sender=request.user,

        receiver=original_mail.sender,

        subject="RE: " + original_mail.subject,

        message=reply_message,

        encrypted_message=encrypted_data["encrypted"],

        iv=encrypted_data["iv"],

        auth_tag=encrypted_data["auth_tag"],

        key_id=encrypted_data["key_id"],

        key=encrypted_data["key"]
    )

    return Response({
        "message": "Reply sent successfully"
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def forward_mail(request):

    mail_id = request.data.get('mail_id')

    new_receiver_email = request.data.get('receiver')

    # 🔍 Find original mail
    try:

        original_mail = Email.objects.get(
            id=mail_id,
            receiver=request.user
        )

    except Email.DoesNotExist:

        return Response({
            "error": "Mail not found"
        }, status=404)

    # 🔍 Find new receiver
    try:

        new_receiver = User.objects.get(
            username=new_receiver_email
        )

    except User.DoesNotExist:

        return Response({
            "error": "Receiver not found"
        }, status=404)

    # 🔐 Encrypt again
    encrypted_data = encrypt_message(
        original_mail.message
    )

    # ✅ Save forwarded mail
    Email.objects.create(

        sender=request.user,

        receiver=new_receiver,

        subject="FWD: " + original_mail.subject,

        message=original_mail.message,

        encrypted_message=encrypted_data["encrypted"],

        iv=encrypted_data["iv"],

        auth_tag=encrypted_data["auth_tag"],

        key_id=encrypted_data["key_id"],

        key=encrypted_data["key"]
    )

    return Response({
        "message": "Mail forwarded successfully"
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_mail(request, mail_id):

    try:
        mail = Email.objects.get(
            id=mail_id
        )
        if (
            mail.receiver != request.user
            and mail.sender != request.user
):
            return Response({

        "error": "Unauthorized"

    }, status=403)

    except Email.DoesNotExist:

        return Response({
            "error": "Mail not found"
        }, status=404)

    # 🗑️ Move to trash
    mail.is_deleted = True

    mail.save()

    return Response({
        "message": "Mail moved to trash"
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trash(request):

    mails = Email.objects.filter(
        receiver=request.user,
        is_deleted=True
    )

    data = []

    for mail in mails:

        data.append({

            "id": mail.id,

            "sender": mail.sender.username,

            "subject": mail.subject
        })

    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_mail(request, mail_id):

    try:

        mail = Email.objects.get(
            id=mail_id,
            sender=request.user
        )

    except Email.DoesNotExist:

        return Response({
            "error": "Mail not found"
        }, status=404)

    # 🔒 Prevent editing after reply
    if mail.is_replied:

        return Response({
            "error": "Cannot edit. Receiver already replied."
        }, status=400)

    # ✏️ Get new data
    new_subject = request.data.get('subject')

    new_message = request.data.get('message')

    # 🔐 Re-encrypt
    encrypted_data = encrypt_message(new_message)

    # ✅ Update
    mail.subject = new_subject

    mail.message = new_message

    mail.encrypted_message = encrypted_data["encrypted"]

    mail.iv = encrypted_data["iv"]

    mail.auth_tag = encrypted_data["auth_tag"]

    mail.key_id = encrypted_data["key_id"]

    mail.key = encrypted_data["key"]

    mail.save()

    return Response({
        "message": "Mail updated successfully"
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_otp(request, mail_id):

    otp = str(random.randint(100000, 999999))
    OTP.objects.create(

    user=request.user,

    otp=otp

    )
    profile = UserProfile.objects.get(
        user=request.user
    )

    client = boto3.client(

        "sns",
        region_name="us-east-2",
        aws_access_key_id="AKIA525EB66VL3Y5ZOWW",
        aws_secret_access_key="p4TzrjRCIJKg6a0SxkGuHKOQmfn7fl3/NTAiEd9h",
    )

    response = client.publish(

        PhoneNumber="+91" + profile.phone_number,

        Message=f"Your OTP for QMail is {otp}"
    )

    print("Generated OTP:", otp)
    print(response)

    return Response({
        "message": "OTP sent successfully",
        "otp": otp
    })

from django.utils import timezone
from datetime import timedelta

@api_view(['POST'])
def verify_otp(request):

    entered_otp = request.data.get("otp")

    otp_obj = OTP.objects.filter(
        user=request.user,
        otp=entered_otp,
        is_verified=False
    ).last()

    latest_otp = OTP.objects.filter(
    user=request.user
).last()
    if latest_otp.attempts >= 3:
        
        return Response({
        "error": "Too many wrong attempts"
    }, status=400)

    if not otp_obj:
        latest_otp.attempts += 1
        latest_otp.save()
        return Response({
            "error": "Invalid OTP"
        }, status=400)

    # 🔥 OTP Expiry Check
    if timezone.now() > otp_obj.created_at + timedelta(minutes=2):

        return Response({
            "error": "OTP expired"
        }, status=400)

    otp_obj.is_verified = True
    otp_obj.save()

    return Response({
        "message": "OTP verified successfully"
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])

def star_mail(request, mail_id):

    try:

        mail = Email.objects.get(
            id=mail_id,
            receiver=request.user
        )

    except Email.DoesNotExist:

        return Response({
            "error": "Mail not found"
        }, status=404)

    mail.is_starred = not mail.is_starred

    mail.save()

    return Response({

        "message": "Star updated",

        "is_starred": mail.is_starred
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def restore_mail(request, mail_id):

    try:

        mail = Email.objects.get(
            id=mail_id,
            receiver=request.user,
            is_deleted=True
        )

    except Email.DoesNotExist:

        return Response({
            "error": "Mail not found"
        }, status=404)

    mail.is_deleted = False

    mail.save()

    return Response({
        "message": "Mail restored successfully"
    })
from django.core.files.base import ContentFile

from .utils import (
    encrypt_message,
    decrypt_message,
    encrypt_file,
    decrypt_file
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_mails(request):

    user = request.user

    mail_id = request.GET.get('mail_id')

    subject = request.GET.get('subject')

    date = request.GET.get('date')

    mails = Email.objects.filter(
        receiver=user
    )

    # 🔍 Search by Mail ID
    if mail_id:

        mails = mails.filter(
            id=mail_id
        )

    # 🔍 Search by Subject
    if subject:

        mails = mails.filter(
            subject__icontains=subject
        )

    # 🔍 Search by Date
    if date:

        mails = mails.filter(
            created_at__date=date
        )

    data = []

    for mail in mails:

        data.append({

            "mail_id": mail.id,

            "sender": mail.sender.username,

            "subject": mail.subject,

            "date": mail.created_at,

            "is_read": mail.is_read
        })

    return Response(data)

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')

    try:

        user = User.objects.get(
            username=email
        )

    except User.DoesNotExist:

        return Response({

            "error": "User not found"

        }, status=404)

    profile = UserProfile.objects.get(
        user=user
    )

    otp = str(random.randint(
        100000,
        999999
    ))

    OTP.objects.create(

        user=user,

        otp=otp
    )
    sns_client = boto3.client(

    "sns",

    region_name="us-east-2",

    aws_access_key_id="AKIA525EB66VL3Y5ZOWW",
    aws_secret_access_key="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"
)
    response = sns_client.publish(

    PhoneNumber="+91" + profile.phone_number,

    Message=f"QMail Password Reset OTP: {otp}"
)
    print(response)
    print("OTP:", otp)
    return Response({

        "message":
        "OTP sent successfully"
    })

from django.utils import timezone
from datetime import timedelta

@api_view(['POST'])

def verify_forgot_otp(request):

    email = request.data.get("email")

    otp = request.data.get("otp")

    try:

        user = User.objects.get(
            username=email
        )

    except User.DoesNotExist:

        return Response({

            "error": "User not found"

        }, status=404)

    otp_obj = OTP.objects.filter(

        user=user,

        otp=otp

    ).last()

    if not otp_obj:

        return Response({

            "error": "Invalid OTP"

        }, status=400)

    # ✅ OTP Expiry Check
    if timezone.now() > otp_obj.created_at + timedelta(minutes=2):

        return Response({

            "error": "OTP expired"

        }, status=400)

    return Response({

        "message": "OTP verified successfully"
    })



@api_view(['POST'])

def reset_password(request):

    email = request.data.get('email')

    otp = request.data.get('otp')

    new_password = request.data.get(
        'new_password'
    )

    confirm_password = request.data.get(
        'confirm_password'
    )

    if new_password != confirm_password:

        return Response({

            "error":
            "Passwords do not match"

        }, status=400)

    try:

        user = User.objects.get(
            username=email
        )

    except User.DoesNotExist:

        return Response({

            "error": "User not found"

        }, status=404)

    latest_otp = OTP.objects.filter(

        user=user,

        otp=otp

    ).last()

    if not latest_otp:

        return Response({

            "error": "Invalid OTP"

        }, status=400)

    user.set_password(new_password)

    user.save()

    return Response({

        "message":
        "Password reset successful"
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reply_mail(request, mail_id):

    try:

        original_mail = Email.objects.get(
            id=mail_id
        )

    except Email.DoesNotExist:

        return Response({

            "error": "Mail not found"

        }, status=404)

    message = request.data.get(
        'message'
    )

    encrypted_data = encrypt_message(
        message
    )

    Email.objects.create(

        sender=request.user,

        receiver=original_mail.sender,

        subject="RE: " + original_mail.subject,

        message=message,

        encrypted_message=
        encrypted_data["encrypted"],

        iv=encrypted_data["iv"],

        auth_tag=
        encrypted_data["auth_tag"],

        key_id=
        encrypted_data["key_id"],

        key=encrypted_data["key"],

        is_replied=True
    )

    return Response({

        "message":
        "Reply sent successfully"
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])

def reply_all(request, mail_id):

    try:

        original_mail = Email.objects.get(
            id=mail_id
        )

    except Email.DoesNotExist:

        return Response({

            "error": "Mail not found"

        }, status=404)

    message = request.data.get(
        'message'
    )

    recipients = original_mail.all_receivers.split(",")

    for email in recipients:

        if email == request.user.username:
            continue

        try:

            receiver = User.objects.get(
                username=email
            )

        except User.DoesNotExist:
            continue

        encrypted_data = encrypt_message(
            message
        )

        Email.objects.create(

            sender=request.user,

            receiver=receiver,

            subject="RE: " +
            original_mail.subject,

            message=message,

            encrypted_message=
            encrypted_data["encrypted"],

            iv=encrypted_data["iv"],

            auth_tag=
            encrypted_data["auth_tag"],

            key_id=
            encrypted_data["key_id"],

            key=encrypted_data["key"],

            is_replied=True,

            all_receivers=
            original_mail.all_receivers
        )

    return Response({

        "message":
        "Reply all sent successfully"
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_draft(request):

    sender = request.user

    receivers = request.data.get("receivers")
    subject = request.data.get("subject")
    message = request.data.get("message")

    receiver_user = User.objects.first()

    if receivers:

        try:
            receiver_user = User.objects.get(
                username=receivers
            )
        except:
            receiver_user = User.objects.first()

    Email.objects.create(

        sender=sender,
        receiver=receiver_user,
        subject=subject or "",
        message=message or "",

        encrypted_message="",
        iv="",
        auth_tag="",
        key_id="",
        key="",

        is_draft=True,
        all_receivers=receivers
    )

    return Response({

        "message": "Draft saved successfully"

    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_drafts(request):

    drafts = Email.objects.filter(
        sender=request.user,
        is_draft=True
    ).order_by("-id")

    data = []

    for mail in drafts:

        data.append({

            "id": mail.id,
            "sender": mail.sender.username,
            "subject": mail.subject,
            "preview": mail.message[:50],
            "time": mail.created_at.strftime("%d %b %Y, %I:%M %p"),
            "avatar": mail.sender.username[0].upper(),
            "unread": False,
            "is_starred": mail.is_starred,
            "hasAttachment": bool(mail.encrypted_attachment),
            "is_draft": True
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_sent_mails(request):

    sent = Email.objects.filter(
    sender=request.user,
    is_draft=False,
    is_deleted=False
).exclude(receiver=request.user)

    data = []

    for mail in sent:

        data.append({

            "id": mail.id,
            "sender": mail.receiver.username,
            "subject": mail.subject,
            "preview": mail.message[:50],
            "time": mail.created_at.strftime("%d %b %Y, %I:%M %p"),
            "avatar": mail.receiver.username[0].upper(),
            "unread": False,
            "is_starred": mail.is_starred,
            "is_read": mail.is_read,
            "hasAttachment": bool(mail.encrypted_attachment)
        })

    return Response(data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])

def toggle_star(request, mail_id):

    try:

        mail = Email.objects.get(id=mail_id)

        mail.is_starred = not mail.is_starred

        mail.save()

        return Response({

            "message": "Star updated",
            "is_starred": mail.is_starred
        })

    except Email.DoesNotExist:

        return Response({

            "error": "Mail not found"
        }, status=404)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])

def get_starred_mails(request):

    mails = Email.objects.filter(
        sender=request.user,
        is_starred=True
    ) | Email.objects.filter(
        receiver=request.user,
        is_starred=True
    )

    mails = mails.order_by("-created_at")

    data = []

    for mail in mails:

        data.append({

            "id": mail.id,

            "sender": mail.sender.username,

            "subject": mail.subject,

            "preview": mail.message[:50],

            "time": mail.created_at.strftime("%d %b %Y, %I:%M %p"),

            "avatar": mail.sender.username[0].upper(),

            "unread": False,

            "is_starred": mail.is_starred,

            "hasAttachment": bool(mail.encrypted_attachment),

            "is_draft": mail.is_draft
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])

def get_trash_mails(request):

    mails = Email.objects.filter(
        is_deleted=True
    ).filter(
        sender=request.user
    ) | Email.objects.filter(
        is_deleted=True,
        receiver=request.user
    )

    mails = mails.order_by("-created_at")

    data = []

    for mail in mails:

        data.append({

            "id": mail.id,

            "sender": mail.sender.username,

            "subject": mail.subject,

            "preview": mail.message[:50],

            "time": mail.created_at.strftime("%d %b %Y, %I:%M %p"),

            "avatar": mail.sender.username[0].upper(),

            "unread": False,

            "is_starred": mail.is_starred,

            "hasAttachment": bool(mail.encrypted_attachment)
        })

    return Response(data)