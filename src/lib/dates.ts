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

export function formatDuration(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function nowISO(): string {
  return new Date().toISOString()
}
