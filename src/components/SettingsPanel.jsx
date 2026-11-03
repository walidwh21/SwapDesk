import React from "react";
import Modal from "./Modal";

const PRESETS = [0.1, 0.5, 1];

export default function SettingsPanel({ slippage, deadline, onSlippage, onDeadline, onClose }) {
  return (
    <Modal title="Transaction settings" onClose={onClose}>
      <p className="label">Slippage tolerance</p>
      <div className="seg">
        {PRESETS.map((p) => (
          <button key={p} className={slippage === p ? "seg-btn on" : "seg-btn"} onClick={() => onSlippage(p)}>
            {p}%
          </button>
        ))}
        <label className="seg-input">
          <input
            type="number"
            min="0.01"
            max="50"
            step="0.1"
            value={slippage}
            onChange={(e) => onSlippage(Math.min(50, Math.max(0.01, Number(e.target.value) || 0.5)))}
          />
          <span>%</span>
        </label>
      </div>

      <p className="label">Transaction deadline</p>
      <label className="seg-input wide">
        <input
          type="number"
          min="1"
          max="180"
          value={deadline}
          onChange={(e) => onDeadline(Math.min(180, Math.max(1, Number(e.target.value) || 10)))}
        />
        <span>minutes</span>
      </label>
      <p className="hint">Swaps revert if the price moves beyond the slippage tolerance or the deadline passes.</p>
    </Modal>
  );
}
