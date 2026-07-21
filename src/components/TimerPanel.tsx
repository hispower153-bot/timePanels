"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

export default function TimerPanel() {
  const [mode, setMode] = useState<Mode>("countdown");
  const [status, setStatus] = useState<Status>("idle");

  // countdown setup
  const [setH, setSetH] = useState(0);
  const [setM, setSetM] = useState(5);
  const [setS, setSetS] = useState(0);

  const [displayMs, setDisplayMs] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);

  const runningRef = useRef(false);
  const countdownEndAtRef = useRef<number | null>(null);
  const countdownRemainingRef = useRef(0);
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
      setDisplayMs((setH * 3600 + setM * 60 + setS) * 1000);
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
      setDisplayMs((setH * 3600 + setM * 60 + setS) * 1000);
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
      setDisplayMs((setH * 3600 + setM * 60 + setS) * 1000);
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

  const { h, m, s } = splitTime(displayMs);
  const hh = pad(h), mm = pad(m), ss = pad(s);
  const showMs = mode === "stopwatch";
  const csDisplay = pad(splitTime(displayMs).cs);

  const ledClass =
    status === "running" ? "bg-teal shadow-[0_0_0_4px_rgba(46,196,182,0.18),0_0_10px_rgba(46,196,182,0.6)]"
    : status === "paused" ? "bg-amber shadow-[0_0_0_4px_rgba(255,159,28,0.18)]"
    : status === "alarm" ? "bg-red shadow-[0_0_0_4px_rgba(255,93,93,0.22),0_0_14px_rgba(255,93,93,0.7)] animate-pulse"
    : "bg-muted shadow-[0_0_0_3px_rgba(124,133,144,0.12)]";

  const statusLabel =
    status === "running" ? (mode === "countdown" ? "진행 중" : "측정 중")
    : status === "paused" ? "일시정지"
    : status === "alarm" ? "시간 종료"
    : "대기 중";

  const Cell = ({ value }: { value: string }) => (
    <span className="font-mono font-bold text-[clamp(38px,11vw,62px)] leading-none min-w-[0.62em] text-center text-text bg-[#101317] rounded-lg px-1 pt-2.5 pb-2 shadow-[inset_0_2px_3px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.06)] font-variant-tabular">
      {value}
    </span>
  );

  return (
    <div className="max-w-xl mx-auto px-4 pb-16">
      {/* 상단 광고 자리 */}
      <div className="bg-panel border border-hairline rounded-lg min-h-[66px] flex items-center justify-center text-muted text-[11px] tracking-wide uppercase mb-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        광고 영역 (상단)
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-panel border border-hairline rounded-full p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)]">
          <button
            onClick={() => switchMode("countdown")}
            className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors ${
              mode === "countdown" ? "bg-panel-alt text-text shadow-[0_1px_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.35)]" : "text-muted"
            }`}
          >
            카운트다운
          </button>
          <button
            onClick={() => switchMode("stopwatch")}
            className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors ${
              mode === "stopwatch" ? "bg-panel-alt text-text shadow-[0_1px_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.35)]" : "text-muted"
            }`}
          >
            스탑워치
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-b from-panel to-[#191D22] border border-hairline rounded-[18px] px-6 pt-9 pb-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className={`w-2 h-2 rounded-full transition-colors ${ledClass}`} />
          <span className="text-[11px] tracking-[0.14em] uppercase text-muted">{statusLabel}</span>
        </div>

        <div className="flex items-baseline justify-center gap-1.5 flex-wrap mb-2">
          <div className="flex gap-[3px]"><Cell value={hh[0]} /><Cell value={hh[1]} /></div>
          <span className="font-mono text-[clamp(38px,11vw,62px)] text-muted pt-2.5 pb-2 self-start">:</span>
          <div className="flex gap-[3px]"><Cell value={mm[0]} /><Cell value={mm[1]} /></div>
          <span className="font-mono text-[clamp(38px,11vw,62px)] text-muted pt-2.5 pb-2 self-start">:</span>
          <div className="flex gap-[3px]"><Cell value={ss[0]} /><Cell value={ss[1]} /></div>
          <span className={`font-mono text-[clamp(18px,5vw,26px)] text-teal self-end pb-3 min-w-[1.6em] font-variant-tabular ${showMs ? "visible" : "invisible"}`}>
            .{csDisplay}
          </span>
        </div>
        <p className="text-center text-[12px] text-muted tracking-wide mb-6">
          {mode === "countdown" ? "시:분:초" : "경과 시간"}
        </p>

        {mode === "countdown" && (
          <>
            <div className="flex justify-center gap-4 sm:gap-5 mb-6">
              {([
                { label: "시간", val: setH, field: "h" as const, display: pad(setH) },
                { label: "분", val: setM, field: "m" as const, display: pad(setM) },
                { label: "초", val: setS, field: "s" as const, display: pad(setS) },
              ]).map((d) => (
                <div key={d.field} className="flex flex-col items-center gap-1.5">
                  <label className="text-[10px] tracking-[0.12em] uppercase text-muted">{d.label}</label>
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => adjust(d.field, 1)}
                      className="w-8 h-6 rounded-md border border-hairline bg-panel-alt text-muted text-xs flex items-center justify-center hover:text-amber hover:border-amber transition-colors"
                    >
                      ▲
                    </button>
                    <span className="font-mono font-bold text-xl w-11 text-center">{d.display}</span>
                    <button
                      onClick={() => adjust(d.field, -1)}
                      className="w-8 h-6 rounded-md border border-hairline bg-panel-alt text-muted text-xs flex items-center justify-center hover:text-amber hover:border-amber transition-colors"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 flex-wrap mb-1">
              {[1, 3, 5, 10, 25].map((min) => (
                <button
                  key={min}
                  onClick={() => applyPreset(0, min, 0)}
                  className="font-mono text-xs border border-dashed border-hairline text-muted px-3 py-1.5 rounded-full hover:text-amber hover:border-amber transition-colors"
                >
                  {min}분
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-center gap-3 flex-wrap mt-6">
          <button
            onClick={() => (runningRef.current ? pause() : start())}
            className={`rounded-[10px] font-semibold text-sm px-6 py-3 transition-transform active:translate-y-px hover:brightness-110 ${
              runningRef.current ? "bg-amber text-[#0C1412]" : "bg-teal text-[#0C1412]"
            }`}
          >
            {runningRef.current ? "일시정지" : status === "paused" ? "재개" : "시작"}
          </button>
          {mode === "stopwatch" && (
            <button
              onClick={addLap}
              className="rounded-[10px] font-semibold text-sm px-6 py-3 bg-panel-alt text-text border border-hairline hover:border-muted transition-colors"
            >
              랩
            </button>
          )}
          <button
            onClick={reset}
            className="rounded-[10px] font-semibold text-sm px-6 py-3 bg-transparent text-muted border border-hairline hover:text-text transition-colors"
          >
            초기화
          </button>
        </div>

        {mode === "stopwatch" && (
          <div className="mt-6">
            <div className="flex justify-between text-[10px] tracking-[0.1em] uppercase text-muted px-1.5 pb-2 border-b border-dashed border-hairline">
              <span>랩</span>
              <span>구간 / 누적</span>
            </div>
            <div className="max-h-[220px] overflow-y-auto">
              {laps.length === 0 ? (
                <p className="text-center text-muted text-xs py-4">랩 버튼을 누르면 기록이 여기 쌓여요</p>
              ) : (
                laps.map((lap, i) => (
                  <div key={laps.length - i} className="flex justify-between items-baseline font-mono text-[13px] py-2.5 px-1.5 border-b border-dashed border-hairline">
                    <span className="text-muted w-11">#{laps.length - i}</span>
                    <span>
                      {fmtShort(lap.total)}{" "}
                      <span className="text-teal text-[11px]">+{fmtShort(lap.split)}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 광고 자리 */}
      <div className="bg-panel border border-hairline rounded-lg min-h-[66px] flex items-center justify-center text-muted text-[11px] tracking-wide uppercase mt-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        광고 영역 (하단)
      </div>

      <p className="text-center text-[11px] text-muted mt-6">
        브라우저 탭이 백그라운드에 있어도 정확한 시간을 유지합니다.
      </p>
    </div>
  );
}
