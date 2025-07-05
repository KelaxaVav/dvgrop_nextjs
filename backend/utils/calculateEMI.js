// Calculate EMI using simple interest formula
export const calculateEMI = (principal, interestRate, period) => {
  // Simple Interest Formula: Total Amount = Principal + (Principal × Rate × Time)
  const simpleInterest = principal * (interestRate / 100) * period;
  const totalAmount = principal + simpleInterest;
  
  // EMI = Total Amount / Number of Installments
  const emi = Math.round(totalAmount / period);
  
  return {
    emi,
    totalAmount,
    totalInterest: simpleInterest
  };
};

// Calculate EMI using reducing balance method
export const calculateReducingBalanceEMI = (principal, interestRate, period) => {
  // Convert annual interest rate to monthly
  const monthlyInterestRate = interestRate / 100 / 12;
  
  // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  const emi = principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, period) / 
              (Math.pow(1 + monthlyInterestRate, period) - 1);
  
  const totalAmount = emi * period;
  const totalInterest = totalAmount - principal;
  
  return {
    emi: Math.round(emi),
    totalAmount: Math.round(totalAmount),
    totalInterest: Math.round(totalInterest)
  };
};

// Calculate penalty based on settings
export const calculatePenalty = (amount, daysOverdue, penaltySettings) => {
  const { penaltyRate, penaltyType } = penaltySettings;
  
  switch (penaltyType) {
    case 'per_day':
      return Math.round(amount * (penaltyRate / 100) * daysOverdue);
    case 'per_week':
      const weeksOverdue = Math.ceil(daysOverdue / 7);
      return Math.round(amount * (penaltyRate / 100) * weeksOverdue);
    case 'fixed_total':
      return Math.round(amount * (penaltyRate / 100));
    default:
      return Math.round(amount * (penaltyRate / 100) * daysOverdue);
  }
};