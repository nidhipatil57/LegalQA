'use client';

import { useState, useEffect } from 'react';
import {
  CheckSquare, Plus, Loader2, Calendar, AlertTriangle, User,
  CheckCircle2, PlusCircle, Trash2, ArrowRight, ListTodo
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Task creation form state
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [contractId, setContractId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>(['Verify Governing Law', 'Audit Limitation of Liability caps']);
  const [newItemText, setNewItemText] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchInitialData = () => {
    setLoading(true);
    
    // Fetch tasks
    const p1 = fetch('/api/tasks').then(res => res.json());
    // Fetch contracts
    const p2 = fetch('/api/contracts').then(res => res.json());
    // Fetch team members
    const p3 = fetch('/api/teams').then(res => res.json());

    Promise.all([p1, p2, p3])
      .then(([tasksData, contractsData, teamsData]) => {
        const list = tasksData.tasks || [];
        setTasks(list);
        setContracts(contractsData.contracts || []);
        
        const teamList = teamsData.members || [];
        setMembers(teamList);
        if (teamList.length > 0) {
          setAssignedToId(teamList[0].id);
        }

        // Reselect selected task if it was updated
        if (selectedTask) {
          const match = list.find((t: any) => t.id === selectedTask.id);
          if (match) setSelectedTask(match);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch tasks page data error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedToId) return;

    setCreating(true);

    const checklist = checklistItems
      .filter((text) => text.trim().length > 0)
      .map((text) => ({ text, completed: false }));

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          dueDate: dueDate || null,
          contractId: contractId || null,
          assignedToId,
          checklist,
        }),
      });

      if (!res.ok) throw new Error('Failed to create task');

      // Clear form
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDueDate('');
      setContractId('');
      setChecklistItems(['Verify Governing Law', 'Audit Limitation of Liability caps']);
      setCreateOpen(false);

      // Refresh list
      fetchInitialData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error creating task');
    } finally {
      setCreating(false);
    }
  };

  // Update task status or checklist items
  const handleUpdateTask = async (taskId: string, updates: { status?: string; checklist?: any[] }) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task');

      // Refresh data to update UI
      const list = tasks.map((t) => (t.id === taskId ? data.task : t));
      setTasks(list);
      if (selectedTask?.id === taskId) {
        setSelectedTask(data.task);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error updating task');
    }
  };

  const handleToggleChecklistItem = (itemIndex: number) => {
    if (!selectedTask) return;

    const list = [...(selectedTask.checklist || [])];
    list[itemIndex].completed = !list[itemIndex].completed;

    handleUpdateTask(selectedTask.id, { checklist: list });
  };

  const handleAddChecklistItem = () => {
    if (!newItemText.trim() || !selectedTask) return;

    const list = [...(selectedTask.checklist || [])];
    list.push({ text: newItemText.trim(), completed: false });
    setNewItemText('');

    handleUpdateTask(selectedTask.id, { checklist: list });
  };

  const handleAddFormChecklistItem = () => {
    if (newItemText.trim()) {
      setChecklistItems(prev => [...prev, newItemText.trim()]);
      setNewItemText('');
    }
  };

  // Group tasks by status
  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const reviewTasks = tasks.filter(t => t.status === 'REVIEW');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Review Checklists & Tasks</h1>
          <p className="text-sm text-gray-400">Track audits, delegate reviews, and manage risk validation checklists.</p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Checklist Task
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" /> Loading checklists...
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-stretch">
          {/* Kanban Columns (span 3 on xl) */}
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            
            {/* TODO Column */}
            <div className="glass-card rounded-2xl p-4 flex flex-col space-y-4">
              <div className="flex justify-between items-center px-1 border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">To Do</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 font-mono text-gray-400">{todoTasks.length}</span>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[450px]">
                {todoTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      selectedTask?.id === t.id 
                        ? 'bg-blue-600/10 border-blue-500/30' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{t.title}</span>
                    <span className="text-[9px] text-gray-500 font-mono mt-2 block truncate">{t.contract?.title || 'No contract attached'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* IN_PROGRESS Column */}
            <div className="glass-card rounded-2xl p-4 flex flex-col space-y-4">
              <div className="flex justify-between items-center px-1 border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">In Progress</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/10 font-mono text-yellow-500">{inProgressTasks.length}</span>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[450px]">
                {inProgressTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      selectedTask?.id === t.id 
                        ? 'bg-blue-600/10 border-blue-500/30' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{t.title}</span>
                    <span className="text-[9px] text-gray-500 font-mono mt-2 block truncate">{t.contract?.title || 'No contract attached'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* REVIEW Column */}
            <div className="glass-card rounded-2xl p-4 flex flex-col space-y-4">
              <div className="flex justify-between items-center px-1 border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Under Review</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 font-mono text-indigo-400">{reviewTasks.length}</span>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[450px]">
                {reviewTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      selectedTask?.id === t.id 
                        ? 'bg-blue-600/10 border-blue-500/30' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{t.title}</span>
                    <span className="text-[9px] text-gray-500 font-mono mt-2 block truncate">{t.contract?.title || 'No contract attached'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DONE Column */}
            <div className="glass-card rounded-2xl p-4 flex flex-col space-y-4">
              <div className="flex justify-between items-center px-1 border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Completed</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 font-mono text-green-400">{doneTasks.length}</span>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[450px]">
                {doneTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      selectedTask?.id === t.id 
                        ? 'bg-blue-600/10 border-blue-500/30' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block truncate">{t.title}</span>
                    <span className="text-[9px] text-gray-500 font-mono mt-2 block truncate">{t.contract?.title || 'No contract attached'}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Detailed inspect sidebar */}
          <div className="xl:col-span-1">
            {!selectedTask ? (
              <div className="glass-panel border-white/5 rounded-2xl p-8 text-center text-gray-500 h-full flex flex-col items-center justify-center">
                <ListTodo className="w-8 h-8 text-gray-700 mb-2" />
                <h4 className="text-sm font-bold text-white font-display">Task Inspect Board</h4>
                <p className="text-[10px] max-w-xs text-gray-500">Select any review task to check off audit lists or update details.</p>
              </div>
            ) : (
              <div className="glass-panel border-white/5 rounded-2xl p-6 flex flex-col space-y-6 h-full text-left">
                {/* Title */}
                <div>
                  <h3 className="text-base font-bold text-white leading-tight mb-2">{selectedTask.title}</h3>
                  <p className="text-xs text-gray-400">{selectedTask.description || 'No description provided.'}</p>
                </div>

                {/* Status Selector */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Task Review Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateTask(selectedTask.id, { status: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer"
                  >
                    <option value="TODO" className="bg-[#090d1a]">To Do</option>
                    <option value="IN_PROGRESS" className="bg-[#090d1a]">In Progress</option>
                    <option value="REVIEW" className="bg-[#090d1a]">Under Review</option>
                    <option value="DONE" className="bg-[#090d1a]">Completed</option>
                  </select>
                </div>

                {/* Checklist Checklist Items */}
                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block">Audit Checklist Items</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(!selectedTask.checklist || selectedTask.checklist.length === 0) ? (
                      <p className="text-[10px] text-gray-500 italic">No checklist items defined.</p>
                    ) : (
                      selectedTask.checklist.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => handleToggleChecklistItem(idx)}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 cursor-pointer select-none text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            readOnly
                            className="h-3.5 w-3.5 rounded border-white/10 text-blue-600 focus:ring-0 cursor-pointer mt-0.5"
                          />
                          <span className={`${item.completed ? 'line-through text-gray-600' : 'text-gray-300'}`}>
                            {item.text}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add item inline */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add checklist item..."
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-white outline-none"
                    />
                    <button
                      onClick={handleAddChecklistItem}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Metadata details */}
                <div className="border-t border-white/5 pt-4 text-[10px] text-gray-500 font-mono space-y-2">
                  <div className="flex justify-between">
                    <span>Assignee:</span>
                    <span className="text-white">{selectedTask.assignedTo?.name}</span>
                  </div>
                  {selectedTask.dueDate && (
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span className="text-white">{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Priority:</span>
                    <span className={`${
                      selectedTask.priority === 'URGENT' || selectedTask.priority === 'HIGH' 
                        ? 'text-red-400' 
                        : 'text-gray-400'
                    }`}>{selectedTask.priority}</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {createOpen && (
        <div className="fixed inset-0 bg-[#030712]/80 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="w-full max-w-lg glass-panel border-white/10 rounded-2xl p-8 shadow-2xl relative my-8">
            <h3 className="text-xl font-bold text-white font-display mb-2">Create Review Task</h3>
            <p className="text-xs text-gray-500 mb-6">Assign a checklist task to audit legal compliance or execute risk rewrites.</p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Audit NDA Liability Indemnity limits"
                  className="w-full glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of task instructions..."
                  className="w-full glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Attached Contract</label>
                  <select
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[#090d1a]">None</option>
                    {contracts.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#090d1a]">{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Assign Lawyer</label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#090d1a]">{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Task Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer"
                  >
                    <option value="LOW" className="bg-[#090d1a]">Low Priority</option>
                    <option value="MEDIUM" className="bg-[#090d1a]">Medium Priority</option>
                    <option value="HIGH" className="bg-[#090d1a]">High Priority</option>
                    <option value="URGENT" className="bg-[#090d1a]">Urgent Priority</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              {/* Define list checklist items */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Initial Checklist Items</label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto mb-2">
                  {checklistItems.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-gray-300 font-medium">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add checklist item..."
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFormChecklistItem}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating Task...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Save Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
