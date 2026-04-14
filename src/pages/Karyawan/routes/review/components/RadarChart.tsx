// * This file defines route module logic for src/pages/Karyawan/routes/review/components/RadarChart.tsx.

import { useEffect, useRef, useState } from "react";
import { formatScore } from "../../../utils/review/formatter";
import { RadarPoint } from "../types/RadarTypes";

// & This function defines RadarChart behavior in the route flow.
// % Fungsi ini mendefinisikan perilaku RadarChart dalam alur route.
export function RadarChart({ data }: { data: RadarPoint[] }) {
  // & Process the main execution steps of RadarChart inside this function body.
  // % Memproses langkah eksekusi utama RadarChart di dalam body fungsi ini.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(280);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // & This function component/helper defines updateSize behavior for this route file.
    // % Fungsi komponen/helper ini mendefinisikan perilaku updateSize untuk file route ini.
    const updateSize = () => {
      // & Process the main execution steps of updateSize inside this function body.
      // % Memproses langkah eksekusi utama updateSize di dalam body fungsi ini.
      const nextSize = Math.max(220, Math.min(320, wrapper.clientWidth - 12));
      setSize(nextSize);
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    context.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 48;
    const totalPoints = data.length;

    // & This function component/helper defines angleByIndex behavior for this route file.
    // % Fungsi komponen/helper ini mendefinisikan perilaku angleByIndex untuk file route ini.
    const angleByIndex = (index: number) =>
      (Math.PI * 2 * index) / totalPoints - Math.PI / 2;

    // & This function component/helper defines pointAt behavior for this route file.
    // % Fungsi komponen/helper ini mendefinisikan perilaku pointAt untuk file route ini.
    const pointAt = (index: number, radialDistance: number) => ({
      x: centerX + radialDistance * Math.cos(angleByIndex(index)),
      y: centerY + radialDistance * Math.sin(angleByIndex(index)),
    });

    context.clearRect(0, 0, size, size);

    for (let ring = 1; ring <= 5; ring += 1) {
      context.beginPath();

      for (let index = 0; index < totalPoints; index += 1) {
        const { x, y } = pointAt(index, (radius * ring) / 5);
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.closePath();
      context.strokeStyle = "rgba(148, 163, 184, 0.28)";
      context.lineWidth = 1;
      context.stroke();
    }

    for (let index = 0; index < totalPoints; index += 1) {
      context.beginPath();
      context.moveTo(centerX, centerY);

      const { x, y } = pointAt(index, radius);
      context.lineTo(x, y);
      context.strokeStyle = "rgba(148, 163, 184, 0.24)";
      context.lineWidth = 1;
      context.stroke();
    }

    context.beginPath();
    data.forEach((item, index) => {
      // & Process the main execution steps of pointAt inside this function body.
      // % Memproses langkah eksekusi utama pointAt di dalam body fungsi ini.
      const ratio = Math.min(1, Math.max(0, item.value / item.max));
      const { x, y } = pointAt(index, radius * ratio);

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.closePath();
    context.fillStyle = "rgba(59, 130, 246, 0.2)";
    context.fill();
    context.strokeStyle = "rgba(59, 130, 246, 0.9)";
    context.lineWidth = 2.5;
    context.stroke();

    data.forEach((item, index) => {
      const ratio = Math.min(1, Math.max(0, item.value / item.max));
      const { x, y } = pointAt(index, radius * ratio);

      context.beginPath();
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fillStyle = "#2563eb";
      context.fill();
      context.strokeStyle = "#ffffff";
      context.lineWidth = 1.5;
      context.stroke();

      const labelPoint = pointAt(index, radius + 24);
      const shortLabel =
        item.label.length > 12 ? `${item.label.slice(0, 11)}…` : item.label;

      context.font = "600 11px sans-serif";
      context.fillStyle = "#64748b";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(
        `${shortLabel} (${formatScore(item.value)})`,
        labelPoint.x,
        labelPoint.y,
      );
    });
  }, [data, size]);

  if (data.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-sm text-gray-500">
        Belum ada data kategori.
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="mx-auto w-full max-w-[340px]">
      <canvas ref={canvasRef} className="mx-auto block" />
    </div>
  );
}