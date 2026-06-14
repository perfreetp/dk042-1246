import { useState, useMemo } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { useStore } from '@/store';
import { formatCurrency } from '@/utils/formatUtils';
import { formatDate } from '@/utils/dateUtils';
import {
  Receipt,
  LogOut,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  DollarSign,
  TrendingUp,
  Wallet,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type TabKey = 'services' | 'discharge' | 'transfers';

const careLevelMap: Record<string, string> = {
  'self-care': '自理',
  'semi-care': '半自理',
  'full-care': '全护理',
  'special-care': '特护',
};

const statusMap: Record<string, { label: string; variant: any }> = {
  pending: { label: '待缴费', variant: 'warning' },
  paid: { label: '已缴费', variant: 'success' },
  settled: { label: '已结算', variant: 'emerald' },
};

const PIE_COLORS = ['#14b8a6', '#0ea5e9', '#f59e0b', '#10b981', '#6366f1'];

const monthlyRevenueData = [
  { month: '1月', revenue: 185000 },
  { month: '2月', revenue: 192000 },
  { month: '3月', revenue: 210000 },
  { month: '4月', revenue: 205000 },
  { month: '5月', revenue: 228000 },
  { month: '6月', revenue: 242000 },
];

export default function Billing() {
  const {
    elders,
    beds,
    rooms,
    bills,
    bedTransfers,
    getElderById,
    getBedById,
    getRoomById,
    dischargeElder,
    payBill,
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabKey>('services');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [monthFilter, setMonthFilter] = useState('2026-06');
  const [nameSearch, setNameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [dischargeElderId, setDischargeElderId] = useState('');
  const [dischargeDate, setDischargeDate] = useState(formatDate(new Date()));
  const [dischargeReason, setDischargeReason] = useState('');
  const [settlementMethod, setSettlementMethod] = useState('refund');

  const getBedInfo = (elderId: string) => {
    const bed = beds.find((b) => b.elderId === elderId);
    if (!bed) return { bedNumber: '-', roomNumber: '-' };
    const room = getRoomById(bed.roomId);
    return { bedNumber: bed.bedNumber, roomNumber: room?.roomNumber || '-' };
  };

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      if (monthFilter && bill.period !== monthFilter) return false;
      const elder = getElderById(bill.elderId);
      if (nameSearch && elder && !elder.name.includes(nameSearch)) return false;
      if (statusFilter && bill.status !== statusFilter) return false;
      return true;
    });
  }, [bills, monthFilter, nameSearch, statusFilter, getElderById]);

  const statistics = useMemo(() => {
    const monthBills = bills.filter((b) => b.period === monthFilter);
    const total = monthBills.reduce((s, b) => s + b.totalAmount, 0);
    const paid = monthBills
      .filter((b) => b.status !== 'pending')
      .reduce((s, b) => s + b.payableAmount, 0);
    const pending = monthBills
      .filter((b) => b.status === 'pending')
      .reduce((s, b) => s + b.payableAmount, 0);
    return { total, paid, pending };
  }, [bills, monthFilter]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        const key =
          item.category === 'room'
            ? '床位费'
            : item.category === 'care'
            ? '护理费'
            : item.category === 'meal'
            ? '餐费'
            : item.category === 'medical'
            ? '医疗费'
            : '其他';
        categories[key] = (categories[key] || 0) + item.subtotal;
      });
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [bills]);

  const activeElders = useMemo(
    () => elders.filter((e) => e.status === 'active'),
    [elders]
  );

  const dischargeInfo = useMemo(() => {
    if (!dischargeElderId) return null;
    const elder = getElderById(dischargeElderId);
    if (!elder) return null;
    const checkIn = new Date(elder.checkInDate);
    const discharge = new Date(dischargeDate);
    const stayDays = Math.max(
      1,
      Math.ceil((discharge.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    );
    const bed = beds.find((b) => b.elderId === elder.id);
    const dailyRate = bed?.dailyRate || 150;
    const careFeeMap: Record<string, number> = {
      'self-care': 2000,
      'semi-care': 3500,
      'full-care': 5500,
      'special-care': 8000,
    };
    const monthlyCareFee = careFeeMap[elder.careLevel] || 2000;
    const dailyCareFee = monthlyCareFee / 30;

    const roomTotal = dailyRate * stayDays;
    const careTotal = dailyCareFee * stayDays;
    const mealTotal = 30 * stayDays;
    const consumptionTotal = roomTotal + careTotal + mealTotal;
    const deposit = elder.deposit;
    const refundAmount = deposit - consumptionTotal;

    return {
      stayDays,
      roomTotal,
      careTotal,
      consumptionTotal,
      deposit,
      refundAmount,
    };
  }, [dischargeElderId, dischargeDate, getElderById, beds]);

  const toggleRow = (billId: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(billId)) {
      newSet.delete(billId);
    } else {
      newSet.add(billId);
    }
    setExpandedRows(newSet);
  };

  const handleDischarge = () => {
    if (!dischargeElderId || !dischargeInfo) return;
    const elderBills = bills.filter(
      (b) => b.elderId === dischargeElderId && b.status === 'pending'
    );
    elderBills.forEach((b) => payBill(b.id));
    dischargeElder(dischargeElderId);
    setDischargeElderId('');
    setDischargeReason('');
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'services', label: '服务明细' },
    { key: 'discharge', label: '退住办理' },
    { key: 'transfers', label: '床位调换记录' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="费用核对"
        subtitle="服务明细与退住结算管理"
        actions={
          <>
            <Button variant="outline" icon={<FileText className="h-4 w-4" />}>
              月度账单汇总
            </Button>
            <Button icon={<LogOut className="h-4 w-4" />}>
              退住结算
            </Button>
          </>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <Card>
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <CardContent className="pt-6">
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatCard
                      title="本月应收总额"
                      value={formatCurrency(statistics.total)}
                      icon={DollarSign}
                      color="sky"
                    />
                    <StatCard
                      title="已收金额"
                      value={formatCurrency(statistics.paid)}
                      icon={TrendingUp}
                      color="emerald"
                    />
                    <StatCard
                      title="待收金额"
                      value={formatCurrency(statistics.pending)}
                      icon={Wallet}
                      color="amber"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <Input
                      type="month"
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="sm:w-48"
                    />
                    <Input
                      placeholder="搜索老人姓名"
                      icon={<Search className="h-4 w-4" />}
                      value={nameSearch}
                      onChange={(e) => setNameSearch(e.target.value)}
                      className="sm:w-48"
                    />
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      options={[
                        { value: '', label: '全部状态' },
                        { value: 'pending', label: '待缴费' },
                        { value: 'paid', label: '已缴费' },
                        { value: 'settled', label: '已结算' },
                      ]}
                      className="sm:w-40"
                    />
                  </div>

                  <div className="overflow-auto -mx-6">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"></TableHead>
                          <TableHead>老人姓名</TableHead>
                          <TableHead>床位</TableHead>
                          <TableHead>护理等级</TableHead>
                          <TableHead>账期</TableHead>
                          <TableHead className="text-right">床位费</TableHead>
                          <TableHead className="text-right">护理费</TableHead>
                          <TableHead className="text-right">餐费</TableHead>
                          <TableHead className="text-right">其他</TableHead>
                          <TableHead className="text-right font-semibold">合计</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBills.map((bill) => {
                          const elder = getElderById(bill.elderId);
                          const bedInfo = getBedInfo(bill.elderId);
                          const status = statusMap[bill.status];
                          const roomItem = bill.items.find((i) => i.category === 'room');
                          const careItem = bill.items.find((i) => i.category === 'care');
                          const mealItem = bill.items.find((i) => i.category === 'meal');
                          const otherItems = bill.items.filter(
                            (i) => !['room', 'care', 'meal'].includes(i.category)
                          );
                          const otherTotal = otherItems.reduce((s, i) => s + i.subtotal, 0);
                          const isExpanded = expandedRows.has(bill.id);

                          return (
                            <>
                              <TableRow key={bill.id}>
                                <TableCell>
                                  <button
                                    onClick={() => toggleRow(bill.id)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    )}
                                  </button>
                                </TableCell>
                                <TableCell className="font-medium">{elder?.name || '-'}</TableCell>
                                <TableCell>
                                  {bedInfo.roomNumber}-{bedInfo.bedNumber}
                                </TableCell>
                                <TableCell>{careLevelMap[elder?.careLevel || ''] || '-'}</TableCell>
                                <TableCell>{bill.period}</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(roomItem?.subtotal || 0)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(careItem?.subtotal || 0)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(mealItem?.subtotal || 0)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(otherTotal)}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-gray-900">
                                  {formatCurrency(bill.totalAmount)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={status.variant}>{status.label}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {bill.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() => payBill(bill.id)}
                                    >
                                      缴费
                                    </Button>
                                  )}
                                  {bill.status !== 'pending' && (
                                    <Button size="sm" variant="outline">
                                      详情
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                              {isExpanded && (
                                <TableRow>
                                  <TableCell colSpan={12} className="bg-gray-50 p-0">
                                    <div className="p-4 border-t border-gray-100">
                                      <div className="text-sm font-medium text-gray-700 mb-2">
                                        费用明细
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {bill.items.map((item) => (
                                          <div
                                            key={item.id}
                                            className="bg-white p-3 rounded-lg border border-gray-200"
                                          >
                                            <div className="text-xs text-gray-500 mb-1">
                                              {item.serviceName}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                              {formatCurrency(item.unitPrice)} × {item.quantity}
                                            </div>
                                            <div className="text-sm font-semibold text-primary-600 mt-1">
                                              {formatCurrency(item.subtotal)}
                                            </div>
                                            {item.dateFrom && item.dateTo && (
                                              <div className="text-xs text-gray-400 mt-1">
                                                {item.dateFrom} ~ {item.dateTo}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })}
                        {filteredBills.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={12} className="text-center py-12 text-gray-500">
                              暂无账单数据
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {activeTab === 'discharge' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          选择退住老人
                        </label>
                        <Select
                          placeholder="请选择老人"
                          value={dischargeElderId}
                          onChange={(e) => setDischargeElderId(e.target.value)}
                          options={activeElders.map((e) => ({
                            value: e.id,
                            label: `${e.name}（${careLevelMap[e.careLevel]}）`,
                          }))}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="退住日期"
                          type="date"
                          value={dischargeDate}
                          onChange={(e) => setDischargeDate(e.target.value)}
                        />
                        <Select
                          label="结算方式"
                          value={settlementMethod}
                          onChange={(e) => setSettlementMethod(e.target.value)}
                          options={[
                            { value: 'refund', label: '押金抵扣后退费' },
                            { value: 'deposit', label: '押金全额退回' },
                            { value: 'bank', label: '银行转账' },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          退住原因
                        </label>
                        <textarea
                          value={dischargeReason}
                          onChange={(e) => setDischargeReason(e.target.value)}
                          rows={4}
                          placeholder="请输入退住原因..."
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                        />
                      </div>

                      <Button
                        size="lg"
                        className="w-full"
                        disabled={!dischargeElderId || !dischargeInfo}
                        onClick={handleDischarge}
                      >
                        确认退住结算
                      </Button>
                    </div>

                    <Card className="bg-gradient-to-br from-primary-50 to-white">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="h-5 w-5 text-primary-600" />
                          费用清算
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dischargeInfo ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">入住天数</div>
                                <div className="text-2xl font-bold text-gray-900">
                                  {dischargeInfo.stayDays}
                                  <span className="text-sm font-normal ml-1">天</span>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">押金金额</div>
                                <div className="text-2xl font-bold text-amber-600">
                                  {formatCurrency(dischargeInfo.deposit)}
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                              <div className="flex justify-between items-center p-3">
                                <span className="text-sm text-gray-600">床位费合计</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {formatCurrency(dischargeInfo.roomTotal)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3">
                                <span className="text-sm text-gray-600">护理费合计</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {formatCurrency(dischargeInfo.careTotal)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3">
                                <span className="text-sm text-gray-600">消费总计</span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(dischargeInfo.consumptionTotal)}
                                </span>
                              </div>
                            </div>

                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-4 text-white">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium opacity-90">应退金额</span>
                                <span className="text-3xl font-bold">
                                  {dischargeInfo.refundAmount >= 0
                                    ? formatCurrency(dischargeInfo.refundAmount)
                                    : `需补缴 ${formatCurrency(-dischargeInfo.refundAmount)}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>请先选择退住老人</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'transfers' && (
                <div className="overflow-auto -mx-6">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead>老人姓名</TableHead>
                        <TableHead>原床位 → 新床位</TableHead>
                        <TableHead className="text-right">差价（元/天）</TableHead>
                        <TableHead>原因</TableHead>
                        <TableHead>审批人</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bedTransfers.map((transfer) => {
                        const elder = getElderById(transfer.elderId);
                        const fromBed = getBedById(transfer.fromBedId);
                        const toBed = getBedById(transfer.toBedId);
                        const fromRoom = fromBed ? getRoomById(fromBed.roomId) : null;
                        const toRoom = toBed ? getRoomById(toBed.roomId) : null;
                        return (
                          <TableRow key={transfer.id}>
                            <TableCell>{transfer.transferDate}</TableCell>
                            <TableCell className="font-medium">{elder?.name || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">
                                  {fromRoom?.roomNumber}-{fromBed?.bedNumber}
                                </span>
                                <span className="text-primary-500">→</span>
                                <span className="font-medium text-gray-900">
                                  {toRoom?.roomNumber}-{toBed?.bedNumber}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium ${
                                transfer.rateDifference > 0
                                  ? 'text-rose-600'
                                  : transfer.rateDifference < 0
                                  ? 'text-emerald-600'
                                  : 'text-gray-500'
                              }`}
                            >
                              {transfer.rateDifference > 0 ? '+' : ''}
                              {transfer.rateDifference}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{transfer.reason}</TableCell>
                            <TableCell>{transfer.approvedBy}</TableCell>
                          </TableRow>
                        );
                      })}
                      {bedTransfers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                            暂无床位调换记录
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-80 space-y-6 shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                月度收入趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, '收入']}
                  />
                  <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="h-5 w-5 text-primary-600" />
                收入分类占比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), '金额']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
