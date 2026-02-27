import { KG_TO_LB, LB_TO_KG } from './constants'
import type { WeightUnit } from '../types'

export function epley1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

export function tonnage(weight: number, reps: number, sets: number): number {
  return weight * reps * sets
}

export function convertWeight(kg: number, unit: WeightUnit): number {
  return unit === 'lb' ? kg * KG_TO_LB : kg
}

export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'lb' ? value * LB_TO_KG : value
}

export function formatWeight(kg: number, unit: WeightUnit): string {
  const val = convertWeight(kg, unit)
  return `${Number(val.toFixed(1))} ${unit}`
}
