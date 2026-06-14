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
  BedTransfer,
  MonthlyWorkload,
  CustomTask,
} from '../types';

export const floors: Floor[] = [
  { id: 'flr_001', name: '1楼', floorNumber: 1 },
  { id: 'flr_002', name: '2楼', floorNumber: 2 },
  { id: 'flr_003', name: '3楼', floorNumber: 3 },
];

export const rooms: Room[] = [
  { id: 'rm_101', roomNumber: '101', floorId: 'flr_001', type: 'single', capacity: 1 },
  { id: 'rm_102', roomNumber: '102', floorId: 'flr_001', type: 'double', capacity: 2 },
  { id: 'rm_103', roomNumber: '103', floorId: 'flr_001', type: 'triple', capacity: 3 },
  { id: 'rm_104', roomNumber: '104', floorId: 'flr_001', type: 'double', capacity: 2 },
  { id: 'rm_105', roomNumber: '105', floorId: 'flr_001', type: 'single', capacity: 1 },
  { id: 'rm_106', roomNumber: '106', floorId: 'flr_001', type: 'quad', capacity: 4 },
  { id: 'rm_201', roomNumber: '201', floorId: 'flr_002', type: 'double', capacity: 2 },
  { id: 'rm_202', roomNumber: '202', floorId: 'flr_002', type: 'triple', capacity: 3 },
  { id: 'rm_203', roomNumber: '203', floorId: 'flr_002', type: 'single', capacity: 1 },
  { id: 'rm_204', roomNumber: '204', floorId: 'flr_002', type: 'quad', capacity: 4 },
  { id: 'rm_205', roomNumber: '205', floorId: 'flr_002', type: 'double', capacity: 2 },
  { id: 'rm_206', roomNumber: '206', floorId: 'flr_002', type: 'triple', capacity: 3 },
  { id: 'rm_301', roomNumber: '301', floorId: 'flr_003', type: 'single', capacity: 1 },
  { id: 'rm_302', roomNumber: '302', floorId: 'flr_003', type: 'double', capacity: 2 },
  { id: 'rm_303', roomNumber: '303', floorId: 'flr_003', type: 'triple', capacity: 3 },
  { id: 'rm_304', roomNumber: '304', floorId: 'flr_003', type: 'double', capacity: 2 },
  { id: 'rm_305', roomNumber: '305', floorId: 'flr_003', type: 'single', capacity: 1 },
  { id: 'rm_306', roomNumber: '306', floorId: 'flr_003', type: 'quad', capacity: 4 },
];

