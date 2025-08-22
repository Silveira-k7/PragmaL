import React, { useState } from 'react';
import { Plus, Trash2, School, DoorOpen, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

export const BlockList = () => {
  const { blocks, rooms, addBlock, addRoom, deleteBlock, deleteRoom } = useStore();
  const [newBlockName, setNewBlockName] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [expandedBlocks, setExpandedBlocks] = useState<string[]>([]);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlocks(prev => 
      prev.includes(blockId) 
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    );
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBlockName.trim()) {
      addBlock(newBlockName.trim());
      setNewBlockName('');
      toast.success('Bloco adicionado com sucesso!');
    }
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBlock && newRoomName.trim()) {
      addRoom(selectedBlock, newRoomName.trim());
      setNewRoomName('');
      setSelectedBlock(null);
      toast.success('Sala adicionada com sucesso!');
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este bloco e todas as suas salas?')) {
      await deleteBlock(blockId);
      toast.success('Bloco excluído com sucesso!');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta sala?')) {
      await deleteRoom(roomId);
      toast.success('Sala excluída com sucesso!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Adicionar Novo Bloco</h2>
        <form onSubmit={handleAddBlock} className="flex gap-2">
          <input
            type="text"
            value={newBlockName}
            onChange={(e) => setNewBlockName(e.target.value)}
            placeholder="Nome do novo bloco"
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar
          </motion.button>
        </form>
      </motion.div>

      <div className="space-y-4">
        <AnimatePresence>
          {blocks.map((block) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <School className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-medium text-slate-800">{block.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleBlockExpansion(block.id)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      {expandedBlocks.includes(block.id) ? (
                        <ChevronUp className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteBlock(block.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                      title="Excluir bloco"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedBlocks.includes(block.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-slate-50">
                      <div className="space-y-2 mb-4">
                        {rooms
                          .filter((room) => room.block_id === block.id)
                          .map((room) => (
                            <motion.div
                              key={room.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                            >
                              <span className="flex items-center gap-2 text-slate-700">
                                <DoorOpen className="w-4 h-4 text-slate-400" />
                                {room.name}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-1.5 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                                title="Excluir sala"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </motion.div>
                          ))}
                      </div>

                      {selectedBlock === block.id ? (
                        <motion.form
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onSubmit={handleAddRoom}
                          className="space-y-3"
                        >
                          <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="Nome da nova sala"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="submit"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Adicionar
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={() => setSelectedBlock(null)}
                              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                              Cancelar
                            </motion.button>
                          </div>
                        </motion.form>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedBlock(block.id)}
                          className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Sala
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {blocks.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nenhum bloco cadastrado. Adicione um novo bloco para começar.
          </div>
        )}
      </div>
    </div>
  );
};