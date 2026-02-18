import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Files, Settings, LogOut, Plus, 
  Search, Trash2, Edit2, Download, Upload, User, Lock, 
  Moon, Sun, ChevronRight, Bell, CheckCircle2, AlertCircle, 
  X, Menu, Eye, FileJson, FileImage, FileCode, Info, ShieldCheck, 
  Clock, Key, Trash, History, Smartphone, Copy, EyeOff, Globe, Share2
} from 'lucide-react';

/**
 * Vault.io - Aplikasi Penyimpanan Data Pribadi (Versi Terlengkap)
 * Fitur: Dashboard, Catatan, File Manager, Password Manager, Security, Trash.
 */

// --- Data Simulasi ---
const INITIAL_NOTES = [
  { id: 1, title: "Rencana Bisnis 2024", content: "Fokus pada pengembangan ekosistem digital dan keamanan data.", date: "15 Feb 2024" },
  { id: 2, title: "Daftar Belanja Bulanan", content: "Kopi, perlengkapan kantor, dan langganan cloud.", date: "16 Feb 2024" }
];

const INITIAL_FILES = [
  { id: 1, name: "Laporan_Keuangan.pdf", size: "2.4 MB", type: "PDF", date: "10 Feb 2024", url: "#" },
  { id: 2, name: "Arsitektur_Sistem.png", size: "1.1 MB", type: "IMAGE", date: "12 Feb 2024", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600" }
];

const INITIAL_PASSWORDS = [
  { id: 1, service: "Netflix", user: "johndoe@email.com", pass: "netflix12345", category: "Hiburan" },
  { id: 2, service: "GitHub", user: "dev_john", pass: "git_secure_99", category: "Developer" }
];

const SESSIONS = [
  { id: 1, device: "iPhone 15 Pro", location: "Jakarta, ID", time: "Aktif Sekarang", active: true },
  { id: 2, device: "MacBook Air M2", location: "Jakarta, ID", time: "2 jam yang lalu", active: false }
];

// --- Komponen Notifikasi ---
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-[100] flex items-center p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-4 ${
    type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-rose-500/20 border-rose-500/50 text-rose-200'
  } backdrop-blur-md`}>
    {type === 'success' ? <CheckCircle2 size={18} className="mr-3" /> : <AlertCircle size={18} className="mr-3" />}
    <span className="text-sm font-bold">{message}</span>
    <button onClick={onClose} className="ml-4 p-1 hover:bg-white/10 rounded-lg"><X size={14} /></button>
  </div>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPassId, setShowPassId] = useState(null);
  
  // States Data
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [files, setFiles] = useState(INITIAL_FILES);
  const [passwords, setPasswords] = useState(INITIAL_PASSWORDS);
  const [trash, setTrash] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeNote, setActiveNote] = useState({ id: null, title: '', content: '' });
  const [previewFile, setPreviewFile] = useState(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    notify("Berhasil masuk ke brankas!");
  };

  const deleteToTrash = (item, type) => {
    const newItem = { ...item, type, deletedAt: new Date().toLocaleDateString() };
    setTrash([newItem, ...trash]);
    if (type === 'note') setNotes(notes.filter(n => n.id !== item.id));
    if (type === 'file') setFiles(files.filter(f => f.id !== item.id));
    notify("Item dipindahkan ke sampah");
  };

  const restoreFromTrash = (item) => {
    if (item.type === 'note') setNotes([item, ...notes]);
    if (item.type === 'file') setFiles([item, ...files]);
    setTrash(trash.filter(t => t.id !== item.id));
    notify("Item dipulihkan");
  };

  const saveNote = () => {
    if (!activeNote.title) return;
    const dateStr = new Date().toLocaleDateString('id-ID');
    if (activeNote.id) {
      setNotes(notes.map(n => n.id === activeNote.id ? { ...activeNote, date: dateStr } : n));
      notify("Catatan diperbarui");
    } else {
      setNotes([{ ...activeNote, id: Date.now(), date: dateStr }, ...notes]);
      notify("Catatan baru ditambahkan");
    }
    setIsModalOpen(false);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    notify("Disalin ke clipboard!");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
        </div>
        <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl text-center">
          <div className="inline-flex p-5 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/30 mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 italic">VAULT.IO</h1>
          <p className="text-slate-400 mb-10">Penyimpanan Terenkripsi Militer</p>
          <form onSubmit={handleLogin} className="space-y-4">
             <input type="email" defaultValue="user@example.com" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Email" />
             <input type="password" defaultValue="password123" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Password" />
             <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 p-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all">MASUK</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} flex transition-colors duration-500 font-sans`}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Sidebar Overlay Mobile */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[70] w-72 border-r ${isDarkMode ? 'border-white/5 bg-slate-900/80' : 'border-slate-200 bg-white'} backdrop-blur-xl transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-300 p-8 flex flex-col`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20"><Lock size={18} /></div>
            <span className="text-2xl font-black tracking-tighter italic">VAULT</span>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          <NavItem active={view === 'dashboard'} onClick={() => {setView('dashboard'); setIsMobileMenuOpen(false)}} icon={LayoutDashboard} label="Dashboard" />
          <NavItem active={view === 'notes'} onClick={() => {setView('notes'); setIsMobileMenuOpen(false)}} icon={FileText} label="Catatan" />
          <NavItem active={view === 'files'} onClick={() => {setView('files'); setIsMobileMenuOpen(false)}} icon={Files} label="File Manager" />
          <NavItem active={view === 'passwords'} onClick={() => {setView('passwords'); setIsMobileMenuOpen(false)}} icon={Key} label="Password" />
          <NavItem active={view === 'security'} onClick={() => {setView('security'); setIsMobileMenuOpen(false)}} icon={ShieldCheck} label="Keamanan" />
          <NavItem active={view === 'trash'} onClick={() => {setView('trash'); setIsMobileMenuOpen(false)}} icon={Trash} label="Sampah" count={trash.length} />
          <NavItem active={view === 'settings'} onClick={() => {setView('settings'); setIsMobileMenuOpen(false)}} icon={Settings} label="Pengaturan" />
        </nav>

        <button onClick={() => setIsLoggedIn(false)} className="mt-8 flex items-center space-x-3 p-4 text-rose-500 font-bold hover:bg-rose-500/10 rounded-2xl transition-all">
          <LogOut size={20} /> <span>Keluar</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <header className={`sticky top-0 z-50 p-6 md:p-8 flex items-center justify-between backdrop-blur-md ${isDarkMode ? 'bg-slate-950/70' : 'bg-slate-50/70'}`}>
          <div className="flex items-center">
            <button className="lg:hidden p-3 mr-4 bg-white/5 rounded-xl border border-white/10" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
            <h2 className="text-2xl font-black tracking-tight capitalize">{view}</h2>
          </div>
          <div className="flex items-center space-x-3">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-100'}`}>
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
            </button>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-10 h-10 rounded-2xl bg-indigo-500/10 p-1 border border-white/10" alt="avatar" />
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
          
          {/* Dashboard View */}
          {view === 'dashboard' && (
            <>
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 md:p-14 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform"><ShieldCheck size={200} /></div>
                <div className="relative z-10 max-w-2xl space-y-6">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">Keamanan Data Adalah Prioritas Kami.</h1>
                  <p className="text-indigo-100 opacity-80 text-lg leading-relaxed">Selamat datang di brankas digital Anda. Kelola catatan rahasia dan file penting dengan enkripsi end-to-end.</p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button onClick={() => setView('notes')} className="bg-white text-indigo-700 font-black px-8 py-4 rounded-2xl shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-2 font-sans"><Plus size={18}/> Catatan Baru</button>
                    <button onClick={() => setView('files')} className="bg-white/10 text-white font-bold px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">Manajer File</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Catatan" value={notes.length} icon={FileText} color="indigo" />
                <StatCard label="File" value={files.length} icon={Files} color="emerald" />
                <StatCard label="Password" value={passwords.length} icon={Key} color="orange" />
                <StatCard label="Sesi Aktif" value={SESSIONS.length} icon={Smartphone} color="rose" />
              </div>

              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><History size={20} className="text-indigo-500"/> Sesi Aktif</h3>
                  <div className="space-y-4">
                    {SESSIONS.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <Smartphone size={20} className="text-slate-500" />
                          <div><p className="text-sm font-bold">{s.device}</p><p className="text-[10px] text-slate-500 font-bold uppercase">{s.location}</p></div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${s.active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>{s.active ? 'ONLINE' : s.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Globe size={20} className="text-emerald-500"/> Akses Cepat</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {passwords.map(p => (
                      <div key={p.id} onClick={() => setView('passwords')} className="p-4 bg-white/5 rounded-2xl hover:bg-indigo-600/10 cursor-pointer transition-all border border-white/5">
                        <p className="font-bold text-sm mb-1 truncate">{p.service}</p>
                        <p className="text-[10px] text-slate-500 truncate">{p.user}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Notes View */}
          {view === 'notes' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                 <div className="relative w-full md:w-96">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                   <input type="text" placeholder="Cari catatan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none focus:ring-4 focus:ring-indigo-500/10 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`} />
                 </div>
                 <button onClick={() => {setActiveNote({id:null, title:'', content:''}); setIsModalOpen(true);}} className="w-full md:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2"><Plus size={20} /> TAMBAH CATATAN</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase())).map(n => (
                  <div key={n.id} onClick={() => {setActiveNote(n); setIsModalOpen(true);}} className={`p-8 rounded-[2.5rem] border group transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200'}`}>
                     <div className="flex justify-between items-start mb-6">
                       <div className="p-4 bg-indigo-600/10 text-indigo-500 rounded-2xl"><FileText size={24}/></div>
                       <button onClick={(e) => {e.stopPropagation(); deleteToTrash(n, 'note')}} className="p-3 text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                     </div>
                     <h4 className="font-bold text-xl mb-3">{n.title}</h4>
                     <p className="text-slate-500 text-sm line-clamp-3 mb-6 h-14">{n.content}</p>
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{n.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files View */}
          {view === 'files' && (
             <div className="space-y-8 animate-in slide-in-from-bottom-8">
                <div className={`p-10 border-2 border-dashed rounded-[3rem] bg-white/5 flex flex-col items-center justify-center text-center ${isDarkMode ? 'border-white/10' : 'border-slate-300'}`}>
                  <div className="p-5 bg-emerald-600/10 text-emerald-500 rounded-full mb-4"><Upload size={40} /></div>
                  <h3 className="text-2xl font-black mb-2">Unggah Dokumen Baru</h3>
                  <button className="mt-4 px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">PILIH FILE</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {files.map(f => (
                    <div key={f.id} className={`p-6 rounded-[2.5rem] border flex flex-col items-center text-center group transition-all ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                       <div className="p-8 rounded-3xl bg-white/5 mb-6 text-slate-400 group-hover:text-emerald-500 transition-colors">
                         {f.type === 'IMAGE' ? <FileImage size={48}/> : <FileJson size={48}/>}
                       </div>
                       <h4 className="font-bold text-sm mb-1 truncate w-full">{f.name}</h4>
                       <p className="text-[10px] text-slate-500 mb-8 font-black uppercase tracking-widest">{f.size} • {f.date}</p>
                       <div className="flex gap-2">
                         <button onClick={() => setPreviewFile(f)} className="p-3 rounded-xl border border-white/10 hover:bg-white/10"><Eye size={18}/></button>
                         <button onClick={() => deleteToTrash(f, 'file')} className="p-3 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {/* Passwords View */}
          {view === 'passwords' && (
             <div className="space-y-8 animate-in slide-in-from-bottom-8">
               <div className="bg-orange-600 p-10 rounded-[3rem] text-white flex items-center justify-between">
                 <div>
                    <h3 className="text-3xl font-black mb-2 tracking-tight italic">Password Manager</h3>
                    <p className="opacity-80">Simpan kredensial login Anda dengan enkripsi end-to-end.</p>
                 </div>
                 <Key size={60} className="opacity-20 hidden md:block" />
               </div>
               <div className={`rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <tr>
                      <th className="p-6">Layanan</th>
                      <th className="p-6">User/Email</th>
                      <th className="p-6">Password</th>
                      <th className="p-6 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {passwords.map(p => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-6 font-bold">{p.service}</td>
                        <td className="p-6 text-slate-400">{p.user}</td>
                        <td className="p-6">
                           <div className="flex items-center space-x-2">
                             <span className="font-mono text-indigo-500">{showPassId === p.id ? p.pass : '••••••••••••'}</span>
                             <button onClick={() => setShowPassId(showPassId === p.id ? null : p.id)} className="p-1.5 hover:bg-white/10 rounded-lg">
                               {showPassId === p.id ? <EyeOff size={14} /> : <Eye size={14} />}
                             </button>
                           </div>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => copyText(p.pass)} className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all"><Copy size={16}/></button>
                            <button className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             </div>
          )}

          {/* Trash View */}
          {view === 'trash' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Tempat Sampah</h3>
                <button onClick={() => {setTrash([]); notify("Semua sampah dibersihkan");}} className="text-xs font-black text-rose-500 hover:underline">Kosongkan Semua</button>
              </div>
              {trash.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trash.map(t => (
                    <div key={t.id} className={`p-6 rounded-[2rem] border relative group ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex justify-between mb-4">
                        <div className={`p-3 rounded-xl ${t.type === 'note' ? 'bg-indigo-500/20 text-indigo-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                          {t.type === 'note' ? <FileText size={20} /> : <Files size={20} />}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Dihapus: {t.deletedAt}</p>
                      </div>
                      <h4 className="font-bold mb-2 truncate">{t.title || t.name}</h4>
                      <p className="text-xs text-slate-500 mb-6 truncate">{t.content || t.size}</p>
                      <div className="flex gap-2">
                        <button onClick={() => restoreFromTrash(t)} className="flex-1 py-3 bg-indigo-600 rounded-xl text-xs font-bold text-white">Pulihkan</button>
                        <button onClick={() => setTrash(trash.filter(i => i.id !== t.id))} className="p-3 bg-white/5 rounded-xl text-rose-500 hover:bg-rose-500 transition-all hover:text-white border border-rose-500/10"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4 opacity-30">
                  <div className="p-10 border-2 border-dashed border-white/10 rounded-full inline-block"><Trash size={48} /></div>
                  <p className="font-black uppercase text-xs tracking-widest">Tempat sampah kosong.</p>
                </div>
              )}
            </div>
          )}

          {/* Security & Settings View */}
          {view === 'security' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-8">
              <div className="bg-emerald-600 p-10 rounded-[3rem] text-white flex items-center gap-8 shadow-2xl">
                 <ShieldCheck size={60} className="opacity-40" />
                 <div>
                   <h3 className="text-3xl font-black mb-2 tracking-tight italic">Sistem Keamanan Aktif</h3>
                   <p className="opacity-80">Brankas Anda menggunakan enkripsi AES-256 dan dilindungi oleh protokol keamanan terbaru.</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                    <h4 className="font-bold text-lg mb-6">Verifikasi Akun</h4>
                    <div className="space-y-4">
                       <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-emerald-500">
                         <span className="text-sm font-bold">Autentikasi Dua Faktor</span>
                         <CheckCircle2 size={18} />
                       </div>
                       <button className="w-full py-4 bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest">Ubah Kunci Utama</button>
                    </div>
                 </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className={`relative w-full max-w-xl rounded-[3rem] p-10 shadow-2xl border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black tracking-tight italic">{activeNote.id ? 'Edit Catatan' : 'Catatan Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-rose-500/10 rounded-full text-slate-400 hover:text-rose-500 transition-colors"><X size={28} /></button>
            </div>
            <div className="space-y-6">
              <input type="text" placeholder="Berikan judul..." value={activeNote.title} onChange={(e) => setActiveNote({...activeNote, title: e.target.value})} className={`w-full p-6 rounded-2xl border outline-none text-2xl font-black focus:ring-4 focus:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`} />
              <textarea placeholder="Tuliskan isi catatan di sini..." rows="8" value={activeNote.content} onChange={(e) => setActiveNote({...activeNote, content: e.target.value})} className={`w-full p-6 rounded-2xl border outline-none font-medium focus:ring-4 focus:ring-indigo-500/20 transition-all resize-none ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}></textarea>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black text-slate-400 hover:text-slate-600">Batal</button>
                <button onClick={saveNote} disabled={!activeNote.title} className="bg-indigo-600 disabled:opacity-50 hover:bg-indigo-500 text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-indigo-600/30 transition-all">Simpan Catatan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview */}
      {previewFile && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setPreviewFile(null)}></div>
          <div className={`relative w-full max-w-4xl rounded-[3.5rem] overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between p-8 border-b border-white/5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Info size={24} /></div>
                <div><h3 className="font-black text-xl truncate max-w-[200px] md:max-w-md">{previewFile.name}</h3><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{previewFile.type} • {previewFile.size}</p></div>
              </div>
              <button onClick={() => setPreviewFile(null)} className="p-3 text-slate-400 hover:text-rose-500 transition-all"><X size={28} /></button>
            </div>
            <div className="p-10 md:p-14 flex flex-col items-center justify-center min-h-[400px]">
               {previewFile.url && previewFile.type === 'IMAGE' ? (
                 <img src={previewFile.url} alt="preview" className="max-h-[60vh] rounded-[2rem] shadow-2xl object-contain animate-in fade-in" />
               ) : (
                 <div className="text-center space-y-8 animate-in slide-in-from-top-4 opacity-50">
                    <div className="p-12 bg-white/5 rounded-full inline-block border-2 border-dashed border-white/10">
                      {previewFile.type === 'PDF' ? <FileJson size={100} className="text-rose-500" /> : <FileCode size={100} className="text-emerald-500" />}
                    </div>
                    <h4 className="text-2xl font-black">Pratinjau Tidak Tersedia</h4>
                    <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black">Unduh Berkas</button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Komponen Pembantu ---

function NavItem({ active, onClick, icon: Icon, label, count }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all group relative ${active ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30' : 'text-slate-500 hover:bg-white/5 hover:text-indigo-500'}`}>
      <Icon size={20} className={active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-500 transition-colors'} />
      <span className="font-bold text-sm tracking-tight">{label}</span>
      {count > 0 && !active && <span className="ml-auto w-5 h-5 bg-rose-500 text-[10px] text-white flex items-center justify-center rounded-full font-black">{count}</span>}
      {active && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    indigo: "bg-indigo-500 text-indigo-500",
    emerald: "bg-emerald-500 text-emerald-500",
    orange: "bg-orange-500 text-orange-500",
    rose: "bg-rose-500 text-rose-500"
  };
  return (
    <div className="p-6 rounded-[2rem] border bg-white/5 border-white/5 flex items-center space-x-4 shadow-xl hover:scale-[1.02] transition-transform cursor-pointer">
      <div className={`p-4 rounded-2xl ${colors[color].split(' ')[0]} bg-opacity-10`}>
        <Icon className={colors[color].split(' ')[1]} size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}
