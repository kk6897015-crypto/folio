import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  ChevronRight,
  MoreVertical,
  Trash2,
  Smile,
  Meh,
  Frown,
  Zap,
  Brain,
  TrendingUp,
  CalendarDays
} from 'lucide-react';
import { format, isAfter, isBefore, startOfDay, parseISO, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Task, JournalEntry, TaskTag, Mood } from './types';
import { getAIInsights } from './services/aiService';
import { cn } from '@/lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'journal' | 'insights'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('folio_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('folio_journal');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('folio_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('folio_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  // Task Handlers
  const addTask = (title: string, tag: TaskTag, dueDate: Date) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      tag,
      dueDate: dueDate.toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Journal Handlers
  const addJournalEntry = (content: string, mood: Mood, tags: string[]) => {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      content,
      mood,
      tags,
      createdAt: new Date().toISOString(),
      wordCount: content.trim().split(/\s+/).length,
    };
    setJournalEntries([newEntry, ...journalEntries]);
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries(journalEntries.filter(e => e.id !== id));
  };

  return (
    <div className="flex h-screen bg-app-bg text-text-primary font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-app-card border-r border-app-border flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-app-accent rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">Folio</h1>
          </div>
          
          <nav className="space-y-1">
            <NavButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Dashboard"
            />
            <NavButton 
              active={activeTab === 'tasks'} 
              onClick={() => setActiveTab('tasks')}
              icon={<CheckSquare className="w-4 h-4" />}
              label="Tasks"
            />
            <NavButton 
              active={activeTab === 'journal'} 
              onClick={() => setActiveTab('journal')}
              icon={<BookOpen className="w-4 h-4" />}
              label="Journal"
            />
            <NavButton 
              active={activeTab === 'insights'} 
              onClick={() => setActiveTab('insights')}
              icon={<Sparkles className="w-4 h-4" />}
              label="Insights"
            />
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-app-border space-y-4">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Secure HTTPS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-app-bg border border-app-border flex items-center justify-center text-xs font-semibold text-text-primary">
              JD
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Jane Doe</p>
              <p className="text-xs text-text-secondary">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <DashboardView key="dashboard" tasks={tasks} journalEntries={journalEntries} />
            )}
            {activeTab === 'tasks' && (
              <TasksView key="tasks" tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} />
            )}
            {activeTab === 'journal' && (
              <JournalView key="journal" entries={journalEntries} onAdd={addJournalEntry} onDelete={deleteJournalEntry} />
            )}
            {activeTab === 'insights' && (
              <InsightsView key="insights" tasks={tasks} journalEntries={journalEntries} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
        active 
          ? "bg-app-accent/10 text-app-accent" 
          : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// --- Dashboard View ---
function DashboardView({ tasks, journalEntries }: { tasks: Task[], journalEntries: JournalEntry[], key?: string }) {
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overdueTasks = tasks.filter(t => !t.completed && isBefore(parseISO(t.dueDate), startOfDay(new Date()))).length;
    
    return { totalTasks, completedTasks, completionRate, overdueTasks, journalCount: journalEntries.length };
  }, [tasks, journalEntries]);

  const todayTasks = tasks.filter(t => isToday(parseISO(t.dueDate)));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <header>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-text-primary">Dashboard</h2>
        <p className="text-text-secondary text-sm">Welcome back, Jane. Here's your overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Tasks" value={stats.totalTasks} subValue={`${stats.completedTasks} completed`} icon={<CheckSquare className="w-4 h-4 text-app-accent" />} />
        <StatCard label="Completion" value={`${stats.completionRate}%`} subValue="Overall efficiency" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
        <StatCard label="Overdue" value={stats.overdueTasks} subValue="Needs attention" icon={<AlertCircle className="w-4 h-4 text-rose-500" />} />
        <StatCard label="Journal" value={stats.journalCount} subValue="Total entries" icon={<BookOpen className="w-4 h-4 text-indigo-500" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="pro-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-text-primary">
              <CalendarDays className="w-5 h-5 text-app-accent" />
              Today's Focus
            </CardTitle>
            <CardDescription className="text-text-secondary">You have {todayTasks.length} tasks scheduled for today.</CardDescription>
          </CardHeader>
          <CardContent>
            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-app-border bg-app-bg/50 hover:bg-app-bg transition-colors">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      task.tag === 'Work' ? 'bg-app-accent' : 
                      task.tag === 'Study' ? 'bg-indigo-500' :
                      task.tag === 'Health' ? 'bg-emerald-500' : 'bg-orange-500'
                    )} />
                    <span className={cn("text-sm flex-1 text-text-primary", task.completed && "line-through text-text-secondary")}>{task.title}</span>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider border-app-border text-text-secondary">{task.tag}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-text-secondary text-sm italic">
                No tasks for today.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="pro-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-text-primary">
              <Smile className="w-5 h-5 text-indigo-500" />
              Recent Moods
            </CardTitle>
            <CardDescription className="text-text-secondary">Your last 5 journal entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {journalEntries.length > 0 ? (
              <div className="space-y-4">
                {journalEntries.slice(0, 5).map(entry => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      <MoodIcon mood={entry.mood} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-text-primary">{entry.content}</p>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">
                        {format(parseISO(entry.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-text-secondary text-sm italic">
                Start journaling to see your mood trends.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, subValue, icon }: { label: string, value: string | number, subValue: string, icon: React.ReactNode }) {
  return (
    <Card className="pro-card border-none">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</span>
          {icon}
        </div>
        <div className="text-2xl font-bold text-text-primary">{value}</div>
        <p className="text-xs text-text-secondary mt-1">{subValue}</p>
      </CardContent>
    </Card>
  );
}

// --- Tasks View ---
function TasksView({ tasks, onAdd, onToggle, onDelete }: { tasks: Task[], onAdd: (t: string, g: TaskTag, d: Date) => void, onToggle: (id: string) => void, onDelete: (id: string) => void, key?: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState<TaskTag>('Work');
  const [newDate, setNewDate] = useState<Date>(new Date());
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAdd(newTitle, newTag, newDate);
      setNewTitle('');
      setIsAdding(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-text-primary">Tasks</h2>
          <p className="text-text-secondary">Organize your day and stay productive.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="pro-button-primary gap-2 h-10 px-6">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-app-card p-2 rounded-xl border border-app-border">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="w-4 h-4 text-text-secondary" />
          <input placeholder="Search tasks..." className="bg-transparent border-none text-sm focus:ring-0 w-full outline-none text-text-primary placeholder:text-app-muted" />
        </div>
        <Separator orientation="vertical" className="h-6 bg-app-border" />
        <div className="flex gap-1 p-1">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
          <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')} label="Pending" />
          <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')} label="Completed" />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-3 pr-4">
          {filteredTasks.map(task => (
            <TaskItem key={task.id} task={task} onToggle={() => onToggle(task.id)} onDelete={() => onDelete(task.id)} />
          ))}
          {filteredTasks.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-6 h-6 text-[#9CA3AF]" />
              </div>
              <p className="text-[#6B7280] font-medium">No tasks found</p>
              <p className="text-sm text-[#9CA3AF]">Try changing your filter or add a new task.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Task Dialog */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pro-card shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-text-primary">New Task</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Title</label>
                    <Input 
                      autoFocus
                      placeholder="What needs to be done?" 
                      value={newTitle} 
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAdd()}
                      className="pro-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Category</label>
                      <Select value={newTag} onValueChange={(v: TaskTag) => setNewTag(v)}>
                        <SelectTrigger className="pro-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-app-card border-app-border text-text-primary">
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Study">Study</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Due Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-medium pro-input">
                            <CalendarIcon className="mr-2 h-4 w-4 text-app-accent" />
                            {format(newDate, "MMM d, yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-app-card border-app-border">
                          <Calendar
                            mode="single"
                            selected={newDate}
                            onSelect={(d) => d && setNewDate(d)}
                            initialFocus
                            className="text-text-primary"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-app-bg p-4 flex justify-end gap-3 border-t border-app-border">
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-text-secondary hover:text-text-primary">Cancel</Button>
                <Button onClick={handleAdd} className="pro-button-primary px-6">Create Task</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
        active ? "bg-app-accent text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
      )}
    >
      {label}
    </button>
  );
}

function TaskItem({ task, onToggle, onDelete }: { task: Task, onToggle: () => void, onDelete: () => void, key?: string }) {
  const isOverdue = !task.completed && isBefore(parseISO(task.dueDate), startOfDay(new Date()));

  return (
    <div className={cn(
      "group flex items-center gap-4 p-4 pro-card hover:bg-app-bg transition-all",
      task.completed && "opacity-60"
    )}>
      <Checkbox checked={task.completed} onCheckedChange={onToggle} className="w-5 h-5 rounded-md border-app-border data-[state=checked]:bg-app-accent data-[state=checked]:border-app-accent" />
      <div className="flex-1 min-w-0">
        <h4 className={cn("font-medium text-sm truncate text-text-primary", task.completed && "line-through text-text-secondary")}>
          {task.title}
        </h4>
        <div className="flex items-center gap-3 mt-1">
          <Badge variant="secondary" className={cn(
            "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0 border-none",
            task.tag === 'Work' ? 'bg-app-accent/10 text-app-accent' : 
            task.tag === 'Study' ? 'bg-indigo-500/10 text-indigo-500' :
            task.tag === 'Health' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
          )}>
            {task.tag}
          </Badge>
          <div className={cn("flex items-center gap-1 text-[10px] font-semibold tracking-wider", isOverdue ? "text-rose-500" : "text-text-secondary")}>
            <Clock className="w-3 h-3" />
            {format(parseISO(task.dueDate), 'MMM d')}
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 transition-opacity">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

// --- Journal View ---
function JournalView({ entries, onAdd, onDelete }: { entries: JournalEntry[], onAdd: (c: string, m: Mood, t: string[]) => void, onDelete: (id: string) => void, key?: string }) {
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('Happy');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    if (content.trim()) {
      onAdd(content, mood, tags.split(',').map(t => t.trim()).filter(Boolean));
      setContent('');
      setTags('');
      setIsWriting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-text-primary">Journal</h2>
          <p className="text-text-secondary">Reflect on your thoughts and track your mood.</p>
        </div>
        <Button onClick={() => setIsWriting(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-lg h-10 px-6">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entries.map(entry => (
          <Card key={entry.id} className="pro-card border-none group relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <MoodIcon mood={entry.mood} className="w-8 h-8" />
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    {format(parseISO(entry.createdAt), 'EEEE')}
                  </p>
                  <p className="text-sm font-bold text-text-primary">
                    {format(parseISO(entry.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-primary/80 line-clamp-4 leading-relaxed">
                {entry.content}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {entry.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-[10px] uppercase font-bold tracking-wider border-app-border text-text-secondary bg-app-bg/50">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{entry.wordCount} words</span>
                <Button variant="ghost" size="icon" onClick={() => onDelete(entry.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 transition-opacity h-8 w-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {entries.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-[#9CA3AF]" />
            </div>
            <p className="text-[#6B7280] font-medium">Your journal is empty</p>
            <p className="text-sm text-[#9CA3AF]">Start writing to capture your journey.</p>
          </div>
        )}
      </div>

      {/* Writing Dialog */}
      <AnimatePresence>
        {isWriting && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pro-card shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-text-primary">New Journal Entry</h3>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{format(new Date(), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">How are you feeling?</label>
                    <div className="flex gap-2">
                      {(['Ecstatic', 'Happy', 'Neutral', 'Sad', 'Anxious', 'Tired'] as Mood[]).map(m => (
                        <button
                          key={m}
                          onClick={() => setMood(m)}
                          className={cn(
                            "flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                            mood === m ? "bg-app-accent text-white border-app-accent shadow-sm" : "bg-app-bg text-text-secondary border-app-border hover:border-app-muted"
                          )}
                        >
                          <MoodIcon mood={m} className={cn("w-6 h-6", mood === m ? "text-white" : "text-text-secondary")} />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">{m}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Thoughts</label>
                    <Textarea 
                      autoFocus
                      placeholder="Write freely..." 
                      className="min-h-[200px] resize-none text-sm leading-relaxed pro-input"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Tags (comma separated)</label>
                    <Input 
                      placeholder="e.g. gratitude, work, growth" 
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      className="pro-input"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-app-bg p-4 flex justify-end gap-3 border-t border-app-border">
                <Button variant="ghost" onClick={() => setIsWriting(false)} className="text-text-secondary hover:text-text-primary">Discard</Button>
                <Button onClick={handleSave} className="pro-button-primary px-6">Save Entry</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MoodIcon({ mood, className }: { mood: Mood, className?: string }) {
  switch (mood) {
    case 'Ecstatic': return <Zap className={cn("text-yellow-500", className)} />;
    case 'Happy': return <Smile className={cn("text-green-500", className)} />;
    case 'Neutral': return <Meh className={cn("text-blue-500", className)} />;
    case 'Sad': return <Frown className={cn("text-indigo-500", className)} />;
    case 'Anxious': return <AlertCircle className={cn("text-orange-500", className)} />;
    case 'Tired': return <Clock className={cn("text-gray-500", className)} />;
    default: return <Meh className={className} />;
  }
}

// --- Insights View ---
function InsightsView({ tasks, journalEntries }: { tasks: Task[], journalEntries: JournalEntry[], key?: string }) {
  const [prompt, setPrompt] = useState('');
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetInsight = async (customPrompt?: string) => {
    const p = customPrompt || prompt;
    if (!p.trim()) return;
    
    setIsLoading(true);
    setInsight(null);
    const result = await getAIInsights(tasks, journalEntries, p);
    setInsight(result);
    setIsLoading(false);
    setPrompt('');
  };

  const suggestions = [
    { label: "Productivity Analysis", prompt: "Analyze my current tasks and tell me if I'm focusing on the right things. What should I prioritize?" },
    { label: "Mood Patterns", prompt: "Look at my recent journal entries. Are there any recurring themes or mood patterns I should be aware of?" },
    { label: "Weekly Suggestions", prompt: "Based on my activity, give me 3 suggestions to improve my work-life balance this week." },
    { label: "Priority Plan", prompt: "I'm feeling overwhelmed. Help me create a simple plan for my pending tasks." }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-text-primary">AI Insights</h2>
        <p className="text-text-secondary">Personalized coaching powered by your data.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map(s => (
          <button
            key={s.label}
            onClick={() => handleGetInsight(s.prompt)}
            disabled={isLoading}
            className="flex items-center justify-between p-4 pro-card hover:bg-app-bg transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-app-bg rounded-lg flex items-center justify-center group-hover:bg-app-accent transition-colors">
                <Brain className="w-4 h-4 text-text-primary group-hover:text-white" />
              </div>
              <span className="text-sm font-semibold text-text-primary">{s.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input 
            placeholder="Ask anything about your productivity..." 
            className="pr-12 h-12 pro-card border-app-border focus:border-app-accent transition-all text-sm text-text-primary placeholder:text-app-muted"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGetInsight()}
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            onClick={() => handleGetInsight()}
            disabled={isLoading || !prompt.trim()}
            className="absolute right-1 top-1 h-10 w-10 bg-app-accent hover:bg-blue-600 text-white rounded-lg"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
        </div>

        <AnimatePresence>
          {insight && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pro-card p-6 border-app-accent/30 relative overflow-hidden bg-app-accent/5"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-app-accent" />
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-app-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-app-accent">AI Analysis</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-text-primary/90 leading-relaxed whitespace-pre-wrap">
                {insight}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
