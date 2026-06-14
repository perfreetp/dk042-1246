import { useState, useMemo, useEffect } from 'react';
import {
  AlertOctagon,
  MapPin,
  CalendarX,
  Heart,
  Plus,
  Search,
  ChevronRight,
  Clock,
  User,
  FileText,
  CheckCircle2,
  MessageSquare,
  Send,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useStore } from '@/store';
import type { EventType, EventRecord } from '@/types';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/utils/dateUtils';
import { formatPhone } from '@/utils/formatUtils';

type EventTypeFilter = 'all' | EventType;
type EventStatusFilter = 'all' | 'pending' | 'processing' | 'resolved';

const EVENT_TYPE_CONFIG: Record<
  EventType,
  {
    label: string;
    icon: typeof AlertOctagon;
    iconBg: string;
    iconColor: string;
    line: string;
    badgeVariant: 'danger' | 'info' | 'warning' | 'rose';
  }
> = {
  fall: {
    label: '跌倒',
    icon: AlertOctagon,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    line: 'bg-red-400',
    badgeVariant: 'danger',
  },
  outing: {
    label: '外出',
    icon: MapPin,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    line: 'bg-blue-400',
    badgeVariant: 'info',
  },
  leave: {
    label: '请假',
    icon: CalendarX,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    line: 'bg-orange-400',
    badgeVariant: 'warning',
  },
  visit: {
    label: '家属探视',
    icon: Heart,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    line: 'bg-pink-400',
    badgeVariant: 'rose',
  },
};

const EVENT_STATUS_CONFIG: Record<
  'pending' | 'processing' | 'resolved',
  { label: string; variant: 'warning' | 'info' | 'success' }
> = {
  pending: { label: '待处理', variant: 'warning' },
  processing: { label: '处理中', variant: 'info' },
  resolved: { label: '已解决', variant: 'success' },
};

const TYPE_TABS: { value: EventTypeFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'fall', label: '跌倒' },
  { value: 'outing', label: '外出' },
  { value: 'leave', label: '请假' },
  { value: 'visit', label: '家属探视' },
];

const STATUS_FILTERS: { value: EventStatusFilter; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
];

interface TimelineStep {
  label: string;
  time?: string;
  done: boolean;
  icon: typeof Clock;
}

