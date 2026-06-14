export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

export function formatIdCard(idCard: string): string {
  if (!idCard) return idCard
  if (idCard.length === 15) {
    return `${idCard.slice(0, 6)}********${idCard.slice(12)}`
  }
  if (idCard.length === 18) {
    return `${idCard.slice(0, 6)}********${idCard.slice(14)}`
  }
  return idCard
}

const CARE_LEVEL_MAP: Record<string, string> = {
  SELF_CARE: '自理',
  SEMI_CARE: '半自理',
  FULL_CARE: '全护理',
  SPECIAL_CARE: '特护',
}

export function careLevelText(level: string): string {
  return CARE_LEVEL_MAP[level] || level
}

const BED_STATUS_MAP: Record<string, string> = {
  AVAILABLE: '空闲',
  OCCUPIED: '已入住',
  RESERVED: '已预订',
  MAINTENANCE: '维修中',
}

export function bedStatusText(status: string): string {
  return BED_STATUS_MAP[status] || status
}

const SHIFT_MAP: Record<string, string> = {
  MORNING: '早班',
  MIDDLE: '中班',
  NIGHT: '夜班',
}

export function shiftText(shift: string): string {
  return SHIFT_MAP[shift] || shift
}

const EVENT_TYPE_MAP: Record<string, string> = {
  MEDICATION: '服药',
  VITAL_SIGNS: '生命体征',
  MEAL: '用餐',
  BATH: '洗澡',
  EXERCISE: '活动',
  ACCIDENT: '意外事件',
  OTHER: '其他',
}

export function eventTypeText(type: string): string {
  return EVENT_TYPE_MAP[type] || type
}
