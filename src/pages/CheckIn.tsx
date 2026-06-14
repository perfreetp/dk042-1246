import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Activity,
  BedDouble,
  Receipt,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Search,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { getAge, getTodayStr } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatUtils';
import type { CareLevel, Elder, CarePlan, CustomTask } from '@/types';

const steps = [
  { id: 1, title: '基本信息', icon: User },
  { id: 2, title: '健康评估', icon: Activity },
  { id: 3, title: '床位分配', icon: BedDouble },
  { id: 4, title: '费用确认', icon: Receipt },
];

const careLevelOptions: Array<{
  value: CareLevel;
  label: string;
  description: string;
  monthlyFee: number;
  deposit: number;
  color: string;
}> = [
  {
    value: 'self-care',
    label: '自理',
    description: '日常生活完全自理，无需协助',
    monthlyFee: 2000,
    deposit: 5000,
    color: 'emerald',
  },
  {
    value: 'semi-care',
    label: '半自理',
    description: '部分生活需要协助，如洗澡、穿衣',
    monthlyFee: 3500,
    deposit: 8000,
    color: 'sky',
  },
  {
    value: 'full-care',
    label: '全护理',
    description: '大部分生活需要照护，含24小时监护',
    monthlyFee: 5500,
    deposit: 12000,
    color: 'amber',
  },
  {
    value: 'special-care',
    label: '特护',
    description: '一对一专人护理，医疗级监护',
    monthlyFee: 8000,
    deposit: 15000,
    color: 'rose',
  },
];

const healthConditionOptions = [
  { value: 'hypertension', label: '高血压' },
  { value: 'diabetes', label: '糖尿病' },
  { value: 'heartDisease', label: '心脏病' },
  { value: 'alzheimer', label: '阿尔茨海默' },
];

const paymentMethods = [
  { value: 'cash', label: '现金' },
  { value: 'bank', label: '银行转账' },
  { value: 'wechat', label: '微信' },
  { value: 'alipay', label: '支付宝' },
];

type Step1Data = {
  name: string;
  gender: 'male' | 'female' | '';
  idCard: string;
  birthDate: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  allergies: string;
};

type Step2Data = {
  careLevel: CareLevel | '';
  healthConditions: string[];
};

