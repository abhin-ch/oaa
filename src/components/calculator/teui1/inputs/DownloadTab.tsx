'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Mail } from 'lucide-react';
import type { Building } from '@/schema/building';
import type { TEUI1Result } from '@/engine/teui1';
import { GAS_M3_TO_KWH, PROPANE_LBS_TO_KWH, OIL_L_TO_KWH, BIOFUEL_M3_TO_KWH } from '@/engine/teui1';

interface DownloadTabProps {
  building: Building;
  result: TEUI1Result;
}

export function DownloadTab({ building, result }: DownloadTabProps) {
  const t = useTranslations('teui1.download');
  const tEnergy = useTranslations('teui1.energy');
  const tRenew = useTranslations('teui1.renewables');
  const tProj = useTranslations('teui1.project');
  const tBuild = useTranslations('teui1.building');
  const tResults = useTranslations('teui1.results');
  const tTypes = useTranslations('buildings.types');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const es = building.energySources ?? {};
  const rn = building.renewables ?? {};
  const ep = building.evaluationPeriod ?? {};
  const area = es.conditionedAreaM2 ?? 0;
  const occupancy = typeof building.occupancy === 'string' ? building.occupancy : 'residential';
  const hasEnergy = result.totalEnergyKwh > 0;

  async function handleDownloadPdf() {
    if (downloading) return;
    setDownloading(true);

    // Detect mobile + share capability before async work begins
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const canShareFiles =
      typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
    // iOS fallback: pre-open window synchronously while user gesture is active
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    let preOpenedWindow: Window | null = null;
    if (isIOS && !canShareFiles) {
      preOpenedWindow = window.open('', '_blank');
    }

    try {
      const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
      void svg2pdf; // ensure plugin registers

      const pdf = new jsPDF('p', 'mm', 'a4');
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const M = 15; // margin
      const cW = W - M * 2; // content width
      let y = M;

      // --- Helpers ---
      const black = () => {
        pdf.setTextColor(23, 23, 23);
      };
      const gray = () => {
        pdf.setTextColor(115, 115, 115);
      };
      const lightGray = () => {
        pdf.setTextColor(163, 163, 163);
      };

      const checkPage = (needed: number) => {
        if (y + needed > H - 15) {
          pdf.addPage();
          y = M;
        }
      };

      const sectionTitle = (title: string) => {
        checkPage(12);
        gray();
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title.toUpperCase(), M, y);
        y += 1.5;
        pdf.setDrawColor(229, 229, 229);
        pdf.setLineWidth(0.3);
        pdf.line(M, y, M + cW, y);
        y += 5;
      };

      const dataRow = (label: string, value: string) => {
        checkPage(7);
        gray();
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(label, M, y);
        black();
        pdf.setFont('helvetica', 'bold');
        pdf.text(value, M + cW, y, { align: 'right' });
        y += 1;
        pdf.setDrawColor(245, 245, 245);
        pdf.setLineWidth(0.2);
        pdf.line(M, y, M + cW, y);
        y += 5;
      };

      // === OAA LOGO (vector SVG, top-right) ===
      const logoH = 8; // mm tall
      try {
        const resp = await fetch('/oaa-logo.svg');
        const svgText = await resp.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgEl = svgDoc.querySelector('svg');
        if (svgEl) {
          const logoW = logoH * (491.6 / 108.6); // preserve aspect ratio
          await pdf.svg(svgEl, {
            x: M + cW - logoW,
            y: y - 1,
            width: logoW,
            height: logoH,
          });
        }
      } catch {
        // Logo fetch failed (offline?) — skip silently
      }

      // === HEADER TEXT ===
      black();
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(building.meta.name ?? 'Building', M, y + 5);
      y += 8;
      gray();
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${tTypes(occupancy)} — ${t('reportTitle')}`.toUpperCase(), M, y);
      y += 3;
      pdf.setDrawColor(23, 23, 23);
      pdf.setLineWidth(0.8);
      pdf.line(M, y, M + cW, y);
      y += 8;

      // === SCORE CARDS ===
      const cardW = cW / 3;
      pdf.setDrawColor(229, 229, 229);
      pdf.setLineWidth(0.3);
      pdf.rect(M, y, cW, 22);
      pdf.line(M + cardW, y, M + cardW, y + 22);
      pdf.line(M + cardW * 2, y, M + cardW * 2, y + 22);

      const scoreY = y;
      // TEUI Score
      gray();
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text(tResults('title').toUpperCase(), M + 4, scoreY + 5);
      black();
      pdf.setFontSize(18);
      pdf.text(hasEnergy ? result.teui.toFixed(1) : '--', M + 4, scoreY + 13);
      gray();
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text('kWh/m²/yr', M + 4, scoreY + 18);

      // Total Energy
      gray();
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text(tResults('totalEnergy').toUpperCase(), M + cardW + 4, scoreY + 5);
      black();
      pdf.setFontSize(18);
      pdf.text(
        hasEnergy ? result.totalEnergyKwh.toLocaleString() : '--',
        M + cardW + 4,
        scoreY + 13,
      );
      gray();
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text('kWh', M + cardW + 4, scoreY + 18);

      // GHGI
      gray();
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text(tResults('ghgiUnit').toUpperCase(), M + cardW * 2 + 4, scoreY + 5);
      black();
      pdf.setFontSize(18);
      pdf.text(
        hasEnergy ? result.ghgi.kgCo2PerM2.toFixed(2) : '--',
        M + cardW * 2 + 4,
        scoreY + 13,
      );

      y = scoreY + 30;

      // === ENERGY BREAKDOWN ===
      if (hasEnergy && result.breakdown.length > 0) {
        sectionTitle(tResults('breakdown'));
        const barColors = ['#171717', '#525252', '#737373', '#a3a3a3', '#d4d4d4', '#4ade80'];
        for (let i = 0; i < result.breakdown.length; i++) {
          const b = result.breakdown[i];
          checkPage(7);
          // Color bar
          const color = barColors[i % barColors.length];
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const bl = parseInt(color.slice(5, 7), 16);
          pdf.setFillColor(r, g, bl);
          pdf.rect(M, y - 3, 1.5, 4, 'F');

          black();
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(tEnergy(b.source), M + 4, y);

          pdf.setFont('helvetica', 'bold');
          pdf.text(`${Math.round(b.percentage)}%`, M + cW - 25, y, { align: 'right' });

          lightGray();
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${b.kwhPerM2.toFixed(1)} kWh/m²`, M + cW, y, { align: 'right' });

          y += 1;
          pdf.setDrawColor(245, 245, 245);
          pdf.setLineWidth(0.2);
          pdf.line(M, y, M + cW, y);
          y += 5;
        }
        y += 3;
      }

      // === BUILDING INFO ===
      sectionTitle(t('buildingInfo'));
      dataRow(tBuild('typology'), tTypes(occupancy));
      dataRow(tBuild('conditionedArea'), area > 0 ? `${area.toLocaleString()} m²` : '--');
      y += 3;

      // === ENERGY INPUTS ===
      sectionTitle(t('energyInputs'));
      const energyRows = [
        { label: tEnergy('electricity'), value: es.electricityKwh, unit: 'kWh' },
        {
          label: tEnergy('naturalGas'),
          value: es.naturalGasM3,
          unit: 'm³',
          kwh: (es.naturalGasM3 ?? 0) * GAS_M3_TO_KWH,
        },
        {
          label: tEnergy('propane'),
          value: es.propaneLbs,
          unit: 'lbs',
          kwh: (es.propaneLbs ?? 0) * PROPANE_LBS_TO_KWH,
        },
        {
          label: tEnergy('heatingOil'),
          value: es.heatingOilL,
          unit: 'litres',
          kwh: (es.heatingOilL ?? 0) * OIL_L_TO_KWH,
        },
        {
          label: tEnergy('biofuel'),
          value: es.biofuelM3,
          unit: 'm³',
          kwh: (es.biofuelM3 ?? 0) * BIOFUEL_M3_TO_KWH,
        },
      ];
      for (const row of energyRows) {
        const v = row.value ?? 0;
        let display = v > 0 ? `${v.toLocaleString()} ${row.unit}` : '--';
        if (row.kwh != null && v > 0) {
          display += ` = ${row.kwh.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh`;
        }
        dataRow(row.label, display);
      }
      y += 3;

      // === RENEWABLE INPUTS ===
      sectionTitle(t('renewableInputs'));
      const renewRows = [
        { label: tRenew('onSite'), value: rn.onSiteKwh },
        { label: tRenew('offSiteElectricity'), value: rn.offSiteElectricityKwh },
        { label: tRenew('offSiteGas'), value: rn.offSiteGasKwh },
      ];
      for (const row of renewRows) {
        const v = row.value ?? 0;
        dataRow(row.label, v > 0 ? `${v.toLocaleString()} kWh` : '--');
      }
      y += 3;

      // === EVALUATION PERIOD ===
      sectionTitle(t('evaluationPeriod'));
      dataRow(tProj('beginDate'), ep.beginDate ?? '--');
      dataRow(tProj('endDate'), ep.endDate ?? '--');

      // === FOOTER ===
      lightGray();
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated by OAA TEUI Calculator  •  ${new Date().toLocaleDateString()}`, M, H - 8);

      // --- Save ---
      const date = new Date().toISOString().slice(0, 10);
      const projectName = (building.meta.name ?? 'Building').replace(/\s+/g, '-');
      const fileName = `${projectName}_TEUI-v1_${date}.pdf`;

      const blob = pdf.output('blob');
      let shared = false;

      // Mobile: try Web Share API first (works on both iOS and Android)
      if (isMobile && canShareFiles) {
        try {
          const file = new File([blob], fileName, { type: 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: fileName });
            shared = true;
          }
        } catch (shareErr) {
          // AbortError = user dismissed share sheet, PDF was still generated
          if (shareErr instanceof Error && shareErr.name === 'AbortError') {
            shared = true;
          }
          // Any other error: fall through to blob URL fallback
        }
      }

      if (!shared) {
        const blobUrl = URL.createObjectURL(blob);

        if (isIOS) {
          // iOS Safari: a.click() doesn't trigger downloads for blobs.
          // Use pre-opened window if we have one, otherwise navigate current window.
          if (preOpenedWindow) {
            preOpenedWindow.location.href = blobUrl;
          } else {
            window.location.href = blobUrl;
          }
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        } else {
          // Desktop & Android: standard blob download
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
        }
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
      if (preOpenedWindow) preOpenedWindow.close();
    } finally {
      setDownloading(false);
    }
  }

  function handleEmailReport() {
    if (!email) return;
    const summary = [
      `${t('reportTitle')} — ${building.meta.name ?? 'Building'}`,
      `Type: ${tTypes(occupancy)}`,
      `Area: ${area.toLocaleString()} m²`,
      `TEUI: ${result.teui.toFixed(1)} kWh/m²/yr`,
      `Total Energy: ${result.totalEnergyKwh.toLocaleString()} kWh`,
      `Net Energy: ${result.netEnergyKwh.toLocaleString()} kWh`,
      `GHGI: ${result.ghgi.kgCo2PerM2.toFixed(2)} kgCO₂e/m²`,
    ].join('\n');

    navigator.clipboard.writeText(summary).then(() => {
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    });
  }

  return (
    <div className="space-y-5 pb-4">
      {/* Download PDF */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex flex-1 items-center justify-center gap-2 border border-text-primary bg-text-primary px-4 py-2.5 text-sm font-semibold text-text-inverse transition-all hover:opacity-90 disabled:opacity-60"
        >
          {downloading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-75"
                />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              {t('downloadPdf')}
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border-default" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
          {t('or')}
        </span>
        <div className="h-px flex-1 bg-border-default" />
      </div>

      {/* Email form */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {t('emailReport')}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            placeholder={t('emailPlaceholder')}
            className="flex-1 rounded-md border border-input bg-bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleEmailReport}
            disabled={!email}
            className="flex items-center justify-center gap-1.5 whitespace-nowrap border border-border-default bg-bg-surface px-3 py-2 text-sm font-semibold text-text-secondary transition-all hover:border-border-strong hover:text-text-primary disabled:opacity-40"
          >
            <Mail className="h-3.5 w-3.5" />
            {t('emailSend')}
          </button>
        </div>
        {emailSent && (
          <p className="text-xs font-medium text-green-600 animate-in fade-in duration-200">
            ✓ {t('emailSent')}
          </p>
        )}
      </div>
    </div>
  );
}
