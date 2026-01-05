/**
 * Utility per calcolo pesi specifi del workout
 */

/**
 * Round weight to the nearest plate increment
 * 
 * Common increments:
 * - 2.5kg: Standard Olympic barbell plates
 * - 2.0kg: Common dumbbell increments
 * - 1.25kg: Micro plates for fine progression
 * 
 * @param weight - Weight in kg (or any unit)
 * @param increment - Plate increment (default 2.5)
 * @param maxDecimals - Maximum decimal places in output (default 2)
 * @returns Rounded weight to nearest increment, 0 stays 0
 */
export function roundToPlateIncrement(
  weight: number | null | undefined,
  increment: number = 2.5,
  maxDecimals: number = 2
): number {
  if (weight === null || weight === undefined || Number.isNaN(weight) || weight === 0) {
    return 0;
  }

  if (increment <= 0 || Number.isNaN(increment)) {
    increment = 2.5;
  }

  const rounded = Math.round(weight / increment) * increment;
  const factor = Math.pow(10, maxDecimals);
  return Math.round(rounded * factor) / factor;
}
