// lib/forecasting-helpers.ts
import { Ingredient } from './data';

// =============================================================================
// CALCULATE STOCKOUT DATE (when will we run out?)
// =============================================================================
export function calculateStockoutDate(ingredient: Ingredient): Date | null {
  const avgUsage = ingredient.dailyUsage 
    ? ingredient.dailyUsage.reduce((a, b) => a + b, 0) / ingredient.dailyUsage.length 
    : 0;

  if (avgUsage === 0) return null; // No usage data

  const daysLeft = ingredient.onHand / avgUsage;
  const stockoutDate = new Date();
  stockoutDate.setDate(stockoutDate.getDate() + daysLeft);
  
  return stockoutDate;
}

// =============================================================================
// CALCULATE URGENCY (should we order NOW?)
// =============================================================================
export function calculateUrgency(ingredient: Ingredient): 'critical' | 'warning' | 'ok' {
  const avgUsage = ingredient.dailyUsage 
    ? ingredient.dailyUsage.reduce((a, b) => a + b, 0) / ingredient.dailyUsage.length 
    : 0;

  if (avgUsage === 0) return 'ok';

  const daysLeft = ingredient.onHand / avgUsage;
  const leadTime = ingredient.leadTimeDays;

  // Critical: Will stock out before order arrives
  if (daysLeft <= leadTime) return 'critical';
  
  // Warning: Will stock out soon after order arrives
  if (daysLeft <= leadTime * 1.5) return 'warning';
  
  return 'ok';
}

// =============================================================================
// CALCULATE ORDER DEADLINE (last day to order before stockout)
// =============================================================================
export function calculateOrderDeadline(ingredient: Ingredient): Date | null {
  const stockoutDate = calculateStockoutDate(ingredient);
  if (!stockoutDate) return null;

  const orderDeadline = new Date(stockoutDate);
  orderDeadline.setDate(orderDeadline.getDate() - ingredient.leadTimeDays);
  
  return orderDeadline;
}

// =============================================================================
// GET HUMAN-READABLE URGENCY MESSAGE
// =============================================================================
export function getUrgencyMessage(ingredient: Ingredient): string {
  const urgency = calculateUrgency(ingredient);
  const daysLeft = ingredient.dailyUsage 
    ? ingredient.onHand / (ingredient.dailyUsage.reduce((a, b) => a + b, 0) / ingredient.dailyUsage.length)
    : 999;

  switch (urgency) {
    case 'critical':
      return `Order NOW! Only ${daysLeft.toFixed(1)} days left (${ingredient.leadTimeDays}d lead time)`;
    case 'warning':
      return `Order soon. ${daysLeft.toFixed(1)} days left`;
    case 'ok':
      return `Stock OK. ${daysLeft.toFixed(1)} days left`;
  }
}