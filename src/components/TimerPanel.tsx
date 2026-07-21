"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Plus, Flag } from "lucide-react";

type Mode = "countdown" | "stopwatch";
type Status = "idle" | "running" | "paused" | "alarm";

interface Lap {
  total: number;
  split: number;
}

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

function splitTime(totalMs: number) {
  const ms = Math.max(0, totalMs);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return { h, m, s, cs };
}

function fmtShort(ms: number) {
  const { m, s, cs } = splitTime(ms);
  return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new Ctx();
    const now = audioCtx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, now + i * 0.35);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.35 + 0.02);
      gain.gain.linearRampToValueAtTime(0.0001, now + i * 0.35 + 0.28);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + i * 0.35);
      osc.stop(now + i * 0.35 + 0.3);
    }
  } catch {
    // audio unavailable — fail silently
  }
}

const RING_RADIUS = 138;
const RING_STROKE = 10;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

export default function TimerPanel() {
  const [mode, setMode] = useState<Mode>("countdown");
  const [status, setStatus] = useState<Status>("idle");

  const [setH, setSetH] = useState(0);
  const [setM, setSetM] = useState(5);
  const [setS, setSetS] = useState(0);

  const [displayMs, setDisplayMs] = useState(5 * 60 * 1000);
  const [laps, setLaps] = useState<Lap[]>([]);

  const runningRef = useRef(false);
  const countdownEndAtRef = useRef<number | null>(null);
  const countdownRemainingRef = useRef(0);
  const countdownTotalRef = useRef(5 * 60 * 1000);
  const stopwatchStartAtRef = useRef<number | null>(null);
  const stopwatchElapsedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const stopRaf = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const tick = useCallback(() => {
    if (!runningRef.current) return;
    if (mode === "countdown") {
      const remaining = (countdownEndAtRef.current ?? 0) - Date.now();
      if (remaining <= 0) {
        setDisplayMs(0);
        runningRef.current = false;
        setStatus("alarm");
        beep();
        return;
      }
      setDisplayMs(remaining);
    } else {
      const elapsed = stopwatchElapsedRef.current + (Date.now() - (stopwatchStartAtRef.current ?? Date.now()));
      setDisplayMs(elapsed);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [mode]);

  useEffect(() => stopRaf, []);

  useEffect(() => {
    if (mode === "countdown" && status === "idle") {
      const totalMs = (setH * 3600 + setM * 60 + setS) * 1000;
      setDisplayMs(totalMs);
      countdownTotalRef.current = totalMs || 1;
    }
  }, [setH, setM, setS, mode, status]);

  const switchMode = (next: Mode) => {
    if (runningRef.current) return;
    stopRaf();
    setMode(next);
    setStatus("idle");
    setLaps([]);
    stopwatchElapsedRef.current = 0;
    countdownRemainingRef.current = 0;
    if (next === "countdown") {
      const totalMs = (setH * 3600 + setM * 60 + setS) * 1000;
      setDisplayMs(totalMs);
      countdownTotalRef.current = totalMs || 1;
    } else {
      setDisplayMs(0);
    }
  };

  const adjust = (field: "h" | "m" | "s", dir: 1 | -1) => {
    if (runningRef.current) return;
    if (field === "h") setSetH((v) => Math.min(23, Math.max(0, v + dir)));
    if (field === "m") setSetM((v) => Math.min(59, Math.max(0, v + dir)));
    if (field === "s") setSetS((v) => Math.min(59, Math.max(0, v + dir)));
  };

  const applyPreset = (h: number, m: number, s: number) => {
    if (runningRef.current) return;
    setSetH(h);
    setSetM(m);
    setSetS(s);
  };

  const start = () => {
    if (mode === "countdown") {
      if (status !== "paused") {
        const totalMs = (setH * 3600 + setM * 60 + setS) * 1000;
        if (totalMs <= 0) return;
        countdownRemainingRef.current = totalMs;
        countdownTotalRef.current = totalMs;
      }
      countdownEndAtRef.current = Date.now() + countdownRemainingRef.current;
    } else {
      stopwatchStartAtRef.current = Date.now();
    }
    runningRef.current = true;
    setStatus("running");
    rafRef.current = requestAnimationFrame(tick);
  };

  const pause = () => {
    runningRef.current = false;
    stopRaf();
    if (mode === "countdown") {
      countdownRemainingRef.current = (countdownEndAtRef.current ?? 0) - Date.now();
    } else {
      stopwatchElapsedRef.current += Date.now() - (stopwatchStartAtRef.current ?? Date.now());
    }
    setStatus("paused");
  };

  const reset = () => {
    runningRef.current = false;
    stopRaf();
    setStatus("idle");
    if (mode === "countdown") {
      countdownRemainingRef.current = 0;
      const totalMs = (setH * 3600 + setM * 60 + setS) * 1000;
      setDisplayMs(totalMs);
      countdownTotalRef.current = totalMs || 1;
    } else {
      stopwatchElapsedRef.current = 0;
      setDisplayMs(0);
      setLaps([]);
    }
  };

  const addLap = () => {
    if (mode !== "stopwatch" || !runningRef.current) return;
    const elapsed = stopwatchElapsedRef.current + (Date.now() - (stopwatchStartAtRef.current ?? Date.now()));
    setLaps((prev) => {
      const prevTotal = prev.length ? prev[0].total : 0;
      return [{ total: elapsed, split: elapsed - prevTotal }, ...prev];
    });
  };

  const addFiveMinutes = () => {
    if (mode !== "countdown") return;
    const addMs = 5 * 60 * 1000;
    if (status === "running") {
      countdownEndAtRef.current = (countdownEndAtRef.current ?? Date.now()) + addMs;
      countdownTotalRef.current += addMs;
    } else if (status === "paused") {
      countdownRemainingRef.current += addMs;
      countdownTotalRef.current += addMs;
      setDisplayMs(countdownRemainingRef.current);
    } else {
      const totalSec = setH * 3600 + setM * 60 + setS + 5 * 60;
      setSetH(Math.min(23, Math.floor(totalSec / 3600)));
      setSetM(Math.floor((totalSec % 3600) / 60));
      setSetS(totalSec % 60);
    }
  };

  const { h, m, s } = splitTime(displayMs);
  const hh = pad(h), mm = pad(m), ss = pad(s);

  const progressFrac =
    mode === "countdown"
      ? Math.max(0, Math.min(1, displayMs / (countdownTotalRef.current || 1)))
      : (displayMs % 60000) / 60000;

  const dashOffset = RING_CIRC * (1 - progressFrac);

  const statusColor =
    status === "running" ? "text-emerald-500"
    : status === "paused" ? "text-amber-500"
    : status === "alarm" ? "text-rose-500"
    : "text-slate-400";

  const statusDot =
    status === "running" ? "bg-emerald-500"
    : status === "paused" ? "bg-amber-500"
    : status === "alarm" ? "bg-rose-500 animate-pulse"
    : "bg-slate-300";

  const statusLabel =
    status === "running" ? (mode === "countdown" ? "RUNNING" : "MEASURING")
    : status === "paused" ? "PAUSED"
    : status === "alarm" ? "TIME'S UP"
    : "READY";

  const Tile = ({ value }: { value: string }) => (
    <span className="font-mono font-extrabold text-[40px] sm:text-[46px] leading-none text-[#232338] bg-[#F3F2FB] rounded-2xl w-[58px] sm:w-[68px] h-[74px] sm:h-[84px] flex items-center justify-center shadow-[0_2px_0_rgba(35,35,56,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] font-variant-tabular">
      {value}
    </span>
  );

  return (
    <div className="max-w-xl mx-auto px-4 pb-16">
      {/* 상단 광고 자리 */}
      <div className="bg-white/10 border border-white/20 rounded-xl min-h-[64px] flex items-center justify-center text-white/60 text-[11px] tracking-wide uppercase mb-6 backdrop-blur-sm">
        광고 영역 (상단)
      </div>

      {/* 모드 전환 */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1">
          <button
            onClick={() => switchMode("countdown")}
            className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors ${
              mode === "countdown" ? "bg-white text-indigo-700 shadow-sm" : "text-white/70"
            }`}
          >
            카운트다운
          </button>
          <button
            onClick={() => switchMode("stopwatch")}
            className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors ${
              mode === "stopwatch" ? "bg-white text-indigo-700 shadow-sm" : "text-white/70"
            }`}
          >
            스탑워치
          </button>
        </div>
      </div>

      {/* 메인 카드 */}
      <div className="bg-white rounded-[32px] shadow-2xl px-6 sm:px-10 pt-10 pb-9">
        <div className="text-center mb-1">
          <p className="text-indigo-600 font-extrabold text-sm tracking-[0.18em] uppercase">
            {mode === "countdown" ? "Countdown Session" : "Stopwatch Session"}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {mode === "countdown" ? "카운트다운 세션" : "경과 시간 측정"}
          </p>
        </div>

        {/* 원형 링 + 숫자 타일 */}
        <div className="relative flex items-center justify-center my-8">
          <svg
            width={(RING_RADIUS + RING_STROKE) * 2}
            height={(RING_RADIUS + RING_STROKE) * 2}
            className="-rotate-90"
          >
            <circle
              cx={RING_RADIUS + RING_STROKE}
              cy={RING_RADIUS + RING_STROKE}
              r={RING_RADIUS}
              fill="none"
              stroke="#E9E7F9"
              strokeWidth={RING_STROKE}
            />
            <circle
              cx={RING_RADIUS + RING_STROKE}
              cy={RING_RADIUS + RING_STROKE}
              r={RING_RADIUS}
              fill="none"
              stroke="#6C5CE7"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.2s linear" }}
            />
            <circle
              cx={RING_RADIUS + RING_STROKE}
              cy={RING_STROKE}
              r={4}
              fill="#6C5CE7"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <Tile value={hh} />
              <Tile value={mm} />
              <Tile value={ss} />
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              <span className={`text-[11px] font-bold tracking-[0.14em] ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {mode === "countdown" && status === "idle" && (
          <>
            <div className="flex justify-center gap-4 sm:gap-6 mb-5">
              {([
                { label: "시간", field: "h" as const, display: pad(setH) },
                { label: "분", field: "m" as const, display: pad(setM) },
                { label: "초", field: "s" as const, display: pad(setS) },
              ]).map((d) => (
                <div key={d.field} className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => adjust(d.field, 1)}
                    className="w-7 h-6 rounded-md text-slate-400 text-xs flex items-center justify-center hover:text-indigo-600 transition-colors"
                  >
                    ▲
                  </button>
                  <span className="font-mono font-bold text-base text-slate-600 w-9 text-center">
                    {d.display}
                  </span>
                  <button
                    onClick={() => adjust(d.field, -1)}
                    className="w-7 h-6 rounded-md text-slate-400 text-xs flex items-center justify-center hover:text-indigo-600 transition-colors"
                  >
                    ▼
                  </button>
                  <span className="text-[10px] text-slate-300 tracking-wide">{d.label}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 flex-wrap mb-2">
              {[1, 3, 5, 10, 25].map((min) => (
                <button
                  key={min}
                  onClick={() => applyPreset(0, min, 0)}
                  className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  {min}분
                </button>
              ))}
            </div>
          </>
        )}

        {/* 컨트롤 버튼 */}
        <div className="flex justify-center gap-3 flex-wrap mt-7">
          <button
            onClick={() => (runningRef.current ? pause() : start())}
            className="flex items-center gap-2 bg-white border border-slate-200 shadow-[0_2px_8px_rgba(35,35,56,0.08)] rounded-full font-semibold text-sm text-[#232338] px-6 py-3 hover:shadow-[0_4px_14px_rgba(35,35,56,0.12)] transition-shadow active:translate-y-px"
          >
            {runningRef.current ? <Pause size={16} /> : <Play size={16} />}
            {runningRef.current ? "Pause" : status === "paused" ? "Resume" : "Start"}
          </button>

          <button
            onClick={reset}
            className="flex items-center gap-2 bg-white border border-slate-200 shadow-[0_2px_8px_rgba(35,35,56,0.08)] rounded-full font-semibold text-sm text-[#232338] px-6 py-3 hover:shadow-[0_4px_14px_rgba(35,35,56,0.12)] transition-shadow active:translate-y-px"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          {mode === "countdown" ? (
            <button
              onClick={addFiveMinutes}
              className="flex items-center gap-2 bg-white border border-slate-200 shadow-[0_2px_8px_rgba(35,35,56,0.08)] rounded-full font-semibold text-sm text-[#232338] px-6 py-3 hover:shadow-[0_4px_14px_rgba(35,35,56,0.12)] transition-shadow active:translate-y-px"
            >
              <Plus size={16} />
              5 min
            </button>
          ) : (
            <button
              onClick={addLap}
              disabled={!runningRef.current}
              className="flex items-center gap-2 bg-white border border-slate-200 shadow-[0_2px_8px_rgba(35,35,56,0.08)] rounded-full font-semibold text-sm text-[#232338] px-6 py-3 hover:shadow-[0_4px_14px_rgba(35,35,56,0.12)] transition-shadow active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Flag size={16} />
              Lap
            </button>
          )}
        </div>

        {mode === "stopwatch" && (
          <div className="mt-7">
            <div className="flex justify-between text-[10px] tracking-[0.1em] uppercase text-slate-400 px-1.5 pb-2 border-b border-slate-100">
              <span>랩</span>
              <span>구간 / 누적</span>
            </div>
            <div className="max-h-[220px] overflow-y-auto">
              {laps.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-4">랩 버튼을 누르면 기록이 여기 쌓여요</p>
              ) : (
                laps.map((lap, i) => (
                  <div key={laps.length - i} className="flex justify-between items-baseline font-mono text-[13px] py-2.5 px-1.5 border-b border-slate-100 text-[#232338]">
                    <span className="text-slate-400 w-11">#{laps.length - i}</span>
                    <span>
                      {fmtShort(lap.total)}{" "}
                      <span className="text-indigo-500 text-[11px]">+{fmtShort(lap.split)}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 광고 자리 */}
      <div className="bg-white/10 border border-white/20 rounded-xl min-h-[64px] flex items-center justify-center text-white/60 text-[11px] tracking-wide uppercase mt-6 backdrop-blur-sm">
        광고 영역 (하단)
      </div>

      <p className="text-center text-[11px] text-white/60 mt-6">
        브라우저 탭이 백그라운드에 있어도 정확한 시간을 유지합니다.
      </p>
    </div>
  );
}
