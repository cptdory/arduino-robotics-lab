import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Code2, FileText, Cpu, Zap, Maximize2, ShieldCheck, Share2, Eye, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

// --- Types ---

interface Project {
  id: string;
  title: string;
  description: string;
  code: string;
  notes: string;
  icon: React.ReactNode;
}

// --- Initial Data ---

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'line-tracing',
    title: 'Line Tracing Robot',
    description: 'Autonomous line-follower using IR-sensor feedback arrays.',
    code: `// Line Follower Arduino Code
const int leftSensor = 2;
const int rightSensor = 3;
const int EN_A = 5; // Left Motor Speed
const int EN_B = 6; // Right Motor Speed

void setup() {
  pinMode(leftSensor, INPUT);
  pinMode(rightSensor, INPUT);
  Serial.begin(9600);
}

void loop() {
  int L = digitalRead(leftSensor);
  int R = digitalRead(rightSensor);

  if (L == LOW && R == LOW) {
    forward();
  } else if (L == HIGH && R == LOW) {
    turnLeft();
  } else if (L == LOW && R == HIGH) {
    turnRight();
  } else {
    stop();
  }
}

void forward() {
  analogWrite(EN_A, 180);
  analogWrite(EN_B, 180);
}

void turnLeft() {
  analogWrite(EN_A, 100);
  analogWrite(EN_B, 200);
}

void turnRight() {
  analogWrite(EN_A, 200);
  analogWrite(EN_B, 100);
}

void stop() {
  analogWrite(EN_A, 0);
  analogWrite(EN_B, 0);
}`,
    notes: 'CALIBRATION: Ensure sensors are 10mm from the ground. Tune motor speeds (EN_A/B) for battery voltage drops.',
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: 'maze-solving',
    title: 'Maze Solver 1.0',
    description: 'PID-controlled wall following logic for complex pathfinding.',
    code: `// Maze Solver - Left Hand Rule
#include <NewPing.h>

const int TRIG = 12;
const int ECHO = 11;
NewPing sonar(TRIG, ECHO, 200);

void loop() {
  unsigned int dist = sonar.ping_cm();
  
  if (dist < 15) {
    // Escape maneuver
    handleObstacle();
  } else {
    navigatePath();
  }
}

void handleObstacle() {
  backUp();
  rotateRight(90);
}`,
    notes: 'The Left-Hand-Rule (LHR) is effective for mazes without loops. For cyclic mazes, implement a flood-fill algorithm.',
    icon: <Cpu className="w-6 h-6" />
  }
];

// --- Components ---

