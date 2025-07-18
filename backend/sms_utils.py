from twilio.rest import Client

# Twilio credentials (replace these with your actual credentials)
TWILIO_ACCOUNT_SID = "AC7478e94a5ac6898d441cd57549665906"
TWILIO_AUTH_TOKEN = "7f9f727ea938d023a53da12e711cbb3d"
TWILIO_PHONE_NUMBER = "CVEAU4B55JWRR9YAFJKTDJKU"  # Replace with your Twilio number (must be WhatsApp-enabled for WhatsApp, or SMS-enabled)

# Your target user phone number (must be verified if using trial account)
USER_PHONE_NUMBER = "+27693246135"  # Replace with your own verified number

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_motion_alert_sms():
    message_body = "🚨 Alert: Motion detected in your smart irrigation system!"

    try:
        message = client.messages.create(
            body=message_body,
            from_=TWILIO_PHONE_NUMBER,
            to=USER_PHONE_NUMBER
        )
        print(f"✅ SMS sent successfully. SID: {message.sid}")
    except Exception as e:
        print(f"❌ Failed to send SMS: {e}")