export const beds: Bed[] = [
  { id: 'bd_101a', bedNumber: '101-A', roomId: 'rm_101', status: 'occupied', elderId: 'eld_001', dailyRate: 180 },
  { id: 'bd_102a', bedNumber: '102-A', roomId: 'rm_102', status: 'occupied', elderId: 'eld_002', dailyRate: 150 },
  { id: 'bd_102b', bedNumber: '102-B', roomId: 'rm_102', status: 'empty', dailyRate: 150 },
  { id: 'bd_103a', bedNumber: '103-A', roomId: 'rm_103', status: 'occupied', elderId: 'eld_003', dailyRate: 120 },
  { id: 'bd_103b', bedNumber: '103-B', roomId: 'rm_103', status: 'occupied', elderId: 'eld_004', dailyRate: 120 },
  { id: 'bd_103c', bedNumber: '103-C', roomId: 'rm_103', status: 'reserved', elderId: 'eld_005', dailyRate: 120 },
  { id: 'bd_104a', bedNumber: '104-A', roomId: 'rm_104', status: 'occupied', elderId: 'eld_006', dailyRate: 150 },
  { id: 'bd_104b', bedNumber: '104-B', roomId: 'rm_104', status: 'occupied', elderId: 'eld_007', dailyRate: 150 },
  { id: 'bd_105a', bedNumber: '105-A', roomId: 'rm_105', status: 'discharged', dailyRate: 180 },
  { id: 'bd_106a', bedNumber: '106-A', roomId: 'rm_106', status: 'occupied', elderId: 'eld_008', dailyRate: 100 },
  { id: 'bd_106b', bedNumber: '106-B', roomId: 'rm_106', status: 'occupied', elderId: 'eld_009', dailyRate: 100 },
  { id: 'bd_106c', bedNumber: '106-C', roomId: 'rm_106', status: 'empty', dailyRate: 100 },
  { id: 'bd_106d', bedNumber: '106-D', roomId: 'rm_106', status: 'occupied', elderId: 'eld_010', dailyRate: 100 },
  { id: 'bd_201a', bedNumber: '201-A', roomId: 'rm_201', status: 'occupied', elderId: 'eld_011', dailyRate: 150 },
  { id: 'bd_201b', bedNumber: '201-B', roomId: 'rm_201', status: 'occupied', elderId: 'eld_012', dailyRate: 150 },
  { id: 'bd_202a', bedNumber: '202-A', roomId: 'rm_202', status: 'empty', dailyRate: 120 },
  { id: 'bd_202b', bedNumber: '202-B', roomId: 'rm_202', status: 'occupied', elderId: 'eld_013', dailyRate: 120 },
  { id: 'bd_202c', bedNumber: '202-C', roomId: 'rm_202', status: 'occupied', elderId: 'eld_014', dailyRate: 120 },
  { id: 'bd_203a', bedNumber: '203-A', roomId: 'rm_203', status: 'occupied', elderId: 'eld_015', dailyRate: 180 },
  { id: 'bd_204a', bedNumber: '204-A', roomId: 'rm_204', status: 'occupied', elderId: 'eld_016', dailyRate: 100 },
  { id: 'bd_204b', bedNumber: '204-B', roomId: 'rm_204', status: 'reserved', elderId: 'eld_017', dailyRate: 100 },
  { id: 'bd_204c', bedNumber: '204-C', roomId: 'rm_204', status: 'occupied', elderId: 'eld_018', dailyRate: 100 },
  { id: 'bd_204d', bedNumber: '204-D', roomId: 'rm_204', status: 'empty', dailyRate: 100 },
  { id: 'bd_205a', bedNumber: '205-A', roomId: 'rm_205', status: 'occupied', elderId: 'eld_019', dailyRate: 150 },
  { id: 'bd_205b', bedNumber: '205-B', roomId: 'rm_205', status: 'discharged', dailyRate: 150 },
  { id: 'bd_206a', bedNumber: '206-A', roomId: 'rm_206', status: 'occupied', elderId: 'eld_020', dailyRate: 120 },
  { id: 'bd_206b', bedNumber: '206-B', roomId: 'rm_206', status: 'occupied', elderId: 'eld_021', dailyRate: 120 },
  { id: 'bd_206c', bedNumber: '206-C', roomId: 'rm_206', status: 'reserved', elderId: 'eld_022', dailyRate: 120 },
  { id: 'bd_301a', bedNumber: '301-A', roomId: 'rm_301', status: 'occupied', elderId: 'eld_023', dailyRate: 180 },
  { id: 'bd_302a', bedNumber: '302-A', roomId: 'rm_302', status: 'occupied', elderId: 'eld_024', dailyRate: 150 },
  { id: 'bd_302b', bedNumber: '302-B', roomId: 'rm_302', status: 'empty', dailyRate: 150 },
  { id: 'bd_303a', bedNumber: '303-A', roomId: 'rm_303', status: 'occupied', elderId: 'eld_025', dailyRate: 120 },
  { id: 'bd_303b', bedNumber: '303-B', roomId: 'rm_303', status: 'occupied', elderId: 'eld_026', dailyRate: 120 },
  { id: 'bd_303c', bedNumber: '303-C', roomId: 'rm_303', status: 'empty', dailyRate: 120 },
  { id: 'bd_304a', bedNumber: '304-A', roomId: 'rm_304', status: 'occupied', elderId: 'eld_027', dailyRate: 150 },
  { id: 'bd_304b', bedNumber: '304-B', roomId: 'rm_304', status: 'reserved', elderId: 'eld_028', dailyRate: 150 },
  { id: 'bd_305a', bedNumber: '305-A', roomId: 'rm_305', status: 'occupied', elderId: 'eld_029', dailyRate: 180 },
  { id: 'bd_306a', bedNumber: '306-A', roomId: 'rm_306', status: 'occupied', elderId: 'eld_030', dailyRate: 100 },
  { id: 'bd_306b', bedNumber: '306-B', roomId: 'rm_306', status: 'empty', dailyRate: 100 },
  { id: 'bd_306c', bedNumber: '306-C', roomId: 'rm_306', status: 'empty', dailyRate: 100 },
  { id: 'bd_306d', bedNumber: '306-D', roomId: 'rm_306', status: 'discharged', dailyRate: 100 },
];

