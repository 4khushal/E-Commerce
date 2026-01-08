# Twilio Setup Guide - Get a Phone Number

## Step-by-Step Instructions

### Step 1: Sign Up for Twilio

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Click **"Start Free Trial"** or **"Sign Up"**
3. Fill in your information:
   - Email address
   - Password
   - Full name
   - Phone number (for verification)
4. Verify your email address
5. Verify your phone number (they'll send you a code)

### Step 2: Get Your Account Credentials

After signing up, you'll be taken to the Twilio Console Dashboard:

1. **Account SID**: 
   - Found on the dashboard homepage
   - Looks like: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Copy this - you'll need it later

2. **Auth Token**:
   - Click on your account name (top right)
   - Go to **"Account"** → **"API Keys & Tokens"**
   - Your Auth Token will be shown (click to reveal)
   - Looks like: `your_auth_token_here`
   - Copy this - you'll need it later

### Step 3: Get a Phone Number

1. **Navigate to Phone Numbers**:
   - In the Twilio Console, click **"Phone Numbers"** in the left sidebar
   - Or go to: [https://console.twilio.com/us1/develop/phone-numbers/manage/search](https://console.twilio.com/us1/develop/phone-numbers/manage/search)

2. **Buy a Phone Number**:
   - Click **"Buy a number"** button (top right)
   - Or click **"Get Started"** if you see it

3. **Select Number Type**:
   - Choose **"Phone Numbers"** tab
   - Select your country (e.g., United States)
   - You can search by:
     - **Area Code**: Enter a specific area code (e.g., 415, 212)
     - **City**: Enter a city name
     - **Number Pattern**: Enter digits you want in the number

4. **Choose a Number**:
   - Browse available numbers
   - Click **"Buy"** next to the number you want
   - Confirm the purchase
   - **Note**: Trial accounts get a free number, but it may have restrictions

5. **Configure the Number** (Important):
   - After purchasing, click on your number to configure it
   - Set up **Messaging**:
     - Under "Messaging Configuration"
     - Set **"A MESSAGE COMES IN"** webhook URL (optional for now)
     - Or leave it blank if you're just sending SMS

### Step 4: Trial Account Limitations

**Important Notes for Free Trial**:
- ✅ You can send SMS to **verified phone numbers only**
- ✅ You get $15.50 in free credit
- ❌ You **cannot** send SMS to unverified numbers
- ✅ You can verify up to 10 phone numbers for testing

**To Verify Phone Numbers**:
1. Go to **"Phone Numbers"** → **"Verified Caller IDs"**
2. Click **"Add a new Caller ID"**
3. Enter the phone number you want to verify
4. Twilio will call/text you with a verification code
5. Enter the code to verify

### Step 5: Upgrade (When Ready for Production)

When you're ready to send SMS to any number:
1. Go to **"Billing"** in the Twilio Console
2. Add a payment method
3. Upgrade your account
4. After upgrade, you can send SMS to any phone number

## Quick Reference

### Your Twilio Credentials:
```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: your_auth_token_here
Phone Number: +1234567890 (your Twilio number)
```

### Where to Find Them:
- **Account SID**: Dashboard homepage
- **Auth Token**: Account → API Keys & Tokens
- **Phone Number**: Phone Numbers → Manage → Active Numbers

## Pricing (After Trial)

- **SMS in US**: ~$0.0075 per message (less than 1 cent)
- **SMS International**: Varies by country
- **Phone Number**: ~$1/month for US numbers

## Next Steps

Once you have your credentials:
1. Add them to your `.env` file (backend) or environment variables
2. Update `src/services/notifications.js` to use Twilio
3. Test by sending a notification

See `SMS_NOTIFICATION_SETUP.md` for integration code.

## Troubleshooting

**"Phone number not verified" error**:
- You're on a trial account
- Verify the phone number in Twilio Console
- Or upgrade your account

**"Insufficient funds" error**:
- Check your account balance
- Add funds in Billing section

**"Invalid phone number format"**:
- Use E.164 format: `+1234567890`
- Include country code (e.g., +1 for US)

## Support

- Twilio Docs: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- Twilio Support: Available in Console
- Community: [https://stackoverflow.com/questions/tagged/twilio](https://stackoverflow.com/questions/tagged/twilio)

