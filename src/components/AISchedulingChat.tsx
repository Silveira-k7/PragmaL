import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Calendar, Clock, Building2, BookOpen, Users, Sparkles } from 'lucide-react';
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
  horario?: string;
  data?: string;
  semanas?: number;
  duracao?: string;
}

export const AISchedulingChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '🤖 Olá! Sou a IA do PRAGMA. Posso ajudar você a agendar aulas rapidamente! \n\nApenas me diga:\n• Nome do professor\n• Matéria/disciplina\n• Bloco desejado (C, H15, H06, H03)\n• Horário preferido\n• Data de início\n• Quantas semanas no semestre\n\nExemplo: "Quero agendar aulas do Prof. João de Cálculo no Bloco C às 08:00 toda segunda-feira por 16 semanas"',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [schedulingData, setSchedulingData] = useState<SchedulingData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { blocks, rooms, reservations, addSemesterReservations, addReservation } = useStore();

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

  const processMessage = async (message: string) => {
    setIsProcessing(true);
    
    // Simular processamento da IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerMessage = message.toLowerCase();
    let response = '';
    let newSchedulingData = { ...schedulingData };

    // Extrair informações da mensagem
    if (!newSchedulingData.professor) {
      const profMatch = message.match(/prof\.?\s*([a-záêçõ\s]+)/i);
      if (profMatch) {
        newSchedulingData.professor = `Prof. ${profMatch[1].trim()}`;
        response += `✅ Professor identificado: ${newSchedulingData.professor}\n`;
      }
    }

    if (!newSchedulingData.materia) {
      const materias = [
        'cálculo', 'álgebra', 'física', 'química', 'programação', 'estruturas de dados',
        'banco de dados', 'engenharia de software', 'redes', 'inteligência artificial',
        'sistemas operacionais', 'estatística', 'metodologia', 'gestão', 'marketing',
        'contabilidade', 'administração', 'direito', 'psicologia', 'logística'
      ];
      
      for (const materia of materias) {
        if (lowerMessage.includes(materia)) {
          newSchedulingData.materia = materia.charAt(0).toUpperCase() + materia.slice(1);
          response += `✅ Matéria identificada: ${newSchedulingData.materia}\n`;
          break;
        }
      }
    }

    if (!newSchedulingData.bloco) {
      const blocoMatch = message.match(/bloco\s*([ch]\d*|[ch]\d+)/i);
      if (blocoMatch) {
        const blocoName = blocoMatch[1].toUpperCase();
        const foundBlock = blocks.find(b => b.name.toUpperCase().includes(blocoName));
        if (foundBlock) {
          newSchedulingData.bloco = foundBlock.id;
          response += `✅ Bloco identificado: ${foundBlock.name}\n`;
        }
      }
    }

    if (!newSchedulingData.horario) {
      const horarioMatch = message.match(/(\d{1,2}):?(\d{2})?/);
      if (horarioMatch) {
        const hour = horarioMatch[1].padStart(2, '0');
        const minute = horarioMatch[2] || '00';
        const timeString = `${hour}:${minute}`;
        
        // Encontrar o slot de tempo mais próximo
        const matchingSlot = timeSlots.find(slot => 
          slot.start.startsWith(hour) || slot.start === timeString
        );
        
        if (matchingSlot) {
          newSchedulingData.horario = matchingSlot.start;
          newSchedulingData.duracao = matchingSlot.end;
          response += `✅ Horário identificado: ${matchingSlot.start} - ${matchingSlot.end}\n`;
        }
      }
    }

    if (!newSchedulingData.semanas) {
      const semanasMatch = message.match(/(\d+)\s*semanas?/i);
      if (semanasMatch) {
        newSchedulingData.semanas = parseInt(semanasMatch[1]);
        response += `✅ Duração: ${newSchedulingData.semanas} semanas\n`;
      }
    }

    if (!newSchedulingData.data) {
      const dataMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (dataMatch) {
        newSchedulingData.data = `${dataMatch[3]}-${dataMatch[2].padStart(2, '0')}-${dataMatch[1].padStart(2, '0')}`;
        response += `✅ Data de início: ${dataMatch[1]}/${dataMatch[2]}/${dataMatch[3]}\n`;
      } else {
        // Detectar dias da semana
        const diasSemana = {
          'segunda': 1, 'terça': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5,
          'segunda-feira': 1, 'terça-feira': 2, 'quarta-feira': 3, 'quinta-feira': 4, 'sexta-feira': 5
        };
        
        for (const [dia, numero] of Object.entries(diasSemana)) {
          if (lowerMessage.includes(dia)) {
            // Calcular próxima ocorrência do dia da semana
            const hoje = new Date();
            const diasParaProximo = (numero - hoje.getDay() + 7) % 7 || 7;
            const proximaData = new Date(hoje);
            proximaData.setDate(hoje.getDate() + diasParaProximo);
            
            newSchedulingData.data = format(proximaData, 'yyyy-MM-dd');
            response += `✅ Data de início: ${format(proximaData, 'dd/MM/yyyy')} (próxima ${dia})\n`;
            break;
          }
        }
      }
    }

    // Verificar se temos todas as informações necessárias
    const hasAllInfo = newSchedulingData.professor && 
                      newSchedulingData.materia && 
                      newSchedulingData.bloco && 
                      newSchedulingData.horario && 
                      newSchedulingData.data;

    if (hasAllInfo && !lowerMessage.includes('confirmar') && !lowerMessage.includes('cancelar')) {
      response += '\n🎯 Tenho todas as informações necessárias!\n\n';
      response += `📋 **Resumo do Agendamento:**\n`;
      response += `👨‍🏫 Professor: ${newSchedulingData.professor}\n`;
      response += `📚 Matéria: ${newSchedulingData.materia}\n`;
      response += `🏢 Bloco: ${blocks.find(b => b.id === newSchedulingData.bloco)?.name}\n`;
      response += `⏰ Horário: ${newSchedulingData.horario} - ${newSchedulingData.duracao}\n`;
      response += `📅 Início: ${format(new Date(newSchedulingData.data), 'dd/MM/yyyy')}\n`;
      response += `📊 Duração: ${newSchedulingData.semanas || 16} semanas\n\n`;
      response += '✨ Digite "confirmar" para criar os agendamentos ou "cancelar" para recomeçar!';
    } else if (lowerMessage.includes('confirmar') && hasAllInfo) {
      // Executar agendamento
      try {
        // Encontrar sala disponível no bloco
        const blockRooms = rooms.filter(r => r.block_id === newSchedulingData.bloco);
        if (blockRooms.length === 0) {
          response = '❌ Não encontrei salas disponíveis no bloco selecionado.';
        } else {
          // Selecionar primeira sala disponível (pode ser melhorado com lógica de conflitos)
          const selectedRoom = blockRooms[0];
          
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
          
          response = `🎉 **Agendamento criado com sucesso!**\n\n`;
          response += `✅ ${weeks} aulas agendadas para:\n`;
          response += `👨‍🏫 ${newSchedulingData.professor}\n`;
          response += `📚 ${newSchedulingData.materia}\n`;
          response += `🏢 ${blockName} - ${selectedRoom.name}\n`;
          response += `⏰ ${newSchedulingData.horario} - ${newSchedulingData.duracao}\n`;
          response += `📅 Início: ${format(startDate, 'dd/MM/yyyy')}\n\n`;
          response += '🚀 Pronto para um novo agendamento! Me diga o que precisa.';
          
          // Reset scheduling data
          newSchedulingData = {};
          
          toast.success(`${weeks} aulas agendadas com sucesso!`);
        }
      } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        response = '❌ Erro ao criar agendamento. Tente novamente.';
        toast.error('Erro ao criar agendamento');
      }
    } else if (lowerMessage.includes('cancelar')) {
      newSchedulingData = {};
      response = '🔄 Agendamento cancelado! Vamos começar novamente. Me diga as informações para o novo agendamento.';
    } else {
      // Solicitar informações faltantes
      const missing = [];
      if (!newSchedulingData.professor) missing.push('👨‍🏫 Nome do professor');
      if (!newSchedulingData.materia) missing.push('📚 Matéria/disciplina');
      if (!newSchedulingData.bloco) missing.push('🏢 Bloco (C, H15, H06, H03)');
      if (!newSchedulingData.horario) missing.push('⏰ Horário');
      if (!newSchedulingData.data) missing.push('📅 Data de início ou dia da semana');
      
      if (missing.length > 0) {
        response += '\n🤔 Ainda preciso de algumas informações:\n\n';
        response += missing.join('\n') + '\n\n';
        response += '💡 Exemplo: "Prof. Ana Silva, Cálculo I, Bloco C, 08:00, toda segunda-feira por 16 semanas"';
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
    setIsProcessing(false);
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
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">IA Agendamento Rápido</h2>
            <p className="text-purple-100 text-sm">Converse comigo para agendar aulas automaticamente</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-full flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                <div className={`text-xs mt-2 opacity-70 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {format(message.timestamp, 'HH:mm')}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="bg-blue-500 p-2 rounded-full flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-full">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">IA processando...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem... Ex: 'Quero agendar aulas do Prof. João de Cálculo no Bloco C às 08:00'"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            disabled={isProcessing}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-full hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Blocos: C, H15, H06, H03</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Horários: 07:10-22:35</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Semestre: 16 semanas</span>
          </div>
        </div>
      </div>
    </div>
  );
};