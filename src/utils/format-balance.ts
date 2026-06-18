export const fBalance = (balance: number | string) => {
   return Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatMoney = (currencyCode: string, amount: number): string => {
   // ✅ Guard against undefined/null/empty currency code
   if (!currencyCode || currencyCode === 'undefined' || currencyCode === 'null') {
       return `GH₵ ${Number(amount).toFixed(2)}`;
   }

   try {
       const formatter = new Intl.NumberFormat('en-US', {
           style: 'currency',
           currency: currencyCode
       });
       return formatter.format(amount);
   } catch (e) {
       // ✅ Fallback if currency code is invalid
       return `GH₵ ${Number(amount).toFixed(2)}`;
   }
};
