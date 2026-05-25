"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationControls,
  useMotionValue,
  useTransform,
} from "motion/react";
import { springs } from "./springs";
import { haptic } from "./haptic";
import { Icon } from "./Icon";
import "./SlideButton.css";

export interface SlideButtonProps {
  label?: string;
  confirmedLabel?: string;
  threshold?: number;
  onConfirm: () => void;
  disabled?: boolean;
  disabledLabel?: string;
  confirmedHoldMs?: number;
  autoReset?: boolean;
  className?: string;
}

const COMPONENT_WIDTH = 282;
const HEIGHT = 80;
const KNOB_SIZE = 80;

const TAP_OFFSET_PX = 4;
const NUDGE_DISTANCE_PX = 32;
const NUDGE_HOLD_MS = 180;
const NUDGE_KICK   = { type: "spring", stiffness: 800, damping: 15 } as const;
const NUDGE_RETURN = { type: "spring", stiffness: 320, damping: 24 } as const;

export function SlideButton({
  label = "Pedir",
  confirmedLabel = "Confirmado",
  threshold = 0.72,
  onConfirm,
  disabled = false,
  disabledLabel,
  confirmedHoldMs = 1800,
  autoReset = true,
  className,
}: SlideButtonProps) {
  const x        = useMotionValue(0);
  const knobScale = useMotionValue(1);
  const controls = useAnimationControls();
  const [confirmed, setConfirmed] = useState(false);
  const [dragging,  setDragging]  = useState(false);

  const maxDrag = COMPONENT_WIDTH - KNOB_SIZE;

  const trackClip = useTransform(
    x,
    (v) => `inset(0 0 0 ${v}px round 16px)`,
  );

  const labelOpacity = useTransform(x, (v) => {
    if (maxDrag <= 0) return 1;
    return Math.max(0, 1 - (v / maxDrag) * 1.6);
  });

  const nudgeTimerRef = useRef<number | null>(null);
  const clearNudgeTimer = () => {
    if (nudgeTimerRef.current != null) {
      window.clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = null;
    }
  };
  useEffect(() => () => clearNudgeTimer(), []);

  const nudge = () => {
    if (disabled || confirmed) return;
    haptic.select();
    clearNudgeTimer();
    animate(x, NUDGE_DISTANCE_PX, NUDGE_KICK);
    animate(knobScale, 1.04, NUDGE_KICK);
    nudgeTimerRef.current = window.setTimeout(() => {
      nudgeTimerRef.current = null;
      animate(x, 0, NUDGE_RETURN);
      animate(knobScale, 1, NUDGE_RETURN);
    }, NUDGE_HOLD_MS);
  };

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number } },
  ) => {
    setDragging(false);
    if (disabled) return;
    if (Math.abs(info.offset.x) < TAP_OFFSET_PX) {
      nudge();
      return;
    }
    const progress = info.offset.x / maxDrag;
    if (progress > threshold) {
      clearNudgeTimer();
      haptic.complete();
      setConfirmed(true);
      controls.start({ x: maxDrag, transition: springs.completing });
      onConfirm();
      if (autoReset) {
        window.setTimeout(() => {
          x.set(0);
          setConfirmed(false);
        }, confirmedHoldMs);
      }
    } else {
      haptic.drag();
      controls.start({ x: 0, transition: springs.snappy });
    }
  };

  const visibleLabel = disabled ? (disabledLabel ?? label) : label;

  return (
    <div
      className={`ds-slide${disabled ? " ds-slide--disabled" : ""}${className ? ` ${className}` : ""}`}
      style={{ width: COMPONENT_WIDTH, height: HEIGHT }}
      aria-live="polite"
    >
      {/* Black track */}
      <motion.div
        aria-hidden
        className="ds-slide__track"
        style={{
          clipPath: trackClip,
          willChange: "clip-path",
          transform: "translateZ(0)",
        }}
      />

      {/* Label */}
      <motion.span
        aria-hidden
        className="ds-slide__label"
        style={{ opacity: labelOpacity, paddingLeft: KNOB_SIZE }}
      >
        {visibleLabel}
      </motion.span>

      {/* Confirmed overlay */}
      <AnimatePresence>
        {confirmed && (
          <motion.div
            key="confirm"
            className="ds-slide__confirm"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={springs.completing}
          >
            <Icon name="check" size="lg" color="currentColor" />
            <span>{confirmedLabel}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Knob */}
      <motion.button
        type="button"
        className="ds-slide__knob"
        drag={confirmed || disabled ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={{ left: 0.2, right: 0.15 }}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        style={{ x, scale: knobScale, width: KNOB_SIZE, height: KNOB_SIZE, willChange: "transform", translateZ: 0 }}
        animate={controls}
        onPointerDown={() => {
          if (disabled || confirmed) return;
          haptic.select();
          clearNudgeTimer();
        }}
        onDragStart={() => {
          setDragging(true);
          clearNudgeTimer();
        }}
        onDragEnd={handleDragEnd}
        data-dragging={dragging || undefined}
        aria-label={`Deslizar para ${label.toLowerCase()}`}
        disabled={disabled}
      >
        <span aria-hidden className="ds-slide__halo" />
        <Icon name="arrow-right" size="lg" color="currentColor" />
      </motion.button>
    </div>
  );
}