export const elders: Elder[] = [
  { id: 'eld_001', name: '王建国', gender: 'male', idCard: '110101193503154532', birthDate: '1935-03-15', age: 91, phone: '13800138001', emergencyContact: '王志明', emergencyPhone: '13900139001', careLevel: 'full-care', checkInDate: '2024-06-15', deposit: 10000, status: 'active', medicalHistory: '高血压、糖尿病', allergies: '青霉素' },
  { id: 'eld_002', name: '李秀英', gender: 'female', idCard: '110102194208226784', birthDate: '1942-08-22', age: 84, phone: '13800138002', emergencyContact: '李小华', emergencyPhone: '13900139002', careLevel: 'semi-care', checkInDate: '2024-09-10', deposit: 8000, status: 'active', medicalHistory: '冠心病', allergies: '无' },
  { id: 'eld_003', name: '张德福', gender: 'male', idCard: '310101193812103456', birthDate: '1938-12-10', age: 87, phone: '13800138003', emergencyContact: '张卫国', emergencyPhone: '13900139003', careLevel: 'special-care', checkInDate: '2025-01-20', deposit: 15000, status: 'active', medicalHistory: '阿尔茨海默症、脑梗', allergies: '磺胺类' },
  { id: 'eld_004', name: '刘桂芳', gender: 'female', idCard: '320102194605187890', birthDate: '1946-05-18', age: 80, phone: '13800138004', emergencyContact: '刘国强', emergencyPhone: '13900139004', careLevel: 'self-care', checkInDate: '2025-02-28', deposit: 5000, status: 'active', medicalHistory: '骨质疏松', allergies: '无' },
  { id: 'eld_005', name: '陈志明', gender: 'male', idCard: '440101195207251234', birthDate: '1952-07-25', age: 74, phone: '13800138005', emergencyContact: '陈建华', emergencyPhone: '13900139005', careLevel: 'semi-care', checkInDate: '2026-06-20', deposit: 8000, status: 'reserved', medicalHistory: '前列腺增生', allergies: '无' },
  { id: 'eld_006', name: '赵玉兰', gender: 'female', idCard: '510102194009302345', birthDate: '1940-09-30', age: 85, phone: '13800138006', emergencyContact: '赵小红', emergencyPhone: '13900139006', careLevel: 'full-care', checkInDate: '2024-11-05', deposit: 12000, status: 'active', medicalHistory: '中风后遗症、高血压', allergies: '无' },
  { id: 'eld_007', name: '孙文华', gender: 'male', idCard: '330101194804125678', birthDate: '1948-04-12', age: 78, phone: '13800138007', emergencyContact: '孙晓东', emergencyPhone: '13900139007', careLevel: 'semi-care', checkInDate: '2025-03-18', deposit: 8000, status: 'active', medicalHistory: '慢性支气管炎', allergies: '海鲜' },
  { id: 'eld_008', name: '周金妹', gender: 'female', idCard: '320502193211083456', birthDate: '1932-11-08', age: 93, phone: '13800138008', emergencyContact: '周明远', emergencyPhone: '13900139008', careLevel: 'special-care', checkInDate: '2024-03-22', deposit: 15000, status: 'active', medicalHistory: '帕金森病、糖尿病', allergies: '阿司匹林' },
  { id: 'eld_009', name: '吴德顺', gender: 'male', idCard: '420101193706158765', birthDate: '1937-06-15', age: 89, phone: '13800138009', emergencyContact: '吴志坚', emergencyPhone: '13900139009', careLevel: 'full-care', checkInDate: '2024-08-30', deposit: 10000, status: 'active', medicalHistory: '高血压、关节炎', allergies: '无' },
  { id: 'eld_010', name: '郑秀珍', gender: 'female', idCard: '350102194502284321', birthDate: '1945-02-28', age: 81, phone: '13800138010', emergencyContact: '郑丽华', emergencyPhone: '13900139010', careLevel: 'self-care', checkInDate: '2025-05-10', deposit: 5000, status: 'active', medicalHistory: '无', allergies: '花粉' },
  { id: 'eld_011', name: '冯志刚', gender: 'male', idCard: '610101195010052341', birthDate: '1950-10-05', age: 75, phone: '13800138011', emergencyContact: '冯晓峰', emergencyPhone: '13900139011', careLevel: 'semi-care', checkInDate: '2025-06-18', deposit: 8000, status: 'active', medicalHistory: '糖尿病、高血脂', allergies: '无' },
  { id: 'eld_012', name: '黄丽娟', gender: 'female', idCard: '440301193903126578', birthDate: '1939-03-12', age: 87, phone: '13800138012', emergencyContact: '黄晓燕', emergencyPhone: '13900139012', careLevel: 'full-care', checkInDate: '2024-07-14', deposit: 12000, status: 'active', medicalHistory: '心脏病、高血压', allergies: '青霉素' },
  { id: 'eld_013', name: '何志明', gender: 'male', idCard: '500101195508207654', birthDate: '1955-08-20', age: 70, phone: '13800138013', emergencyContact: '何晓军', emergencyPhone: '13900139013', careLevel: 'self-care', checkInDate: '2025-09-25', deposit: 5000, status: 'active', medicalHistory: '腰椎间盘突出', allergies: '无' },
  { id: 'eld_014', name: '罗玉华', gender: 'female', idCard: '610102194812084532', birthDate: '1948-12-08', age: 77, phone: '13800138014', emergencyContact: '罗明辉', emergencyPhone: '13900139014', careLevel: 'semi-care', checkInDate: '2025-04-08', deposit: 8000, status: 'active', medicalHistory: '慢性胃炎、失眠', allergies: '无' },
  { id: 'eld_015', name: '林茂森', gender: 'male', idCard: '350101193001251298', birthDate: '1930-01-25', age: 96, phone: '13800138015', emergencyContact: '林远志', emergencyPhone: '13900139015', careLevel: 'special-care', checkInDate: '2024-02-10', deposit: 15000, status: 'active', medicalHistory: '晚期癌症、阿尔茨海默症', allergies: '多种药物' },
  { id: 'eld_016', name: '梁淑芬', gender: 'female', idCard: '450102194406178901', birthDate: '1944-06-17', age: 82, phone: '13800138016', emergencyContact: '梁晓晴', emergencyPhone: '13900139016', careLevel: 'semi-care', checkInDate: '2025-01-15', deposit: 8000, status: 'active', medicalHistory: '白内障、高血压', allergies: '无' },
  { id: 'eld_017', name: '宋海涛', gender: 'male', idCard: '230101195304224567', birthDate: '1953-04-22', age: 73, phone: '13800138017', emergencyContact: '宋晓阳', emergencyPhone: '13900139017', careLevel: 'self-care', checkInDate: '2026-06-25', deposit: 5000, status: 'reserved', medicalHistory: '痛风', allergies: '无' },
  { id: 'eld_018', name: '谢美华', gender: 'female', idCard: '360102194110301234', birthDate: '1941-10-30', age: 84, phone: '13800138018', emergencyContact: '谢小丽', emergencyPhone: '13900139018', careLevel: 'full-care', checkInDate: '2024-10-12', deposit: 12000, status: 'active', medicalHistory: '脑梗死后遗症', allergies: '海鲜' },
  { id: 'eld_019', name: '唐永康', gender: 'male', idCard: '430101194702186789', birthDate: '1947-02-18', age: 79, phone: '13800138019', emergencyContact: '唐晓东', emergencyPhone: '13900139019', careLevel: 'semi-care', checkInDate: '2025-07-22', deposit: 8000, status: 'active', medicalHistory: '肺气肿', allergies: '吸烟相关' },
  { id: 'eld_020', name: '韩桂珍', gender: 'female', idCard: '130102193607152345', birthDate: '1936-07-15', age: 89, phone: '13800138020', emergencyContact: '韩志明', emergencyPhone: '13900139020', careLevel: 'full-care', checkInDate: '2024-05-08', deposit: 10000, status: 'active', medicalHistory: '糖尿病足、冠心病', allergies: '无' },
  { id: 'eld_021', name: '曹文斌', gender: 'male', idCard: '340101194909085432', birthDate: '1949-09-08', age: 76, phone: '13800138021', emergencyContact: '曹晓峰', emergencyPhone: '13900139021', careLevel: 'self-care', checkInDate: '2025-08-30', deposit: 5000, status: 'active', medicalHistory: '早期青光眼', allergies: '无' },
  { id: 'eld_022', name: '邓玉兰', gender: 'female', idCard: '520102195403251234', birthDate: '1954-03-25', age: 72, phone: '13800138022', emergencyContact: '邓晓红', emergencyPhone: '13900139022', careLevel: 'semi-care', checkInDate: '2026-06-28', deposit: 8000, status: 'reserved', medicalHistory: '类风湿关节炎', allergies: '无' },
  { id: 'eld_023', name: '许金生', gender: 'male', idCard: '310104192812087654', birthDate: '1928-12-08', age: 97, phone: '13800138023', emergencyContact: '许国强', emergencyPhone: '13900139023', careLevel: 'special-care', checkInDate: '2024-01-20', deposit: 15000, status: 'active', medicalHistory: '多器官功能衰退、阿尔茨海默症', allergies: '青霉素' },
  { id: 'eld_024', name: '傅雪梅', gender: 'female', idCard: '210102194308124567', birthDate: '1943-08-12', age: 83, phone: '13800138024', emergencyContact: '傅晓琳', emergencyPhone: '13900139024', careLevel: 'semi-care', checkInDate: '2024-12-01', deposit: 8000, status: 'active', medicalHistory: '高血压、甲状腺功能减退', allergies: '无' },
  { id: 'eld_025', name: '沈国栋', gender: 'male', idCard: '330106195105208765', birthDate: '1951-05-20', age: 75, phone: '13800138025', emergencyContact: '沈晓军', emergencyPhone: '13900139025', careLevel: 'self-care', checkInDate: '2025-10-18', deposit: 5000, status: 'active', medicalHistory: '高血压（轻度）', allergies: '无' },
  { id: 'eld_026', name: '曾玉琴', gender: 'female', idCard: '510104193804156543', birthDate: '1938-04-15', age: 88, phone: '13800138026', emergencyContact: '曾晓明', emergencyPhone: '13900139026', careLevel: 'full-care', checkInDate: '2024-04-22', deposit: 12000, status: 'active', medicalHistory: '髋部骨折术后、高血压', allergies: '无' },
  { id: 'eld_027', name: '彭伟民', gender: 'male', idCard: '440601194611082341', birthDate: '1946-11-08', age: 79, phone: '13800138027', emergencyContact: '彭晓东', emergencyPhone: '13900139027', careLevel: 'semi-care', checkInDate: '2025-02-14', deposit: 8000, status: 'active', medicalHistory: '2型糖尿病', allergies: '磺胺类' },
  { id: 'eld_028', name: '吕芳', gender: 'female', idCard: '370102195601156789', birthDate: '1956-01-15', age: 70, phone: '13800138028', emergencyContact: '吕晓燕', emergencyPhone: '13900139028', careLevel: 'self-care', checkInDate: '2026-06-30', deposit: 5000, status: 'reserved', medicalHistory: '更年期综合征', allergies: '无' },
  { id: 'eld_029', name: '苏振邦', gender: 'male', idCard: '320106193409254321', birthDate: '1934-09-25', age: 91, phone: '13800138029', emergencyContact: '苏晓峰', emergencyPhone: '13900139029', careLevel: 'special-care', checkInDate: '2024-06-05', deposit: 15000, status: 'active', medicalHistory: '帕金森病晚期、褥疮', allergies: '胶带' },
  { id: 'eld_030', name: '蒋素贞', gender: 'female', idCard: '460102194005207654', birthDate: '1940-05-20', age: 86, phone: '13800138030', emergencyContact: '蒋晓丽', emergencyPhone: '13900139030', careLevel: 'full-care', checkInDate: '2024-09-18', deposit: 12000, status: 'active', medicalHistory: '尿毒症（透析中）', allergies: '造影剂' },
];

