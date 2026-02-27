import { format, formatDistanceToNow, startOfWeek, parseISO } from 'date-fns'

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy')
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a')
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy h:mm a')
}

export function timeAgo(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true })
}

export function getWeekStart(iso: string): string {
  return startOfWeek(parseISO(iso), { weekStartsOn: 1 }).toISOString()
}

export function durationMinutes(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
}

export function nowISO(): string {
  return new Date().toISOString()
}
