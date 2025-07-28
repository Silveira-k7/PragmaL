import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Calendar, Clock, Building2, BookOpen, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { format, addWeeks, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  data?: any;
}

interface SchedulingData {
  professor?: string;
  materia?: string;
  bloco?: string;
  sala?: string;
  horario?: string;
  data?: string;
  semanas?: number;
  duracao?: string;
  diaSemana?: string;
}

export const AISchedulingChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Olá! Sou o Luciano, assistente de agendamentos do PRAGMA.\n\nPara criar um agendamento, informe:\n• Nome do professor\n• Disciplina\n• Bloco (C, H15, H06, H03)\n• Dia da semana\n• Horário\n• Número de semanas (padrão: 16)\n\nExemplo: "Prof. João Silva, Cálculo I, Bloco C, segunda-feira às 08:00, 16 semanas"',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [schedulingData, setSchedulingData] = useState<SchedulingData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { blocks, rooms, addSemesterReservations, addReservation } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Horários predefinidos da faculdade
  const timeSlots = [
    { start: '07:10', end: '08:00' },
    { start: '08:00', end: '08:50' },
    { start: '08:50', end: '09:40' },
    { start: '09:55', end: '10:45' },
    { start: '10:45', end: '11:35' },
    { start: '11:35', end: '12:25' },
    { start: '13:15', end: '14:05' },
    { start: '14:05', end: '14:55' },
    { start: '15:10', end: '16:00' },
    { start: '16:00', end: '16:50' },
    { start: '16:50', end: '17:40' },
    { start: '18:30', end: '19:20' },
    { start: '19:20', end: '20:05' },
    { start: '20:05', end: '20:50' },
    { start: '21:05', end: '21:50' }
  ];

  const diasSemana = {
    'segunda': 1, 'segunda-feira': 1, 'seg': 1,
    'terça': 2, 'terça-feira': 2, 'ter': 2, 'terca': 2,
    'quarta': 3, 'quarta-feira': 3, 'qua': 3,
    'quinta': 4, 'quinta-feira': 4, 'qui': 4,
    'sexta': 5, 'sexta-feira': 5, 'sex': 5
  };

  const findBestTimeSlot = (timeInput: string) => {
    const hour = parseInt(timeInput.split(':')[0]);
    return timeSlots.find(slot => {
      const slotHour = parseInt(slot.start.split(':')[0]);
      return Math.abs(slotHour - hour) <= 1;
    }) || timeSlots[0];
  };

  const getNextDateForWeekday = (weekday: number) => {
    const today = new Date();
    const daysUntilNext = (weekday - today.getDay() + 7) % 7 || 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    return nextDate;
  };

  const processMessage = async (message: string) => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const lowerMessage = message.toLowerCase();
      let response = '';
      let newSchedulingData = { ...schedulingData };

      // Verificar se é confirmação ou cancelamento
      if (lowerMessage.includes('confirmar') || lowerMessage.includes('sim') || lowerMessage.includes('ok')) {
        const hasAllInfo = newSchedulingData.professor && 
                          newSchedulingData.materia && 
                          newSchedulingData.bloco && 
                          newSchedulingData.horario && 
                          newSchedulingData.data;

        if (hasAllInfo) {
          try {
            const blockRooms = rooms.filter(r => r.block_id === newSchedulingData.bloco);
            if (blockRooms.length === 0) {
              response = 'Não há salas disponíveis no bloco selecionado.\n\nPor favor, escolha outro bloco.';
            } else {
              const selectedRoom = newSchedulingData.sala 
                ? blockRooms.find(r => r.id === newSchedulingData.sala) || blockRooms[0]
                : blockRooms[0];
              
              const startDate = new Date(newSchedulingData.data!);
              const [startHour, startMinute] = newSchedulingData.horario!.split(':').map(Number);
              const [endHour, endMinute] = newSchedulingData.duracao!.split(':').map(Number);
              
              startDate.setHours(startHour, startMinute, 0, 0);
              const endDate = new Date(startDate);
              endDate.setHours(endHour, endMinute, 0, 0);
              
              const reservation = {
                room_id: selectedRoom.id,
                teacher_name: newSchedulingData.professor!,
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                purpose: newSchedulingData.materia!
              };
              
              const weeks = newSchedulingData.semanas || 16;
              
              await addSemesterReservations(reservation, weeks);
              
              const blockName = blocks.find(b => b.id === newSchedulingData.bloco)?.name;
              
              response = `✓ Agendamento criado com sucesso\n\n`;
              response += `Professor: ${newSchedulingData.professor}\n`;
              response += `Disciplina: ${newSchedulingData.materia}\n`;
              response += `Local: ${blockName} - ${selectedRoom.name}\n`;
              response += `Horário: ${newSchedulingData.horario} - ${newSchedulingData.duracao}\n`;
              response += `Início: ${format(startDate, 'dd/MM/yyyy')}\n`;
              response += `Total: ${weeks} aulas agendadas`;
              
              newSchedulingData = {};
              toast.success(`${weeks} aulas agendadas com sucesso!`);
            }
          } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            response = 'Erro ao criar o agendamento.\n\nTente novamente ou verifique os dados informados.';
            toast.error('Erro ao criar agendamento');
          }
        } else {
          response = 'Informações incompletas.\n\nPor favor, forneça todos os dados necessários antes de confirmar.';
        }
      } else if (lowerMessage.includes('cancelar') || lowerMessage.includes('não') || lowerMessage.includes('nao')) {
        newSchedulingData = {};
        response = 'Agendamento cancelado.\n\nPosso ajudar com um novo agendamento?';
      } else {
        // Extrair informações da mensagem
        
        // Professor
        if (!newSchedulingData.professor) {
          const profMatches = [
            message.match(/prof\.?\s*([a-záêçõ\s]+?)(?:\s*,|\s*de|\s*-|\s*$)/i),
            message.match(/professor\s+([a-záêçõ\s]+?)(?:\s*,|\s*de|\s*-|\s*$)/i),
            message.match(/([a-záêçõ\s]+?)\s*(?:vai dar|dará|ensina)/i)
          ];
          
          for (const match of profMatches) {
            if (match) {
              const profName = match[1].trim();
              if (profName.length > 2) {
                newSchedulingData.professor = profName.startsWith('Prof') ? profName : `Prof. ${profName}`;
                break;
              }
            }
          }
        }

        // Matéria
        if (!newSchedulingData.materia) {
          const materias = [
            'cálculo', 'álgebra', 'física', 'química', 'programação', 'estruturas de dados',
            'banco de dados', 'engenharia de software', 'redes', 'inteligência artificial',
            'sistemas operacionais', 'estatística', 'metodologia', 'gestão', 'marketing',
            'contabilidade', 'administração', 'direito', 'psicologia', 'logística',
            'matemática', 'português', 'inglês', 'história', 'geografia', 'biologia'
          ];
          
          for (const materia of materias) {
            if (lowerMessage.includes(materia)) {
              newSchedulingData.materia = materia.charAt(0).toUpperCase() + materia.slice(1);
              break;
            }
          }
          
          if (!newSchedulingData.materia) {
            const materiaMatch = message.match(/(?:de|da|do)\s+([a-záêçõ\s]+?)(?:\s*,|\s*no|\s*em|\s*$)/i);
            if (materiaMatch) {
              const materia = materiaMatch[1].trim();
              if (materia.length > 3 && !materia.includes('bloco')) {
                newSchedulingData.materia = materia.charAt(0).toUpperCase() + materia.slice(1);
              }
            }
          }
        }

        // Bloco
        if (!newSchedulingData.bloco) {
          const blocoMatches = [
            message.match(/bloco\s*([ch]\d*)/i),
            message.match(/\b([ch]\d+)\b/i),
            message.match(/\b(h\d+)\b/i)
          ];
          
          for (const match of blocoMatches) {
            if (match) {
              const blocoName = match[1].toUpperCase();
              const foundBlock = blocks.find(b => 
                b.name.toUpperCase().includes(blocoName) || 
                b.name.toUpperCase() === blocoName
              );
              if (foundBlock) {
                newSchedulingData.bloco = foundBlock.id;
                break;
              }
            }
          }
        }

        // Horário
        if (!newSchedulingData.horario) {
          const horarioMatches = [
            message.match(/(\d{1,2}):(\d{2})/),
            message.match(/(\d{1,2})h(\d{2})?/),
            message.match(/às?\s*(\d{1,2}):?(\d{2})?/i)
          ];
          
          for (const match of horarioMatches) {
            if (match) {
              const hour = match[1].padStart(2, '0');
              const minute = match[2] ? match[2].padStart(2, '0') : '00';
              const timeString = `${hour}:${minute}`;
              
              const matchingSlot = findBestTimeSlot(timeString);
              if (matchingSlot) {
                newSchedulingData.horario = matchingSlot.start;
                newSchedulingData.duracao = matchingSlot.end;
                break;
              }
            }
          }
        }

        // Dia da semana e data
        if (!newSchedulingData.data) {
          for (const [dia, numero] of Object.entries(diasSemana)) {
            if (lowerMessage.includes(dia)) {
              const proximaData = getNextDateForWeekday(numero);
              newSchedulingData.data = format(proximaData, 'yyyy-MM-dd');
              newSchedulingData.diaSemana = dia;
              break;
            }
          }
        }

        // Semanas
        if (!newSchedulingData.semanas) {
          const semanasMatch = message.match(/(\d+)\s*semanas?/i);
          if (semanasMatch) {
            newSchedulingData.semanas = parseInt(semanasMatch[1]);
          }
        }

        // Verificar se temos todas as informações necessárias
        const hasAllInfo = newSchedulingData.professor && 
                          newSchedulingData.materia && 
                          newSchedulingData.bloco && 
                          newSchedulingData.horario && 
                          newSchedulingData.data;

        if (hasAllInfo) {
          const blockName = blocks.find(b => b.id === newSchedulingData.bloco)?.name;
          const semanas = newSchedulingData.semanas || 16;
          
          response = 'Dados coletados com sucesso:\n\n';
          response += `Professor: ${newSchedulingData.professor}\n`;
          response += `Disciplina: ${newSchedulingData.materia}\n`;
          response += `Bloco: ${blockName}\n`;
          response += `Horário: ${newSchedulingData.horario} - ${newSchedulingData.duracao}\n`;
          response += `Início: ${format(new Date(newSchedulingData.data), 'dd/MM/yyyy')} (${newSchedulingData.diaSemana})\n`;
          response += `Duração: ${semanas} semanas\n\n`;
          response += 'Digite "confirmar" para criar os agendamentos.';
        } else {
          // Solicitar informações faltantes
          const missing = [];
          if (!newSchedulingData.professor) missing.push('Nome do professor');
          if (!newSchedulingData.materia) missing.push('Disciplina');
          if (!newSchedulingData.bloco) missing.push('Bloco (C, H15, H06, H03)');
          if (!newSchedulingData.horario) missing.push('Horário (ex: 08:00, 14:00)');
          if (!newSchedulingData.data) missing.push('Dia da semana');
          
          if (missing.length > 0) {
            response = 'Informações necessárias:\n\n';
            response += missing.map(item => `• ${item}`).join('\n');
            response += '\n\nExemplo: "Prof. Ana Silva, Cálculo I, Bloco C, segunda-feira às 08:00, 16 semanas"';
          }
        }
      }

      setSchedulingData(newSchedulingData);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
        data: newSchedulingData
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro no processamento:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Erro no processamento da solicitação.\n\nTente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');
    
    await processMessage(messageToProcess);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[700px] flex flex-col">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Luciano (LU)</h2>
            <p className="text-sm text-gray-500">Assistente de Agendamentos</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] rounded-lg p-3 shadow-sm ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {format(message.timestamp, 'HH:mm')}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Processando...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={1}
              disabled={isProcessing}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span>Blocos: C, H15, H06, H03</span>
          <span>•</span>
          <span>Horários: 07:10-21:50</span>
          <span>•</span>
          <span>Padrão: 16 semanas</span>
        </div>
      </div>
    </div>
  );
};