from twilio.rest import Client

# Your Twilio credentials (replace with your own)
TWILIO_ACCOUNT_SID = "AC7478e94a5ac6898d441cd57549665906"
TWILIO_AUTH_TOKEN = "7f9f727ea938d023a53da12e711cbb3d"
TWILIO_PHONE_NUMBER = "+127693246135"  # Your Twilio phone number

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_motion_alert_sms(to_phone_number):
    message_body = "Alert: Motion detected in your monitored area."

    try:
        message = client.messages.create(
            body=message_body,
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone_number
        )
        print(f"SMS sent successfully, SID: {message.sid}")
    except Exception as e:
        print(f"Failed to send SMS: {e}")