export default function CheckIn() {
  const navigate = useNavigate();
  const {
    floors,
    rooms,
    beds,
    elders,
    addElder,
    addCarePlan,
    updateElder,
    getElderById,
  } = useStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [step1Data, setStep1Data] = useState<Step1Data>({
    name: '',
    gender: '',
    idCard: '',
    birthDate: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: '',
    allergies: '',
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    careLevel: '',
    healthConditions: [],
  });

  const [selectedFloorId, setSelectedFloorId] = useState<string>(floors[0]?.id || '');
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [bedSearch, setBedSearch] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptNo] = useState(() => `RCP${Date.now().toString().slice(-8)}`);

  const [reservedConfirmOpen, setReservedConfirmOpen] = useState(false);
  const [pendingReservedBedId, setPendingReservedBedId] = useState<string>('');
  const [reservedElder, setReservedElder] = useState<Elder | null>(null);
  const [useReservedElder, setUseReservedElder] = useState(false);

  useEffect(() => {
    if (floors.length > 0 && !selectedFloorId) {
      setSelectedFloorId(floors[0].id);
    }
  }, [floors, selectedFloorId]);

  const calculatedAge = useMemo(() => {
    if (step1Data.birthDate) {
      return getAge(step1Data.birthDate);
    }
    if (step1Data.idCard && step1Data.idCard.length === 18) {
      const birthStr = step1Data.idCard.slice(6, 14);
      const formatted = `${birthStr.slice(0, 4)}-${birthStr.slice(4, 6)}-${birthStr.slice(6, 8)}`;
      return getAge(formatted);
    }
    return 0;
  }, [step1Data.birthDate, step1Data.idCard]);

  const selectedCareLevel = useMemo(() => {
    return careLevelOptions.find((c) => c.value === step2Data.careLevel);
  }, [step2Data.careLevel]);

  const selectedBed = useMemo(() => {
    return beds.find((b) => b.id === selectedBedId);
  }, [beds, selectedBedId]);

  const filteredBedsByFloor = useMemo(() => {
    const floorRooms = rooms.filter((r) => r.floorId === selectedFloorId);
    const roomMap = new Map(floorRooms.map((r) => [r.id, r]));
    return beds
      .filter(
        (b) =>
          roomMap.has(b.roomId) &&
          (b.status === 'empty' || b.status === 'reserved')
      )
      .filter((b) => {
        if (!bedSearch) return true;
        const room = roomMap.get(b.roomId);
        return (
          b.bedNumber.toLowerCase().includes(bedSearch.toLowerCase()) ||
          (room && room.roomNumber.includes(bedSearch))
        );
      })
      .map((b) => ({
        bed: b,
        room: roomMap.get(b.roomId)!,
      }));
  }, [rooms, beds, selectedFloorId, bedSearch]);

  const feeSummary = useMemo(() => {
    const bedDailyRate = selectedBed?.dailyRate || 0;
    const bedMonthly = bedDailyRate * 30;
    const careMonthly = selectedCareLevel?.monthlyFee || 0;
    const deposit = selectedCareLevel?.deposit || 0;
    const total = bedMonthly + careMonthly + deposit;
    return { bedMonthly, careMonthly, deposit, total };
  }, [selectedBed, selectedCareLevel]);

  const canGoNext = () => {
    if (currentStep === 1) {
      return (
        step1Data.name.trim() &&
        step1Data.gender &&
        step1Data.idCard.trim() &&
        step1Data.birthDate &&
        step1Data.phone.trim() &&
        step1Data.emergencyContact.trim() &&
        step1Data.emergencyPhone.trim()
      );
    }
    if (currentStep === 2) {
      return step2Data.careLevel !== '';
    }
    if (currentStep === 3) {
      return selectedBedId !== '';
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const healthLabels = step2Data.healthConditions
        .map((c) => healthConditionOptions.find((o) => o.value === c)?.label)
        .filter(Boolean) as string[];
      const medicalHistoryCombined = [
        step1Data.medicalHistory,
        ...healthLabels,
      ]
        .filter(Boolean)
        .join('、');

      let targetElderId = '';

      if (useReservedElder && reservedElder) {
        updateElder(reservedElder.id, {
          status: 'active',
          name: step1Data.name,
          gender: step1Data.gender as 'male' | 'female',
          idCard: step1Data.idCard,
          birthDate: step1Data.birthDate,
          age: calculatedAge,
          phone: step1Data.phone,
          emergencyContact: step1Data.emergencyContact,
          emergencyPhone: step1Data.emergencyPhone,
          careLevel: step2Data.careLevel as CareLevel,
          checkInDate: getTodayStr(),
          deposit: selectedCareLevel?.deposit || 0,
          medicalHistory: medicalHistoryCombined || undefined,
          allergies: step1Data.allergies || undefined,
        });
        useStore.setState((state) => ({
          beds: state.beds.map((bed) =>
            bed.id === selectedBedId
              ? { ...bed, status: 'occupied' as const }
              : bed
          ),
        }));
        targetElderId = reservedElder.id;
      } else {
        const elderData: Elder = {
          id: '',
          name: step1Data.name,
          gender: step1Data.gender as 'male' | 'female',
          idCard: step1Data.idCard,
          birthDate: step1Data.birthDate,
          age: calculatedAge,
          phone: step1Data.phone,
          emergencyContact: step1Data.emergencyContact,
          emergencyPhone: step1Data.emergencyPhone,
          careLevel: step2Data.careLevel as CareLevel,
          checkInDate: getTodayStr(),
          deposit: selectedCareLevel?.deposit || 0,
          status: 'active',
          medicalHistory: medicalHistoryCombined || undefined,
          allergies: step1Data.allergies || undefined,
        };

        addElder(elderData, selectedBedId);

        const newElder = useStore.getState().elders[useStore.getState().elders.length - 1];
        targetElderId = newElder?.id || '';
      }

      const defaultCustomTasks: CustomTask[] = [];
      if (step2Data.careLevel === 'special-care' || step2Data.careLevel === 'full-care') {
        defaultCustomTasks.push({
          id: 'ct_' + Math.random().toString(36).slice(2, 9),
          name: '雾化吸入',
          description: '帮助老人进行呼吸道雾化吸入治疗',
          scheduledTime: '10:00',
          frequency: 'daily',
        });
      }
      if (step2Data.careLevel === 'special-care') {
        defaultCustomTasks.push({
          id: 'ct_' + Math.random().toString(36).slice(2, 9),
          name: '褥疮护理',
          description: '检查并护理褥疮部位，更换敷料',
          scheduledTime: '14:00',
          frequency: 'daily',
        });
      }

      const existingPlan = useStore.getState().carePlans.find((p) => p.elderId === targetElderId);
      const carePlanData: CarePlan = {
        id: existingPlan?.id || '',
        elderId: targetElderId,
        careLevel: step2Data.careLevel as CareLevel,
        turnOverHours:
          step2Data.careLevel === 'special-care'
            ? 2
            : step2Data.careLevel === 'full-care'
              ? 3
              : 4,
        measureFrequency:
          step2Data.careLevel === 'special-care' || step2Data.careLevel === 'full-care'
            ? 'daily'
            : step2Data.careLevel === 'semi-care'
              ? 'bidaily'
              : 'weekly',
        morningCare: true,
        eveningCare: step2Data.careLevel !== 'self-care',
        mealAssist: step2Data.careLevel === 'special-care' || step2Data.careLevel === 'full-care',
        bathingAssist: step2Data.careLevel !== 'self-care',
        bathingSchedule:
          step2Data.careLevel === 'special-care' || step2Data.careLevel === 'full-care'
            ? 'every2days'
            : 'weekly',
        mealRounds: 3,
        nightRounds:
          step2Data.careLevel === 'special-care'
            ? 4
            : step2Data.careLevel === 'full-care'
              ? 2
              : 1,
        customTasks: defaultCustomTasks,
      };

      if (existingPlan) {
        useStore.getState().updateCarePlan(existingPlan.id, carePlanData);
      } else {
        addCarePlan(carePlanData);
      }

      navigate('/');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBedSelect = (bedId: string) => {
    const bed = beds.find((b) => b.id === bedId);
    if (bed?.status === 'reserved' && bed.elderId) {
      const elder = getElderById(bed.elderId);
      if (elder) {
        setPendingReservedBedId(bedId);
        setReservedElder(elder);
        setUseReservedElder(false);
        setReservedConfirmOpen(true);
        return;
      }
    }
    setSelectedBedId(bedId);
    setUseReservedElder(false);
    setReservedElder(null);
  };

  const confirmReservedChoice = () => {
    setSelectedBedId(pendingReservedBedId);
    if (useReservedElder && reservedElder) {
      setStep1Data({
        name: reservedElder.name,
        gender: reservedElder.gender,
        idCard: reservedElder.idCard,
        birthDate: reservedElder.birthDate,
        phone: reservedElder.phone,
        emergencyContact: reservedElder.emergencyContact,
        emergencyPhone: reservedElder.emergencyPhone,
        medicalHistory: reservedElder.medicalHistory || '',
        allergies: reservedElder.allergies || '',
      });
      setStep2Data({
        careLevel: reservedElder.careLevel,
        healthConditions: [],
      });
    } else {
      setStep1Data({
        name: '',
        gender: '',
        idCard: '',
        birthDate: '',
        phone: '',
        emergencyContact: '',
        emergencyPhone: '',
        medicalHistory: '',
        allergies: '',
      });
    }
    setReservedConfirmOpen(false);
  };

  const toggleHealthCondition = (value: string) => {
    setStep2Data((prev) => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(value)
        ? prev.healthConditions.filter((c) => c !== value)
        : [...prev.healthConditions, value],
    }));
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    isCompleted
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : isActive
                        ? 'bg-white border-primary-600 text-primary-600 ring-4 ring-primary-50'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium whitespace-nowrap',
                    isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 mb-6">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isCompleted ? 'bg-primary-600' : 'bg-gray-200'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="姓名"
          placeholder="请输入姓名"
          value={step1Data.name}
          onChange={(e) => setStep1Data({ ...step1Data, name: e.target.value })}
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">性别</label>
          <div className="flex gap-4">
            {[
              { value: 'male', label: '男' },
              { value: 'female', label: '女' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all',
                  step1Data.gender === opt.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <input
                  type="radio"
                  name="gender"
                  value={opt.value}
                  checked={step1Data.gender === opt.value}
                  onChange={(e) =>
                    setStep1Data({ ...step1Data, gender: e.target.value as 'male' | 'female' })
                  }
                  className="sr-only"
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        <Input
          label="身份证号"
          placeholder="请输入18位身份证号"
          value={step1Data.idCard}
          onChange={(e) => {
            const val = e.target.value;
            setStep1Data({ ...step1Data, idCard: val });
            if (val.length === 18 && !step1Data.birthDate) {
              const birthStr = val.slice(6, 14);
              const formatted = `${birthStr.slice(0, 4)}-${birthStr.slice(4, 6)}-${birthStr.slice(6, 8)}`;
              setStep1Data((prev) => ({ ...prev, birthDate: formatted }));
            }
          }}
          maxLength={18}
        />
        <div>
          <Input
            label="出生日期"
            type="date"
            value={step1Data.birthDate}
            onChange={(e) => setStep1Data({ ...step1Data, birthDate: e.target.value })}
          />
          {calculatedAge > 0 && (
            <p className="mt-1.5 text-sm text-primary-600 font-medium">年龄：{calculatedAge} 岁</p>
          )}
        </div>
        <Input
          label="手机号"
          placeholder="请输入手机号"
          value={step1Data.phone}
          onChange={(e) => setStep1Data({ ...step1Data, phone: e.target.value })}
          maxLength={11}
        />
        <Input
          label="紧急联系人"
          placeholder="请输入紧急联系人姓名"
          value={step1Data.emergencyContact}
          onChange={(e) => setStep1Data({ ...step1Data, emergencyContact: e.target.value })}
        />
        <Input
          label="紧急联系电话"
          placeholder="请输入紧急联系电话"
          value={step1Data.emergencyPhone}
          onChange={(e) => setStep1Data({ ...step1Data, emergencyPhone: e.target.value })}
          maxLength={11}
        />
        <div />
      </div>
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">既往病史</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100 hover:border-gray-400 min-h-[80px] resize-y"
          placeholder="请描述既往病史，如高血压、糖尿病等"
          value={step1Data.medicalHistory}
          onChange={(e) => setStep1Data({ ...step1Data, medicalHistory: e.target.value })}
        />
      </div>
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">过敏史</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100 hover:border-gray-400 min-h-[80px] resize-y"
          placeholder="请描述过敏史，如青霉素、海鲜等"
          value={step1Data.allergies}
          onChange={(e) => setStep1Data({ ...step1Data, allergies: e.target.value })}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">护理等级</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {careLevelOptions.map((level) => {
            const isSelected = step2Data.careLevel === level.value;
            const variantMap: Record<string, 'success' | 'sky' | 'amber' | 'rose'> = {
              emerald: 'success',
              sky: 'sky',
              amber: 'amber',
              rose: 'rose',
            };
            return (
              <Card
                key={level.value}
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  isSelected
                    ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50/30'
                    : 'hover:border-gray-300'
                )}
                onClick={() => setStep2Data({ ...step2Data, careLevel: level.value })}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={variantMap[level.color]} size="md">
                      {level.label}
                    </Badge>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        isSelected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      )}
                    >
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{level.description}</p>
                  <div className="border-t border-gray-100 pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">月护理费</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(level.monthlyFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">入住押金</span>
                      <span className="font-semibold text-amber-600">{formatCurrency(level.deposit)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">健康状况（多选）</h3>
        <div className="flex flex-wrap gap-3">
          {healthConditionOptions.map((opt) => {
            const isSelected = step2Data.healthConditions.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleHealthCondition(opt.value)}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-medium border transition-all',
                  isSelected
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {floors.map((floor) => (
            <button
              key={floor.id}
              type="button"
              onClick={() => {
                setSelectedFloorId(floor.id);
                setSelectedBedId('');
              }}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-medium transition-all',
                selectedFloorId === floor.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {floor.name}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索房间号或床位号..."
              value={bedSearch}
              onChange={(e) => setBedSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100"
            />
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
        {filteredBedsByFloor.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">该楼层暂无可选床位</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredBedsByFloor.map(({ bed, room }) => {
              const isSelected = selectedBedId === bed.id;
              const statusLabel = bed.status === 'reserved' ? '已预订' : '空闲';
              const statusColor = bed.status === 'reserved' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
              return (
                <button
                  key={bed.id}
                  type="button"
                  onClick={() => handleBedSelect(bed.id)}
                  className={cn(
                    'p-4 rounded-xl border-2 bg-white text-left transition-all',
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-100 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <BedDouble
                      className={cn(
                        'w-5 h-5',
                        isSelected ? 'text-primary-600' : 'text-gray-400'
                      )}
                    />
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusColor)}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className={cn('text-base font-bold mb-1', isSelected ? 'text-primary-700' : 'text-gray-900')}>
                    {bed.bedNumber}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">房间 {room.roomNumber}</div>
                  <div className="text-sm font-semibold text-amber-600">
                    {formatCurrency(bed.dailyRate)}<span className="text-xs text-gray-400 font-normal">/天</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedBed && (
        <div className="p-5 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-between">
          <div>
            <div className="text-sm text-primary-600 mb-1">已选择床位</div>
            <div className="text-xl font-bold text-primary-700">{selectedBed.bedNumber}</div>
            <div className="text-sm text-gray-600">
              房间 {rooms.find((r) => r.id === selectedBed.roomId)?.roomNumber} · 日费 {formatCurrency(selectedBed.dailyRate)}
            </div>
          </div>
          <CheckCircle2 className="w-10 h-10 text-primary-500" />
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary-600" />
            费用明细
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">首月床位费</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {selectedBed?.bedNumber || '-'} · {formatCurrency(selectedBed?.dailyRate || 0)} × 30 天
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(feeSummary.bedMonthly)}</div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">首月护理费</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {selectedCareLevel?.label || '-'} 等级
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(feeSummary.careMonthly)}</div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">入住押金</div>
                <div className="text-xs text-gray-500 mt-0.5">退住时无损坏全额退还</div>
              </div>
              <div className="text-lg font-bold text-amber-600">{formatCurrency(feeSummary.deposit)}</div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <div className="text-base font-medium text-gray-700">合计应付</div>
              <div className="text-2xl font-bold text-primary-600">{formatCurrency(feeSummary.total)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-5">
          <h3 className="text-lg font-semibold text-gray-900">支付方式</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {paymentMethods.map((m) => {
              const isSelected = paymentMethod === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setPaymentMethod(m.value)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className={cn('text-base font-semibold', isSelected ? 'text-primary-700' : 'text-gray-900')}>
                    {m.label}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">收据编号</span>
            <span className="font-mono font-semibold text-gray-900">{receiptNo}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-full">
      <PageHeader
        title="入住登记"
        subtitle="新入住老人信息登记"
        actions={
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            返回床位看板
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 md:p-8">
          {renderStepIndicator()}

          <div className="min-h-[400px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 1}
              icon={currentStep > 1 ? <ArrowLeft className="w-4 h-4" /> : undefined}
            >
              上一步
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                下一步
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={submitting}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                确认入住
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal
        open={reservedConfirmOpen}
        onClose={() => setReservedConfirmOpen(false)}
        title="该床位已被预订"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReservedConfirmOpen(false)}>
              取消
            </Button>
            <Button onClick={confirmReservedChoice}>
              确认选择
            </Button>
          </>
        }
      >
        {reservedElder && (
          <div className="space-y-5">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-amber-800 mb-1">床位已被预订</div>
                <div className="text-sm text-amber-700">
                  该床位已被 <span className="font-semibold">{reservedElder.name}</span> 老人预订。请选择入住方式：
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className={cn(
                'block p-4 rounded-xl border-2 cursor-pointer transition-all',
                useReservedElder
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}>
                <input
                  type="radio"
                  name="reservedChoice"
                  checked={useReservedElder}
                  onChange={() => setUseReservedElder(true)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                    useReservedElder ? 'border-primary-500' : 'border-gray-300'
                  )}>
                    {useReservedElder && <div className="w-3 h-3 rounded-full bg-primary-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">预订老人 {reservedElder.name} 转正入住</div>
                    <div className="text-sm text-gray-500 mt-1">
                      使用预订老人的信息办理正式入住，系统将自动填充其资料。
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="grid grid-cols-2 gap-2 text-gray-600">
                        <div>性别：{reservedElder.gender === 'male' ? '男' : '女'}</div>
                        <div>年龄：{reservedElder.age} 岁</div>
                        <div>联系电话：{reservedElder.phone}</div>
                        <div>护理等级：{careLevelOptions.find(c => c.value === reservedElder.careLevel)?.label}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </label>

              <label className={cn(
                'block p-4 rounded-xl border-2 cursor-pointer transition-all',
                !useReservedElder
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}>
                <input
                  type="radio"
                  name="reservedChoice"
                  checked={!useReservedElder}
                  onChange={() => setUseReservedElder(false)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                    !useReservedElder ? 'border-primary-500' : 'border-gray-300'
                  )}>
                    {!useReservedElder && <div className="w-3 h-3 rounded-full bg-primary-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">新老人入住（取消原预订）</div>
                    <div className="text-sm text-gray-500 mt-1">
                      取消 {reservedElder.name} 的预订，为新老人办理入住。原预订老人将变为无床位状态。
                    </div>
                    <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                      注意：此操作将取消 {reservedElder.name} 的预订，请先与家属确认。
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
