export interface BkashTransaction {
  paymentID: string;
  trxID: string;
  amount: number;
  currency: string;
  customerMsisdn: string;
  merchantInvoiceNumber: string;
  transactionStatus: 'Completed' | 'Pending' | 'Failed';
  statusCode: string;
  statusMessage: string;
  timestamp: string;
}

const STORAGE_KEY = 'nexus_bkash_transactions';

export function getStoredTransactions(): BkashTransaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: BkashTransaction[] = [
        {
          paymentID: 'PAY_BKASH_829104',
          trxID: '9K8X29M1B4',
          amount: 1450,
          currency: 'BDT',
          customerMsisdn: '01712489201',
          merchantInvoiceNumber: 'INV-2026-001',
          transactionStatus: 'Completed',
          statusCode: '0000',
          statusMessage: 'Successful',
          timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTransaction(tx: BkashTransaction): BkashTransaction[] {
  if (typeof window === 'undefined') return [tx];
  try {
    const current = getStoredTransactions();
    const updated = [tx, ...current.slice(0, 19)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [tx];
  }
}

export function processBkashPayment(params: {
  amount: number;
  phone: string;
  trxId: string;
}): BkashTransaction {
  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const paymentId = `PAY_BKASH_${Date.now()}`;

  const transaction: BkashTransaction = {
    paymentID: paymentId,
    trxID: params.trxId,
    amount: params.amount,
    currency: 'BDT',
    customerMsisdn: params.phone.replace(/[^0-9]/g, ''),
    merchantInvoiceNumber: invoiceNumber,
    transactionStatus: 'Completed',
    statusCode: '0000',
    statusMessage: 'Successful payment via bKash Checkout URL v1.2',
    timestamp: new Date().toLocaleTimeString(),
  };

  saveTransaction(transaction);
  return transaction;
}
