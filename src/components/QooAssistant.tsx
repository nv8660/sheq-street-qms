import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Sparkles, Send, CheckCircle, HelpCircle } from 'lucide-react';

export const QooAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hi Naveen! I am Qoo, your SHEQ Street QMS assistant. Your audit-readiness is currently at 85%. How can I assist you with ISO 9001 compliance or your QMS modules today?',
    },
  ]);

  // Draggable position state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    // Initial position: bottom right
    const defaultRight = 24;
    const defaultBottom = 20;
    const x = Math.max(10, window.innerWidth - 68 - defaultRight);
    const y = Math.max(10, window.innerHeight - 88 - defaultBottom);
    setPosition({ x, y });

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const maxX = window.innerWidth - 75;
        const maxY = window.innerHeight - 95;
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Primary button only
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position?.x ?? window.innerWidth - 88,
      initialY: position?.y ?? window.innerHeight - 104,
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasMovedRef.current = true;
    }

    const newX = dragStartRef.current.initialX + deltaX;
    const newY = dragStartRef.current.initialY + deltaY;

    // Viewport bounds
    const boundedX = Math.min(Math.max(10, newX), window.innerWidth - 75);
    const boundedY = Math.min(Math.max(10, newY), window.innerHeight - 95);

    setPosition({ x: boundedX, y: boundedY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}

    // If clicked without dragging, toggle chat
    if (!hasMovedRef.current) {
      setIsOpen((prev) => !prev);
    }
  };

  const getChatStyle = (): React.CSSProperties => {
    if (!position) return { position: 'fixed', bottom: '96px', right: '24px', zIndex: 50 };

    const isRight = position.x > window.innerWidth / 2;
    const isTop = position.y < window.innerHeight / 2;

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 50,
    };

    if (isRight) {
      style.right = `${Math.max(16, window.innerWidth - position.x - 70)}px`;
    } else {
      style.left = `${Math.max(16, position.x)}px`;
    }

    if (isTop) {
      style.top = `${Math.min(window.innerHeight - 440, position.y + 75)}px`;
    } else {
      style.bottom = `${Math.max(16, window.innerHeight - position.y + 10)}px`;
    }

    return style;
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage;
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInputMessage('');

    setTimeout(() => {
      let reply = "I'm monitoring your QMS modules! You have 4 open NCRs with closest due date in 9 days for the Warehouse department. Make sure to review root cause analyses before the upcoming internal audit.";
      if (userMsg.toLowerCase().includes('audit') || userMsg.toLowerCase().includes('score')) {
        reply = "Your current Audit Readiness is 85%! The Audit Matrix has 4 processes scheduled for 2026. Target is 80%, so you're on track to surpass your goal once the 2 open NCRs are cleared.";
      } else if (userMsg.toLowerCase().includes('ncr')) {
        reply = "There are 4 Open NCRs in your register (Warehouse and Production). Two are currently marked as IN PROGRESS. Would you like to review their corrective action plans?";
      } else if (userMsg.toLowerCase().includes('trial') || userMsg.toLowerCase().includes('upgrade')) {
        reply = "You have 13 days remaining in your Free Trial of SHEQ Street. Upgrading unlocks unlimited users, automated compliance alerts, and full ISO 9001 audit export reports.";
      }
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    }, 600);
  };

  return (
    <>
      {/* Draggable Floating Qoo Mascot Button */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setIsDragging(false)}
        style={
          position
            ? {
                left: `${position.x}px`,
                top: `${position.y}px`,
              }
            : {
                right: '24px',
                bottom: '20px',
              }
        }
        className={`fixed z-40 flex flex-col items-center select-none touch-none ${
          isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'
        } transition-transform duration-150`}
      >
        <button
          type="button"
          tabIndex={-1}
          className={`group relative w-16 h-16 rounded-full bg-white shadow-xl hover:shadow-2xl border-2 ${
            isDragging ? 'border-orange-500 shadow-orange-500/20' : 'border-slate-200 hover:border-orange-400'
          } p-1 flex items-center justify-center transition-colors pointer-events-none`}
          title="Drag to move • Click to open Qoo AI"
        >
          {/* Qoo Robot matching pinned image */}
          <div className="w-full h-full flex items-center justify-center relative">
            <img
              src="/qoo-robot.png"
              alt="Qoo Robot"
              draggable={false}
              className="w-14 h-14 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-200 pointer-events-none select-none"
            />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </button>
        <span className="text-[11px] font-bold text-slate-800 mt-1 bg-white/90 px-1.5 py-0.5 rounded-md shadow-2xs border border-slate-200/60 pointer-events-none">
          Qoo
        </span>
      </div>

      {/* Floating Qoo Chat Window */}
      {isOpen && (
        <div
          style={getChatStyle()}
          className="w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0c1527] to-[#16274a] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden p-1 shadow-xs">
                <img
                  src="/qoo-robot.png"
                  alt="Qoo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Qoo — QMS Copilot
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">ISO 9001:2015 Smart Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="p-4 h-72 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden p-1 shadow-xs mt-0.5">
                    <img
                      src="/qoo-robot.png"
                      alt="Qoo"
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[82%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => {
                setInputMessage('What is pending for the audit?');
              }}
              className="px-2 py-0.5 bg-white border border-slate-300 rounded-full text-slate-700 hover:border-orange-500 truncate"
            >
              Audit status?
            </button>
            <button
              onClick={() => {
                setInputMessage('Summarize open NCRs');
              }}
              className="px-2 py-0.5 bg-white border border-slate-300 rounded-full text-slate-700 hover:border-orange-500 truncate"
            >
              Open NCRs?
            </button>
            <button
              onClick={() => {
                setInputMessage('Check calibration status');
              }}
              className="px-2 py-0.5 bg-white border border-slate-300 rounded-full text-slate-700 hover:border-orange-500 truncate"
            >
              Calibrations?
            </button>
          </div>

          {/* Input Box */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Qoo about your QMS..."
              className="flex-1 text-xs px-3 py-2 bg-slate-100 border border-transparent focus:border-blue-500 rounded-lg outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-[#2563eb] hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
