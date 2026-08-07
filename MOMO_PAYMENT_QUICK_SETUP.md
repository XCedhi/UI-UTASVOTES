# Mobile Money Payment - Quick Setup Guide

## Step 1: Create Payment Transactions Table

Run this SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content from: create-payment-transactions-table.sql
```

This creates the `payment_transactions` table to track all payments.

## Step 2: Test the Payment Flow

1. **Start your dev server**:
```bash
npm run dev
```

2. **Navigate to candidate registration**:
   - Log in as a student
   - Go to "Apply" or candidate registration page
   - Fill out steps 1-4

3. **Test payment (Step 5)**:
   - Select "Mobile Money" payment method
   - Choose a network (MTN/Vodafone/AirtelTigo)
   - Notice phone number is auto-filled from your profile
   - Edit the number if you want to test editing
   - Click "Pay GHS [amount]"

4. **Watch the payment flow**:
   - "Initiating payment request..."
   - "Payment prompt sent to your phone. Please check your phone..."
   - "Waiting for payment approval... (1/30)"
   - After a few seconds: "Payment successful!" ✅

5. **Complete application**:
   - Proceed to Step 6: Review & Submit
   - Submit your application

## Step 3: Verify in Database

Check that the payment was recorded:

```sql
-- View all payment transactions
SELECT 
  transaction_id,
  amount,
  network,
  phone_number,
  status,
  created_at
FROM payment_transactions
ORDER BY created_at DESC;
```

## How It Works (Development Mode)

### Current Behavior:
- ✅ Phone number auto-fills from user profile
- ✅ User can edit phone number
- ✅ Payment initiation creates transaction record
- ✅ Status polling simulates waiting for approval
- ✅ Random success after 2-6 seconds (70% success rate)
- ⚠️ No actual money is charged
- ⚠️ No real phone prompt is sent

### What Users See:

1. **Payment Form**:
   ```
   Mobile Number: 024 123 4567
   Auto-filled from your profile. You can edit if needed.
   ```

2. **After Clicking Pay**:
   ```
   ℹ️ Payment prompt sent to your phone. Please check your 
      phone and approve the transaction.
   ```

3. **While Waiting**:
   ```
   ℹ️ Waiting for payment approval... (5/30)
   ```

4. **On Success**:
   ```
   ✅ Payment successful!
   ```

5. **On Failure**:
   ```
   ❌ Payment failed. Please try again.
   ```

## Production Setup (When Ready)

### For MTN Mobile Money:

1. **Register**: https://momodeveloper.mtn.com/
2. **Get credentials**: Subscription Key, API User, API Key
3. **Add to `.env`**:
```env
MOMO_API_KEY=your_subscription_key
MOMO_API_SECRET=your_api_key
MOMO_API_USER_ID=your_api_user_id
MOMO_ENVIRONMENT=production
```

4. **Update code**: See `MOMO_PAYMENT_INTEGRATION_COMPLETE.md` for details

### For Vodafone Cash:

Contact Vodafone Ghana Business:
- Website: https://vodafone.com.gh/business
- Email: business@vodafone.com.gh

### For AirtelTigo Money:

Contact AirtelTigo Ghana:
- Website: https://airteltigo.com.gh
- Email: business@airteltigo.com.gh

## Testing Scenarios

### Test 1: Auto-Fill Phone Number
- **Expected**: Phone number from profile appears automatically
- **Verify**: Check that the number matches user's profile

### Test 2: Edit Phone Number
- **Action**: Change the auto-filled number
- **Expected**: New number is used for payment
- **Verify**: Check transaction record has new number

### Test 3: Payment Success
- **Action**: Complete payment flow
- **Expected**: "Payment successful!" message
- **Verify**: Transaction status = 'success' in database

### Test 4: Payment Timeout
- **Action**: Wait for 1 minute without approval
- **Expected**: "Payment timeout. Please try again."
- **Verify**: Can retry payment

### Test 5: Different Networks
- **Action**: Try MTN, Vodafone, AirtelTigo
- **Expected**: All networks work
- **Verify**: Network name saved in transaction

## Troubleshooting

### Phone number not auto-filling

**Check**: User has phone number in their profile
**Fix**: Update user profile with phone number

### Payment always fails

**Check**: Look at browser console for errors
**Fix**: Check API routes are accessible

### Transaction not in database

**Check**: Run the SQL script to create table
**Fix**: Verify Supabase connection

### Status stuck on "Waiting..."

**Check**: Browser console for API errors
**Fix**: Refresh page and try again

## What's Next?

After testing in development:

1. ✅ Verify phone auto-fill works
2. ✅ Test editing phone number
3. ✅ Confirm payment flow completes
4. ✅ Check database records
5. 🔄 Integrate real MoMo API (production)
6. 🔄 Add webhook handlers
7. 🔄 Add email/SMS notifications
8. 🔄 Add payment receipts

## Status: Ready for Testing ✅

The MoMo payment system is ready to test in development mode!
