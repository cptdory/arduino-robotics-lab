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
  notes: string | string[];
  icon: React.ReactNode;
}

// --- Initial Data ---

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'line-tracing',
    title: 'Line Tracing Robot',
    description: 'Autonomous line-follower using IR-sensor feedback arrays.',
    code: `int leftWheel = 2;
int leftWheelSpeed = 5;
int rightWheel = 4;
int rightWheelSpeed = 6;

int sensorLeft = A0;
int sensorMid = A1;
int sensorRight = A2;
int threshold = 300;

int speed = 60;
int lastTurn = 0;
void setup() {
  pinMode(leftWheel, OUTPUT);
  pinMode(leftWheelSpeed, OUTPUT);
  pinMode(rightWheel, OUTPUT);
  pinMode(rightWheelSpeed, OUTPUT);
}
void loop() {
  int sensorValueLeft = analogRead(sensorLeft);
  int sensorValueMid = analogRead(sensorMid);
  int sensorValueRight = analogRead(sensorRight);
  bool L = sensorValueLeft > threshold;
  bool M = sensorValueMid > threshold;
  bool R = sensorValueRight > threshold;

  if (M) {
    moveForward();
  } else if (L && !R) {
    rotateRight();
    lastTurn = -1;
  } else if (!L && R) {
    rotateLeft();
    lastTurn = 1;
  } else {
    if (lastTurn == 1) rotateLeft();
    else if (lastTurn == -1) rotateRight();
    else stop();
  }
}
void stop() {
  analogWrite(leftWheelSpeed, 0);
  analogWrite(rightWheelSpeed, 0);
}
void rotateRight() {
  digitalWrite(leftWheel, HIGH);
  analogWrite(leftWheelSpeed, 0);
  digitalWrite(rightWheel, LOW);
  analogWrite(rightWheelSpeed, speed);
}
void moveForward() {
  digitalWrite(leftWheel, HIGH);
  analogWrite(leftWheelSpeed, speed);
  digitalWrite(rightWheel, LOW);
  analogWrite(rightWheelSpeed, speed);
}
void rotateLeft() {
  digitalWrite(leftWheel, LOW);
  analogWrite(leftWheelSpeed, speed);
  digitalWrite(rightWheel, HIGH);
  analogWrite(rightWheelSpeed, 0);
}`,
    notes: [
            'always make sure na yung speed is tama lang para maka stop or maka rotate on time si robot, look at the track and think if kakayanin ba sa current setup ng speed and rotation sa code',
      'try tapping the sensors it should turn red every tinatakpan pag hindi paadjust kay sir Cris kung pwede pa i calibrate',
      'sa 2 student na nagloloko yung robot, upon checking kay Avril sira si ultrasonic sensor, pero napalitan naman ng spare so it should be working now, kay Xian, We tried changing the ultrasonic sensors but yung sira nya talaga is sa expansion board na, so most probably hihiram siya for maze, sa line trace no need',
      'sa mga nasiraan expansion board you can borrow from a friend, d naman mag mamatter si hardware since we all have the same kit, sa code tlaga magkakaalaman',
      'sa mga nageerror yung code pagupload, make sure na magkaibang sketch yung line and maze, ginawa lng natin sila sa na same file different tabs para mas madali macopy functions sa other file, pero when uploading it should be separate file'

    ],
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: 'maze-solving',
    title: 'Maze Solver',
    description: 'Obstacle-avoiding / Reactive maze solver',
    code: `#include <Servo.h>
// ================= MOTOR PINS =================
int leftWheel  = 2;
int leftWheelSpeed  = 5;
int rightWheel = 4;
int rightWheelSpeed = 6;
// ================= TUNABLE/CALIBRATION ===========
int speed = 80;
int clearDistance = 25;     // Safe to move forward
int deadEndLimit  = 20;     // Too close on both sides
// ================= ULTRASONIC SENSOR =================
int trigPin = 12;
int echoPin = 13;
// ================= SERVO =================
Servo myServo;
// ================= TURN MEMORY (CONSTANT) =================
// 0 = no direction yet
// 1 = turning left
// -1 = turning right
int chosenDirection = 0;
int turnCount = 0;
int maxTurns  = 6;

// ================= FUNCTION: GET DISTANCE =================
float checkDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);

  digitalWrite(trigPin, LOW);
  float distance = pulseIn(echoPin, HIGH) / 58.0;
  delay(10);
  return distance;
}

// ================= SETUP =================
void setup() {
  pinMode(leftWheel, OUTPUT);
  pinMode(leftWheelSpeed, OUTPUT);
  pinMode(rightWheel, OUTPUT);
  pinMode(rightWheelSpeed, OUTPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  myServo.attach(10); //YOU CAN CHANGE THIS IF YOU CHANGED YOUR SERVO PIN(default D10) 
  myServo.write(90); // Center position
}
// ================= MAIN LOOP =================
void loop() {
  float frontDistance = checkDistance();
  // ===== PATH IS CLEAR =====
  if (frontDistance > clearDistance) {
    chosenDirection = 0;
    turnCount = 0;
    moveForward();
    delay(10);
    return;
  }
  // ===== OBSTACLE DETECTED =====
  stop();
  delay(300);

  float leftDistance = 0;
  float rightDistance = 0;
  // ===== CHECK BOTH SIDES (ONLY ONCE) =====
  if (chosenDirection == 0) {
    // Look LEFT
    myServo.write(150);
    delay(500);
    leftDistance = checkDistance();
    // Look RIGHT
    myServo.write(30);
    delay(500);
    rightDistance = checkDistance();
    // Return to CENTER
    myServo.write(90);
    delay(300);
    // ===== DEAD END =====
    if (leftDistance < deadEndLimit && rightDistance < deadEndLimit) {
      escapeDeadEnd();
      return;
    }
    // ===== CHOOSE BEST DIRECTION =====
    if (leftDistance > rightDistance) {
      chosenDirection = 1;
    } else {
      chosenDirection = -1;
    }
    turnCount = 0;
  }
  // ===== TOO MANY TURNS (STUCK) =====
  if (turnCount >= maxTurns) {
    escapeDeadEnd();
    chosenDirection = 0;
    turnCount = 0;
    return;
  }
  // ===== EXECUTE TURN =====
  if (chosenDirection == 1) {
    rotateLeft();
    delay(400);
  } else {
    rotateRight();
    delay(400);
  }
  turnCount++;
  // Move forward a bit after turning
  moveForward();
  delay(300);
}

// ================= ESCAPE FUNCTION =================
void escapeDeadEnd() {
  moveBackward();
  delay(800);
  rotateRight();
  delay(900);
  stop();
  delay(200);
}
// ================= MOTOR FUNCTIONS =================
void moveForward() {
  digitalWrite(leftWheel, HIGH);
  analogWrite(leftWheelSpeed, speed);
  digitalWrite(rightWheel, LOW);
  analogWrite(rightWheelSpeed, speed);
}
void moveBackward() {
  digitalWrite(leftWheel, LOW);
  analogWrite(leftWheelSpeed, speed);
  digitalWrite(rightWheel, HIGH);
  analogWrite(rightWheelSpeed, speed);
}
void rotateLeft() {
  digitalWrite(leftWheel, LOW);
  analogWrite(leftWheelSpeed, speed);
  digitalWrite(rightWheel, LOW);
  analogWrite(rightWheelSpeed, speed);
}
void rotateRight() {
  digitalWrite(leftWheel, HIGH);
  analogWrite(leftWheelSpeed, speed);
  digitalWrite(rightWheel, HIGH);
  analogWrite(rightWheelSpeed, speed);
}
void stop() {
  analogWrite(leftWheelSpeed, 0);
  analogWrite(rightWheelSpeed, 0);
}`,
    notes: [
      'sa maze you can adjust the clearDistance and deadEndLimit, note that the value is in cm, so visualize lang kung kakayanin ba umikot ni robot sa maze',
      'kung hindi gumagalaw si ultrasonic sensor try using other pins, like D10, D9, D7 etc, or ask sir Cris for guidance',
      'sa direction ni wheels check you direction yung naka HIGH and LOW',
      'sa may something sa reverse or d maka reverse adjust lang yung function na escapeDeadEnd, visualize kung ilang beses dapat mag rotate para maka lingon uli sa likod',
      'again control the speed 255 is the maximum speed but its always advisable na itodo ito lalo kung hnd ganun ka sturdy si maze'
    ],
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

  const noteLines = Array.isArray(project.notes) ? project.notes : project.notes.split('\n');
  const hasNotes = noteLines.some((line) => line.trim().length > 0);

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
                value={typeof project.notes === 'string' ? project.notes : project.notes.join('\n')}
                onChange={(e) => onUpdateNotes(project.id, e.target.value)}
                placeholder="Add secret tips or lecture notes here..."
              />
            ) : (
              <div className="text-sm leading-relaxed text-slate-300">
                {hasNotes ? (
                  noteLines.map((line, i) => (
                    <p key={i} className="mb-4 last:mb-0 relative pl-10 group">
                      <span className="absolute left-0 top-0 text-[10px] bg-gold-400 text-navy-950 px-1 font-mono font-bold group-hover:bg-gold-500 transition-colors">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {line}
                    </p>
                  ))
                ) : (
                  <span className="text-navy-700 italic">No notes added yet.</span>
                )}
              </div>
            )}
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
            TIPSSSSS....
          </motion.h1>
          <div className="mt-8 space-y-2">
            <p className="text-sm font-bold tracking-[0.4em] uppercase text-gold-600">
              Para sa competition :), GOODLUCK!
            </p>
            <a 
              href="/guideline.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-2 bg-gold-400 text-navy-950 font-black uppercase tracking-widest text-xs hover:bg-gold-500 transition-colors"
            >
              View PDF Guideline
            </a>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="bg-gold-400 text-navy-950 px-5 py-2 font-mono text-xs uppercase font-black tracking-widest shadow-[4px_4px_0px_#d97706]">
            - sir Francis
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 relative z-10">
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
      </main>
    </div>
  );
}
