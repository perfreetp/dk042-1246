import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Floor,
  Room,
  Bed,
  Elder,
  CarePlan,
  CareTask,
  Caregiver,
  Schedule,
  EventRecord,
  Bill,
  BillItem,
  BedTransfer,
  MonthlyWorkload,
  TaskStatus,
} from '@/types';
import mockData from '@/data/mockData';

interface StoreState {
  floors: Floor[];
  rooms: Room[];
  beds: Bed[];
  elders: Elder[];
  carePlans: CarePlan[];
  careTasks: CareTask[];
  caregivers: Caregiver[];
  schedules: Schedule[];
  events: EventRecord[];
  bills: Bill[];
  bedTransfers: BedTransfer[];
  monthlyWorkloads: MonthlyWorkload[];
  currentUser: { name: string; role: string } | null;
}

interface StoreActions {
  initData: () => void;
  addElder: (elder: Elder, bedId: string) => void;
  updateElder: (id: string, data: Partial<Elder>) => void;
  dischargeElder: (elderId: string) => void;
  transferBed: (elderId: string, toBedId: string, reason: string) => void;
  addCarePlan: (plan: CarePlan) => void;
  updateCarePlan: (id: string, data: Partial<CarePlan>) => void;
  addCareTask: (task: CareTask) => void;
  updateCareTaskStatus: (id: string, status: TaskStatus) => void;
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, data: Partial<Schedule>) => void;
  batchAddSchedule: (schedules: Schedule[]) => void;
  addEvent: (event: EventRecord) => void;
  updateEventStatus: (id: string, status: string) => void;
  generateBill: (elderId: string, period: string) => void;
  payBill: (billId: string) => void;
  getOverdueTasks: () => CareTask[];
  getElderById: (id: string) => Elder | undefined;
  getBedById: (id: string) => Bed | undefined;
  getRoomById: (id: string) => Room | undefined;
  getCaregiverById: (id: string) => Caregiver | undefined;
  getCarePlanByElderId: (elderId: string) => CarePlan | undefined;
  getBedsByFloorId: (floorId: string) => { room: Room; beds: Bed[] }[];
}

type Store = StoreState & StoreActions;

const generateId = () => Math.random().toString(36).slice(2, 10);

const careFeeMap: Record<string, number> = {
  'self-care': 2000,
  'semi-care': 3500,
  'full-care': 5500,
  'special-care': 8000,
};

const mealFee = 900;

const generateBillItems = (elder: Elder, dailyRate: number, period: string): BillItem[] => {
  const [year, month] = period.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const careFee = careFeeMap[elder.careLevel] || 2000;
  const dateFrom = `${period}-01`;
  const dateTo = `${period}-${String(daysInMonth).padStart(2, '0')}`;
  const roomSubtotal = dailyRate * daysInMonth;

  return [
    {
      id: `bi_${generateId()}`,
      serviceName: '床位费',
      category: 'room',
      quantity: daysInMonth,
      unitPrice: dailyRate,
      subtotal: roomSubtotal,
      dateFrom,
      dateTo,
    },
    {
      id: `bi_${generateId()}`,
      serviceName: '护理费',
      category: 'care',
      quantity: 1,
      unitPrice: careFee,
      subtotal: careFee,
    },
    {
      id: `bi_${generateId()}`,
      serviceName: '餐费',
      category: 'meal',
      quantity: 1,
      unitPrice: mealFee,
      subtotal: mealFee,
    },
    {
      id: `bi_${generateId()}`,
      serviceName: '生活用品费',
      category: 'other',
      quantity: 1,
      unitPrice: 200,
      subtotal: 200,
    },
  ];
};

