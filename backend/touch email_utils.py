import smtplib
from email.message import EmailMessage

# Replace with your Gmail and app password
EMAIL_ADDRESS = 'tshepisomakuoa02@gmail.com'
EMAIL_PASSWORD = 'Warona@01'

def send_motion_alert(to_email):
    msg = EmailMessage()
    msg['Subject'] = '🚨 Motion Detected in Your Smart Irrigation System!'
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_email
    msg.set_content(
        '⚠️ Warning: Motion was detected in your monitored area.\n\n'
        'Please check your dashboard for more details.'
    )

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
            print(f"✅ Motion alert sent to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
