import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  BedDouble,
  AlertTriangle,
  Search,
  UserPlus,
  Printer,
  LogOut,
  ArrowRightLeft,
  ClipboardList,
} from 'lucide-react';
import { useStore } from '@/store';
import PageHeader from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatUtils';
import type { BedStatus, CareLevel, Room, Bed, Elder } from '@/types';

const ROOM_TYPE_MAP: Record<string, string> = {
  single: '单人间',
  double: '双人间',
  triple: '三人间',
  quad: '四人间',
};

const CARE_LEVEL_MAP: Record<CareLevel, string> = {
  'self-care': '自理',
  'semi-care': '半自理',
  'full-care': '全护理',
  'special-care': '特护',
};

const CARE_LEVEL_VARIANT: Record<CareLevel, 'default' | 'sky' | 'amber' | 'rose'> = {
  'self-care': 'default',
  'semi-care': 'sky',
  'full-care': 'amber',
  'special-care': 'rose',
};

const BED_STATUS_MAP: Record<BedStatus, string> = {
  empty: '空闲',
  reserved: '已预订',
  occupied: '已入住',
  discharged: '退住中',
};

const BED_STATUS_BG: Record<BedStatus, string> = {
  empty: 'bg-emerald-100 border-emerald-300 hover:border-emerald-500',
  reserved: 'bg-sky-100 border-sky-300 hover:border-sky-500',
  occupied: 'bg-teal-100 border-teal-300 hover:border-teal-500',
  discharged: 'bg-rose-100 border-rose-300 hover:border-rose-500',
};

const BED_STATUS_TEXT: Record<BedStatus, string> = {
  empty: 'text-emerald-800',
  reserved: 'text-sky-800',
  occupied: 'text-teal-800',
  discharged: 'text-rose-800',
};

