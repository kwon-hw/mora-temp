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

// 데이터 구조 타입
interface DataStructure {
  ticketConfig: TicketConfig[];
  transactions: Transaction[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'collection' | 'transaction' | 'settlement'>('transaction');
  const [searchCategory, setSearchCategory] = useState('상품명');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'전체' | '환불 요청'>('전체');
  const [dateRange, setDateRange] = useState({ start: '2024-01-16', end: '2025-01-16' });
  const [selectedDateQuick, setSelectedDateQuick] = useState<string | null>('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortOrder, setSortOrder] = useState('등록일순');
  const [showModal, setShowModal] = useState(false);
  const [ticketConfig, setTicketConfig] = useState<TicketConfig[]>((transactionsData as DataStructure).ticketConfig || []);
  const [allData, setAllData] = useState<Transaction[]>([]);

  const sellerAddresses = ['justin.jetmarket', 'alice.ticket', 'bob.seller', 'charlie.market', 'diana.trade'];

  // 티켓 설정을 기반으로 거래 내역 생성
  const generateTransactions = (config: TicketConfig[]): Transaction[] => {
    const transactions: Transaction[] = [];
    let transactionId = 1289031741;

    // 각 티켓 설정에 대해 거래 내역 생성
    config.forEach((ticket) => {
      // 각 티켓당 약 24개씩 생성 (총 120개 정도)
      const transactionsPerTicket = Math.floor(120 / config.length);
      
      for (let i = 0; i < transactionsPerTicket; i++) {
        const startDate = new Date(ticket.availableDates.start);
        const endDate = new Date(ticket.availableDates.end);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const randomTime = startDate.getTime() + Math.random() * timeDiff;
        const transactionDate = new Date(randomTime);
        
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        
        // 기준 금액의 ±50% 범위로 랜덤 생성
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

  // 티켓 설정 변경 시 거래 내역 재생성
  useEffect(() => {
    const generatedTransactions = generateTransactions(ticketConfig);
    setAllData(generatedTransactions);
  }, [ticketConfig]);

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    let filtered = [...allData];
    
    // 검색 필터
    if (searchQuery) {
      if (searchCategory === '상품명') {
        filtered = filtered.filter(item => item.ticketName.includes(searchQuery));
      }
    }
    
    // 상태 필터
    if (statusFilter === '환불 요청') {
      filtered = filtered.filter(item => item.refundStatus === '환불 요청');
    }
    
    return filtered;
  }, [allData, searchQuery, searchCategory, statusFilter]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // 통계 계산 (전체 데이터 기준)
  const totalCount = allData.length;
  const refundRequestCount = allData.filter(item => item.refundStatus === '환불 요청').length;
  const refundCompletedCount = allData.filter(item => item.refundStatus === '환불 완료').length;

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('전체');
    setDateRange({ start: '2024-01-16', end: '2025-01-16' });
    setSelectedDateQuick(null);
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
    // 여기서 실제로 JSON 파일을 저장할 수도 있지만, 브라우저에서는 불가능하므로
    // 상태만 업데이트 (실제 저장은 서버 API 필요)
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-6">
        {/* 헤더 */}
        <h1 className="text-2xl font-bold mb-6">N차 거래</h1>

        {/* 탭 네비게이션 */}
        <div className="flex gap-4 border-b mb-6">
          <button
            onClick={() => setActiveTab('collection')}
            className={`pb-3 px-2 ${activeTab === 'collection' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-gray-600'}`}
          >
            컬렉션 관리
          </button>
          <button
            onClick={() => setActiveTab('transaction')}
            className={`pb-3 px-2 ${activeTab === 'transaction' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-gray-600'}`}
          >
            거래내역 관리
          </button>
          <button
            onClick={() => setActiveTab('settlement')}
            className={`pb-3 px-2 ${activeTab === 'settlement' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-gray-600'}`}
          >
            정산관리
          </button>
        </div>

        {/* 거래 요약 */}
        <div className="flex mb-6 text-sm text-black font-bold">
          전체 <span className="text-blue-500 font-bold mx-1 underline ">{totalCount}</span>건<div className="flex w-5"></div>
          환불 요청 <span className="text-blue-500 font-bold mx-1 underline ">{refundRequestCount}</span>건<div className="flex w-5"></div>
          환불 완료 <span className="text-blue-500 font-bold mx-1 underline ">{refundCompletedCount}</span>건<div className="flex w-5"></div>
        </div>

        {/* 검색 및 필터 섹션 */}
        <div className="mb-6">
          <div className="border border-gray-300 rounded overflow-hidden">
            <table className="w-full border-collapse">
              <tbody>
                {/* 검색분류 */}
                <tr className="border-b border-gray-300">
                  <td className="px-4 py-3 border-r border-gray-300 bg-gray-50 w-40">
                    <label className="text-sm font-medium text-gray-700">검색분류</label>
                  </td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3 border-r border-gray-300 bg-gray-50 w-20">
                    <label className="text-sm font-medium text-gray-700">상태</label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="전체"
                          checked={statusFilter === '전체'}
                          onChange={(e) => setStatusFilter(e.target.value as '전체' | '환불 요청')}
                          className="mr-2 accent-black"
                        />
                        <span className="text-sm">전체</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="환불 요청"
                          checked={statusFilter === '환불 요청'}
                          onChange={(e) => setStatusFilter(e.target.value as '전체' | '환불 요청')}
                          className="mr-2 accent-black"
                        />
                        <span className="text-sm">환불 요청</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* 날짜 */}
                <tr>
                  <td className="px-4 py-3 border-r border-gray-300 bg-gray-50 w-20 align-top">
                    <label className="text-sm font-medium text-gray-700 pt-2 block">날짜</label>
                  </td>
                  <td className="px-4 py-3">
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
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 검색 버튼 */}
          <div className="flex gap-2 justify-center px-4 pt-4 pb-4">
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

        {/* 거래내역 목록 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-700">총 {filteredData.length} 개</span>
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
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">거래 ID</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">티켓명</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">거래일자</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">판매자 주소</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">결제 금액(원)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">결제 상태</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">소유권 이전</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">환불 요청 상태</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.id}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.ticketName}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.transactionDate}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.sellerAddress}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.paymentAmount.toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.paymentStatus}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.ownershipTransfer}</td>
                    <td className={`border border-gray-300 px-4 py-3 text-sm ${
                      item.refundStatus === '환불 요청' ? 'text-orange-600' : 
                      item.refundStatus === '환불 완료' ? 'text-green-600' : ''
                    }`}>
                      {item.refundStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              이전
            </button>
            {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 6) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 border rounded ${
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
              className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {/* 데이터 수정 버튼 */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium"
      >
        데이터 수정
      </button>

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
