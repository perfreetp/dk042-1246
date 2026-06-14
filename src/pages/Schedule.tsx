import { useState, useMemo, useEffect } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Coffee,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Download,
  Users,
  ClipboardList,
  AlertTriangle,
  Phone,
  Award,
  CalendarPlus,
  User,
} from 'lucide-react';
import { useStore } from '@/store';
import type { ShiftType, Schedule } from '@/types';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { formatDate, getWeekDates, addDays } from '@/utils/dateUtils';
import { formatPhone } from '@/utils/formatUtils';

type CellShift = ShiftType | 'rest';

const SHIFT_CYCLE: CellShift[] = ['morning', 'afternoon', 'night', 'rest'];

const SHIFT_CONFIG: Record<
  CellShift,
  { label: string; icon: typeof Sun; bg: string; text: string; border: string }
> = {
  morning: {
    label: '早班',
    icon: Sun,
    bg: 'bg-teal-50 hover:bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
  afternoon: {
    label: '中班',
    icon: Sunset,
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  night: {
    label: '夜班',
    icon: Moon,
    bg: 'bg-indigo-50 hover:bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  rest: {
    label: '休班',
    icon: Coffee,
    bg: 'bg-gray-50 hover:bg-gray-100',
    text: 'text-gray-500',
    border: 'border-gray-200',
  },
};

const WEEK_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function Schedule() {
  const {
    caregivers,
    schedules,
    monthlyWorkloads,
    careTasks,
    initData,
    addSchedule,
    updateSchedule,
    batchAddSchedule,
  } = useStore();

  const [baseDate] = useState<Date>(new Date(2026, 5, 15));
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | null>(null);
  const [quickScheduleOpen, setQuickScheduleOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const [qsCaregiverId, setQsCaregiverId] = useState('');
  const [qsShift, setQsShift] = useState<CellShift>('morning');
  const [qsStartDate, setQsStartDate] = useState('');
  const [qsEndDate, setQsEndDate] = useState('');

  useEffect(() => {
    initData();
  }, [initData]);

  const weekDates = useMemo(() => {
    const base = addDays(baseDate, weekOffset * 7);
    const dates = getWeekDates(base);
    dates.shift();
    return dates;
  }, [baseDate, weekOffset]);

  const weekDateStrs = useMemo(
    () => weekDates.map((d) => formatDate(d, 'YYYY-MM-DD')),
    [weekDates]
  );

  const scheduleMap = useMemo(() => {
    const map = new Map<string, CellShift>();
    schedules.forEach((s) => {
      map.set(`${s.caregiverId}_${s.date}`, s.shift);
    });
    return map;
  }, [schedules]);

  const getCellShift = (caregiverId: string, dateStr: string): CellShift => {
    return scheduleMap.get(`${caregiverId}_${dateStr}`) || 'rest';
  };

  const cycleShift = (caregiverId: string, dateStr: string) => {
    const current = getCellShift(caregiverId, dateStr);
    const currentIdx = SHIFT_CYCLE.indexOf(current);
    const next = SHIFT_CYCLE[(currentIdx + 1) % SHIFT_CYCLE.length];

    const existing = schedules.find(
      (s) => s.caregiverId === caregiverId && s.date === dateStr
    );

    if (next === 'rest') {
      if (existing) {
        updateSchedule(existing.id, { shift: 'morning' });
      }
    } else {
      if (existing) {
        updateSchedule(existing.id, { shift: next });
      } else {
        addSchedule({
          id: '',
          caregiverId,
          date: dateStr,
          shift: next,
        });
      }
    }
  };

  const weekStats = useMemo(() => {
    let total = 0;
    let morning = 0;
    let afternoon = 0;
    let night = 0;

    caregivers.forEach((cg) => {
      weekDateStrs.forEach((ds) => {
        const s = scheduleMap.get(`${cg.id}_${ds}`) || 'rest';
        if (s !== 'rest') {
          total++;
          if (s === 'morning') morning++;
          if (s === 'afternoon') afternoon++;
          if (s === 'night') night++;
        }
      });
    });

    return { total, morning, afternoon, night };
  }, [caregivers, weekDateStrs, scheduleMap]);

  const todayStr = formatDate(new Date(2026, 5, 15), 'YYYY-MM-DD');

  const requiredPerShift = 3;
  const todayShifts = useMemo(() => {
    let m = 0, a = 0, n = 0;
    caregivers.forEach((cg) => {
      const s = scheduleMap.get(`${cg.id}_${todayStr}`) || 'rest';
      if (s === 'morning') m++;
      if (s === 'afternoon') a++;
      if (s === 'night') n++;
    });
    return { m, a, n };
  }, [caregivers, todayStr, scheduleMap]);

  const shortageCount = Math.max(0, requiredPerShift - todayShifts.m) +
    Math.max(0, requiredPerShift - todayShifts.a) +
    Math.max(0, requiredPerShift - todayShifts.n);

  const selectedCaregiver = useMemo(
    () => caregivers.find((c) => c.id === selectedCaregiverId) || null,
    [caregivers, selectedCaregiverId]
  );

  const cgMonthStats = useMemo(() => {
    if (!selectedCaregiver) return null;
    return (
      monthlyWorkloads.find((w) => w.caregiverId === selectedCaregiver.id) || null
    );
  }, [monthlyWorkloads, selectedCaregiver]);

  const cgWeekStats = useMemo(() => {
    if (!selectedCaregiver) return null;
    let m = 0, a = 0, n = 0;
    weekDateStrs.forEach((ds) => {
      const s = scheduleMap.get(`${selectedCaregiver.id}_${ds}`) || 'rest';
      if (s === 'morning') m++;
      if (s === 'afternoon') a++;
      if (s === 'night') n++;
    });
    return { m, a, n, total: m + a + n };
  }, [selectedCaregiver, weekDateStrs, scheduleMap]);

  const cgTaskCount = useMemo(() => {
    if (!selectedCaregiver) return 0;
    return careTasks.filter(
      (t) => t.caregiverId === selectedCaregiver.id && t.status === 'completed'
    ).length;
  }, [careTasks, selectedCaregiver]);

  const handleQuickSchedule = () => {
    if (!qsCaregiverId || !qsStartDate || !qsEndDate) return;

    const start = new Date(qsStartDate);
    const end = new Date(qsEndDate);
    const newSchedules: Schedule[] = [];
    const toUpdate: { id: string; shift: ShiftType }[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDate(d, 'YYYY-MM-DD');
      const existing = schedules.find(
        (s) => s.caregiverId === qsCaregiverId && s.date === dateStr
      );
      if (qsShift !== 'rest') {
        if (existing) {
          toUpdate.push({ id: existing.id, shift: qsShift });
        } else {
          newSchedules.push({
            id: '',
            caregiverId: qsCaregiverId,
            date: dateStr,
            shift: qsShift,
          });
        }
      }
    }

    if (newSchedules.length > 0) batchAddSchedule(newSchedules);
    toUpdate.forEach((u) => updateSchedule(u.id, { shift: u.shift }));

    setQuickScheduleOpen(false);
    setQsCaregiverId('');
    setQsShift('morning');
    setQsStartDate('');
    setQsEndDate('');
  };

  const handleExport = () => {
    const rows = [
      ['护理员', ...weekDateStrs.map((d) => formatDate(d, 'MM/DD'))],
    ];
    caregivers.forEach((cg) => {
      const row = [cg.name];
      weekDateStrs.forEach((ds) => {
        const s = getCellShift(cg.id, ds);
        row.push(SHIFT_CONFIG[s].label);
      });
      rows.push(row);
    });
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `排班表_${weekDateStrs[0]}_${weekDateStrs[6]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="排班表"
        subtitle="护理员班次安排管理"
        actions={
          <>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronLeft className="h-4 w-4" />}
                onClick={() => setWeekOffset((o) => o - 1)}
              />
              <Button
                variant={weekOffset === 0 ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setWeekOffset(0)}
              >
                本周
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight className="h-4 w-4" />}
                onClick={() => setWeekOffset((o) => o + 1)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<CalendarPlus className="h-4 w-4" />}
              onClick={() => setQuickScheduleOpen(true)}
            >
              快速排班
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={handleExport}
            >
              导出排班
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="本周总班次"
          value={weekStats.total}
          icon={ClipboardList}
          color="teal"
        />
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">各班次分布</p>
              <Users className="h-5 w-5 text-sky-600" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-teal-50">
                <div className="text-2xl font-bold text-teal-700">{weekStats.morning}</div>
                <div className="text-xs text-teal-600 mt-1">早班</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-50">
                <div className="text-2xl font-bold text-amber-700">{weekStats.afternoon}</div>
                <div className="text-xs text-amber-600 mt-1">中班</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-indigo-50">
                <div className="text-2xl font-bold text-indigo-700">{weekStats.night}</div>
                <div className="text-xs text-indigo-600 mt-1">夜班</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <StatCard
          title="今日人力缺口"
          value={shortageCount}
          icon={AlertTriangle}
          color={shortageCount > 0 ? 'rose' : 'emerald'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="sticky left-0 z-10 bg-gray-50 border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-600 w-48">
                      护理员
                    </th>
                    {weekDates.map((d, i) => {
                      const isToday = formatDate(d, 'YYYY-MM-DD') === todayStr;
                      return (
                        <th
                          key={i}
                          className={cn(
                            'px-2 py-3 text-center text-xs font-semibold min-w-[100px]',
                            isToday ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                          )}
                        >
                          <div className="font-medium">{WEEK_LABELS[i]}</div>
                          <div className={cn('mt-1', isToday ? 'text-primary-600' : 'text-gray-400')}>
                            {formatDate(d, 'MM/DD')}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {caregivers.filter((c) => c.status === 'active').map((cg) => (
                    <tr
                      key={cg.id}
                      className={cn(
                        'border-b border-gray-100 hover:bg-gray-50/50 transition-colors',
                        selectedCaregiverId === cg.id && 'bg-primary-50/30'
                      )}
                    >
                      <td
                        className="sticky left-0 z-10 bg-white border-r border-gray-100 px-4 py-3 cursor-pointer"
                        onClick={() =>
                          setSelectedCaregiverId(
                            selectedCaregiverId === cg.id ? null : cg.id
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
                            {cg.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {cg.name}
                            </div>
                            <Badge
                              variant={
                                cg.certification.includes('高级')
                                  ? 'emerald'
                                  : cg.certification.includes('中级')
                                  ? 'sky'
                                  : cg.certification.includes('护士')
                                  ? 'rose'
                                  : cg.certification.includes('康复')
                                  ? 'amber'
                                  : 'default'
                              }
                              size="sm"
                              className="mt-0.5"
                            >
                              {cg.certification.replace('养老护理员', '')}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      {weekDateStrs.map((ds, i) => {
                        const shift = getCellShift(cg.id, ds);
                        const cfg = SHIFT_CONFIG[shift];
                        const Icon = cfg.icon;
                        return (
                          <td key={i} className="px-1.5 py-2">
                            <button
                              onClick={() => cycleShift(cg.id, ds)}
                              className={cn(
                                'w-full h-14 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all duration-200',
                                cfg.bg,
                                cfg.text,
                                cfg.border,
                                'hover:scale-[1.02] active:scale-[0.98]'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-xs font-medium">{cfg.label}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">护理员信息</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCaregiver ? (
              <div className="space-y-5">
                <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold mb-3">
                    {selectedCaregiver.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {selectedCaregiver.name}
                  </h3>
                  <Badge
                    variant={
                      selectedCaregiver.certification.includes('高级')
                        ? 'emerald'
                        : 'sky'
                    }
                    size="md"
                    className="mt-1.5"
                  >
                    {selectedCaregiver.certification}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-500 shrink-0">入职日期：</span>
                    <span className="text-gray-900">{selectedCaregiver.hireDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-500 shrink-0">联系方式：</span>
                    <span className="text-gray-900">
                      {formatPhone(selectedCaregiver.phone)}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-600">
                    <Award className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-gray-500 shrink-0">资质证书：</span>
                    <span className="text-gray-900">{selectedCaregiver.certification}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <h4 className="font-medium text-gray-900 text-sm">本月排班统计</h4>
                  {cgMonthStats ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-teal-50">
                        <div className="text-lg font-bold text-teal-700">
                          {cgMonthStats.morningShifts}
                        </div>
                        <div className="text-xs text-teal-600">早班</div>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-50">
                        <div className="text-lg font-bold text-amber-700">
                          {cgMonthStats.afternoonShifts}
                        </div>
                        <div className="text-xs text-amber-600">中班</div>
                      </div>
                      <div className="p-2 rounded-lg bg-indigo-50">
                        <div className="text-lg font-bold text-indigo-700">
                          {cgMonthStats.nightShifts}
                        </div>
                        <div className="text-xs text-indigo-600">夜班</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 text-center py-2">暂无数据</div>
                  )}

                  <div className="mt-3 p-3 rounded-lg bg-gradient-to-br from-sky-50 to-sky-100/60 border border-sky-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-sky-600 font-medium">完成任务数</div>
                        <div className="text-2xl font-bold text-sky-700 mt-1">
                          {cgMonthStats?.tasksCompleted ?? cgTaskCount}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-sky-500/10">
                        <ClipboardList className="h-5 w-5 text-sky-600" />
                      </div>
                    </div>
                  </div>

                  {cgWeekStats && (
                    <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">本周排班</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">总班次</span>
                        <span className="font-semibold text-gray-900">{cgWeekStats.total} 个</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">点击左侧护理员查看详情</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={quickScheduleOpen}
        onClose={() => setQuickScheduleOpen(false)}
        title="快速排班"
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuickScheduleOpen(false)}>
              取消
            </Button>
            <Button onClick={handleQuickSchedule}>确认排班</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="选择护理员"
            placeholder="请选择护理员"
            options={caregivers
              .filter((c) => c.status === 'active')
              .map((c) => ({ value: c.id, label: c.name }))}
            value={qsCaregiverId}
            onChange={(e) => setQsCaregiverId(e.target.value)}
          />
          <Select
            label="固定班次"
            options={SHIFT_CYCLE.map((s) => ({
              value: s,
              label: SHIFT_CONFIG[s].label,
            }))}
            value={qsShift}
            onChange={(e) => setQsShift(e.target.value as CellShift)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="开始日期"
              type="date"
              value={qsStartDate}
              onChange={(e) => setQsStartDate(e.target.value)}
            />
            <Input
              label="结束日期"
              type="date"
              value={qsEndDate}
              onChange={(e) => setQsEndDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