type StatusFilter = 'all' | BedStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string; variant: 'default' | 'emerald' | 'sky' | 'teal' | 'rose' }> = [
  { value: 'all', label: '全部', variant: 'default' },
  { value: 'empty', label: '空闲', variant: 'emerald' },
  { value: 'occupied', label: '已入住', variant: 'sky' },
  { value: 'reserved', label: '已预订', variant: 'teal' },
  { value: 'discharged', label: '退住中', variant: 'rose' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const initData = useStore((s) => s.initData);
  const floors = useStore((s) => s.floors);
  const beds = useStore((s) => s.beds);
  const elders = useStore((s) => s.elders);
  const getOverdueTasks = useStore((s) => s.getOverdueTasks);
  const getBedsByFloorId = useStore((s) => s.getBedsByFloorId);
  const getElderById = useStore((s) => s.getElderById);

  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    if (floors.length > 0 && !selectedFloorId) {
      setSelectedFloorId(floors[0].id);
    }
  }, [floors, selectedFloorId]);

  const overdue = useMemo(() => getOverdueTasks(), [getOverdueTasks]);

  const stats = useMemo(() => {
    const total = beds.length;
    const occupied = beds.filter((b) => b.status === 'occupied').length;
    const empty = beds.filter((b) => b.status === 'empty').length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, empty, occupancyRate, overdue: overdue.length };
  }, [beds, overdue]);

  const floorBedGroups = useMemo(() => {
    if (!selectedFloorId) return [];
    return getBedsByFloorId(selectedFloorId);
  }, [selectedFloorId, getBedsByFloorId]);

  const filteredGroups = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return floorBedGroups
      .map(({ room, beds: roomBeds }) => {
        let filteredBeds = roomBeds;
        if (statusFilter !== 'all') {
          filteredBeds = filteredBeds.filter((b) => b.status === statusFilter);
        }
        if (search) {
          const matchRoom = room.roomNumber.toLowerCase().includes(search);
          filteredBeds = filteredBeds.filter((bed) => {
            if (matchRoom) return true;
            if (!bed.elderId) return false;
            const elder = getElderById(bed.elderId);
            return elder ? elder.name.toLowerCase().includes(search) : false;
          });
        }
        return { room, beds: filteredBeds };
      })
      .filter((g) => g.beds.length > 0);
  }, [floorBedGroups, statusFilter, searchText, getElderById]);

  const selectedBed = useMemo(() => {
    if (!selectedBedId) return null;
    return beds.find((b) => b.id === selectedBedId) || null;
  }, [selectedBedId, beds]);

  const selectedBedElder = useMemo(() => {
    if (!selectedBed?.elderId) return null;
    return getElderById(selectedBed.elderId) || null;
  }, [selectedBed, getElderById]);

  const openBedModal = (bedId: string) => {
    setSelectedBedId(bedId);
    setModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {overdue.length > 0 && (
        <div className="animate-[fadeInUp_0.4s_ease-out]">
          <Alert variant="danger" title={`存在 ${overdue.length} 项超时护理任务`} dismissible>
            请及时处理超时任务，确保老人得到妥善照护。
          </Alert>
        </div>
      )}

      <div className="animate-[fadeInUp_0.4s_ease-out_0.05s_both]">
        <PageHeader
          title="床位看板"
          subtitle="颐养中心床位状态总览"
          actions={
            <>
              <Button variant="primary" icon={<UserPlus className="h-4 w-4" />} onClick={() => navigate('/checkin')}>
                入住登记
              </Button>
              <Button variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={handlePrint}>
                打印报表
              </Button>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-[fadeInUp_0.4s_ease-out_0.1s_both]">
          <StatCard title="总床位数" value={stats.total} icon={Building2} color="teal" />
        </div>
        <div className="animate-[fadeInUp_0.4s_ease-out_0.15s_both]">
          <StatCard title="入住率" value={`${stats.occupancyRate}%`} icon={Users} color="sky" />
        </div>
        <div className="animate-[fadeInUp_0.4s_ease-out_0.2s_both]">
          <StatCard title="空床数" value={stats.empty} icon={BedDouble} color="emerald" />
        </div>
        <div className="animate-[fadeInUp_0.4s_ease-out_0.25s_both]">
          <StatCard title="超时任务" value={stats.overdue} icon={AlertTriangle} color="rose" />
        </div>
      </div>

      <div className="animate-[fadeInUp_0.4s_ease-out_0.3s_both]">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
              <span className="text-sm font-medium text-gray-600 mr-2">楼层：</span>
              {floors.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setSelectedFloorId(floor.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    selectedFloorId === floor.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {floor.name}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600 mr-2">状态：</span>
              {STATUS_FILTERS.map((filter) => {
                const isActive = statusFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                      isActive
                        ? filter.variant === 'default'
                          ? 'bg-gray-700 text-white border-gray-700'
                          : filter.variant === 'emerald'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : filter.variant === 'sky'
                          ? 'bg-sky-600 text-white border-sky-600'
                          : filter.variant === 'teal'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="w-full max-w-md">
              <Input
                placeholder="搜索房间号或老人姓名..."
                icon={<Search className="h-4 w-4" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredGroups.map((group, groupIdx) => (
          <RoomCard
            key={group.room.id}
            room={group.room}
            beds={group.beds}
            getElderById={getElderById}
            onBedClick={openBedModal}
            delay={0.35 + groupIdx * 0.05}
          />
        ))}
        {filteredGroups.length === 0 && (
          <div className="col-span-full animate-[fadeInUp_0.4s_ease-out_0.35s_both]">
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <BedDouble className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>当前筛选条件下没有匹配的床位</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedBed ? `床位 ${selectedBed.bedNumber} 详情` : '床位详情'}
        footer={
          selectedBedElder ? (
            <>
              <Button variant="outline" icon={<ClipboardList className="h-4 w-4" />}>
                查看护理计划
              </Button>
              <Button variant="secondary" icon={<ArrowRightLeft className="h-4 w-4" />}>
                床位调换
              </Button>
              <Button variant="danger" icon={<LogOut className="h-4 w-4" />}>
                办理退住
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              关闭
            </Button>
          )
        }
      >
        {selectedBed && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs text-gray-500 mb-1">床位号</div>
                <div className="text-lg font-semibold text-gray-900">{selectedBed.bedNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">床位状态</div>
                <Badge
                  variant={
                    selectedBed.status === 'empty'
                      ? 'emerald'
                      : selectedBed.status === 'reserved'
                      ? 'sky'
                      : selectedBed.status === 'occupied'
                      ? 'success'
                      : 'rose'
                  }
                  size="md"
                >
                  {BED_STATUS_MAP[selectedBed.status]}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">日床位费</div>
                <div className="text-base font-medium text-gray-900">{formatCurrency(selectedBed.dailyRate)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">房间号</div>
                <div className="text-base font-medium text-gray-900">
                  {(() => {
                    const roomGroup = floorBedGroups.find((g) =>
                      g.beds.some((b) => b.id === selectedBed.id)
                    );
                    return roomGroup?.room.roomNumber || '-';
                  })()}
                </div>
              </div>
            </div>

            {selectedBedElder ? (
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-900">入住老人信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">姓名</div>
                    <div className="text-base font-medium text-gray-900">{selectedBedElder.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">性别</div>
                    <div className="text-base font-medium text-gray-900">
                      {selectedBedElder.gender === 'male' ? '男' : '女'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">年龄</div>
                    <div className="text-base font-medium text-gray-900">{selectedBedElder.age} 岁</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">护理等级</div>
                    <Badge variant={CARE_LEVEL_VARIANT[selectedBedElder.careLevel]} size="md">
                      {CARE_LEVEL_MAP[selectedBedElder.careLevel]}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1">入住日期</div>
                    <div className="text-base font-medium text-gray-900">{selectedBedElder.checkInDate}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1">押金</div>
                    <div className="text-base font-medium text-gray-900">{formatCurrency(selectedBedElder.deposit)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1">联系电话</div>
                    <div className="text-base font-medium text-gray-900">{selectedBedElder.phone}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1">紧急联系人</div>
                    <div className="text-base font-medium text-gray-900">
                      {selectedBedElder.emergencyContact} - {selectedBedElder.emergencyPhone}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4 text-center text-gray-500 py-6">
                该床位暂无入住老人
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

interface RoomCardProps {
  room: Room;
  beds: Array<Bed>;
  getElderById: (id: string) => Elder | undefined;
  onBedClick: (bedId: string) => void;
  delay: number;
}

function RoomCard({ room, beds, getElderById, onBedClick, delay }: RoomCardProps) {
  const capacityText = `${ROOM_TYPE_MAP[room.type]} · ${room.capacity}人`;

  return (
    <Card
      className={cn('overflow-hidden')}
      style={{ animation: `fadeInUp 0.4s ease-out ${delay}s both` }}
    >
      <CardHeader className="py-4 px-5 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            <span className="text-lg font-bold text-slate-900">{room.roomNumber}</span>
            <span className="ml-2 text-sm font-normal text-slate-500">{capacityText}</span>
          </CardTitle>
          <Badge variant="default" size="sm">
            {beds.filter((b) => b.status === 'occupied').length}/{room.capacity} 入住
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {beds.map((bed) => {
            const elder = bed.elderId ? getElderById(bed.elderId) : undefined;
            return (
              <button
                key={bed.id}
                onClick={() => onBedClick(bed.id)}
                className={cn(
                  'relative rounded-lg border-2 p-3 text-left transition-all duration-200',
                  'hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
                  BED_STATUS_BG[bed.status]
                )}
              >
                <div className={cn('text-xs font-semibold mb-1', BED_STATUS_TEXT[bed.status])}>
                  {bed.bedNumber}
                </div>
                {elder ? (
                  <>
                    <div className="text-sm font-medium text-gray-900 truncate">{elder.name}</div>
                    <div className="mt-1.5">
                      <Badge variant={CARE_LEVEL_VARIANT[elder.careLevel]} size="sm">
                        {CARE_LEVEL_MAP[elder.careLevel]}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {BED_STATUS_MAP[bed.status]}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
