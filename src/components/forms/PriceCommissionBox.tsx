export function PriceCommissionBox({ sellingPrice }: { sellingPrice: number }) {
  const commission = sellingPrice * 0.10;
  const earnings = sellingPrice - commission;
  
  return (
    <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800">
      <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2">Earnings Breakdown</h4>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-emerald-700/70 dark:text-emerald-400/70">Selling Price:</span>
        <span className="font-medium text-emerald-900 dark:text-emerald-300">Rs. {sellingPrice.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2 border-b border-emerald-200/50 pb-2">
        <span className="text-emerald-700/70 dark:text-emerald-400/70">Platform Fee (10%):</span>
        <span className="font-medium text-emerald-900 dark:text-emerald-300">- Rs. {commission.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm font-bold">
        <span className="text-emerald-800 dark:text-emerald-400">You will earn:</span>
        <span className="text-emerald-800 dark:text-emerald-400">Rs. {earnings.toFixed(2)}</span>
      </div>
    </div>
  );
}