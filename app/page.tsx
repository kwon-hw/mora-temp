'use client';

import { useState, useMemo, useEffect } from 'react';
import transactionsData from '../data/transactions.json';

// 티켓 설정 타입 정의
interface TicketConfig {
  ticketName: string;
  availableDates: {
    start: string;
    end: string;
  };
  basePrice: number;
}

// 거래 내역 타입 정의
interface Transaction {
  id: string;
  ticketName: string;
  transactionDate: string;
  sellerAddress: string;
  paymentAmount: number;
  paymentStatus: '완료' | '대기' | '취소';
  ownershipTransfer: '완료' | '대기' | '진행중';
  refundStatus: '환불 요청' | '환불 완료' | '-';
}

// 정산 데이터 타입 정의
interface Settlement {
  id: string;
  ticketName: string;
  transactionDate: string;
  sellerAddress: string;
  saleAmount: number;
  commission: number;
  finalAmount: number;
  settlementDate: string;
  settlementStatus: '정산 완료' | '정산 진행중';
}

// 데이터 구조 타입
interface DataStructure {
  ticketConfig: TicketConfig[];
  transactions: Transaction[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'collection' | 'transaction' | 'settlement'>('settlement');
  const [searchCategory, setSearchCategory] = useState('상품명');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'전체' | '정산 완료' | '정산 진행중'>('전체');
  const [dateRange, setDateRange] = useState({ start: '2024-01-16', end: '2025-01-16' });
  const [selectedDateQuick, setSelectedDateQuick] = useState<string | null>('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortOrder, setSortOrder] = useState('등록일순');
  const [showModal, setShowModal] = useState(false);
  const [showDataButton, setShowDataButton] = useState(true);
  const [ticketConfig, setTicketConfig] = useState<TicketConfig[]>((transactionsData as DataStructure).ticketConfig || []);
  const [allData, setAllData] = useState<Transaction[]>([]);
  const [settlementData, setSettlementData] = useState<Settlement[]>([]);

  const sellerAddresses = ['justin.jetmarket', 'alice.ticket', 'bob.seller', 'charlie.market', 'diana.trade'];

  // 티켓 설정을 기반으로 거래 내역 생성
  const generateTransactions = (config: TicketConfig[]): Transaction[] => {
    const transactions: Transaction[] = [];
    let transactionId = 1289031741;

    config.forEach((ticket) => {
      const transactionsPerTicket = Math.floor(120 / config.length);
      
      for (let i = 0; i < transactionsPerTicket; i++) {
        const startDate = new Date(ticket.availableDates.start);
        const endDate = new Date(ticket.availableDates.end);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const randomTime = startDate.getTime() + Math.random() * timeDiff;
        const transactionDate = new Date(randomTime);
        
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        
        const priceVariation = ticket.basePrice * 0.5;
        const paymentAmount = Math.floor(
          ticket.basePrice - priceVariation + Math.random() * (priceVariation * 2)
        );

        transactions.push({
          id: `#${transactionId++}`,
          ticketName: ticket.ticketName,
          transactionDate: `${transactionDate.getFullYear()}.${String(transactionDate.getMonth() + 1).padStart(2, '0')}.${String(transactionDate.getDate()).padStart(2, '0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
          sellerAddress: sellerAddresses[Math.floor(Math.random() * sellerAddresses.length)],
          paymentAmount: paymentAmount,
          paymentStatus: '완료',
          ownershipTransfer: '완료',
          refundStatus: i % 5 === 0 ? '환불 완료' : (i % 3 === 0 ? '환불 요청' : '-'),
        });
      }
    });

    return transactions;
  };

  // 거래 내역을 기반으로 정산 데이터 생성
  const generateSettlements = (transactions: Transaction[]): Settlement[] => {
    return transactions.map((transaction, index) => {
      const saleAmount = transaction.paymentAmount;
      const commission = Math.floor(saleAmount * 0.1); // 10% 수수료
      const finalAmount = saleAmount - commission;
      
      // 거래일자 기준으로 정산일자 생성 (거래일자 + 1~7일)
      const transactionDateObj = new Date(transaction.transactionDate.replace(/\./g, '-').split(' ')[0]);
      const settlementDays = Math.floor(Math.random() * 7) + 1;
      transactionDateObj.setDate(transactionDateObj.getDate() + settlementDays);
      const settlementDate = `${transactionDateObj.getFullYear()}.${String(transactionDateObj.getMonth() + 1).padStart(2, '0')}.${String(transactionDateObj.getDate()).padStart(2, '0')}`;
      
      return {
        id: transaction.id,
        ticketName: transaction.ticketName,
        transactionDate: transaction.transactionDate,
        sellerAddress: transaction.sellerAddress,
        saleAmount: saleAmount,
        commission: commission,
        finalAmount: finalAmount,
        settlementDate: settlementDate,
        settlementStatus: index % 2 === 0 ? '정산 완료' : '정산 진행중',
      };
    });
  };

  // 티켓 설정 변경 시 거래 내역 재생성
  useEffect(() => {
    const generatedTransactions = generateTransactions(ticketConfig);
    setAllData(generatedTransactions);
    const generatedSettlements = generateSettlements(generatedTransactions);
    setSettlementData(generatedSettlements);
  }, [ticketConfig]);

  // 필터링된 데이터
  const filteredSettlementData = useMemo(() => {
    let filtered = [...settlementData];
    
    // 검색 필터
    if (searchQuery) {
      if (searchCategory === '상품명') {
        filtered = filtered.filter(item => item.ticketName.includes(searchQuery));
      }
    }
    
    // 상태 필터
    if (statusFilter === '정산 완료') {
      filtered = filtered.filter(item => item.settlementStatus === '정산 완료');
    } else if (statusFilter === '정산 진행중') {
      filtered = filtered.filter(item => item.settlementStatus === '정산 진행중');
    }
    
    return filtered;
  }, [settlementData, searchQuery, searchCategory, statusFilter]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredSettlementData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredSettlementData.slice(startIndex, endIndex);

  // 통계 계산
  const totalCount = settlementData.length;
  const completedCount = settlementData.filter(item => item.settlementStatus === '정산 완료').length;
  const inProgressCount = settlementData.filter(item => item.settlementStatus === '정산 진행중').length;

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('전체');
    setDateRange({ start: '2024-01-16', end: '2025-01-16' });
    setSelectedDateQuick('전체');
    setCurrentPage(1);
  };

  const handleDateQuickSelect = (days: number | null, label: string) => {
    const endDate = new Date();
    const startDate = days !== null ? new Date() : null;
    if (startDate && days !== null) {
      startDate.setDate(startDate.getDate() - days);
    }
    
    setSelectedDateQuick(label);
    setDateRange({
      start: startDate ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}` : '2024-01-16',
      end: `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`,
    });
    setCurrentPage(1);
  };

  const handleTicketConfigChange = (index: number, field: keyof TicketConfig, value: any) => {
    const updated = [...ticketConfig];
    if (field === 'availableDates') {
      updated[index] = { ...updated[index], availableDates: { ...updated[index].availableDates, ...value } };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setTicketConfig(updated);
  };

  const handleAddTicket = () => {
    setTicketConfig([
      ...ticketConfig,
      {
        ticketName: '',
        availableDates: { start: '2024-01-01', end: '2025-12-31' },
        basePrice: 100000,
      },
    ]);
  };

  const handleRemoveTicket = (index: number) => {
    setTicketConfig(ticketConfig.filter((_, i) => i !== index));
  };

  const handleSaveConfig = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 왼쪽 네비게이션 바 */}
      <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">JetMarket</h1>
          <nav className="space-y-1">
            <div className="text-gray-500 text-sm mb-2">메뉴</div>
            <button className="w-full text-left px-4 py-1.5 text-gray-700 hover:bg-gray-100 rounded">
              회원
            </button>
            <button className="w-full text-left px-4 py-1.5 text-gray-700 hover:bg-gray-100 rounded">
              상품
            </button>
            <button className="w-full text-left px-4 py-1.5 text-gray-700 hover:bg-gray-100 rounded">
              주문
            </button>
            <button className="w-full text-left px-4 py-1.5 text-gray-700 hover:bg-gray-100 rounded">
              혜택
            </button>
            <button className="w-full text-left px-4 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded border-l-4 border-blue-600">
              N차 거래
            </button>
          </nav>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 p-4 min-w-0">
        <div className="w-full">
          {/* 헤더 */}
          <h1 className="text-2xl font-bold mb-3">N차 거래</h1>

          {/* 탭 네비게이션 */}
          <div className="flex gap-4 border-b mb-3">
            <button
              onClick={() => setActiveTab('collection')}
              className={`pb-2 px-2 ${activeTab === 'collection' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-gray-600'}`}
            >
              컬렉션 관리
            </button>
            <button
              onClick={() => setActiveTab('transaction')}
              className={`pb-2 px-2 ${activeTab === 'transaction' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-gray-600'}`}
            >
              거래내역 관리
            </button>
            <button
              onClick={() => setActiveTab('settlement')}
              className={`pb-2 px-2 ${activeTab === 'settlement' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-gray-600'}`}
            >
              정산관리
            </button>
          </div>

          {/* 정산 요약 */}
          <div className="flex mb-3 text-sm text-black font-bold">
            전체 <span className="text-blue-500 font-bold mx-1 underline">{totalCount}</span>건
            <div className="flex w-5"></div>
            정산 완료 <span className="text-blue-500 font-bold mx-1 underline">{completedCount}</span>건
            <div className="flex w-5"></div>
            정산 진행중 <span className="text-blue-500 font-bold mx-1 underline">{inProgressCount}</span>건
          </div>

          {/* 검색 및 필터 섹션 */}
          <div className="mb-3">
            <div className="border border-gray-300 rounded overflow-hidden bg-gray-50">
              <table className="w-full border-collapse">
                <tbody>
                  {/* 검색분류 */}
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-2 border-r border-gray-300 bg-gray-50 w-40">
                      <label className="text-sm font-medium text-gray-700">검색분류</label>
                    </td>
                    <td className="px-4 py-2 bg-gray-50">
                      <div className="flex gap-2">
                        <select
                          value={searchCategory}
                          onChange={(e) => setSearchCategory(e.target.value)}
                          className="border rounded px-3 py-2 text-sm min-w-[100px] bg-white"
                        >
                          <option>상품명</option>
                        </select>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="한글, 영문, 숫자, 공백 입력 가능"
                          className="flex-1 border rounded px-3 py-2 text-sm bg-white"
                        />
                      </div>
                    </td>
                  </tr>

                  {/* 상태 */}
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-2 border-r border-gray-300 bg-gray-50 w-40">
                      <label className="text-sm font-medium text-gray-700">상태</label>
                    </td>
                    <td className="px-4 py-2 bg-gray-50">
                      <div className="flex gap-6">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="전체"
                            checked={statusFilter === '전체'}
                            onChange={(e) => setStatusFilter(e.target.value as '전체' | '정산 완료' | '정산 진행중')}
                            className="mr-2 accent-black"
                          />
                          <span className="text-sm">전체</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="정산 완료"
                            checked={statusFilter === '정산 완료'}
                            onChange={(e) => setStatusFilter(e.target.value as '전체' | '정산 완료' | '정산 진행중')}
                            className="mr-2 accent-black"
                          />
                          <span className="text-sm">정산 완료</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="정산 진행중"
                            checked={statusFilter === '정산 진행중'}
                            onChange={(e) => setStatusFilter(e.target.value as '전체' | '정산 완료' | '정산 진행중')}
                            className="mr-2 accent-black"
                          />
                          <span className="text-sm">정산 진행중</span>
                        </label>
                      </div>
                    </td>
                  </tr>

                  {/* 날짜 */}
                  <tr>
                    <td className="px-4 py-2 border-r border-gray-300 bg-gray-50 w-40 align-top">
                      <label className="text-sm font-medium text-gray-700 pt-1 block">날짜</label>
                    </td>
                    <td className="px-4 py-2 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <select className="border rounded px-3 py-2 text-sm bg-white">
                          <option>거래일자</option>
                        </select>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleDateQuickSelect(0, '오늘')}
                            className={`px-3 py-1.5 text-xs border rounded hover:bg-gray-200 ${
                              selectedDateQuick === '오늘' ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-300'
                            }`}
                          >
                            오늘
                          </button>
                          <button
                            onClick={() => handleDateQuickSelect(7, '7일')}
                            className={`px-3 py-1.5 text-xs border rounded hover:bg-gray-200 ${
                              selectedDateQuick === '7일' ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-300'
                            }`}
                          >
                            7일
                          </button>
                          <button
                            onClick={() => handleDateQuickSelect(30, '1개월')}
                            className={`px-3 py-1.5 text-xs border rounded hover:bg-gray-200 ${
                              selectedDateQuick === '1개월' ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-300'
                            }`}
                          >
                            1개월
                          </button>
                          <button
                            onClick={() => handleDateQuickSelect(90, '3개월')}
                            className={`px-3 py-1.5 text-xs border rounded hover:bg-gray-200 ${
                              selectedDateQuick === '3개월' ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-300'
                            }`}
                          >
                            3개월
                          </button>
                          <button
                            onClick={() => handleDateQuickSelect(180, '6개월')}
                            className={`px-3 py-1.5 text-xs border rounded hover:bg-gray-200 ${
                              selectedDateQuick === '6개월' ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-300'
                            }`}
                          >
                            6개월
                          </button>
                          <button
                            onClick={() => handleDateQuickSelect(null, '전체')}
                            className={`px-3 py-1.5 text-xs border rounded hover:bg-gray-200 ${
                              selectedDateQuick === '전체' || selectedDateQuick === null ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-300'
                            }`}
                          >
                            전체
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                          className="border rounded px-3 py-2 text-sm bg-white"
                        />
                        <span className="text-gray-600">~</span>
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                          className="border rounded px-3 py-2 text-sm bg-white"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 검색 버튼 */}
            <div className="flex gap-2 justify-center px-4 pt-2 pb-2">
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded font-medium"
              >
                검색
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded font-medium"
              >
                초기화
              </button>
            </div>
          </div>

          {/* 정산 목록 */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">총 {filteredSettlementData.length} 개</span>
              <div className="flex gap-2">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option>등록일순</option>
                </select>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value={20}>20개씩보기</option>
                  <option value={50}>50개씩보기</option>
                  <option value={100}>100개씩보기</option>
                </select>
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">거래 ID</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">티켓명</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">거래일자</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">판매자 주소</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">판매 금액(원)</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">판매 수수료(원)</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">최종 정산 금액</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">정산일자</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">정산 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.id}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.ticketName}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.transactionDate}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.sellerAddress}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.saleAmount.toLocaleString()}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.commission.toLocaleString()}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.finalAmount.toLocaleString()}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.settlementDate}</td>
                      <td className={`border border-gray-300 px-4 py-2 text-sm ${
                        item.settlementStatus === '정산 완료' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {item.settlementStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center gap-1 mt-3">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                &lt;&lt;
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 10) {
                  pageNum = i + 1;
                } else if (currentPage <= 5) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 4) {
                  pageNum = totalPages - 9 + i;
                } else {
                  pageNum = currentPage - 4 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                &gt;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 데이터 수정 버튼 (좌측 하단) */}
      {showDataButton && (
        <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium"
          >
            데이터 수정
          </button>
          <button
            onClick={() => setShowDataButton(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
          >
            숨기기
          </button>
        </div>
      )}
      {!showDataButton && (
        <button
          onClick={() => setShowDataButton(true)}
          className="fixed bottom-6 left-6 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-40"
        >
          표시
        </button>
      )}

      {/* 팝업 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">티켓 설정 관리</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {ticketConfig.map((ticket, index) => (
                <div key={index} className="border border-gray-300 rounded p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">티켓 {index + 1}</h3>
                    <button
                      onClick={() => handleRemoveTicket(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">티켓명</label>
                      <input
                        type="text"
                        value={ticket.ticketName}
                        onChange={(e) => handleTicketConfigChange(index, 'ticketName', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="티켓명을 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">기준 금액 (원)</label>
                      <input
                        type="number"
                        value={ticket.basePrice}
                        onChange={(e) => handleTicketConfigChange(index, 'basePrice', Number(e.target.value))}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="기준 금액"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">거래 시작일</label>
                      <input
                        type="date"
                        value={ticket.availableDates.start}
                        onChange={(e) => handleTicketConfigChange(index, 'availableDates', { start: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">거래 종료일</label>
                      <input
                        type="date"
                        value={ticket.availableDates.end}
                        onChange={(e) => handleTicketConfigChange(index, 'availableDates', { end: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddTicket}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                티켓 추가
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium"
              >
                취소
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
