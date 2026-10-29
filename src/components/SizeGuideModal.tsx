import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [activeTab, setActiveTab] = useState<'tops' | 'bottoms'>('tops');

  if (!isOpen) return null;

  const topsData = [
    { size: 'XS', chestIn: '36 - 38', chestCm: '91 - 96', lengthIn: '27.5', lengthCm: '70', shoulderIn: '17.5', shoulderCm: '44.5' },
    { size: 'S', chestIn: '38 - 40', chestCm: '96 - 101', lengthIn: '28.5', lengthCm: '72', shoulderIn: '18.5', shoulderCm: '47' },
    { size: 'M', chestIn: '40 - 42', chestCm: '101 - 106', lengthIn: '29.5', lengthCm: '75', shoulderIn: '19.5', shoulderCm: '49.5' },
    { size: 'L', chestIn: '42 - 44', chestCm: '106 - 112', lengthIn: '30.5', lengthCm: '77', shoulderIn: '20.5', shoulderCm: '52' },
    { size: 'XL', chestIn: '44 - 46', chestCm: '112 - 117', lengthIn: '31.5', lengthCm: '80', shoulderIn: '21.5', shoulderCm: '54.5' },
    { size: 'XXL', chestIn: '46 - 48', chestCm: '117 - 122', lengthIn: '32.5', lengthCm: '82', shoulderIn: '22.5', shoulderCm: '57' },
  ];

  const bottomsData = [
    { size: '28', waistIn: '28 - 29', waistCm: '71 - 74', hipIn: '36', hipCm: '91', lengthIn: '39', lengthCm: '99' },
    { size: '30', waistIn: '30 - 31', waistCm: '76 - 79', hipIn: '38', hipCm: '96', lengthIn: '40', lengthCm: '101' },
    { size: '32', waistIn: '32 - 33', waistCm: '81 - 84', hipIn: '40', hipCm: '101', lengthIn: '41', lengthCm: '104' },
    { size: '34', waistIn: '34 - 35', waistCm: '86 - 89', hipIn: '42', hipCm: '106', lengthIn: '41.5', lengthCm: '105' },
    { size: '36', waistIn: '36 - 37', waistCm: '91 - 94', hipIn: '44', hipCm: '112', lengthIn: '42', lengthCm: '107' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-lg shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-neutral-800" />
            <h3 className="text-lg font-bold uppercase tracking-tight text-neutral-900 font-display">
              Men's Size & Measurement Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black rounded-md hover:bg-neutral-100"
            aria-label="Close size guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls: Department Tabs + Unit Switch */}
        <div className="py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md">
            <button
              onClick={() => setActiveTab('tops')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeTab === 'tops' ? 'bg-white text-black shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Tops & Outerwear
            </button>
            <button
              onClick={() => setActiveTab('bottoms')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeTab === 'bottoms' ? 'bg-white text-black shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Bottoms & Denim
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md">
            <button
              onClick={() => setUnit('inches')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                unit === 'inches' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                unit === 'cm' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Size Table */}
        <div className="overflow-x-auto border border-neutral-200 rounded-md">
          {activeTab === 'tops' ? (
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Chest ({unit === 'inches' ? 'in' : 'cm'})</th>
                  <th className="py-2.5 px-3">Length ({unit === 'inches' ? 'in' : 'cm'})</th>
                  <th className="py-2.5 px-3">Shoulder ({unit === 'inches' ? 'in' : 'cm'})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono tabular-nums">
                {topsData.map((row) => (
                  <tr key={row.size} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-sans font-bold text-neutral-900">{row.size}</td>
                    <td className="py-2.5 px-3 text-neutral-700">{unit === 'inches' ? row.chestIn : row.chestCm}</td>
                    <td className="py-2.5 px-3 text-neutral-700">{unit === 'inches' ? row.lengthIn : row.lengthCm}</td>
                    <td className="py-2.5 px-3 text-neutral-700">{unit === 'inches' ? row.shoulderIn : row.shoulderCm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Waist Tag</th>
                  <th className="py-2.5 px-3">Waist ({unit === 'inches' ? 'in' : 'cm'})</th>
                  <th className="py-2.5 px-3">Hip ({unit === 'inches' ? 'in' : 'cm'})</th>
                  <th className="py-2.5 px-3">Outseam ({unit === 'inches' ? 'in' : 'cm'})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono tabular-nums">
                {bottomsData.map((row) => (
                  <tr key={row.size} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-sans font-bold text-neutral-900">{row.size}</td>
                    <td className="py-2.5 px-3 text-neutral-700">{unit === 'inches' ? row.waistIn : row.waistCm}</td>
                    <td className="py-2.5 px-3 text-neutral-700">{unit === 'inches' ? row.hipIn : row.hipCm}</td>
                    <td className="py-2.5 px-3 text-neutral-700">{unit === 'inches' ? row.lengthIn : row.lengthCm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Measuring Tip */}
        <div className="mt-5 p-3.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-neutral-600 space-y-1">
          <p className="font-bold text-neutral-900">How to measure:</p>
          <p>• <strong>Chest:</strong> Measure around the fullest part of your chest, keeping tape horizontal under arms.</p>
          <p>• <strong>Length:</strong> Measure from highest point of the shoulder down to the bottom hem.</p>
          <p>• <strong>Fit Note:</strong> URBN streetwear fits feature relaxed, dropped shoulders. If you prefer a regular tailored fit, consider sizing down one size.</p>
        </div>
      </div>
    </div>
  );
};