const buildCustomTasks = (careLevel: string): CustomTask[] => {
  const tasks: CustomTask[] = [];
  if (careLevel === 'special-care' || careLevel === 'full-care') {
    tasks.push({
      id: 'ct_' + Math.random().toString(36).slice(2, 9),
      name: '雾化吸入',
      description: '帮助老人进行呼吸道雾化吸入治疗',
      scheduledTime: '10:00',
      frequency: 'daily',
    });
  }
  if (careLevel === 'special-care') {
    tasks.push({
      id: 'ct_' + Math.random().toString(36).slice(2, 9),
      name: '褥疮护理',
      description: '检查并护理褥疮部位，更换敷料',
      scheduledTime: '14:00',
      frequency: 'daily',
    });
  }
  return tasks;
};

export const carePlans: CarePlan[] = elders
  .filter((e) => e.status !== 'reserved')
  .map((elder) => {
    const level = elder.careLevel;
    const plan: CarePlan = {
      id: 'cp_' + elder.id.slice(4),
      elderId: elder.id,
      careLevel: level,
      turnOverHours: level === 'special-care' ? 2 : level === 'full-care' ? 3 : 4,
      measureFrequency: level === 'special-care' ? 'daily' : level === 'full-care' ? 'daily' : level === 'semi-care' ? 'bidaily' : 'weekly',
      morningCare: true,
      eveningCare: level !== 'self-care',
      mealAssist: level === 'special-care' || level === 'full-care',
      bathingAssist: level !== 'self-care',
      bathingSchedule: level === 'special-care' ? 'every2days' : level === 'full-care' ? 'every2days' : 'weekly',
      mealRounds: 3,
      nightRounds: level === 'special-care' ? 4 : level === 'full-care' ? 2 : 1,
      customTasks: buildCustomTasks(level),
    };
    return plan;
  });

