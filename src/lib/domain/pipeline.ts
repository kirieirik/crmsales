export function calculateWeightedValue(value: number, probability: number): number {
  if (value < 0 || probability < 0 || probability > 100) {
    throw new Error("Value and probability must be within valid ranges");
  }

  return Math.round(((value * probability) / 100) * 100) / 100;
}

export function isOverdue(dueDate: Date, now = new Date()): boolean {
  return dueDate.getTime() < now.getTime();
}
