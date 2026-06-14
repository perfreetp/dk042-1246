const CARE_LEVEL_DAILY_RATES: Record<string, number> = {
  SELF_CARE: 50,
  SEMI_CARE: 80,
  FULL_CARE: 120,
  SPECIAL_CARE: 180,
}

export function calcDaysBetween(from: string, to: string): number {
  const start = new Date(from)
  const end = new Date(to)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
}

export function calcBedCost(dailyRate: number, days: number): number {
  return Math.round(dailyRate * days * 100) / 100
}

export function calcCareCost(careLevel: string, days: number): number {
  const rate = CARE_LEVEL_DAILY_RATES[careLevel] || 0
  return Math.round(rate * days * 100) / 100
}

export function generateBillItems(
  elderId: string,
  bed: any,
  carePlan: any,
  fromDate: string,
  toDate: string
): any[] {
  const days = calcDaysBetween(fromDate, toDate)
  const items: any[] = []

  if (bed && bed.dailyRate) {
    const bedCost = calcBedCost(bed.dailyRate, days)
    items.push({
      id: `bed-${Date.now()}`,
      elderId,
      type: 'BED',
      name: `${bed.roomNo}-${bed.bedNo}床位费`,
      description: `${fromDate} 至 ${toDate}，共 ${days} 天，单价 ¥${bed.dailyRate}/天`,
      unitPrice: bed.dailyRate,
      quantity: days,
      amount: bedCost,
      fromDate,
      toDate,
    })
  }

  if (carePlan && carePlan.careLevel) {
    const careLevel = carePlan.careLevel
    const careRate = CARE_LEVEL_DAILY_RATES[careLevel] || 0
    const careCost = calcCareCost(careLevel, days)
    const careLevelNames: Record<string, string> = {
      SELF_CARE: '自理',
      SEMI_CARE: '半自理',
      FULL_CARE: '全护理',
      SPECIAL_CARE: '特护',
    }
    items.push({
      id: `care-${Date.now()}`,
      elderId,
      type: 'CARE',
      name: `${careLevelNames[careLevel] || careLevel}护理费`,
      description: `${fromDate} 至 ${toDate}，共 ${days} 天，单价 ¥${careRate}/天`,
      unitPrice: careRate,
      quantity: days,
      amount: careCost,
      fromDate,
      toDate,
    })
  }

  return items
}