export const caregivers: Caregiver[] = [
  { id: 'cg_001', name: '张桂兰', gender: 'female', phone: '15900000001', certification: '高级养老护理员', hireDate: '2021-03-15', status: 'active' },
  { id: 'cg_002', name: '李秀梅', gender: 'female', phone: '15900000002', certification: '中级养老护理员', hireDate: '2022-06-20', status: 'active' },
  { id: 'cg_003', name: '王翠花', gender: 'female', phone: '15900000003', certification: '高级养老护理员', hireDate: '2020-09-10', status: 'active' },
  { id: 'cg_004', name: '赵晓燕', gender: 'female', phone: '15900000004', certification: '初级养老护理员', hireDate: '2023-02-28', status: 'active' },
  { id: 'cg_005', name: '刘红霞', gender: 'female', phone: '15900000005', certification: '中级养老护理员', hireDate: '2022-11-05', status: 'active' },
  { id: 'cg_006', name: '陈志华', gender: 'male', phone: '15900000006', certification: '高级养老护理员', hireDate: '2019-07-12', status: 'active' },
  { id: 'cg_007', name: '孙丽萍', gender: 'female', phone: '15900000007', certification: '中级养老护理员', hireDate: '2021-12-01', status: 'leave' },
  { id: 'cg_008', name: '周美玲', gender: 'female', phone: '15900000008', certification: '护士资格证', hireDate: '2020-04-18', status: 'active' },
  { id: 'cg_009', name: '吴文娟', gender: 'female', phone: '15900000009', certification: '中级养老护理员', hireDate: '2023-05-22', status: 'active' },
  { id: 'cg_010', name: '郑伟明', gender: 'male', phone: '15900000010', certification: '康复治疗师', hireDate: '2022-03-08', status: 'active' },
];

const today = new Date(2026, 5, 15);
const weekStart = new Date(2026, 5, 15);
const weekDates: string[] = [];
for (let i = 0; i < 7; i++) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + i);
  weekDates.push(d.toISOString().slice(0, 10));
}

const shiftPatterns: Array<Array<'morning' | 'afternoon' | 'night'>> = [
  ['morning', 'morning', 'afternoon', 'afternoon', 'night', 'night', 'morning'],
  ['afternoon', 'night', 'morning', 'morning', 'morning', 'afternoon', 'afternoon'],
  ['night', 'morning', 'morning', 'afternoon', 'afternoon', 'night', 'night'],
  ['morning', 'afternoon', 'night', 'morning', 'morning', 'afternoon', 'afternoon'],
  ['afternoon', 'afternoon', 'night', 'night', 'morning', 'morning', 'morning'],
  ['night', 'night', 'morning', 'afternoon', 'afternoon', 'night', 'morning'],
  ['morning', 'night', 'night', 'morning', 'afternoon', 'afternoon', 'afternoon'],
  ['afternoon', 'morning', 'morning', 'night', 'night', 'morning', 'afternoon'],
  ['night', 'afternoon', 'afternoon', 'morning', 'morning', 'morning', 'night'],
  ['morning', 'morning', 'morning', 'afternoon', 'night', 'night', 'afternoon'],
];

export const schedules: Schedule[] = caregivers.flatMap((cg, cgIdx) =>
  weekDates.map((date, dayIdx) => ({
    id: `sch_${cg.id.slice(3)}_${dayIdx + 1}`,
    caregiverId: cg.id,
    date,
    shift: shiftPatterns[cgIdx][dayIdx],
    assignedBeds: beds
      .filter((_, bedIdx) => bedIdx % 10 === cgIdx)
      .map((b) => b.id),
  }))
);

const todayStr = today.toISOString().slice(0, 10);
const activeElders = elders.filter((e) => e.status === 'active');