const CodeSection = ({ project, onUpdateCode, onUpdateNotes, isAdmin }: { 
  project: Project, 
  onUpdateCode: (id: string, code: string) => void,
  onUpdateNotes: (id: string, notes: string) => void,
  isAdmin: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(project.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col gap-6"
      id={`project-${project.id}`}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-gold-400 pb-4">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-gold-400">{project.title}</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">{project.description}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-2 text-xs font-black uppercase tracking-widest bg-gold-400 text-navy-950 hover:bg-gold-500 transition-colors self-start md:self-auto flex items-center gap-2"
          >
            {isEditing ? <Check className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
            {isEditing ? 'Sync Changes' : 'Open Admin Edit'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Notes Area */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gold-400 flex items-center justify-center">
              <FileText className="w-4 h-4 text-navy-950" />
            </div>
            <h3 className="text-lg font-black uppercase underline decoration-2 underline-offset-4 text-gold-400">Instructor Notes</h3>
          </div>
          <div className="bg-navy-900 border-2 border-gold-400/30 p-6 min-h-[300px] flex flex-col shadow-xl">
            {isEditing && isAdmin ? (
              <textarea
                className="w-full flex-1 bg-transparent text-sm leading-relaxed outline-none resize-none font-bold text-slate-100 placeholder:text-navy-700"
                value={project.notes}
                onChange={(e) => onUpdateNotes(project.id, e.target.value)}
                placeholder="Add secret tips or lecture notes here..."
              />
            ) : (
              <div className="text-sm leading-relaxed text-slate-300">
                {project.notes.split('\n').map((line, i) => (
                  <p key={i} className="mb-4 last:mb-0 relative pl-10 group">
                    <span className="absolute left-0 top-0 text-[10px] bg-gold-400 text-navy-950 px-1 font-mono font-bold group-hover:bg-gold-500 transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {line}
                  </p>
                ))}
                {project.notes === '' && <span className="text-navy-700 italic">No notes added yet.</span>}
              </div>
            )}
            <div className="mt-8 border-t-2 border-gold-400/20 pt-4">
              <p className="text-[10px] uppercase font-black tracking-widest text-gold-400/50 mb-2 italic">Security Tag</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gold-400 rounded-full animate-pulse" />
                <span className="font-mono text-[10px] font-bold text-gold-400/70">{project.id.toUpperCase()}_PROTOCOL_V1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Source Code Area */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
          <div className="flex justify-between items-center bg-gold-400 px-6 py-3 text-navy-950">
            <div className="flex items-center gap-3">
              <Code2 className="w-4 h-4" />
              <span className="font-mono text-xs uppercase font-black tracking-widest">
                SRC_{project.id.replace('-', '_').toUpperCase()}.INO
              </span>
            </div>
            <div className="flex items-center gap-4">
              {!isEditing && (
                <button 
                  onClick={handleCopy}
                  className="text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 bg-navy-950/20 px-3 py-1 rounded"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              )}
              <span className="text-[10px] opacity-40 font-mono hidden sm:inline">SHA-256_HASH_VERIFIED</span>
            </div>
          </div>
          
          <div className="flex-1 border-2 border-t-0 border-gold-400 bg-navy-950 relative group">
            {isEditing && isAdmin ? (
              <textarea
                className="absolute inset-0 w-full h-full p-8 font-mono text-sm bg-[#0d1117] text-emerald-400 outline-none resize-none"
                value={project.code}
                onChange={(e) => onUpdateCode(project.id, e.target.value)}
                placeholder="Paste your source code here..."
              />
            ) : (
              <SyntaxHighlighter 
                language="cpp" 
                style={vscDarkPlus}
                customStyle={{ 
                  margin: 0, 
                  padding: '2rem', 
                  background: '#0d1117',
                  height: '100%',
                  fontSize: '13px'
                }}
                codeTagProps={{ className: 'font-mono leading-relaxed' }}
              >
                {project.code}
              </SyntaxHighlighter>
            )}
            <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-8 h-8 text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [generalNotes, setGeneralNotes] = useState("Welcome Students! This lab environment contains the required source code archives and technical tips for our Module 04 Robotics segment. Please ensure your hardware matches the pin assignments in the snippets below.");
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load from local storage and check for admin mode
  useEffect(() => {
    const savedProjects = localStorage.getItem('arduino-lab-projects');
    const savedNotes = localStorage.getItem('arduino-lab-general-notes');
    if (savedProjects) {
        try {
            setProjects(JSON.parse(savedProjects));
        } catch (e) {
            console.error('Failed to parse projects', e);
        }
    }
    if (savedNotes) setGeneralNotes(savedNotes);

    const params = new URLSearchParams(window.location.search);
    setIsAdmin(params.get('mode') === 'admin');
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('arduino-lab-projects', JSON.stringify(projects));
    localStorage.setItem('arduino-lab-general-notes', generalNotes);
  }, [projects, generalNotes]);

  const updateProjectCode = (id: string, newCode: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, code: newCode } : p));
  };

  const updateProjectNotes = (id: string, newNotes: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, notes: newNotes } : p));
  };

  const getBaseUrl = () => {
    return window.location.origin + window.location.pathname;
  };

  return (
    <div className="min-h-screen bg-navy-950 font-sans text-slate-200 selection:bg-gold-400 selection:text-navy-950 pb-20">
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_70%)]" />

      <header className="max-w-7xl mx-auto px-4 pt-16 pb-8 mb-16 border-b-4 border-gold-400 flex flex-col md:flex-row justify-between items-baseline gap-8 relative z-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-9xl font-black tracking-tighter leading-none uppercase italic text-gold-400 break-words"
          >
            Robotics Lab
          </motion.h1>
          <div className="mt-8 space-y-2">
            <p className="text-sm font-bold tracking-[0.4em] uppercase text-gold-600">
              Module 04: Autonomous Navigation & Control
            </p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-400 text-navy-950 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" /> Restricted Admin Access
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="bg-gold-400 text-navy-950 px-5 py-2 font-mono text-xs uppercase font-black tracking-widest shadow-[4px_4px_0px_#d97706]">
            INST: DR_ARIS_S26
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-600/50">
            SECURED ARCHIVE / SESSION 12
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Intro Section */}
        <section className="grid grid-cols-12 gap-8 mb-24">
          <div className="col-span-12 lg:col-span-12">
            <h2 className="text-2xl font-black uppercase mb-6 underline decoration-4 underline-offset-8 text-gold-400">
              Lab Briefing Archive
            </h2>
            <div className="relative group bg-navy-900 border-2 border-gold-400 p-8 min-h-[140px] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold-600 italic">Broadcast Signal Active</label>
                {isAdmin && (
                  <button 
                    onClick={() => setIsEditingGlobal(!isEditingGlobal)}
                    className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-gold-400 text-navy-950 hover:bg-white transition-colors"
                  >
                    {isEditingGlobal ? 'Sync Broadcast' : 'Modify Signal'}
                  </button>
                )}
              </div>
              
              {isEditingGlobal && isAdmin ? (
                <textarea 
                  className="w-full flex-1 bg-transparent text-xl leading-relaxed outline-none resize-none font-bold italic text-white placeholder:text-navy-800"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  autoFocus
                />
              ) : (
                <p className="text-xl md:text-3xl font-bold leading-tight italic text-slate-100 max-w-5xl border-l-4 border-gold-400 pl-10 py-2">
                  {generalNotes}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <div className="space-y-40">
          {projects.map((project) => (
            <CodeSection 
              key={project.id} 
              project={project} 
              onUpdateCode={updateProjectCode}
              onUpdateNotes={updateProjectNotes}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {/* Admin Link Center */}
        {isAdmin && (
          <section id="share-links" className="mt-40 p-10 bg-black border-4 border-gold-400 border-double">
            <div className="flex items-center justify-between mb-8 border-b border-gold-400/20 pb-4">
              <h3 className="text-2xl font-black uppercase flex items-center gap-4 text-gold-400">
                <Share2 className="w-6 h-6" /> Share Protocol
              </h3>
              <div className="text-[10px] font-mono text-gold-600 bg-gold-400/5 px-2 py-1">ENCRYPTION_ACTIVE</div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gold-600 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> STUDENT_VIEW_URL (Read-Only)
                </p>
                <div className="flex items-center gap-2 group">
                  <code className="flex-1 text-xs text-slate-400 bg-navy-900 p-4 border border-gold-400/10 truncate font-mono">
                    {getBaseUrl()}
                  </code>
                  <a 
                    href={getBaseUrl()} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-4 bg-navy-900 border border-gold-400/10 hover:bg-gold-400 hover:text-navy-950 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gold-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-400" /> INSTRUCTOR_EDIT_URL (Admin Mode)
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-gold-400 bg-navy-900 p-4 border border-gold-400/40 font-black truncate font-mono">
                    {getBaseUrl()}?mode=admin
                  </code>
                  <a 
                    href={`${getBaseUrl()}?mode=admin`} 
                    target="_self"
                    className="p-4 bg-gold-400 text-navy-950 border border-gold-400 hover:bg-white transition-all shadow-[4px_4px_0px_#d97706]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-start gap-4 p-4 bg-navy-950 border-l-4 border-gold-400">
               <ShieldCheck className="w-5 h-5 text-gold-400 mt-1 shrink-0" />
               <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-relaxed">
                 Security Advisory: The Admin URL allows global modifications. Do not share the ?mode=admin link with students. 
                 Changes are stored in your browser's LocalStorage and will persist on this specific device.
               </div>
            </div>
          </section>
        )}

        {/* Footer Decorative */}
        <footer className="mt-40 pt-16 border-t-8 border-gold-400 flex flex-col md:flex-row justify-between items-end gap-12 overflow-hidden bg-black/40 p-8 -mx-4 md:mx-0">
          <div className="space-y-4">
            <h3 className="text-6xl font-black uppercase italic tracking-tighter opacity-10 text-gold-400 select-none">GOLDEN_CORE_S26</h3>
            <p className="text-xs font-black uppercase tracking-widest text-gold-600 flex items-center gap-3">
              <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
              ARCHIVE_STATUS: NODE_SECURED_0x4F
            </p>
          </div>
          <div className="flex gap-2">
            {[1, 0.8, 0.6, 0.4].map((op, i) => (
              <div key={i} className="w-12 h-12 bg-gold-400" style={{ opacity: op }} />
            ))}
            <div className="w-12 h-12 border-2 border-gold-400 flex items-center justify-center font-black text-gold-400">012</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
