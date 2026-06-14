import { useState, useMemo } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { useStore } from '@/store';
import {
  Users,
  BedDouble,
  DollarSign,
  UserCheck,
  AlertCircle,
  Clock,
  TrendingUp,
  Medal,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const careLevelMap: Record<string, string> = {
  'self-care': '自理',
  'semi-care': '半自理',
  'full-care': '全护理',
  'special-care': '特护',
};

const PIE_COLORS = ['#14b8a6', '#0ea5e9', '#f59e0b', '#10b981'];
const STACK_COLORS = ['#ef4444', '#f59e0b', '#0ea5e9', '#10b981'];

const occupancyTrendData = [
  { month: '1月', rate: 78 },
  { month: '2月', rate: 80 },
  { month: '3月', rate: 82 },
  { month: '4月', rate: 81 },
  { month: '5月', rate: 85 },
  { month: '6月', rate: 88 },
];

const eventCategoryData = [
  { month: '1月', 跌倒: 3, 外出: 8, 请假: 5, 探访: 12 },
  { month: '2月', 跌倒: 2, 外出: 6, 请假: 10, 探访: 18 },
  { month: '3月', 跌倒: 4, 外出: 12, 请假: 6, 探访: 15 },
  { month: '4月', 跌倒: 3, 外出: 10, 请假: 4, 探访: 14 },
  { month: '5月', 跌倒: 5, 外出: 15, 请假: 7, 探访: 16 },
  { month: '6月', 跌倒: 4, 外出: 14, 请假: 6, 探访: 20 },
];

const transferReasons = [
  { name: '病情加重，需更密集护理', count: 8, percent: 35 },
  { name: '行动不便，调换低楼层', count: 6, percent: 26 },
  { name: '房间装修/维修', count: 4, percent: 17 },
  { name: '家属要求升级房型', count: 3, percent: 13 },
  { name: '与室友相处不融洽', count: 2, percent: 9 },
];

export default function Statistics() {
  const {
    elders,
    beds,
    bills,
    caregivers,
    careTasks,
    events,
    monthlyWorkloads,
    bedTransfers,
  } = useStore();

  const [selectedMonth, setSelectedMonth] = useState('2026-06');

  const activeElders = useMemo(
    () => elders.filter((e) => e.status === 'active').length,
    [elders]
  );

  const occupiedBeds = useMemo(
    () => beds.filter((b) => b.status === 'occupied').length,
    [beds]
  );
  const totalBeds = beds.length;
  const avgOccupancyRate =
    totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const monthlyRevenue = useMemo(() => {
    return bills
      .filter((b) => b.period === selectedMonth && b.status !== 'pending')
      .reduce((s, b) => s + b.payableAmount, 0);
  }, [bills, selectedMonth]);

  const activeCaregivers = caregivers.filter((c) => c.status === 'active').length;
  const avgTasksPerCaregiver =
    activeCaregivers > 0
      ? Math.round(careTasks.length / activeCaregivers)
      : 0;

  const totalEvents = events.length;
  const overdueTasks = careTasks.filter((t) => t.status === 'overdue').length;
  const overdueRate =
    careTasks.length > 0
      ? Math.round((overdueTasks / careTasks.length) * 100 * 10) / 10
      : 0;

  const careLevelDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      'self-care': 0,
      'semi-care': 0,
      'full-care': 0,
      'special-care': 0,
    };
    elders.forEach((e) => {
      if (e.status === 'active' && counts[e.careLevel] !== undefined) {
        counts[e.careLevel]++;
      }
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: careLevelMap[key] || key,
      value,
    }));
  }, [elders]);

  const sortedWorkloads = useMemo(() => {
    return [...monthlyWorkloads]
      .filter((w) => w.yearMonth === '2026-05')
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted);
  }, [monthlyWorkloads]);

  const getMedalIcon = (rank: number) => {
    if (rank === 1)
      return <Medal className="h-5 w-5 text-yellow-500 fill-yellow-400" />;
    if (rank === 2)
      return <Medal className="h-5 w-5 text-gray-400 fill-gray-300" />;
    if (rank === 3)
      return <Medal className="h-5 w-5 text-amber-600 fill-amber-500" />;
    return <span className="text-gray-400 text-sm font-medium">#{rank}</span>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="统计分析"
        subtitle="运营数据与工作量报表"
        actions={
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-44"
          />
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="总入住人数"
          value={`${activeElders} 人`}
          icon={Users}
          color="teal"
          trend={{ value: 5.2, isUp: true }}
        />
        <StatCard
          title="平均入住率"
          value={`${avgOccupancyRate}%`}
          icon={BedDouble}
          color="sky"
          trend={{ value: 3.8, isUp: true }}
        />
        <StatCard
          title="月度总收入"
          value={`¥${monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
          trend={{ value: 8.5, isUp: true }}
        />
        <StatCard
          title="护理员人均任务"
          value={`${avgTasksPerCaregiver} 项`}
          icon={UserCheck}
          color="amber"
        />
        <StatCard
          title="事件总数"
          value={`${totalEvents} 起`}
          icon={AlertCircle}
          color="rose"
          trend={{ value: 2.1, isUp: false }}
        />
        <StatCard
          title="超时任务率"
          value={`${overdueRate}%`}
          icon={Clock}
          color="rose"
          trend={{ value: 1.5, isUp: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              近6个月入住率趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={occupancyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis
                  domain={[60, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, '入住率']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="入住率"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ fill: '#0ea5e9', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-primary-600" />
              护理等级分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={careLevelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: '#cbd5e1' }}
                >
                  {careLevelDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            月度事件分类统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventCategoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              {['跌倒', '外出', '请假', '探访'].map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={STACK_COLORS[idx]}
                  radius={idx === 3 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-5 w-5 text-primary-600" />
              月度护理工作量排行
              <Badge variant="sky" size="sm">
                2026年5月
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto -mx-6">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">排名</TableHead>
                    <TableHead>护理员姓名</TableHead>
                    <TableHead className="text-center">早班数</TableHead>
                    <TableHead className="text-center">中班数</TableHead>
                    <TableHead className="text-center">夜班数</TableHead>
                    <TableHead className="text-center">总班次</TableHead>
                    <TableHead className="text-center">完成任务数</TableHead>
                    <TableHead className="text-center">加班小时</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedWorkloads.map((w, index) => {
                    const rank = index + 1;
                    return (
                      <TableRow key={w.caregiverId}>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            {getMedalIcon(rank)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {w.caregiverName}
                        </TableCell>
                        <TableCell className="text-center">
                          {w.morningShifts}
                        </TableCell>
                        <TableCell className="text-center">
                          {w.afternoonShifts}
                        </TableCell>
                        <TableCell className="text-center">
                          {w.nightShifts}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {w.totalShifts}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-semibold ${
                              rank <= 3 ? 'text-primary-600' : 'text-gray-700'
                            }`}
                          >
                            {w.tasksCompleted}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {w.overtimeHours > 0 ? (
                            <span className="text-amber-600 font-medium">
                              +{w.overtimeHours}h
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {sortedWorkloads.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-12 text-gray-500"
                      >
                        暂无工作量数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BedDouble className="h-5 w-5 text-primary-600" />
              床位调换Top原因
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transferReasons.map((reason, index) => (
                <div key={reason.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                          index === 0
                            ? 'bg-amber-100 text-amber-700'
                            : index === 1
                            ? 'bg-gray-100 text-gray-600'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700 truncate max-w-[180px]">
                        {reason.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {reason.count}次
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500"
                      style={{ width: `${reason.percent * 2}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {reason.percent}%
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 mt-4">
                <div className="text-sm text-gray-500 text-center">
                  共 {bedTransfers.length} 条调换记录
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