export const careTasks: CareTask[] = [
  { id: 'tsk_001', carePlanId: 'cp_001', elderId: 'eld_001', type: 'morning', name: '晨间护理（洗漱、更衣）', scheduledDate: todayStr, scheduledTime: '06:30', caregiverId: 'cg_001', status: 'completed', completedAt: '2026-06-15T07:02:00' },
  { id: 'tsk_002', carePlanId: 'cp_003', elderId: 'eld_003', type: 'turnover', name: '翻身拍背', scheduledDate: todayStr, scheduledTime: '02:00', caregiverId: 'cg_003', status: 'overdue' },
  { id: 'tsk_003', carePlanId: 'cp_006', elderId: 'eld_006', type: 'vital', name: '血压、脉搏测量', scheduledDate: todayStr, scheduledTime: '07:00', caregiverId: 'cg_008', status: 'completed', completedAt: '2026-06-15T07:15:00', notes: '血压145/90，偏高' },
  { id: 'tsk_004', carePlanId: 'cp_008', elderId: 'eld_008', type: 'meal', name: '协助早餐', scheduledDate: todayStr, scheduledTime: '07:30', caregiverId: 'cg_002', status: 'in-progress' },
  { id: 'tsk_005', carePlanId: 'cp_015', elderId: 'eld_015', type: 'turnover', name: '翻身拍背', scheduledDate: todayStr, scheduledTime: '04:00', caregiverId: 'cg_006', status: 'overdue' },
  { id: 'tsk_006', carePlanId: 'cp_002', elderId: 'eld_002', type: 'morning', name: '晨间护理', scheduledDate: todayStr, scheduledTime: '07:00', caregiverId: 'cg_002', status: 'completed', completedAt: '2026-06-15T07:20:00' },
  { id: 'tsk_007', carePlanId: 'cp_023', elderId: 'eld_023', type: 'vital', name: '生命体征监测', scheduledDate: todayStr, scheduledTime: '06:00', caregiverId: 'cg_008', status: 'completed', completedAt: '2026-06-15T06:25:00' },
  { id: 'tsk_008', carePlanId: 'cp_012', elderId: 'eld_012', type: 'medication', name: '协助服药', scheduledDate: todayStr, scheduledTime: '08:00', caregiverId: 'cg_005', status: 'pending' },
  { id: 'tsk_009', carePlanId: 'cp_029', elderId: 'eld_029', type: 'wound', name: '褥疮换药', scheduledDate: todayStr, scheduledTime: '09:00', caregiverId: 'cg_008', status: 'pending' },
  { id: 'tsk_010', carePlanId: 'cp_010', elderId: 'eld_010', type: 'activity', name: '晨间康复活动', scheduledDate: todayStr, scheduledTime: '08:30', caregiverId: 'cg_010', status: 'pending' },
  { id: 'tsk_011', carePlanId: 'cp_020', elderId: 'eld_020', type: 'meal', name: '协助午餐', scheduledDate: todayStr, scheduledTime: '11:30', caregiverId: 'cg_004', status: 'pending' },
  { id: 'tsk_012', carePlanId: 'cp_018', elderId: 'eld_018', type: 'turnover', name: '翻身拍背', scheduledDate: todayStr, scheduledTime: '10:00', caregiverId: 'cg_001', status: 'pending' },
  { id: 'tsk_013', carePlanId: 'cp_030', elderId: 'eld_030', type: 'vital', name: '血糖、血压测量', scheduledDate: todayStr, scheduledTime: '06:30', caregiverId: 'cg_008', status: 'overdue' },
  { id: 'tsk_014', carePlanId: 'cp_026', elderId: 'eld_026', type: 'rehab', name: '下肢康复训练', scheduledDate: todayStr, scheduledTime: '14:00', caregiverId: 'cg_010', status: 'pending' },
  { id: 'tsk_015', carePlanId: 'cp_004', elderId: 'eld_004', type: 'activity', name: '棋牌活动', scheduledDate: todayStr, scheduledTime: '15:00', caregiverId: 'cg_009', status: 'pending' },
  { id: 'tsk_016', carePlanId: 'cp_011', elderId: 'eld_011', type: 'evening', name: '晚间护理', scheduledDate: todayStr, scheduledTime: '20:00', caregiverId: 'cg_006', status: 'pending' },
  { id: 'tsk_017', carePlanId: 'cp_014', elderId: 'eld_014', type: 'medication', name: '睡前服药', scheduledDate: todayStr, scheduledTime: '21:00', caregiverId: 'cg_005', status: 'pending' },
  { id: 'tsk_018', carePlanId: 'cp_007', elderId: 'eld_007', type: 'vital', name: '体温测量', scheduledDate: todayStr, scheduledTime: '20:00', caregiverId: 'cg_004', status: 'pending' },
  { id: 'tsk_019', carePlanId: 'cp_021', elderId: 'eld_021', type: 'night', name: '夜间巡房', scheduledDate: todayStr, scheduledTime: '23:00', caregiverId: 'cg_006', status: 'pending' },
  { id: 'tsk_020', carePlanId: 'cp_009', elderId: 'eld_009', type: 'night', name: '夜间巡房', scheduledDate: todayStr, scheduledTime: '02:00', caregiverId: 'cg_003', status: 'overdue' },
];

