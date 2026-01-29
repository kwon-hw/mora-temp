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
  stock: number;
  sold: number;
}

interface Transaction {
  id: string;
  ticketName: string;
  transactionDate: string;
  buyerAddress: string;
  paymentAmount: number;
  paymentStatus: '완료' | '대기' | '취소';
}

interface DataStructure {
  ticketConfig: TicketConfig[];
  transactions: Transaction[];
}

// 숫자 포맷팅 함수 (고정된 형식)
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function AdminPage() {
  const [ticketConfig, setTicketConfig] = useState<TicketConfig[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketConfig | null>(null);
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서만 데이터 초기화
  useEffect(() => {
    setMounted(true);
    
    // 티켓 설정 초기화 (고정된 판매량으로)
    const initialTickets = (transactionsData as DataStructure).ticketConfig?.map((t, index) => ({
      ...t,
      stock: 1000,
      sold: [120, 85, 200, 45, 150][index] || 0, // 고정된 값
    })) || [];
    setTicketConfig(initialTickets);

    // 판매 내역 예시 데이터 생성
    const sampleTransactions: Transaction[] = [];
    const buyerAddresses = ['user1@example.com', 'user2@example.com', 'user3@example.com', 'user4@example.com', 'user5@example.com'];
    const statuses: ('완료' | '대기' | '취소')[] = ['완료', '완료', '완료', '대기', '완료'];
    
    initialTickets.forEach((ticket, ticketIndex) => {
      // 각 티켓당 10개씩 판매 내역 생성
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
        const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        
        sampleTransactions.push({
          id: `#${1289000000 + ticketIndex * 10 + i}`,
          ticketName: ticket.ticketName,
          transactionDate: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${hours}:${minutes}`,
          buyerAddress: buyerAddresses[i % buyerAddresses.length],
          paymentAmount: ticket.basePrice + Math.floor(Math.random() * ticket.basePrice * 0.2) - ticket.basePrice * 0.1,
          paymentStatus: statuses[i % statuses.length],
        });
      }
    });
    
    setAllTransactions(sampleTransactions);
  }, []);

  // 통계 계산
  const stats = useMemo(() => {
    const totalTickets = ticketConfig.length;
    const totalStock = ticketConfig.reduce((sum, t) => sum + t.stock, 0);
    const totalSold = ticketConfig.reduce((sum, t) => sum + t.sold, 0);
    const totalRevenue = allTransactions
      .filter(t => t.paymentStatus === '완료')
      .reduce((sum, t) => sum + t.paymentAmount, 0);
    const todaySales = allTransactions.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return t.transactionDate.includes(today.replace(/-/g, '.')) && t.paymentStatus === '완료';
    }).length;

    return {
      totalTickets,
      totalStock,
      totalSold,
      totalRevenue,
      todaySales,
      sellRate: totalStock > 0 ? ((totalSold / totalStock) * 100).toFixed(1) : '0',
    };
  }, [ticketConfig, allTransactions]);

  // 티켓 추가/수정
  const handleSaveTicket = (ticket: TicketConfig) => {
    if (editingTicket) {
      const index = ticketConfig.findIndex((_, i) => i === selectedTicket);
      const updated = [...ticketConfig];
      updated[index] = ticket;
      setTicketConfig(updated);
    } else {
      setTicketConfig([...ticketConfig, ticket]);
    }
    setShowTicketModal(false);
    setEditingTicket(null);
    setSelectedTicket(null);
  };

  const handleDeleteTicket = (index: number) => {
    setTicketConfig(ticketConfig.filter((_, i) => i !== index));
  };

  const handleEditTicket = (index: number) => {
    setSelectedTicket(index);
    setEditingTicket(ticketConfig[index]);
    setShowTicketModal(true);
  };

  const handleAddTicket = () => {
    setEditingTicket(null);
    setSelectedTicket(null);
    setShowTicketModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">티켓 관리 플랫폼</h1>
              <p className="text-xs text-gray-500 mt-0.5">활용 확산을 위한 개방형 플랫폼</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">운영자</div>
                <div className="text-sm font-semibold text-gray-900">티켓 운영자</div>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                T
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 - 한 페이지에 모든 내용 */}
      <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">전체 티켓</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">총 판매량</p>
                <p className="text-2xl font-bold text-gray-900">{mounted ? formatNumber(stats.totalSold) : '0'}</p>
                <p className="text-xs text-gray-400 mt-0.5">재고: {mounted ? formatNumber(stats.totalStock) : '0'}</p>
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
                <p className="text-xs text-gray-500 mb-1">총 매출</p>
                <p className="text-2xl font-bold text-gray-900">{mounted ? formatNumber(stats.totalRevenue) : '0'}원</p>
                <p className="text-xs text-gray-400 mt-0.5">오늘: {mounted ? stats.todaySales : 0}건</p>
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
                <p className="text-xs text-gray-500 mb-1">판매율</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sellRate}%</p>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${stats.sellRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 티켓 관리 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">티켓 관리</h2>
            <button
              onClick={handleAddTicket}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              티켓 추가
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ticketConfig.map((ticket, index) => (
                <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{ticket.ticketName}</h3>
                      <p className="text-xl font-bold text-blue-600 mb-1">{mounted ? formatNumber(ticket.basePrice) : '0'}원</p>
                      <p className="text-xs text-gray-500">
                        {ticket.availableDates.start} ~ {ticket.availableDates.end}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditTicket(index)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(index)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="text-gray-500">재고</span>
                      <span className="font-semibold text-gray-900">{mounted ? formatNumber(ticket.stock) : '0'}개</span>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-xs">
                      <span className="text-gray-500">판매량</span>
                      <span className="font-semibold text-green-600">{mounted ? formatNumber(ticket.sold) : '0'}개</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${ticket.stock > 0 ? (ticket.sold / ticket.stock) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 판매 내역 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">판매 내역</h2>
          </div>
          <div className="p-4">
            {mounted && allTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">거래 ID</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">티켓명</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">구매자</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">거래일자</th>
                      <th className="text-right py-2 px-3 text-gray-600 font-medium">결제 금액</th>
                      <th className="text-center py-2 px-3 text-gray-600 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.map((transaction, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-900">{transaction.id}</td>
                        <td className="py-2 px-3 text-gray-900">{transaction.ticketName}</td>
                        <td className="py-2 px-3 text-gray-600">{transaction.buyerAddress}</td>
                        <td className="py-2 px-3 text-gray-600">{transaction.transactionDate}</td>
                        <td className="py-2 px-3 text-right font-semibold text-gray-900">{formatNumber(transaction.paymentAmount)}원</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            transaction.paymentStatus === '완료' 
                              ? 'bg-green-100 text-green-700' 
                              : transaction.paymentStatus === '대기'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">판매 내역이 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 통계 분석 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">통계 분석</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">티켓별 판매 현황</h3>
                <div className="space-y-2">
                  {ticketConfig.map((ticket, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 truncate">{ticket.ticketName}</span>
                        <span className="font-semibold text-gray-900 ml-2">{mounted ? ticket.sold : 0}개</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${stats.totalSold > 0 ? (ticket.sold / stats.totalSold) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">매출 통계</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">총 매출</span>
                    <span className="text-xl font-bold text-blue-600">{mounted ? formatNumber(stats.totalRevenue) : '0'}원</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">평균 판매가</span>
                    <span className="text-lg font-semibold text-green-600">
                      {mounted && stats.totalSold > 0 ? formatNumber(Math.floor(stats.totalRevenue / stats.totalSold)) : '0'}원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 티켓 추가/수정 모달 */}
      {showTicketModal && (
        <TicketModal
          ticket={editingTicket}
          onSave={handleSaveTicket}
          onClose={() => {
            setShowTicketModal(false);
            setEditingTicket(null);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
}

// 티켓 모달 컴포넌트
function TicketModal({
  ticket,
  onSave,
  onClose,
}: {
  ticket: TicketConfig | null;
  onSave: (ticket: TicketConfig) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<TicketConfig>(
    ticket || {
      ticketName: '',
      availableDates: { start: '2024-01-01', end: '2025-12-31' },
      basePrice: 0,
      stock: 1000,
      sold: 0,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ticketName && formData.basePrice > 0) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {ticket ? '티켓 수정' : '새 티켓 추가'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">티켓명</label>
            <input
              type="text"
              value={formData.ticketName}
              onChange={(e) => setFormData({ ...formData, ticketName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 콘서트 VIP 티켓"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">판매 시작일</label>
              <input
                type="date"
                value={formData.availableDates.start}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    availableDates: { ...formData.availableDates, start: e.target.value },
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">판매 종료일</label>
              <input
                type="date"
                value={formData.availableDates.end}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    availableDates: { ...formData.availableDates, end: e.target.value },
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">기준 가격 (원)</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="100000"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">재고 수량</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1000"
                required
                min="0"
              />
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
              {ticket ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
