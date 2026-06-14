const pad = (n: number): string => n.toString().padStart(2, '0')

export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  const seconds = pad(d.getSeconds())

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

export function getAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function getWeekDates(baseDate: Date = new Date()): Date[] {
  const dates: Date[] = []
  const current = new Date(baseDate)
  const day = current.getDay()
  current.setDate(current.getDate() - day)
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

export function getMonthDays(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function isSameDay(d1: Date | string, d2: Date | string): boolean {
  const a = typeof d1 === 'string' ? new Date(d1) : d1
  const b = typeof d2 === 'string' ? new Date(d2) : d2
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function getTodayStr(): string {
  return formatDate(new Date(), 'YYYY-MM-DD')
}
