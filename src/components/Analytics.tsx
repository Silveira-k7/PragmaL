import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, Clock, Brain, Download, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface AnalyticsData {
  period: string;
  reservations: number;
  rooms: number;
  teachers: number;
  hours: number;
}

interface TeacherStats {
  name: string;
  reservations: number;
  hours: number;
}

interface RoomStats {
  name: string;
  reservations: number;
  utilization: number;
}

type PeriodType = 'week' | 'month' | 'year';

export const Analytics = () => {
  const { blocks, rooms, getAllReservations } = useStore();
  const { isAdmin } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [teacherStats, setTeacherStats] = useState<TeacherStats[]>([]);
  const [roomStats, setRoomStats] = useState<RoomStats[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Cores para os gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    generateAnalytics();
    generateAIInsights();
  }, [selectedPeriod, selectedYear]);

  const generateAnalytics = () => {
    setLoading(true);
    
    // Obter todas as reservas
    const allReservations = getAllReservations();
    
    try {
      let periods: Date[] = [];
      const yearStart = new Date(selectedYear, 0, 1);
      const yearEnd = new Date(selectedYear, 11, 31);

      switch (selectedPeriod) {
        case 'week':
          periods = eachWeekOfInterval({ start: yearStart, end: yearEnd });
          break;
        case 'month':
          periods = eachMonthOfInterval({ start: yearStart, end: yearEnd });
          break;
        case 'year':
          const currentYear = new Date().getFullYear();
          for (let year = currentYear - 4; year <= currentYear; year++) {
            periods.push(new Date(year, 0, 1));
          }
          break;
      }

      const analytics: AnalyticsData[] = periods.map(period => {
        let start: Date, end: Date, label: string;

        switch (selectedPeriod) {
          case 'week':
            start = startOfWeek(period);
            end = endOfWeek(period);
            label = format(period, "'Semana' w", { locale: ptBR });
            break;
          case 'month':
            start = startOfMonth(period);
            end = endOfMonth(period);
            label = format(period, 'MMM yyyy', { locale: ptBR });
            break;
          case 'year':
            start = startOfYear(period);
            end = endOfYear(period);
            label = format(period, 'yyyy');
            break;
        }

        const periodReservations = allReservations.filter(res => {
          const resDate = new Date(res.start_time);
          return resDate >= start && resDate <= end;
        });

        const uniqueRooms = new Set(periodReservations.map(res => res.room_id)).size;
        const uniqueTeachers = new Set(periodReservations.map(res => res.teacher_name)).size;
        const totalHours = periodReservations.reduce((acc, res) => {
          const duration = (new Date(res.end_time).getTime() - new Date(res.start_time).getTime()) / (1000 * 60 * 60);
          return acc + duration;
        }, 0);

        return {
          period: label,
          reservations: periodReservations.length,
          rooms: uniqueRooms,
          teachers: uniqueTeachers,
          hours: Math.round(totalHours * 10) / 10
        };
      });

      setAnalyticsData(analytics);

      // Estatísticas por professor
      const teacherMap = new Map<string, { reservations: number; hours: number }>();
      allReservations.forEach(res => {
        const duration = (new Date(res.end_time).getTime() - new Date(res.start_time).getTime()) / (1000 * 60 * 60);
        const current = teacherMap.get(res.teacher_name) || { reservations: 0, hours: 0 };
        teacherMap.set(res.teacher_name, {
          reservations: current.reservations + 1,
          hours: current.hours + duration
        });
      });

      const teacherStatsArray: TeacherStats[] = Array.from(teacherMap.entries())
        .map(([name, stats]) => ({
          name,
          reservations: stats.reservations,
          hours: Math.round(stats.hours * 10) / 10
        }))
        .sort((a, b) => b.reservations - a.reservations)
        .slice(0, 10);

      setTeacherStats(teacherStatsArray);

      // Estatísticas por sala
      const roomMap = new Map<string, number>();
      allReservations.forEach(res => {
        const current = roomMap.get(res.room_id) || 0;
        roomMap.set(res.room_id, current + 1);
      });

      const roomStatsArray: RoomStats[] = rooms.map(room => {
        const reservationCount = roomMap.get(room.id) || 0;
        const block = blocks.find(b => b.id === room.block_id);
        return {
          name: `${block?.name} - ${room.name}`,
          reservations: reservationCount,
          utilization: Math.round((reservationCount / Math.max(allReservations.length, 1)) * 100)
        };
      }).sort((a, b) => b.reservations - a.reservations);

      setRoomStats(roomStatsArray);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = () => {
    const insights: string[] = [];
    const allReservations = getAllReservations();
    
    if (allReservations.length === 0) {
      insights.push("📊 Nenhum agendamento encontrado para análise.");
      setAiInsights(insights);
      return;
    }

    // Análise de tendências
    const totalReservations = allReservations.length;
    const avgPerMonth = totalReservations / 12;
    
    if (avgPerMonth > 50) {
      insights.push("📈 Alto volume de agendamentos detectado. Sistema está sendo bem utilizado!");
    } else if (avgPerMonth < 10) {
      insights.push("📉 Baixo volume de agendamentos. Considere campanhas de divulgação do sistema.");
    }

    // Análise de horários
    const hourMap = new Map<number, number>();
    allReservations.forEach(res => {
      const hour = new Date(res.start_time).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    const peakHour = Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1])[0];
    if (peakHour) {
      insights.push(`⏰ Horário de pico: ${peakHour[0]}:00 com ${peakHour[1]} agendamentos.`);
    }

    // Análise de professores
    const teacherCount = new Set(allReservations.map(res => res.teacher_name)).size;
    if (teacherCount > 20) {
      insights.push("👥 Grande diversidade de professores utilizando o sistema.");
    }

    // Análise de salas
    const roomUsage = new Map<string, number>();
    allReservations.forEach(res => {
      roomUsage.set(res.room_id, (roomUsage.get(res.room_id) || 0) + 1);
    });

    const underutilizedRooms = rooms.filter(room => (roomUsage.get(room.id) || 0) < 5);
    if (underutilizedRooms.length > 0) {
      insights.push(`🏢 ${underutilizedRooms.length} salas com baixa utilização. Considere redistribuição de recursos.`);
    }

    // Análise de eficiência
    const avgDuration = allReservations.reduce((acc, res) => {
      const duration = (new Date(res.end_time).getTime() - new Date(res.start_time).getTime()) / (1000 * 60 * 60);
      return acc + duration;
    }, 0) / allReservations.length;

    if (avgDuration > 2) {
      insights.push("⏱️ Duração média das aulas é alta. Boa utilização do tempo disponível.");
    }

    setAiInsights(insights);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Relatório de Análise - PRAGMA', 20, 30);
    
    doc.setFontSize(12);
    let yPosition = 50;
    
    doc.text(`Período: ${selectedPeriod} - ${selectedYear}`, 20, yPosition);
    yPosition += 20;
    
    doc.text('Insights da IA:', 20, yPosition);
    yPosition += 10;
    
    aiInsights.forEach(insight => {
      doc.text(insight, 20, yPosition);
      yPosition += 10;
    });
    
    doc.save(`pragma-analytics-${selectedYear}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Dados analíticos
    const ws1 = XLSX.utils.json_to_sheet(analyticsData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Dados Analíticos');
    
    // Estatísticas de professores
    const ws2 = XLSX.utils.json_to_sheet(teacherStats);
    XLSX.utils.book_append_sheet(wb, ws2, 'Professores');
    
    // Estatísticas de salas
    const ws3 = XLSX.utils.json_to_sheet(roomStats);
    XLSX.utils.book_append_sheet(wb, ws3, 'Salas');
    
    XLSX.writeFile(wb, `pragma-analytics-${selectedYear}.xlsx`);
  };

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-slate-800">Analytics IA - PRAGMA</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Filtros de Análise</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="week">Semanal</option>
              <option value="month">Mensal</option>
              <option value="year">Anual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ano
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Insights da IA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-800">Insights da IA</h3>
        </div>
        <div className="space-y-3">
          {aiInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <p className="text-slate-700">{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Agendamentos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Agendamentos por {selectedPeriod === 'week' ? 'Semana' : selectedPeriod === 'month' ? 'Mês' : 'Ano'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reservations" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Horas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Horas de Uso
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="hours" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Professores */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            Top Professores
          </h3>
          <div className="space-y-3">
            {teacherStats.slice(0, 5).map((teacher, index) => (
              <div key={teacher.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-700">{teacher.name}</p>
                  <p className="text-sm text-slate-500">{teacher.hours}h de aulas</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600">{teacher.reservations}</p>
                  <p className="text-xs text-slate-500">agendamentos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Utilização de Salas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Utilização de Salas
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roomStats.slice(0, 6)}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="reservations"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {roomStats.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumo Estatístico */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Resumo Estatístico</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{getAllReservations().length}</p>
            <p className="text-sm text-slate-600">Total de Agendamentos</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{new Set(getAllReservations().map(r => r.teacher_name)).size}</p>
            <p className="text-sm text-slate-600">Professores Únicos</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{rooms.length}</p>
            <p className="text-sm text-slate-600">Salas Disponíveis</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{blocks.length}</p>
            <p className="text-sm text-slate-600">Blocos Cadastrados</p>
          </div>
        </div>
      </div>
    </div>
  );
};