export const events: EventRecord[] = [
  { id: 'evt_001', type: 'fall', elderId: 'eld_006', caregiverId: 'cg_002', occurredAt: '2026-06-14T08:30:00', location: '2楼走廊', description: '老人独自起身时不慎滑倒，左侧手臂轻微擦伤', handledBy: 'cg_008', status: 'resolved', attachments: [] },
  { id: 'evt_002', type: 'visit', elderId: 'eld_001', occurredAt: '2026-06-14T10:00:00', location: '101房间', description: '家属王志明携家人探望，停留约2小时', status: 'resolved' },
  { id: 'evt_003', type: 'outing', elderId: 'eld_004', caregiverId: 'cg_004', occurredAt: '2026-06-14T14:00:00', location: '机构外公园', description: '家属陪同外出公园散步，17:30返回', handledBy: 'cg_004', status: 'resolved' },
  { id: 'evt_004', type: 'leave', elderId: 'eld_010', occurredAt: '2026-06-13T09:00:00', location: '机构大门', description: '请假回家过节，预计6月17日返回', status: 'processing' },
  { id: 'evt_005', type: 'fall', elderId: 'eld_020', caregiverId: 'cg_005', occurredAt: '2026-06-13T16:20:00', location: '餐厅', description: '用餐后起身时头晕摔倒，经检查无大碍', handledBy: 'cg_008', status: 'resolved' },
  { id: 'evt_006', type: 'visit', elderId: 'eld_015', occurredAt: '2026-06-13T11:00:00', location: '203房间', description: '孙子林远志一家前来探望', status: 'resolved' },
  { id: 'evt_007', type: 'outing', elderId: 'eld_013', occurredAt: '2026-06-12T08:30:00', location: '社区医院', description: '家属陪同外出就医复查，12:00返回', handledBy: 'cg_001', status: 'resolved' },
  { id: 'evt_008', type: 'visit', elderId: 'eld_024', occurredAt: '2026-06-12T15:30:00', location: '302房间', description: '女儿傅晓琳探望，带来换洗衣物', status: 'resolved' },
  { id: 'evt_009', type: 'leave', elderId: 'eld_025', occurredAt: '2026-06-11T10:00:00', location: '机构大门', description: '请假参加外孙女婚礼，6月15日已返回', status: 'resolved' },
  { id: 'evt_010', type: 'fall', elderId: 'eld_008', caregiverId: 'cg_003', occurredAt: '2026-06-11T05:45:00', location: '106房间卫生间', description: '夜间如厕时在卫生间滑倒，腰部轻微挫伤', handledBy: 'cg_008', status: 'resolved' },
  { id: 'evt_011', type: 'visit', elderId: 'eld_030', occurredAt: '2026-06-11T16:00:00', location: '306房间', description: '儿子蒋晓丽探望，了解透析情况', status: 'resolved' },
  { id: 'evt_012', type: 'outing', elderId: 'eld_019', caregiverId: 'cg_010', occurredAt: '2026-06-10T09:00:00', location: '康复中心', description: '外出康复中心进行物理治疗，11:30返回', handledBy: 'cg_010', status: 'resolved' },
  { id: 'evt_013', type: 'visit', elderId: 'eld_003', occurredAt: '2026-06-10T14:00:00', location: '103房间', description: '儿子张卫国探望，与医生沟通病情', status: 'resolved' },
  { id: 'evt_014', type: 'leave', elderId: 'eld_022', occurredAt: '2026-06-09T08:00:00', location: '机构大门', description: '请假回家休养，因是预订状态尚未入住', status: 'pending' },
  { id: 'evt_015', type: 'fall', elderId: 'eld_026', caregiverId: 'cg_009', occurredAt: '2026-06-09T19:30:00', location: '3楼活动区', description: '参与活动时不慎绊倒，旧伤部位疼痛，已冷敷处理', handledBy: 'cg_008', status: 'resolved' },
];

const generateBillItems = (elderId: string, dailyRate: number): Bill['items'] => {
  const elder = elders.find((e) => e.id === elderId)!;
  const careFeeMap = { 'self-care': 2000, 'semi-care': 3500, 'full-care': 5500, 'special-care': 8000 };
  const mealFee = 900;
  const careFee = careFeeMap[elder.careLevel];
  const days = 15;
  const roomSubtotal = dailyRate * days;

  return [
    {
      id: `bi_${elderId.slice(4)}_1`,
      serviceName: '床位费',
      category: 'room' as const,
      quantity: days,
      unitPrice: dailyRate,
      subtotal: roomSubtotal,
      dateFrom: '2026-06-01',
      dateTo: '2026-06-15',
    },
    {
      id: `bi_${elderId.slice(4)}_2`,
      serviceName: '护理费',
      category: 'care' as const,
      quantity: 1,
      unitPrice: careFee,
      subtotal: careFee,
    },
    {
      id: `bi_${elderId.slice(4)}_3`,
      serviceName: '餐费',
      category: 'meal' as const,
      quantity: 1,
      unitPrice: mealFee,
      subtotal: mealFee,
    },
    {
      id: `bi_${elderId.slice(4)}_4`,
      serviceName: '生活用品费',
      category: 'other' as const,
      quantity: 1,
      unitPrice: 200,
      subtotal: 200,
    },
  ];
};

