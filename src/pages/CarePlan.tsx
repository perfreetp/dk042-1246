import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Save,
  Sun,
  Moon,
  UtensilsCrossed,
  Droplets,
  HeartPulse,
  Bed,
  Bath,
  ListPlus,
  Trash2,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { getWeekDates, formatDate, isSameDay, getTodayStr } from '@/utils/dateUtils';
import type {
  Elder,
  CareLevel,
  CarePlan,
  CareTask,
  CustomTask,
  TaskStatus,
} from '@/types';

const careLevelBadgeMap: Record<CareLevel, { variant: any; label: string }> = {
  'self-care': { variant: 'success', label: '自理' },
  'semi-care': { variant: 'sky', label: '半自理' },
  'full-care': { variant: 'amber', label: '全护理' },
  'special-care': { variant: 'rose', label: '特护' },
};

const measureFrequencyOptions = [
  { value: 'daily', label: '每日' },
  { value: 'bidaily', label: '隔日' },
  { value: 'weekly', label: '每周' },
];

const bathingOptions = [
  { value: 'daily', label: '每日' },
  { value: 'every2days', label: '每2日' },
  { value: 'weekly', label: '每周' },
];

const vitalSignItems = ['血压', '体温', '脉搏', '血糖'];

type ToggleKey = 'morningCare' | 'eveningCare' | 'mealAssist' | 'bathingAssist';

type PlanForm = Omit<CarePlan, 'id' | 'elderId' | 'careLevel'>;

const defaultEmptyCustomTask = (): CustomTask => ({
  id: 'ct_new_' + Math.random().toString(36).slice(2, 8),
  name: '',
  description: '',
  scheduledTime: '09:00',
  frequency: 'daily',
});

const taskTypeColorMap: Record<string, string> = {
  morning: 'bg-sky-100 text-sky-700 border-sky-200',
  evening: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  meal: 'bg-amber-100 text-amber-700 border-amber-200',
  turnover: 'bg-rose-100 text-rose-700 border-rose-200',
  vital: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  bath: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  night: 'bg-violet-100 text-violet-700 border-violet-200',
  medication: 'bg-pink-100 text-pink-700 border-pink-200',
  activity: 'bg-teal-100 text-teal-700 border-teal-200',
  rehab: 'bg-orange-100 text-orange-700 border-orange-200',
  wound: 'bg-red-100 text-red-700 border-red-200',
  custom: 'bg-gray-100 text-gray-700 border-gray-200',
};

const taskTypeLabelMap: Record<string, string> = {
  morning: '晨间',
  evening: '晚间',
  meal: '用餐',
  turnover: '翻身',
  vital: '体征',
  bath: '洗澡',
  night: '巡房',
  medication: '服药',
  activity: '活动',
  rehab: '康复',
  wound: '伤口',
  custom: '自定义',
};

const renderStatusIcon = (status: TaskStatus) => {
  if (status === 'completed') {
    return <span className="text-emerald-600 font-bold text-xs leading-none">✓</span>;
  }
  if (status === 'overdue') {
    return <AlertCircle className="w-3 h-3 text-red-500" />;
  }
  return <span className="w-3 h-3 rounded-full border border-gray-400 inline-block leading-none" />;
};