const initialState: StoreState = {
  floors: [],
  rooms: [],
  beds: [],
  elders: [],
  carePlans: [],
  careTasks: [],
  caregivers: [],
  schedules: [],
  events: [],
  bills: [],
  bedTransfers: [],
  monthlyWorkloads: [],
  currentUser: { name: '管理员', role: 'admin' },
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      initData: () => {
        const state = get();
        if (state.floors.length === 0) {
          set({
            floors: mockData.floors,
            rooms: mockData.rooms,
            beds: mockData.beds,
            elders: mockData.elders,
            carePlans: mockData.carePlans,
            careTasks: mockData.careTasks,
            caregivers: mockData.caregivers,
            schedules: mockData.schedules,
            events: mockData.events,
            bills: mockData.bills,
            bedTransfers: mockData.bedTransfers,
            monthlyWorkloads: mockData.monthlyWorkloads,
          });
        }
      },

      addElder: (elder: Elder, bedId: string) => {
        set((state) => {
          const newElder = { ...elder, id: generateId() };
          const updatedBeds = state.beds.map((bed) =>
            bed.id === bedId
              ? { ...bed, status: 'occupied' as const, elderId: newElder.id }
              : bed
          );
          return {
            elders: [...state.elders, newElder],
            beds: updatedBeds,
          };
        });
      },

      updateElder: (id: string, data: Partial<Elder>) => {
        set((state) => ({
          elders: state.elders.map((elder) =>
            elder.id === id ? { ...elder, ...data } : elder
          ),
        }));
      },

      dischargeElder: (elderId: string) => {
        set((state) => {
          const updatedElders = state.elders.map((elder) =>
            elder.id === elderId ? { ...elder, status: 'discharged' as const } : elder
          );
          const updatedBeds = state.beds.map((bed) =>
            bed.elderId === elderId
              ? { ...bed, status: 'empty' as const, elderId: undefined }
              : bed
          );
          return {
            elders: updatedElders,
            beds: updatedBeds,
          };
        });
      },

      transferBed: (elderId: string, toBedId: string, reason: string) => {
        set((state) => {
          const fromBed = state.beds.find((b) => b.elderId === elderId);
          const toBed = state.beds.find((b) => b.id === toBedId);
          if (!fromBed || !toBed) return state;

          const rateDifference = toBed.dailyRate - fromBed.dailyRate;
          const transferRecord: BedTransfer = {
            id: generateId(),
            elderId,
            fromBedId: fromBed.id,
            toBedId,
            transferDate: new Date().toISOString().slice(0, 10),
            reason,
            rateDifference,
            approvedBy: get().currentUser?.name || '系统',
          };

          const updatedBeds = state.beds.map((bed) => {
            if (bed.id === fromBed.id) {
              return { ...bed, status: 'empty' as const, elderId: undefined };
            }
            if (bed.id === toBedId) {
              return { ...bed, status: 'occupied' as const, elderId };
            }
            return bed;
          });

          return {
            beds: updatedBeds,
            bedTransfers: [...state.bedTransfers, transferRecord],
          };
        });
      },

      addCarePlan: (plan: CarePlan) => {
        set((state) => ({
          carePlans: [...state.carePlans, { ...plan, id: generateId() }],
        }));
      },

      updateCarePlan: (id: string, data: Partial<CarePlan>) => {
        set((state) => ({
          carePlans: state.carePlans.map((plan) =>
            plan.id === id ? { ...plan, ...data } : plan
          ),
        }));
      },

      addCareTask: (task: CareTask) => {
        set((state) => ({
          careTasks: [...state.careTasks, { ...task, id: generateId() }],
        }));
      },

      updateCareTaskStatus: (id: string, status: TaskStatus) => {
        set((state) => ({
          careTasks: state.careTasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status,
                  completedAt: status === 'completed' ? new Date().toISOString() : task.completedAt,
                }
              : task
          ),
        }));
      },

      addSchedule: (schedule: Schedule) => {
        set((state) => ({
          schedules: [...state.schedules, { ...schedule, id: generateId() }],
        }));
      },

      updateSchedule: (id: string, data: Partial<Schedule>) => {
        set((state) => ({
          schedules: state.schedules.map((schedule) =>
            schedule.id === id ? { ...schedule, ...data } : schedule
          ),
        }));
      },

      batchAddSchedule: (schedules: Schedule[]) => {
        set((state) => ({
          schedules: [
            ...state.schedules,
            ...schedules.map((s) => ({ ...s, id: generateId() })),
          ],
        }));
      },

      addEvent: (event: EventRecord) => {
        set((state) => ({
          events: [...state.events, { ...event, id: generateId() }],
        }));
      },

      updateEventStatus: (id: string, status: string) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, status: status as 'pending' | 'processing' | 'resolved' } : event
          ),
        }));
      },

      generateBill: (elderId: string, period: string) => {
        set((state) => {
          const elder = state.elders.find((e) => e.id === elderId);
          if (!elder) return state;

          const bed = state.beds.find((b) => b.elderId === elderId);
          const dailyRate = bed?.dailyRate || 150;
          const items = generateBillItems(elder, dailyRate, period);
          const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);

          const existingBill = state.bills.find(
            (b) => b.elderId === elderId && b.period === period
          );
          if (existingBill) return state;

          const bill: Bill = {
            id: generateId(),
            elderId,
            period,
            items,
            totalAmount,
            depositUsed: 0,
            payableAmount: totalAmount,
            generatedAt: new Date().toISOString(),
            status: 'pending',
          };

          return {
            bills: [...state.bills, bill],
          };
        });
      },

      payBill: (billId: string) => {
        set((state) => ({
          bills: state.bills.map((bill) =>
            bill.id === billId ? { ...bill, status: 'paid' as const } : bill
          ),
        }));
      },

      getOverdueTasks: () => {
        return get().careTasks.filter((task) => task.status === 'overdue');
      },

      getElderById: (id: string) => {
        return get().elders.find((elder) => elder.id === id);
      },

      getBedById: (id: string) => {
        return get().beds.find((bed) => bed.id === id);
      },

      getRoomById: (id: string) => {
        return get().rooms.find((room) => room.id === id);
      },

      getCaregiverById: (id: string) => {
        return get().caregivers.find((caregiver) => caregiver.id === id);
      },

      getCarePlanByElderId: (elderId: string) => {
        return get().carePlans.find((plan) => plan.elderId === elderId);
      },

      getBedsByFloorId: (floorId: string) => {
        const state = get();
        const floorRooms = state.rooms.filter((room) => room.floorId === floorId);
        return floorRooms.map((room) => ({
          room,
          beds: state.beds.filter((bed) => bed.roomId === room.id),
        }));
      },
    }),
    {
      name: 'eldercare-store',
    }
  )
);
