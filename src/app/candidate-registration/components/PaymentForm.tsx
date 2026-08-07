'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PaymentFormProps {
  amount: number;
  positionTitle: string;
  onPaymentComplete: (transactionId: string) => void;
  errors: Record<string, string>;
  userPhone?: string; // Add user's phone number from profile
}

const PaymentForm = ({ amount, positionTitle, onPaymentComplete, errors, userPhone }: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobilemoney' | ''>('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [mobileMoneyDetails, setMobileMoneyDetails] = useState({
    network: '',
    number: userPhone || '', // Auto-fill with user's phone number
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Auto-fill phone number when userPhone prop changes
  React.useEffect(() => {
    if (userPhone && !mobileMoneyDetails.number) {
      setMobileMoneyDetails(prev => ({ ...prev, number: userPhone }));
    }
  }, [userPhone]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('pending');
    setStatusMessage('');

    try {
      if (paymentMethod === 'mobilemoney') {
        // Validate MoMo details
        if (!mobileMoneyDetails.network || !mobileMoneyDetails.number) {
          setStatusMessage('Please select network and enter mobile number');
          setPaymentStatus('failed');
          setIsProcessing(false);
          return;
        }

        // Initiate MoMo payment
        setStatusMessage('Initiating payment request...');
        
        const response = await fetch('/api/payment/momo/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            network: mobileMoneyDetails.network,
            phoneNumber: mobileMoneyDetails.number,
            description: `Application fee for ${positionTitle}`,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Payment initiation failed');
        }

        // Show prompt sent message
        setStatusMessage('Payment prompt sent to your phone. Please check your phone and approve the transaction.');
        
        // Poll for payment status
        const checkPaymentStatus = async (transactionId: string, attempts = 0) => {
          if (attempts >= 30) { // 30 attempts = 1 minute
            setStatusMessage('Payment timeout. Please try again.');
            setPaymentStatus('failed');
            setIsProcessing(false);
            return;
          }

          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

          const statusResponse = await fetch(`/api/payment/momo/status?transactionId=${transactionId}`);
          const statusResult = await statusResponse.json();

          if (statusResult.status === 'success') {
            setStatusMessage('Payment successful!');
            setPaymentStatus('success');
            setIsProcessing(false);
            onPaymentComplete(transactionId);
          } else if (statusResult.status === 'failed') {
            setStatusMessage('Payment failed. Please try again.');
            setPaymentStatus('failed');
            setIsProcessing(false);
          } else {
            // Still pending, check again
            setStatusMessage(`Waiting for payment approval... (${attempts + 1}/30)`);
            await checkPaymentStatus(transactionId, attempts + 1);
          }
        };

        await checkPaymentStatus(result.transactionId);

      } else if (paymentMethod === 'card') {
        // Card payment simulation (replace with actual Stripe integration)
        setStatusMessage('Processing card payment...');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockTransactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
        setStatusMessage('Payment successful!');
        setPaymentStatus('success');
        setIsProcessing(false);
        onPaymentComplete(mockTransactionId);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setStatusMessage(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setPaymentStatus('failed');
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Application Fee for</p>
            <p className="text-lg font-heading font-semibold text-foreground">{positionTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Amount Due</p>
            <p className="text-2xl font-heading font-bold text-accent">GHS {amount}</p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-md p-4">
          <div className="flex items-start gap-3">
            <Icon
              name="InformationCircleIcon"
              size={20}
              variant="solid"
              className="text-primary flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm text-foreground font-medium">Secure Payment Processing</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your payment is processed securely through Stripe. All transactions are encrypted
                and protected.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-4">
          Select Payment Method <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-4 rounded-md border-2 transition-all duration-250 ease-smooth ${
              paymentMethod === 'card'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon name="CreditCardIcon" size={24} variant="outline" className="text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground">Credit/Debit Card</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, Verve</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('mobilemoney')}
            className={`p-4 rounded-md border-2 transition-all duration-250 ease-smooth ${
              paymentMethod === 'mobilemoney'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                name="DevicePhoneMobileIcon"
                size={24}
                variant="outline"
                className="text-primary"
              />
              <div className="text-left">
                <p className="font-medium text-foreground">Mobile Money</p>
                <p className="text-xs text-muted-foreground">MTN, Vodafone, AirtelTigo</p>
              </div>
            </div>
          </button>
        </div>
        {errors.paymentMethod && <p className="text-sm text-error mt-2">{errors.paymentMethod}</p>}
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-foreground mb-2">
              Card Number <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardDetails.number}
              onChange={(e) =>
                setCardDetails({
                  ...cardDetails,
                  number: formatCardNumber(e.target.value.slice(0, 19)),
                })
              }
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth"
            />
          </div>

          <div>
            <label htmlFor="cardName" className="block text-sm font-medium text-foreground mb-2">
              Cardholder Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="cardName"
              value={cardDetails.name}
              onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
              placeholder="Name as shown on card"
              className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cardExpiry"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Expiry Date <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="cardExpiry"
                value={cardDetails.expiry}
                onChange={(e) =>
                  setCardDetails({
                    ...cardDetails,
                    expiry: formatExpiry(e.target.value.slice(0, 5)),
                  })
                }
                placeholder="MM/YY"
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth"
              />
            </div>

            <div>
              <label htmlFor="cardCvv" className="block text-sm font-medium text-foreground mb-2">
                CVV <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="cardCvv"
                value={cardDetails.cvv}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, cvv: e.target.value.slice(0, 3) })
                }
                placeholder="123"
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth"
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'mobilemoney' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="network" className="block text-sm font-medium text-foreground mb-2">
              Mobile Network <span className="text-error">*</span>
            </label>
            <select
              id="network"
              value={mobileMoneyDetails.network}
              onChange={(e) =>
                setMobileMoneyDetails({ ...mobileMoneyDetails, network: e.target.value })
              }
              className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth appearance-none"
            >
              <option value="">Select your network</option>
              <option value="mtn">MTN Mobile Money</option>
              <option value="vodafone">Vodafone Cash</option>
              <option value="airteltigo">AirtelTigo Money</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="mobileNumber"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Mobile Number <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                id="mobileNumber"
                value={mobileMoneyDetails.number}
                onChange={(e) =>
                  setMobileMoneyDetails({ ...mobileMoneyDetails, number: e.target.value })
                }
                placeholder="024 XXX XXXX"
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth"
              />
              {userPhone && (
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-filled from your profile. You can edit if needed.
                </p>
              )}
            </div>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-md p-4">
            <div className="flex items-start gap-3">
              <Icon
                name="ExclamationTriangleIcon"
                size={20}
                variant="solid"
                className="text-warning flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm text-foreground font-medium">Approval Required</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You will receive a prompt on your phone to approve this transaction. Please ensure
                  your phone is nearby.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Message */}
      {statusMessage && (
        <div className={`rounded-md p-4 ${
          paymentStatus === 'success' ? 'bg-success/10 border border-success/20' :
          paymentStatus === 'failed' ? 'bg-error/10 border border-error/20' :
          'bg-primary/10 border border-primary/20'
        }`}>
          <div className="flex items-start gap-3">
            <Icon
              name={
                paymentStatus === 'success' ? 'CheckCircleIcon' :
                paymentStatus === 'failed' ? 'XCircleIcon' :
                'InformationCircleIcon'
              }
              size={20}
              variant="solid"
              className={
                paymentStatus === 'success' ? 'text-success' :
                paymentStatus === 'failed' ? 'text-error' :
                'text-primary'
              }
            />
            <p className="text-sm text-foreground">{statusMessage}</p>
          </div>
        </div>
      )}

      {paymentMethod && (
        <button
          type="button"
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full py-4 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90 transition-all duration-250 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Icon name="ArrowPathIcon" size={20} variant="outline" className="animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <Icon name="LockClosedIcon" size={20} variant="solid" />
              <span>Pay GHS {amount}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default PaymentForm;