export default function Events() {
  const {
    events,
    elders,
    caregivers,
    careTasks,
    initData,
    addEvent,
    updateEventStatus,
  } = useStore();

  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newType, setNewType] = useState<EventType>('fall');
  const [newElderId, setNewElderId] = useState('');
  const [newOccurredAt, setNewOccurredAt] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newHandledBy, setNewHandledBy] = useState('');
  const [newCaregiverId, setNewCaregiverId] = useState('');

  const [remarkText, setRemarkText] = useState('');
  const [eventRemarks, setEventRemarks] = useState<Record<string, string[]>>({});

  useEffect(() => {
    initData();
  }, [initData]);

  const overdueTasks = useMemo(
    () => careTasks.filter((t) => t.status === 'overdue'),
    [careTasks]
  );

  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (typeFilter !== 'all') {
      result = result.filter((e) => e.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }
    if (dateFrom) {
      result = result.filter((e) => e.occurredAt.slice(0, 10) >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((e) => e.occurredAt.slice(0, 10) <= dateTo);
    }
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      result = result.filter((e) => {
        const elder = elders.find((el) => el.id === e.elderId);
        return elder?.name.toLowerCase().includes(kw);
      });
    }

    result.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
    return result;
  }, [events, typeFilter, statusFilter, dateFrom, dateTo, searchText, elders]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const selectedElder = useMemo(() => {
    if (!selectedEvent) return null;
    return elders.find((e) => e.id === selectedEvent.elderId) || null;
  }, [selectedEvent, elders]);

  const selectedCaregiver = useMemo(() => {
    if (!selectedEvent?.caregiverId) return null;
    return caregivers.find((c) => c.id === selectedEvent.caregiverId) || null;
  }, [selectedEvent, caregivers]);

  const handledCaregiver = useMemo(() => {
    if (!selectedEvent?.handledBy) return null;
    return (
      caregivers.find((c) => c.id === selectedEvent.handledBy) ||
      caregivers.find((c) => c.name === selectedEvent.handledBy) ||
      null
    );
  }, [selectedEvent, caregivers]);

  const getTimelineSteps = (event: EventRecord): TimelineStep[] => {
    const steps: TimelineStep[] = [
      { label: '事件发生', time: event.occurredAt, done: true, icon: AlertCircle },
      {
        label: '上报记录',
        time: event.occurredAt,
        done: true,
        icon: FileText,
      },
      {
        label: '开始处理',
        time: event.status !== 'pending' ? event.occurredAt : undefined,
        done: event.status !== 'pending',
        icon: Send,
      },
      {
        label: '处理完成',
        time: event.status === 'resolved' ? event.occurredAt : undefined,
        done: event.status === 'resolved',
        icon: CheckCircle2,
      },
    ];
    return steps;
  };

  const handleAddEvent = () => {
    if (!newElderId || !newOccurredAt || !newDescription) return;

    const event: EventRecord = {
      id: '',
      type: newType,
      elderId: newElderId,
      caregiverId: newCaregiverId || undefined,
      occurredAt: newOccurredAt.includes('T')
        ? newOccurredAt
        : `${newOccurredAt}T12:00:00`,
      location: newLocation || '未填写',
      description: newDescription,
      handledBy: newHandledBy || undefined,
      status: 'pending',
    };

    addEvent(event);

    setAddModalOpen(false);
    setNewType('fall');
    setNewElderId('');
    setNewOccurredAt('');
    setNewLocation('');
    setNewDescription('');
    setNewHandledBy('');
    setNewCaregiverId('');
  };

  const handleStatusChange = (status: 'pending' | 'processing' | 'resolved') => {
    if (!selectedEvent) return;
    updateEventStatus(selectedEvent.id, status);
  };

  const handleAddRemark = () => {
    if (!selectedEvent || !remarkText.trim()) return;
    setEventRemarks((prev) => ({
      ...prev,
      [selectedEvent.id]: [...(prev[selectedEvent.id] || []), remarkText.trim()],
    }));
    setRemarkText('');
  };

  useEffect(() => {
    if (filteredEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(filteredEvents[0].id);
    }
  }, [filteredEvents, selectedEventId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="事件记录"
        subtitle="异常事件与家属联系记录"
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setAddModalOpen(true)}
          >
            新增事件
          </Button>
        }
      />

      {overdueTasks.length > 0 && (
        <Alert variant="warning" title="超时任务提醒">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span>
              当前有 <strong>{overdueTasks.length}</strong> 个任务已超时，请及时处理
            </span>
            <Button
              variant="secondary"
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
              icon={<ChevronRight className="h-4 w-4" />}
            >
              查看详情
            </Button>
          </div>
        </Alert>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 pb-3">
              {TYPE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setTypeFilter(tab.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    typeFilter === tab.value
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select
                label="状态筛选"
                options={STATUS_FILTERS.map((s) => ({
                  value: s.value,
                  label: s.label,
                }))}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EventStatusFilter)}
              />
              <Input
                label="开始日期"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                label="结束日期"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <Input
                label="搜索老人姓名"
                placeholder="输入姓名搜索..."
                icon={<Search className="h-4 w-4" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">事件时间线</CardTitle>
              <Badge variant="info" size="sm">
                共 {filteredEvents.length} 条
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[650px] overflow-y-auto">
              {filteredEvents.length > 0 ? (
                <div className="relative">
                  {filteredEvents.map((event, idx) => {
                    const cfg = EVENT_TYPE_CONFIG[event.type];
                    const statusCfg = EVENT_STATUS_CONFIG[event.status];
                    const Icon = cfg.icon;
                    const elder = elders.find((e) => e.id === event.elderId);
                    const isLast = idx === filteredEvents.length - 1;
                    const isSelected = selectedEventId === event.id;

                    return (
                      <div
                        key={event.id}
                        className="relative pl-16 pr-4 py-4 cursor-pointer transition-colors hover:bg-gray-50/80"
                        onClick={() => setSelectedEventId(event.id)}
                      >
                        {!isLast && (
                          <div
                            className={cn(
                              'absolute left-[30px] top-12 bottom-0 w-0.5',
                              cfg.line,
                              'opacity-40'
                            )}
                          />
                        )}

                        <div
                          className={cn(
                            'absolute left-4 top-4 w-[26px] h-[26px] rounded-full flex items-center justify-center shadow-sm ring-2 ring-white z-10',
                            cfg.iconBg
                          )}
                        >
                          <Icon className={cn('h-3.5 w-3.5', cfg.iconColor)} />
                        </div>

                        <div
                          className={cn(
                            'rounded-xl p-4 border-2 transition-all duration-200',
                            isSelected
                              ? 'border-primary-300 bg-primary-50/50 shadow-sm'
                              : 'border-gray-100 bg-white'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={cfg.badgeVariant} size="sm">
                                {cfg.label}
                              </Badge>
                              <Badge variant={statusCfg.variant} size="sm">
                                {statusCfg.label}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(event.occurredAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                              {elder?.name.charAt(0) || '?'}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">
                              {elder?.name || '未知老人'}
                            </span>
                            {elder && (
                              <span className="text-xs text-gray-400">
                                {elder.age}岁 · {elder.gender === 'male' ? '男' : '女'}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {event.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<ChevronRight className="h-3.5 w-3.5" />}
                              className="h-7 px-2.5 text-xs"
                            >
                              详情
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">暂无符合条件的事件记录</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            {selectedEvent && selectedElder ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge
                        variant={EVENT_TYPE_CONFIG[selectedEvent.type].badgeVariant}
                        size="md"
                      >
                        {EVENT_TYPE_CONFIG[selectedEvent.type].label}
                      </Badge>
                      <Badge
                        variant={EVENT_STATUS_CONFIG[selectedEvent.status].variant}
                        size="md"
                      >
                        {EVENT_STATUS_CONFIG[selectedEvent.status].label}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedElder.name} · {EVENT_TYPE_CONFIG[selectedEvent.type].label}事件
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDateTime(selectedEvent.occurredAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedEvent.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/40 border border-primary-200">
                    <h3 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      涉及老人
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-bold">
                        {selectedElder.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedElder.name}</div>
                        <div className="text-xs text-gray-500">
                          {selectedElder.age}岁 · {selectedElder.gender === 'male' ? '男' : '女'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">护理等级</span>
                        <Badge variant="sky" size="sm">
                          {selectedElder.careLevel === 'self-care'
                            ? '自理'
                            : selectedElder.careLevel === 'semi-care'
                            ? '半自理'
                            : selectedElder.careLevel === 'full-care'
                            ? '全护理'
                            : '特护'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">联系电话</span>
                        <span className="text-gray-900">
                          {formatPhone(selectedElder.emergencyPhone)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">紧急联系人</span>
                        <span className="text-gray-900">{selectedElder.emergencyContact}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100/40 border border-sky-200">
                    <h3 className="text-sm font-semibold text-sky-800 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      处理护理员
                    </h3>
                    <div className="space-y-3">
                      {selectedCaregiver ? (
                        <div className="flex items-center gap-3 pb-3 border-b border-sky-200/50">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-lg font-bold">
                            {selectedCaregiver.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {selectedCaregiver.name}
                            </div>
                            <div className="text-xs text-gray-500">现场护理员</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 pb-3 border-b border-sky-200/50">
                          无指定现场护理员
                        </div>
                      )}
                      {handledCaregiver ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-lg font-bold">
                            {handledCaregiver.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {handledCaregiver.name}
                            </div>
                            <div className="text-xs text-gray-500">负责处理</div>
                          </div>
                        </div>
                      ) : selectedEvent.handledBy ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-lg font-bold">
                            {selectedEvent.handledBy.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {selectedEvent.handledBy}
                            </div>
                            <div className="text-xs text-gray-500">负责处理</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">暂无负责人</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    事件描述
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">处理时间线</h3>
                  <div className="relative">
                    {getTimelineSteps(selectedEvent).map((step, idx) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={idx} className="relative pl-10 pb-6 last:pb-0">
                          {idx < 3 && (
                            <div
                              className={cn(
                                'absolute left-[13px] top-7 bottom-0 w-0.5',
                                step.done && getTimelineSteps(selectedEvent)[idx + 1].done
                                  ? 'bg-emerald-400'
                                  : 'bg-gray-200'
                              )}
                            />
                          )}
                          <div
                            className={cn(
                              'absolute left-0 top-0 w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-white',
                              step.done
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            )}
                          >
                            <StepIcon className="h-3.5 w-3.5" />
                          </div>
                          <div className="pt-0.5">
                            <div
                              className={cn(
                                'font-medium text-sm',
                                step.done ? 'text-gray-900' : 'text-gray-400'
                              )}
                            >
                              {step.label}
                            </div>
                            {step.time && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {formatDateTime(step.time)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">操作</h3>

                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">更改状态</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant={selectedEvent.status === 'pending' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange('pending')}
                      >
                        待处理
                      </Button>
                      <Button
                        variant={selectedEvent.status === 'processing' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange('processing')}
                      >
                        处理中
                      </Button>
                      <Button
                        variant={selectedEvent.status === 'resolved' ? 'primary' : 'outline'}
                        size="sm"
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        onClick={() => handleStatusChange('resolved')}
                      >
                        标记已解决
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-2">添加备注</div>
                    <div className="space-y-3">
                      {eventRemarks[selectedEvent.id]?.length > 0 && (
                        <div className="space-y-2">
                          {eventRemarks[selectedEvent.id].map((r, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-gray-700 flex items-start gap-2"
                            >
                              <MessageSquare className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="输入备注内容..."
                          value={remarkText}
                          onChange={(e) => setRemarkText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddRemark();
                          }}
                        />
                        <Button
                          icon={<Send className="h-4 w-4" />}
                          onClick={handleAddRemark}
                          className="shrink-0"
                        >
                          添加
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">从左侧选择事件查看详情</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="新增事件"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddEvent}>确认提交</Button>
          </>
        }
        className="max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="事件类型"
              options={(Object.keys(EVENT_TYPE_CONFIG) as EventType[]).map((t) => ({
                value: t,
                label: EVENT_TYPE_CONFIG[t].label,
              }))}
              value={newType}
              onChange={(e) => setNewType(e.target.value as EventType)}
            />
            <Select
              label="涉及老人"
              placeholder="请选择老人"
              options={elders
                .filter((e) => e.status === 'active')
                .map((e) => ({ value: e.id, label: `${e.name}（${e.age}岁）` }))}
              value={newElderId}
              onChange={(e) => setNewElderId(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="发生时间"
              type="datetime-local"
              value={newOccurredAt}
              onChange={(e) => setNewOccurredAt(e.target.value)}
            />
            <Input
              label="发生地点"
              placeholder="如：2楼走廊、餐厅等"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="现场护理员（可选）"
              placeholder="请选择护理员"
              options={caregivers
                .filter((c) => c.status === 'active')
                .map((c) => ({ value: c.id, label: c.name }))}
              value={newCaregiverId}
              onChange={(e) => setNewCaregiverId(e.target.value)}
            />
            <Select
              label="负责人（可选）"
              placeholder="请选择处理人"
              options={caregivers
                .filter((c) => c.status === 'active')
                .map((c) => ({ value: c.id, label: c.name }))}
              value={newHandledBy}
              onChange={(e) => setNewHandledBy(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              事件描述 / 现场处理
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 hover:border-gray-400 min-h-[100px] resize-y"
              placeholder="请详细描述事件经过、现场处理措施..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
