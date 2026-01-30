'use client';

import { useState, useMemo, useEffect } from 'react';
import transactionsData from '../../data/transactions.json';

interface TicketConfig {
  ticketName: string;
  availableDates: {
    start: string;
    end: string;
  };
  basePrice: number;
}

interface Transaction {
  id: string;
  ticketName: string;
  transactionDate: string;
  buyerAddress: string;
  paymentAmount: number;
  paymentStatus: '완료' | '대기' | '취소';
}

interface SuspiciousAccount {
  address: string;
  ticketName: string;
  purchaseCount: number;
  totalAmount: number;
  status: '활성' | '정지';
  lastPurchaseDate: string;
}

interface MonitorConfig {
  normalBuyerCount: number;
  suspiciousBuyerCount: number;
  normalPurchasePerTicket: number;
  suspiciousPurchaseCounts: number[];
  suspiciousThreshold: number;
}

interface DataStructure {
  ticketConfig: TicketConfig[];
  transactions: Transaction[];
  monitorConfig?: MonitorConfig;
}

// 숫자 포맷팅 함수
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 랜덤 이메일 주소 생성 함수 (실제 이메일처럼 보이도록)
const generateRandomEmail = (index: number, isSuspicious: boolean = false): string => {
  const firstNames = ['james', 'sarah', 'michael', 'emily', 'david', 'olivia', 'robert', 'sophia', 'william', 'isabella', 'richard', 'ava', 'joseph', 'mia', 'thomas', 'charlotte'];
  const lastNames = ['smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'rodriguez', 'martinez', 'hernandez', 'lopez', 'wilson', 'anderson', 'taylor', 'moore'];
  const adjectives = ['cool', 'smart', 'bright', 'swift', 'bold', 'calm', 'keen', 'wise', 'quick', 'sharp'];
  const nouns = ['tiger', 'eagle', 'wolf', 'lion', 'bear', 'hawk', 'fox', 'deer', 'bird', 'fish'];
  const numbers = ['2024', '2023', '2022', '99', '88', '77', '123', '456', '789', '01'];
  
  let username = '';
  
  if (isSuspicious) {
    // 의심 계정은 더 랜덤하게
    const pattern = Math.floor(Math.random() * 4);
    switch (pattern) {
      case 0:
        username = `${firstNames[index % firstNames.length]}${lastNames[index % lastNames.length]}${numbers[index % numbers.length]}`;
        break;
      case 1:
        username = `${adjectives[index % adjectives.length]}${nouns[index % nouns.length]}${index + 1}`;
        break;
      case 2:
        username = `${firstNames[index % firstNames.length]}.${lastNames[index % lastNames.length]}`;
        break;
      default:
        username = `${adjectives[index % adjectives.length]}${numbers[index % numbers.length]}`;
    }
  } else {
    // 정상 계정은 더 자연스럽게
    const pattern = Math.floor(Math.random() * 3);
    switch (pattern) {
      case 0:
        username = `${firstNames[index % firstNames.length]}.${lastNames[index % lastNames.length]}`;
        break;
      case 1:
        username = `${firstNames[index % firstNames.length]}${lastNames[index % lastNames.length]}${numbers[index % numbers.length]}`;
        break;
      default:
        username = `${firstNames[index % firstNames.length]}${index + 1}`;
    }
  }
  
  return `${username}@google.com`;
};

export default function MonitorPage() {
  const [mounted, setMounted] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [suspiciousAccounts, setSuspiciousAccounts] = useState<SuspiciousAccount[]>([]);
  const [filterStatus, setFilterStatus] = useState<'전체' | '활성' | '정지'>('전체');
  const [showModal, setShowModal] = useState(false);
  const [ticketConfig, setTicketConfig] = useState<TicketConfig[]>([]);
  const [monitorConfig, setMonitorConfig] = useState<MonitorConfig>({
    normalBuyerCount: 7,
    suspiciousBuyerCount: 3,
    normalPurchasePerTicket: 8,
    suspiciousPurchaseCounts: [10, 12, 14],
    suspiciousThreshold: 10,
  });

  // 클라이언트에서만 데이터 초기화
  useEffect(() => {
    setMounted(true);
    
    // 판매 내역 예시 데이터 생성
    const data = transactionsData as unknown as DataStructure;
    const ticketConfigs = data.ticketConfig || [];
    const initialTickets = ticketConfigs.map(t => ({
      ticketName: t.ticketName,
      availableDates: t.availableDates,
      basePrice: t.basePrice,
    }));
    setTicketConfig(initialTickets);
    
    const initialConfig: MonitorConfig = data.monitorConfig || {
      normalBuyerCount: 7,
      suspiciousBuyerCount: 3,
      normalPurchasePerTicket: 8,
      suspiciousPurchaseCounts: [10, 12, 14],
      suspiciousThreshold: 10,
    };
    setMonitorConfig(initialConfig);
    
    generateTransactions(initialConfig, initialTickets);
  }, []);

  // 거래 내역 생성 함수
  const generateTransactions = (config: MonitorConfig, ticketConfigs: TicketConfig[]) => {
    const sampleTransactions: Transaction[] = [];
    
    // 정상 구매자 이메일 생성
    const normalBuyers: string[] = [];
    for (let i = 0; i < config.normalBuyerCount; i++) {
      normalBuyers.push(generateRandomEmail(i, false));
    }
    
    // 의심 계정 이메일 생성
    const suspiciousBuyers: string[] = [];
    for (let i = 0; i < config.suspiciousBuyerCount; i++) {
      suspiciousBuyers.push(generateRandomEmail(i, true));
    }
    
    let transactionId = 1289000000;
    
    ticketConfigs.forEach((ticket, ticketIndex) => {
      // 정상 구매자들
      for (let i = 0; i < config.normalPurchasePerTicket; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
        const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        
        sampleTransactions.push({
          id: `#${transactionId++}`,
          ticketName: ticket.ticketName,
          transactionDate: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${hours}:${minutes}`,
          buyerAddress: normalBuyers[i % normalBuyers.length],
          paymentAmount: ticket.basePrice + Math.floor(Math.random() * ticket.basePrice * 0.2) - ticket.basePrice * 0.1,
          paymentStatus: '완료',
        });
      }

      // 의심 계정들 - 각 티켓에 대해 설정된 건수만큼 구매
      suspiciousBuyers.forEach((suspiciousBuyer, buyerIndex) => {
        const purchaseCount = config.suspiciousPurchaseCounts[buyerIndex] || config.suspiciousThreshold;
        
        for (let i = 0; i < purchaseCount; i++) {
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 30));
          const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
          const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
          
          sampleTransactions.push({
            id: `#${transactionId++}`,
            ticketName: ticket.ticketName,
            transactionDate: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${hours}:${minutes}`,
            buyerAddress: suspiciousBuyer,
            paymentAmount: ticket.basePrice + Math.floor(Math.random() * ticket.basePrice * 0.2) - ticket.basePrice * 0.1,
            paymentStatus: '완료',
          });
        }
      });
    });
    
    setAllTransactions(sampleTransactions);

    // 암표 의심 계정 분석 (같은 티켓에 설정된 임계값 이상 구매)
    const accountMap = new Map<string, Map<string, number>>();
    
    sampleTransactions.forEach(transaction => {
      if (transaction.paymentStatus === '완료') {
        if (!accountMap.has(transaction.buyerAddress)) {
          accountMap.set(transaction.buyerAddress, new Map());
        }
        const ticketMap = accountMap.get(transaction.buyerAddress)!;
        ticketMap.set(transaction.ticketName, (ticketMap.get(transaction.ticketName) || 0) + 1);
      }
    });

    const suspicious: SuspiciousAccount[] = [];
    const threshold = config.suspiciousThreshold;
    accountMap.forEach((ticketMap, address) => {
      ticketMap.forEach((count, ticketName) => {
        if (count >= threshold) {
          const accountTransactions = sampleTransactions.filter(
            t => t.buyerAddress === address && t.ticketName === ticketName && t.paymentStatus === '완료'
          );
          const totalAmount = accountTransactions.reduce((sum, t) => sum + t.paymentAmount, 0);
          const lastPurchase = accountTransactions.sort((a, b) => 
            b.transactionDate.localeCompare(a.transactionDate)
          )[0];
          
          // 의심 계정은 기본적으로 활성 상태로 시작
          suspicious.push({
            address,
            ticketName,
            purchaseCount: count,
            totalAmount,
            status: '활성',
            lastPurchaseDate: lastPurchase.transactionDate,
          });
        }
      });
    });

    setSuspiciousAccounts(suspicious);
  };

  // 필터링된 의심 계정
  const filteredAccounts = useMemo(() => {
    if (filterStatus === '전체') {
      return suspiciousAccounts;
    }
    return suspiciousAccounts.filter(account => account.status === filterStatus);
  }, [suspiciousAccounts, filterStatus]);

  // 통계 계산
  const stats = useMemo(() => {
    const totalAccounts = suspiciousAccounts.length;
    const activeAccounts = suspiciousAccounts.filter(a => a.status === '활성').length;
    const suspendedAccounts = suspiciousAccounts.filter(a => a.status === '정지').length;
    const totalSuspiciousPurchases = suspiciousAccounts.reduce((sum, a) => sum + a.purchaseCount, 0);
    const totalSuspiciousAmount = suspiciousAccounts.reduce((sum, a) => sum + a.totalAmount, 0);

    return {
      totalAccounts,
      activeAccounts,
      suspendedAccounts,
      totalSuspiciousPurchases,
      totalSuspiciousAmount,
    };
  }, [suspiciousAccounts]);

  // 계정 상태 변경
  const handleToggleAccountStatus = (address: string, ticketName: string) => {
    setSuspiciousAccounts(prev => 
      prev.map(account => 
        account.address === address && account.ticketName === ticketName
          ? { ...account, status: account.status === '활성' ? '정지' : '활성' }
          : account
      )
    );
  };

  // 설정 저장
  const handleSaveConfig = (config: MonitorConfig, tickets: TicketConfig[]) => {
    setMonitorConfig(config);
    setTicketConfig(tickets);
    setShowModal(false);
    // 데이터 재생성
    generateTransactions(config, tickets);
  };

  // 티켓 추가/수정/삭제
  const handleTicketChange = (index: number, field: keyof TicketConfig, value: any) => {
    const updated = [...ticketConfig];
    if (field === 'availableDates') {
      updated[index] = { ...updated[index], availableDates: { ...updated[index].availableDates, ...value } };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setTicketConfig(updated);
  };

  const handleAddTicket = (tickets: TicketConfig[]) => {
    return [
      ...tickets,
      {
        ticketName: '',
        availableDates: { start: '2024-01-01', end: '2025-12-31' },
        basePrice: 100000,
      },
    ];
  };

  const handleRemoveTicket = (tickets: TicketConfig[], index: number) => {
    return tickets.filter((_, i) => i !== index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">N차 거래 모니터링 시스템</h1>
              <p className="text-xs text-gray-500 mt-0.5">암표상 방지 및 의심 계정 관리</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">운영자</div>
                <div className="text-sm font-semibold text-gray-900">모니터링 관리자</div>
              </div>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">의심 계정</p>
                <p className="text-2xl font-bold text-gray-900">{mounted ? stats.totalAccounts : '0'}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">활성 계정</p>
                <p className="text-2xl font-bold text-green-600">{mounted ? stats.activeAccounts : '0'}</p>
                <p className="text-xs text-gray-400 mt-0.5">정지: {mounted ? stats.suspendedAccounts : '0'}개</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">의심 구매 건수</p>
                <p className="text-2xl font-bold text-gray-900">{mounted ? formatNumber(stats.totalSuspiciousPurchases) : '0'}</p>
                <p className="text-xs text-gray-400 mt-0.5">10건 이상 구매</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">의심 거래 금액</p>
                <p className="text-2xl font-bold text-gray-900">{mounted ? formatNumber(stats.totalSuspiciousAmount) : '0'}원</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 알림 섹션 */}
        {mounted && suspiciousAccounts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">암표 의심 계정 감지</h3>
                <p className="text-sm text-red-700">
                  {suspiciousAccounts.length}개의 계정이 동일 티켓에 10건 이상 구매했습니다. 즉시 확인이 필요합니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 의심 계정 관리 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">암표 의심 계정 관리</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('전체')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  filterStatus === '전체'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterStatus('활성')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  filterStatus === '활성'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                활성
              </button>
              <button
                onClick={() => setFilterStatus('정지')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  filterStatus === '정지'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                정지
              </button>
            </div>
          </div>
          <div className="p-4">
            {mounted && filteredAccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">계정 주소</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">티켓명</th>
                      <th className="text-center py-2 px-3 text-gray-600 font-medium">구매 건수</th>
                      <th className="text-right py-2 px-3 text-gray-600 font-medium">총 거래 금액</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">최근 구매일</th>
                      <th className="text-center py-2 px-3 text-gray-600 font-medium">상태</th>
                      <th className="text-center py-2 px-3 text-gray-600 font-medium">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3 text-gray-900 font-medium">{account.address}</td>
                        <td className="py-3 px-3 text-gray-900">{account.ticketName}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-semibold">
                            {account.purchaseCount}건
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-gray-900">
                          {formatNumber(account.totalAmount)}원
                        </td>
                        <td className="py-3 px-3 text-gray-600">{account.lastPurchaseDate}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            account.status === '활성'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {account.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleAccountStatus(account.address, account.ticketName)}
                            className={`px-3 py-1.5 rounded text-xs font-medium ${
                              account.status === '활성'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {account.status === '활성' ? '정지' : '활성화'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-sm">의심 계정이 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 통계 분석 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">모니터링 통계</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">티켓별 의심 구매 현황</h3>
                <div className="space-y-2">
                  {mounted && Array.from(new Set(suspiciousAccounts.map(a => a.ticketName))).map((ticketName, index) => {
                    const ticketAccounts = suspiciousAccounts.filter(a => a.ticketName === ticketName);
                    const totalPurchases = ticketAccounts.reduce((sum, a) => sum + a.purchaseCount, 0);
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700 truncate">{ticketName}</span>
                          <span className="font-semibold text-gray-900 ml-2">{totalPurchases}건</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-red-600 h-1.5 rounded-full"
                            style={{ width: `${stats.totalSuspiciousPurchases > 0 ? (totalPurchases / stats.totalSuspiciousPurchases) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">계정 상태 분포</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">활성 계정</span>
                    <span className="text-xl font-bold text-green-600">{mounted ? stats.activeAccounts : 0}개</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-gray-700">정지 계정</span>
                    <span className="text-xl font-bold text-red-600">{mounted ? stats.suspendedAccounts : 0}개</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">전체 의심 계정</span>
                    <span className="text-xl font-bold text-blue-600">{mounted ? stats.totalAccounts : 0}개</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 데이터 수정 버튼 (좌측 하단) */}
      {mounted && (
        <>
          <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium"
            >
              데이터 수정
            </button>
          </div>

          {/* 모니터링 설정 모달 */}
          {showModal && (
            <MonitorConfigModal
              config={monitorConfig}
              tickets={ticketConfig}
              onSave={handleSaveConfig}
              onClose={() => setShowModal(false)}
              onAddTicket={handleAddTicket}
              onRemoveTicket={handleRemoveTicket}
              onTicketChange={handleTicketChange}
            />
          )}
        </>
      )}
    </div>
  );
}

// 모니터링 설정 모달 컴포넌트
function MonitorConfigModal({
  config,
  tickets,
  onSave,
  onClose,
  onAddTicket,
  onRemoveTicket,
  onTicketChange,
}: {
  config: MonitorConfig;
  tickets: TicketConfig[];
  onSave: (config: MonitorConfig, tickets: TicketConfig[]) => void;
  onClose: () => void;
  onAddTicket: (tickets: TicketConfig[]) => TicketConfig[];
  onRemoveTicket: (tickets: TicketConfig[], index: number) => TicketConfig[];
  onTicketChange: (index: number, field: keyof TicketConfig, value: any) => void;
}) {
  const [formData, setFormData] = useState<MonitorConfig>(config);
  const [purchaseCounts, setPurchaseCounts] = useState<string>(config.suspiciousPurchaseCounts.join(', '));
  const [ticketList, setTicketList] = useState<TicketConfig[]>(tickets);

  // 모달이 열릴 때마다 초기값으로 리셋
  useEffect(() => {
    setFormData(config);
    setPurchaseCounts(config.suspiciousPurchaseCounts.join(', '));
    setTicketList(tickets);
  }, [config, tickets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const counts = purchaseCounts.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    onSave({
      ...formData,
      suspiciousPurchaseCounts: counts.length > 0 ? counts : [10, 12, 14],
    }, ticketList);
  };

  const handleAddTicketClick = () => {
    setTicketList(onAddTicket(ticketList));
  };

  const handleRemoveTicketClick = (index: number) => {
    setTicketList(onRemoveTicket(ticketList, index));
  };

  const handleTicketFieldChange = (index: number, field: keyof TicketConfig, value: any) => {
    const updated = [...ticketList];
    if (field === 'availableDates') {
      updated[index] = { ...updated[index], availableDates: { ...updated[index].availableDates, ...value } };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setTicketList(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">모니터링 설정 관리</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 티켓 설정 섹션 */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">티켓 설정</h3>
              <button
                type="button"
                onClick={handleAddTicketClick}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                티켓 추가
              </button>
            </div>
            <div className="space-y-3">
              {ticketList.map((ticket, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">티켓 {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveTicketClick(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">티켓명</label>
                      <input
                        type="text"
                        value={ticket.ticketName}
                        onChange={(e) => handleTicketFieldChange(index, 'ticketName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="티켓명을 입력하세요"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">기준 가격 (원)</label>
                      <input
                        type="number"
                        value={ticket.basePrice}
                        onChange={(e) => handleTicketFieldChange(index, 'basePrice', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="100000"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">판매 시작일</label>
                      <input
                        type="date"
                        value={ticket.availableDates.start}
                        onChange={(e) => handleTicketFieldChange(index, 'availableDates', { start: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">판매 종료일</label>
                      <input
                        type="date"
                        value={ticket.availableDates.end}
                        onChange={(e) => handleTicketFieldChange(index, 'availableDates', { end: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 모니터링 설정 섹션 */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">모니터링 설정</h3>
            <div className="space-y-3">
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정상 구매자 수</label>
            <input
              type="number"
              value={formData.normalBuyerCount}
              onChange={(e) => setFormData({ ...formData, normalBuyerCount: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">의심 계정 수</label>
            <input
              type="number"
              value={formData.suspiciousBuyerCount}
              onChange={(e) => setFormData({ ...formData, suspiciousBuyerCount: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">티켓당 정상 구매 건수</label>
            <input
              type="number"
              value={formData.normalPurchasePerTicket}
              onChange={(e) => setFormData({ ...formData, normalPurchasePerTicket: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">의심 계정별 구매 건수 (쉼표로 구분)</label>
            <input
              type="text"
              value={purchaseCounts}
              onChange={(e) => setPurchaseCounts(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10, 12, 14"
              required
            />
            <p className="text-xs text-gray-500 mt-1">예: 10, 12, 14 (의심 계정 1번은 10건, 2번은 12건, 3번은 14건 구매)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">의심 계정 판단 임계값</label>
            <input
              type="number"
              value={formData.suspiciousThreshold}
              onChange={(e) => setFormData({ ...formData, suspiciousThreshold: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">동일 티켓에 이 건수 이상 구매하면 의심 계정으로 분류</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