export const bills: Bill[] = [
  (() => {
    const elder = activeElders[0];
    const bed = beds.find((b) => b.elderId === elder.id)!;
    const items = generateBillItems(elder.id, bed.dailyRate);
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return {
      id: 'bill_001',
      elderId: elder.id,
      period: '2026-06',
      items,
      totalAmount: total,
      depositUsed: 0,
      payableAmount: total,
      generatedAt: '2026-06-01T00:00:00',
      status: 'paid' as const,
    };
  })(),
  (() => {
    const elder = activeElders[1];
    const bed = beds.find((b) => b.elderId === elder.id)!;
    const items = generateBillItems(elder.id, bed.dailyRate);
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return {
      id: 'bill_002',
      elderId: elder.id,
      period: '2026-06',
      items,
      totalAmount: total,
      depositUsed: 0,
      payableAmount: total,
      generatedAt: '2026-06-01T00:00:00',
      status: 'pending' as const,
    };
  })(),
  (() => {
    const elder = activeElders[2];
    const bed = beds.find((b) => b.elderId === elder.id)!;
    const items = generateBillItems(elder.id, bed.dailyRate);
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return {
      id: 'bill_003',
      elderId: elder.id,
      period: '2026-06',
      items,
      totalAmount: total,
      depositUsed: 2000,
      payableAmount: total - 2000,
      generatedAt: '2026-06-01T00:00:00',
      status: 'paid' as const,
    };
  })(),
  (() => {
    const elder = activeElders[3];
    const bed = beds.find((b) => b.elderId === elder.id)!;
    const items = generateBillItems(elder.id, bed.dailyRate);
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return {
      id: 'bill_004',
      elderId: elder.id,
      period: '2026-06',
      items,
      totalAmount: total,
      depositUsed: 0,
      payableAmount: total,
      generatedAt: '2026-06-01T00:00:00',
      status: 'pending' as const,
    };
  })(),
  (() => {
    const elder = activeElders[5];
    const bed = beds.find((b) => b.elderId === elder.id)!;
    const items = generateBillItems(elder.id, bed.dailyRate);
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return {
      id: 'bill_005',
      elderId: elder.id,
      period: '2026-06',
      items,
      totalAmount: total,
      depositUsed: 0,
      payableAmount: total,
      generatedAt: '2026-06-01T00:00:00',
      status: 'paid' as const,
    };
  })(),
  (() => {
    const elder = activeElders[8];
    const bed = beds.find((b) => b.elderId === elder.id)!;
    const items = generateBillItems(elder.id, bed.dailyRate);
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return {
      id: 'bill_006',
      elderId: elder.id,
      period: '2026-06',
      items,
      totalAmount: total,
      depositUsed: 1500,
      payableAmount: total - 1500,
      generatedAt: '2026-06-01T00:00:00',
      status: 'settled' as const,
    };
  })(),
];

export const bedTransfers: BedTransfer[] = [
  { id: 'bt_001', elderId: 'eld_001', fromBedId: 'bd_201a', toBedId: 'bd_101a', transferDate: '2026-03-10', reason: '行动不便，调换至低楼层单人间方便照顾', rateDifference: 30, approvedBy: '护理主管李主任' },
  { id: 'bt_002', elderId: 'eld_015', fromBedId: 'bd_303c', toBedId: 'bd_203a', transferDate: '2026-04-05', reason: '病情加重，需更密集护理，调换至单人间', rateDifference: 60, approvedBy: '护理主管李主任' },
  { id: 'bt_003', elderId: 'eld_020', fromBedId: 'bd_306b', toBedId: 'bd_206a', transferDate: '2026-05-18', reason: '原房间装修，临时调换', rateDifference: 20, approvedBy: '护理主管李主任' },
];

export const monthlyWorkloads: MonthlyWorkload[] = [
  { caregiverId: 'cg_001', caregiverName: '张桂兰', yearMonth: '2026-05', totalShifts: 26, morningShifts: 9, afternoonShifts: 9, nightShifts: 8, tasksCompleted: 312, overtimeHours: 12 },
  { caregiverId: 'cg_002', caregiverName: '李秀梅', yearMonth: '2026-05', totalShifts: 24, morningShifts: 8, afternoonShifts: 10, nightShifts: 6, tasksCompleted: 268, overtimeHours: 8 },
  { caregiverId: 'cg_003', caregiverName: '王翠花', yearMonth: '2026-05', totalShifts: 27, morningShifts: 10, afternoonShifts: 8, nightShifts: 9, tasksCompleted: 345, overtimeHours: 16 },
  { caregiverId: 'cg_004', caregiverName: '赵晓燕', yearMonth: '2026-05', totalShifts: 22, morningShifts: 7, afternoonShifts: 9, nightShifts: 6, tasksCompleted: 210, overtimeHours: 4 },
  { caregiverId: 'cg_005', caregiverName: '刘红霞', yearMonth: '2026-05', totalShifts: 25, morningShifts: 8, afternoonShifts: 9, nightShifts: 8, tasksCompleted: 289, overtimeHours: 10 },
  { caregiverId: 'cg_006', caregiverName: '陈志华', yearMonth: '2026-05', totalShifts: 26, morningShifts: 9, afternoonShifts: 8, nightShifts: 9, tasksCompleted: 320, overtimeHours: 14 },
  { caregiverId: 'cg_007', caregiverName: '孙丽萍', yearMonth: '2026-05', totalShifts: 12, morningShifts: 4, afternoonShifts: 5, nightShifts: 3, tasksCompleted: 118, overtimeHours: 0 },
  { caregiverId: 'cg_008', caregiverName: '周美玲', yearMonth: '2026-05', totalShifts: 25, morningShifts: 12, afternoonShifts: 10, nightShifts: 3, tasksCompleted: 302, overtimeHours: 18 },
  { caregiverId: 'cg_009', caregiverName: '吴文娟', yearMonth: '2026-05', totalShifts: 23, morningShifts: 8, afternoonShifts: 8, nightShifts: 7, tasksCompleted: 256, overtimeHours: 6 },
  { caregiverId: 'cg_010', caregiverName: '郑伟明', yearMonth: '2026-05', totalShifts: 24, morningShifts: 11, afternoonShifts: 10, nightShifts: 3, tasksCompleted: 278, overtimeHours: 10 },
];

export default {
  floors,
  rooms,
  beds,
  elders,
  carePlans,
  caregivers,
  schedules,
  careTasks,
  events,
  bills,
  bedTransfers,
  monthlyWorkloads,
};
