import React, { useEffect } from "react";

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {
    // Web Audio indisponible (navigateur trop ancien) : on ignore silencieusement.
  }
}

export default function AlertModal({ message, onClose }) {
  useEffect(() => {
    playBeep();
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center text-center animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mb-4">
          <path
            d="M12 3.5l10 17H2l10-17z"
            fill="#FEE2E2"
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M12 9.5v4.5" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16.8" r="1.1" fill="#DC2626" />
        </svg>

        <p className="text-haigana-dark font-semibold">{message}</p>

        <button
          onClick={onClose}
          className="mt-6 px-6 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}