export default function CarePlan() {
  const {
    elders,
    carePlans,
    careTasks,
    addCarePlan,
    updateCarePlan,
  } = useStore();

  const activeElders = useMemo(
    () => elders.filter((e) => e.status === 'active'),
    [elders]
  );

  const [searchText, setSearchText] = useState('');
  const [selectedElderId, setSelectedElderId] = useState<string>(
    activeElders[0]?.id || ''
  );

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    turnover: true,
    vital: true,
    rounds: true,
    bathing: true,
    custom: true,
  });

  const [planForm, setPlanForm] = useState<PlanForm>({
    turnOverHours: 4,
    measureFrequency: 'daily',
    morningCare: true,
    eveningCare: false,
    mealAssist: false,
    bathingAssist: false,
    bathingSchedule: 'weekly',
    mealRounds: 3,
    nightRounds: 1,
    customTasks: [],
  });

  const [saving, setSaving] = useState(false);

  const weekDates = useMemo(() => getWeekDates(new Date()), []);
  const todayStr = getTodayStr();

  const filteredElders = useMemo(() => {
    if (!searchText.trim()) return activeElders;
    const kw = searchText.trim().toLowerCase();
    return activeElders.filter(
      (e) =>
        e.name.toLowerCase().includes(kw) ||
        e.phone.includes(kw) ||
        (e.idCard && e.idCard.includes(kw))
    );
  }, [activeElders, searchText]);

  const selectedElder: Elder | undefined = useMemo(
    () => activeElders.find((e) => e.id === selectedElderId),
    [activeElders, selectedElderId]
  );

  const existingPlan = useMemo(
    () => carePlans.find((p) => p.elderId === selectedElderId),
    [carePlans, selectedElderId]
  );

  const elderTasks = useMemo(() => {
    return careTasks.filter((t) => t.elderId === selectedElderId);
  }, [careTasks, selectedElderId]);

  useEffect(() => {
    if (selectedElderId && existingPlan) {
      setPlanForm({
        turnOverHours: existingPlan.turnOverHours,
        measureFrequency: existingPlan.measureFrequency,
        morningCare: existingPlan.morningCare,
        eveningCare: existingPlan.eveningCare,
        mealAssist: existingPlan.mealAssist,
        bathingAssist: existingPlan.bathingAssist ?? false,
        bathingSchedule: existingPlan.bathingSchedule,
        mealRounds: existingPlan.mealRounds,
        nightRounds: existingPlan.nightRounds,
        customTasks: existingPlan.customTasks.length > 0
          ? existingPlan.customTasks.map((t) => ({ ...t }))
          : [],
      });
    } else if (selectedElder) {
      const level = selectedElder.careLevel;
      setPlanForm({
        turnOverHours: level === 'special-care' ? 2 : level === 'full-care' ? 3 : 4,
        measureFrequency:
          level === 'special-care' || level === 'full-care'
            ? 'daily'
            : level === 'semi-care'
              ? 'bidaily'
              : 'weekly',
        morningCare: true,
        eveningCare: level !== 'self-care',
        mealAssist: level === 'special-care' || level === 'full-care',
        bathingAssist: level !== 'self-care',
        bathingSchedule:
          level === 'special-care' || level === 'full-care' ? 'every2days' : 'weekly',
        mealRounds: 3,
        nightRounds: level === 'special-care' ? 4 : level === 'full-care' ? 2 : 1,
        customTasks: [],
      });
    }
  }, [selectedElderId, existingPlan, selectedElder]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateField = <K extends keyof PlanForm>(key: K, value: PlanForm[K]) => {
    setPlanForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSwitch = (key: ToggleKey) => {
    setPlanForm((prev) => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const addCustomTask = () => {
    setPlanForm((prev) => ({
      ...prev,
      customTasks: [...prev.customTasks, defaultEmptyCustomTask()],
    }));
  };

  const removeCustomTask = (id: string) => {
    setPlanForm((prev) => ({
      ...prev,
      customTasks: prev.customTasks.filter((t) => t.id !== id),
    }));
  };

  const updateCustomTask = (id: string, field: keyof CustomTask, value: any) => {
    setPlanForm((prev) => ({
      ...prev,
      customTasks: prev.customTasks.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    }));
  };

  const handleSave = async () => {
    if (!selectedElder) return;
    setSaving(true);
    try {
      const base = {
        careLevel: selectedElder.careLevel,
        ...planForm,
        customTasks: planForm.customTasks.filter((t) => t.name.trim()),
      };
      if (existingPlan) {
        updateCarePlan(existingPlan.id, base);
      } else {
        addCarePlan({
          id: '',
          elderId: selectedElder.id,
          ...base,
        });
      }
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  };

  const getTasksByDate = (date: Date): CareTask[] => {
    const dateStr = formatDate(date);
    return elderTasks.filter((t) => isSameDay(t.scheduledDate, dateStr));
  };

  return (
    <div className="min-h-full space-y-6">
      <PageHeader
        title="护理计划"
        subtitle="老人护理服务配置"
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={addCustomTask}>
            新增护理计划
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧老人列表 */}
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索姓名、电话..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100"
                />
              </div>
            </CardHeader>
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[400px] px-2 pb-4 space-y-1.5">
              {filteredElders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无在住老人</p>
                </div>
              ) : (
                filteredElders.map((elder) => {
                  const isSelected = elder.id === selectedElderId;
                  const badge = careLevelBadgeMap[elder.careLevel];
                  return (
                    <button
                      key={elder.id}
                      type="button"
                      onClick={() => setSelectedElderId(elder.id)}
                      className={cn(
                        'w-full text-left p-3.5 rounded-xl border transition-all',
                        isSelected
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div
                          className={cn(
                            'font-semibold truncate',
                            isSelected ? 'text-primary-700' : 'text-gray-900'
                          )}
                        >
                          {elder.name}
                        </div>
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          {elder.gender === 'male' ? '男' : '女'} · {elder.age}岁
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* 右侧护理计划配置 */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {selectedElder ? (
            <>
              {/* 选中老人摘要 */}
              <Card>
                <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{selectedElder.name}</h3>
                        <Badge variant={careLevelBadgeMap[selectedElder.careLevel].variant} size="md">
                          {careLevelBadgeMap[selectedElder.careLevel].label}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedElder.gender === 'male' ? '男' : '女'} · {selectedElder.age}岁 · 入住 {selectedElder.checkInDate}
                      </div>
                    </div>
                  </div>
                  {existingPlan ? (
                    <Badge variant="info" size="md">
                      已有护理计划
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="md">
                      待配置计划
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* 基础护理开关 */}
              <Card>
                <button
                  type="button"
                  onClick={() => toggleSection('basic')}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-primary-600" />
                    <CardTitle className="text-base">基础护理</CardTitle>
                  </div>
                  {expandedSections.basic ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.basic && (
                  <CardContent className="pt-0 pb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        {
                          key: 'morningCare' as ToggleKey,
                          icon: Sun,
                          label: '晨间护理',
                          desc: '洗漱、更衣、整理床铺',
                        },
                        {
                          key: 'eveningCare' as ToggleKey,
                          icon: Moon,
                          label: '晚间护理',
                          desc: '洗漱、泡脚、协助如厕',
                        },
                        {
                          key: 'mealAssist' as ToggleKey,
                          icon: UtensilsCrossed,
                          label: '协助用餐',
                          desc: '喂饭、协助进食、记录食量',
                        },
                        {
                          key: 'bathingAssist' as ToggleKey,
                          icon: Droplets,
                          label: '协助洗漱',
                          desc: '洗手、洗脸、口腔清洁',
                        },
                      ].map((item) => {
                        const enabled = (planForm as any)[item.key] ?? true;
                        return (
                          <div
                            key={item.key}
                            onClick={() => toggleSwitch(item.key)}
                            className={cn(
                              'p-4 rounded-xl border cursor-pointer transition-all',
                              enabled
                                ? 'border-primary-300 bg-primary-50/50'
                                : 'border-gray-200 bg-gray-50'
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <item.icon
                                className={cn('w-5 h-5', enabled ? 'text-primary-600' : 'text-gray-400')}
                              />
                              <div
                                className={cn(
                                  'relative w-10 h-6 rounded-full transition-colors',
                                  enabled ? 'bg-primary-600' : 'bg-gray-300'
                                )}
                              >
                                <div
                                  className={cn(
                                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',
                                    enabled ? 'left-[18px]' : 'left-0.5'
                                  )}
                                />
                              </div>
                            </div>
                            <div
                              className={cn(
                                'font-semibold mb-0.5',
                                enabled ? 'text-gray-900' : 'text-gray-500'
                              )}
                            >
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500">{item.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* 翻身频次 */}
              <Card>
                <button
                  type="button"
                  onClick={() => toggleSection('turnover')}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-rose-600" />
                    <CardTitle className="text-base">翻身频次</CardTitle>
                  </div>
                  {expandedSections.turnover ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.turnover && (
                  <CardContent className="pt-0 pb-5">
                    <div className="space-y-5">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-sm text-gray-600">
                          当前设置：每 <span className="font-bold text-rose-600 text-lg">{planForm.turnOverHours}</span> 小时一次
                        </span>
                        <span className="text-sm text-gray-500">
                          约 {Math.round(24 / planForm.turnOverHours)} 次/天
                        </span>
                      </div>
                      <div className="px-2">
                        <input
                          type="range"
                          min={1}
                          max={6}
                          step={1}
                          value={planForm.turnOverHours}
                          onChange={(e) => updateField('turnOverHours', Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-rose-500"
                        />
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          {[1, 2, 3, 4, 5, 6].map((h) => (
                            <span key={h}>{h}h</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-3">
                        说明：翻身频次需根据老人皮肤状况及活动能力调整。特护建议每2小时一次，全护理每3小时一次。
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* 生命体征测量 */}
              <Card>
                <button
                  type="button"
                  onClick={() => toggleSection('vital')}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-emerald-600" />
                    <CardTitle className="text-base">生命体征测量</CardTitle>
                  </div>
                  {expandedSections.vital ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.vital && (
                  <CardContent className="pt-0 pb-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="测量频率"
                        options={measureFrequencyOptions}
                        value={planForm.measureFrequency}
                        onChange={(e) => updateField('measureFrequency', e.target.value as any)}
                      />
                    </div>
                    <div>
                      <div className="block text-sm font-medium text-gray-700 mb-2">包含项目</div>
                      <div className="flex flex-wrap gap-2">
                        {vitalSignItems.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100"
                          >
                            <HeartPulse className="w-3.5 h-3.5 mr-1.5" />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* 送餐巡房 */}
              <Card>
                <button
                  type="button"
                  onClick={() => toggleSection('rounds')}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-amber-600" />
                    <CardTitle className="text-base">送餐与巡房</CardTitle>
                  </div>
                  {expandedSections.rounds ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.rounds && (
                  <CardContent className="pt-0 pb-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="block text-sm font-medium text-gray-700 mb-3">
                          送餐次数：<span className="text-amber-600 font-bold">{planForm.mealRounds}</span> 次/天
                        </div>
                        <div className="flex gap-2">
                          {[2, 3, 4].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => updateField('mealRounds', n)}
                              className={cn(
                                'flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all',
                                planForm.mealRounds === n
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                              )}
                            >
                              {n} 次
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="block text-sm font-medium text-gray-700 mb-3">
                          夜间巡房次数：<span className="text-violet-600 font-bold">{planForm.nightRounds}</span> 次
                        </div>
                        <div className="flex gap-2">
                          {[0, 1, 2, 3].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => updateField('nightRounds', n)}
                              className={cn(
                                'flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all',
                                planForm.nightRounds === n
                                  ? 'bg-violet-500 text-white border-violet-500 shadow-sm'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                              )}
                            >
                              {n} 次
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* 洗澡频次 */}
              <Card>
                <button
                  type="button"
                  onClick={() => toggleSection('bathing')}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-cyan-600" />
                    <CardTitle className="text-base">洗澡频次</CardTitle>
                  </div>
                  {expandedSections.bathing ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.bathing && (
                  <CardContent className="pt-0 pb-5">
                    <div className="grid grid-cols-3 gap-3">
                      {bathingOptions.map((opt) => {
                        const isSelected = planForm.bathingSchedule === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateField('bathingSchedule', opt.value as any)}
                            className={cn(
                              'p-4 rounded-xl border-2 text-center transition-all',
                              isSelected
                                ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            )}
                          >
                            <div
                              className={cn(
                                'text-base font-semibold',
                                isSelected ? 'text-cyan-700' : 'text-gray-900'
                              )}
                            >
                              {opt.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* 自定义任务 */}
              <Card>
                <button
                  type="button"
                  onClick={() => toggleSection('custom')}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <ListPlus className="w-5 h-5 text-gray-600" />
                    <CardTitle className="text-base">自定义任务</CardTitle>
                  </div>
                  {expandedSections.custom ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.custom && (
                  <CardContent className="pt-0 pb-5 space-y-3">
                    {planForm.customTasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <ListPlus className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无自定义任务，点击下方按钮添加</p>
                      </div>
                    ) : (
                      planForm.customTasks.map((task, idx) => (
                        <div
                          key={task.id}
                          className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">任务 #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeCustomTask(task.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              label="任务名称"
                              placeholder="如：雾化吸入"
                              value={task.name}
                              onChange={(e) => updateCustomTask(task.id, 'name', e.target.value)}
                            />
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">执行时间</label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="time"
                                  value={task.scheduledTime}
                                  onChange={(e) => updateCustomTask(task.id, 'scheduledTime', e.target.value)}
                                  className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100"
                                />
                              </div>
                            </div>
                          </div>
                          <Input
                            label="任务描述"
                            placeholder="详细描述任务内容..."
                            value={task.description}
                            onChange={(e) => updateCustomTask(task.id, 'description', e.target.value)}
                          />
                        </div>
                      ))
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={addCustomTask}
                    >
                      添加自定义任务
                    </Button>
                  </CardContent>
                )}
              </Card>

              {/* 保存按钮 */}
              <div className="flex justify-end">
                <Button
                  size="lg"
                  icon={<Save className="w-4 h-4" />}
                  loading={saving}
                  onClick={handleSave}
                >
                  保存配置
                </Button>
              </div>

              {/* 本周护理任务日历 */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">本周护理任务</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-5">
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-7 min-w-[700px] gap-2">
                      {weekDates.map((date, idx) => {
                        const dateStr = formatDate(date);
                        const isToday = dateStr === todayStr;
                        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                        const tasks = getTasksByDate(date);
                        return (
                          <div
                            key={idx}
                            className={cn(
                              'rounded-xl border min-h-[220px] flex flex-col',
                              isToday
                                ? 'border-primary-400 bg-primary-50/50 ring-2 ring-primary-100'
                                : 'border-gray-200 bg-white'
                            )}
                          >
                            <div
                              className={cn(
                                'px-2 py-2 border-b text-center',
                                isToday ? 'border-primary-200' : 'border-gray-100'
                              )}
                            >
                              <div
                                className={cn(
                                  'text-xs font-medium mb-0.5',
                                  isToday ? 'text-primary-600' : 'text-gray-500'
                                )}
                              >
                                {dayNames[date.getDay()]}
                              </div>
                              <div
                                className={cn(
                                  'text-sm font-bold',
                                  isToday ? 'text-primary-700' : 'text-gray-900'
                                )}
                              >
                                {date.getMonth() + 1}/{date.getDate()}
                              </div>
                            </div>
                            <div className="flex-1 p-1.5 space-y-1 overflow-y-auto max-h-[220px]">
                              {tasks.length === 0 ? (
                                <div className="text-center py-6 text-xs text-gray-300">
                                  无任务
                                </div>
                              ) : (
                                tasks.map((task) => {
                                  const color =
                                    taskTypeColorMap[task.type] || taskTypeColorMap.custom;
                                  const typeLabel =
                                    taskTypeLabelMap[task.type] || '任务';
                                  return (
                                    <div
                                      key={task.id}
                                      className={cn(
                                        'p-1.5 rounded-lg border text-[11px] leading-tight',
                                        color
                                      )}
                                    >
                                      <div className="flex items-center gap-1 mb-0.5">
                                        {renderStatusIcon(task.status)}
                                        <span className="font-semibold truncate flex-1">
                                          {task.scheduledTime} {typeLabel}
                                        </span>
                                      </div>
                                      <div className="truncate opacity-90">
                                        {task.name}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span> 已完成
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border border-gray-400 inline-block" />{' '}
                        待执行
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 text-red-500" /> 超时
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-16 text-center">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">请选择一位老人</h3>
                <p className="text-sm text-gray-400">从左侧列表选择老人以查看和配置护理计划</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
