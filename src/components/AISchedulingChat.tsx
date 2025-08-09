import React, { useState, useRef, useEffect, useMemo } from 'react';
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
      content: 'Olá! Sou o Luciano, seu assistente inteligente de agendamentos do PRAGMA.\n\n🎯 Para criar um agendamento, me informe:\n• Nome do professor (Prof. João, Professor Ana, etc.)\n• Disciplina (Cálculo, Física, Programação, etc.)\n• Bloco (C, H15, H06, H03, A, B, D, E, F, G)\n• Dia da semana (segunda, terça, quarta, quinta, sexta)\n• Horário (08:00, 14:00, etc.)\n• Número de semanas (opcional, padrão: 16)\n\n💡 Exemplos de comandos:\n"Prof. João Silva vai dar Cálculo I no Bloco C, segunda-feira às 08:00, 16 semanas"\n"Professor Ana, Física, H15, terça 14:00"\n"Carlos Oliveira, Programação, Bloco A, quinta às 10:00"\n\n🤖 Sou muito inteligente e entendo várias formas de você falar!',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [schedulingData, setSchedulingData] = useState<SchedulingData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { blocks, rooms, addSemesterReservations, addReservation } = useStore();

  // Otimização: usar apenas primeiras 100 salas de cada bloco para performance
  const optimizedRooms = useMemo(() => {
    const roomsByBlock = new Map<string, any[]>();
    blocks.forEach(block => {
      const blockRooms = rooms.filter(r => r.block_id === block.id).slice(0, 100);
      roomsByBlock.set(block.id, blockRooms);
    });
    return roomsByBlock;
  }, [blocks, rooms]);

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

  // Mapeamento inteligente de dias da semana
  const diasSemana = {
    'segunda': 1, 'segunda-feira': 1, 'seg': 1, '2': 1, 'segunda feira': 1,
    'terça': 2, 'terça-feira': 2, 'ter': 2, 'terca': 2, '3': 2, 'terça feira': 2, 'terca-feira': 2,
    'quarta': 3, 'quarta-feira': 3, 'qua': 3, '4': 3, 'quarta feira': 3,
    'quinta': 4, 'quinta-feira': 4, 'qui': 4, '5': 4, 'quinta feira': 4,
    'sexta': 5, 'sexta-feira': 5, 'sex': 5, '6': 5, 'sexta feira': 5
  };

  // Lista expandida de disciplinas para reconhecimento inteligente
  const disciplinasComuns = [
    'cálculo', 'calculo', 'matemática', 'matematica', 'álgebra', 'algebra',
    'física', 'fisica', 'química', 'quimica', 'biologia', 'geografia', 'história', 'historia',
    'programação', 'programacao', 'informática', 'informatica', 'computação', 'computacao',
    'estruturas de dados', 'banco de dados', 'redes', 'sistemas operacionais',
    'engenharia de software', 'inteligência artificial', 'inteligencia artificial',
    'estatística', 'estatistica', 'probabilidade', 'metodologia', 'pesquisa',
    'português', 'portugues', 'inglês', 'ingles', 'espanhol', 'literatura',
    'administração', 'administracao', 'gestão', 'gestao', 'marketing', 'economia',
    'contabilidade', 'direito', 'psicologia', 'sociologia', 'filosofia',
    'educação física', 'educacao fisica', 'artes', 'música', 'musica',
    'eletrônica', 'eletronica', 'mecânica', 'mecanica', 'civil', 'elétrica', 'eletrica'
  ];

  // Padrões de nomes de professores
  const padroesProfessor = [
    /prof\.?\s*([a-záêçõàéíóúâôãç\s]+?)(?:\s*[,.]|\s*vai|\s*dará|\s*ensina|\s*de|\s*da|\s*do|\s*no|\s*na|\s*em|\s*$)/i,
    /professor[a]?\s+([a-záêçõàéíóúâôãç\s]+?)(?:\s*[,.]|\s*vai|\s*dará|\s*ensina|\s*de|\s*da|\s*do|\s*no|\s*na|\s*em|\s*$)/i,
    /([a-záêçõàéíóúâôãç\s]+?)\s*(?:vai dar|dará|ensina|leciona)/i,
    /^([a-záêçõàéíóúâôãç\s]+?)\s*[,]/i
  ];

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

  // Função inteligente para extrair informações
  const extractInformation = (message: string, currentData: SchedulingData) => {
    const lowerMessage = message.toLowerCase();
    const newData = { ...currentData };

    // 1. PROFESSOR - Múltiplos padrões
    if (!newData.professor) {
      for (const pattern of padroesProfessor) {
        const match = message.match(pattern);
        if (match && match[1]) {
          let profName = match[1].trim();
          // Limpar caracteres extras
          profName = profName.replace(/[,.]$/, '');
          if (profName.length > 2 && !disciplinasComuns.includes(profName.toLowerCase())) {
            newData.professor = profName.startsWith('Prof') ? profName : `Prof. ${profName}`;
            break;
          }
        }
      }
    }

    // 2. DISCIPLINA - Busca inteligente
    if (!newData.materia) {
      // Primeiro, procurar disciplinas conhecidas
      for (const disciplina of disciplinasComuns) {
        if (lowerMessage.includes(disciplina)) {
          newData.materia = disciplina.charAt(0).toUpperCase() + disciplina.slice(1);
          break;
        }
      }
      
      // Se não encontrou, tentar padrões contextuais
      if (!newData.materia) {
        const materiaPatterns = [
          /(?:de|da|do|disciplina|matéria|aula)\s+([a-záêçõàéíóúâôãç\s]+?)(?:\s*[,.]|\s*no|\s*na|\s*em|\s*bloco|\s*$)/i,
          /(?:vai dar|dará|ensina|leciona)\s+([a-záêçõàéíóúâôãç\s]+?)(?:\s*[,.]|\s*no|\s*na|\s*em|\s*bloco|\s*$)/i,
          /([a-záêçõàéíóúâôãç\s]+?)\s*(?:no bloco|na sala|em)/i
        ];
        
        for (const pattern of materiaPatterns) {
          const match = message.match(pattern);
          if (match && match[1]) {
            const materia = match[1].trim();
            if (materia.length > 3 && !materia.includes('bloco') && !materia.includes('sala')) {
              newData.materia = materia.charAt(0).toUpperCase() + materia.slice(1);
              break;
            }
          }
        }
      }
    }

    // 3. BLOCO - Reconhecimento inteligente
    if (!newData.bloco) {
      const blocoPatterns = [
        /bloco\s*([a-z]\d*|[a-z]|h\d+)/i,
        /\b([a-z]\d+|h\d+)\b/i,
        /\b(bloco\s*)?([a-z])\b(?!\w)/i
      ];
      
      for (const pattern of blocoPatterns) {
        const match = message.match(pattern);
        if (match) {
          let blocoName = (match[2] || match[1]).toUpperCase();
          const foundBlock = blocks.find(b => 
            b.name.toUpperCase().includes(blocoName) || 
            b.name.toUpperCase() === blocoName ||
            b.name.toUpperCase() === `BLOCO ${blocoName}`
          );
          if (foundBlock) {
            newData.bloco = foundBlock.id;
            break;
          }
        }
      }
    }

    // 4. HORÁRIO - Múltiplos formatos
    if (!newData.horario) {
      const horarioPatterns = [
        /(\d{1,2}):(\d{2})/,
        /(\d{1,2})h(\d{2})?/,
        /às?\s*(\d{1,2}):?(\d{2})?/i,
        /(\d{1,2})\s*horas?/i,
        /(\d{1,2})\s*da\s*(manhã|tarde|noite)/i
      ];
      
      for (const pattern of horarioPatterns) {
        const match = message.match(pattern);
        if (match) {
          let hour = match[1];
          let minute = match[2] || '00';
          
          // Ajustar formato
          hour = hour.padStart(2, '0');
          minute = minute.padStart(2, '0');
          
          const timeString = `${hour}:${minute}`;
          const matchingSlot = findBestTimeSlot(timeString);
          if (matchingSlot) {
            newData.horario = matchingSlot.start;
            newData.duracao = matchingSlot.end;
            break;
          }
        }
      }
    }

    // 5. DIA DA SEMANA - Reconhecimento flexível
    if (!newData.data) {
      for (const [dia, numero] of Object.entries(diasSemana)) {
        if (lowerMessage.includes(dia)) {
          const proximaData = getNextDateForWeekday(numero);
          newData.data = format(proximaData, 'yyyy-MM-dd');
          newData.diaSemana = dia;
          break;
        }
      }
    }

    // 6. SEMANAS - Números por extenso e dígitos
    if (!newData.semanas) {
      const semanasPatterns = [
        /(\d+)\s*semanas?/i,
        /(um|uma|dois|duas|três|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte)\s*semanas?/i
      ];
      
      for (const pattern of semanasPatterns) {
        const match = message.match(pattern);
        if (match) {
          if (match[1].match(/\d+/)) {
            newData.semanas = parseInt(match[1]);
          } else {
            // Converter números por extenso
            const numerosExtenso: { [key: string]: number } = {
              'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3,
              'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8,
              'nove': 9, 'dez': 10, 'onze': 11, 'doze': 12, 'treze': 13,
              'catorze': 14, 'quinze': 15, 'dezesseis': 16, 'dezessete': 17,
              'dezoito': 18, 'dezenove': 19, 'vinte': 20
            };
            newData.semanas = numerosExtenso[match[1].toLowerCase()] || 16;
          }
          break;
        }
      }
    }

    return newData;
  };

  const processMessage = async (message: string) => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const lowerMessage = message.toLowerCase();
      let response = '';
      let newSchedulingData = { ...schedulingData };

      // Verificar se é confirmação ou cancelamento
      if (lowerMessage.includes('confirmar') || lowerMessage.includes('sim') || lowerMessage.includes('ok') || lowerMessage.includes('confirma')) {
        const hasAllInfo = newSchedulingData.professor && 
                          newSchedulingData.materia && 
                          newSchedulingData.bloco && 
                          newSchedulingData.horario && 
                          newSchedulingData.data;

        if (hasAllInfo) {
          try {
            const blockRooms = optimizedRooms.get(newSchedulingData.bloco!) || [];
            if (blockRooms.length === 0) {
              response = '❌ Não há salas disponíveis no bloco selecionado.\n\nPor favor, escolha outro bloco (C, H15, H06, H03, A, B, D, E, F, G).';
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
              
              response = `✅ Agendamento criado com sucesso!\n\n`;
              response += `👨‍🏫 Professor: ${newSchedulingData.professor}\n`;
              response += `📚 Disciplina: ${newSchedulingData.materia}\n`;
              response += `🏢 Local: ${blockName} - ${selectedRoom.name}\n`;
              response += `⏰ Horário: ${newSchedulingData.horario} - ${newSchedulingData.duracao}\n`;
              response += `📅 Início: ${format(startDate, 'dd/MM/yyyy')}\n`;
              response += `📊 Total: ${weeks} aulas agendadas\n\n`;
              response += `🎉 Posso ajudar com mais algum agendamento?`;
              
              newSchedulingData = {};
              toast.success(`${weeks} aulas agendadas com sucesso!`);
            }
          } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            response = '❌ Erro ao criar o agendamento.\n\nTente novamente ou verifique os dados informados.';
            toast.error('Erro ao criar agendamento');
          }
        } else {
          response = '⚠️ Informações incompletas para confirmar.\n\nPreciso de todos os dados antes de criar o agendamento.';
        }
      } else if (lowerMessage.includes('cancelar') || lowerMessage.includes('não') || lowerMessage.includes('nao') || lowerMessage.includes('desistir')) {
        newSchedulingData = {};
        response = '❌ Agendamento cancelado.\n\n😊 Posso ajudar com um novo agendamento?';
      } else {
        // Extrair informações da mensagem usando IA melhorada
        newSchedulingData = extractInformation(message, newSchedulingData);

        // Verificar se temos todas as informações necessárias
        const hasAllInfo = newSchedulingData.professor && 
                          newSchedulingData.materia && 
                          newSchedulingData.bloco && 
                          newSchedulingData.horario && 
                          newSchedulingData.data;

        if (hasAllInfo) {
          const blockName = blocks.find(b => b.id === newSchedulingData.bloco)?.name;
          const semanas = newSchedulingData.semanas || 16;
          
          response = '🎯 Perfeito! Coletei todas as informações:\n\n';
          response += `👨‍🏫 Professor: ${newSchedulingData.professor}\n`;
          response += `📚 Disciplina: ${newSchedulingData.materia}\n`;
          response += `🏢 Bloco: ${blockName}\n`;
          response += `⏰ Horário: ${newSchedulingData.horario} - ${newSchedulingData.duracao}\n`;
          response += `📅 Início: ${format(new Date(newSchedulingData.data), 'dd/MM/yyyy')} (${newSchedulingData.diaSemana})\n`;
          response += `📊 Duração: ${semanas} semanas\n\n`;
          response += '✅ Digite "confirmar" para criar os agendamentos ou "cancelar" para desistir.';
        } else {
          // Solicitar informações faltantes de forma inteligente
          const missing = [];
          if (!newSchedulingData.professor) missing.push('👨‍🏫 Nome do professor');
          if (!newSchedulingData.materia) missing.push('📚 Disciplina');
          if (!newSchedulingData.bloco) missing.push('🏢 Bloco');
          if (!newSchedulingData.horario) missing.push('⏰ Horário');
          if (!newSchedulingData.data) missing.push('📅 Dia da semana');
          
          if (missing.length > 0) {
            response = '🤔 Ainda preciso de algumas informações:\n\n';
            response += missing.map(item => `• ${item}`).join('\n');
            response += '\n\n💡 Exemplo completo:\n';
            response += '"Prof. Ana Silva vai dar Cálculo I no Bloco C, segunda-feira às 08:00, 16 semanas"';
            
            // Dar dicas específicas baseadas no que já foi coletado
            if (newSchedulingData.professor && !newSchedulingData.materia) {
              response += '\n\n🎯 Já tenho o professor! Agora me diga qual disciplina ele vai ensinar.';
            } else if (newSchedulingData.materia && !newSchedulingData.bloco) {
              response += '\n\n🎯 Ótimo! Agora preciso saber em qual bloco (C, H15, H06, H03, A, B, D, E, F, G).';
            }
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
        content: '❌ Erro no processamento da solicitação.\n\n🔄 Tente novamente com um comando mais simples.',
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Luciano (LU) - IA Inteligente</h2>
            <p className="text-sm text-gray-500">Assistente de Agendamentos com IA Avançada</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
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
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
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
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Luciano está pensando...</span>
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
              placeholder="Digite sua mensagem para o Luciano..."
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
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span>🏢 Blocos: C, H15, H06, H03, A, B, D, E, F, G</span>
          <span>•</span>
          <span>⏰ Horários: 07:10-21:50</span>
          <span>•</span>
          <span>📊 Padrão: 16 semanas</span>
        </div>
      </div>
    </div>
  );
};