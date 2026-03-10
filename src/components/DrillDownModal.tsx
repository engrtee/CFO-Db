import React from 'react';
import { X, ChevronRight } from 'lucide-react';

interface DrillDownLevel {
  label: string;
  value: string;
}

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  breadcrumb: string[];
  data: DrillDownLevel[];
  onDrillDown?: (item: DrillDownLevel) => void;
}

const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  title,
  breadcrumb,
  data,
  onDrillDown,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              {breadcrumb.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="w-4 h-4" />}
                  <span className={index === breadcrumb.length - 1 ? 'font-semibold' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {data.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 ${
                  onDrillDown ? 'hover:bg-gray-50 cursor-pointer' : ''
                }`}
                onClick={() => onDrillDown && onDrillDown(item)}
              >
                <span className="font-medium text-gray-900">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{item.value}</span>
                  {onDrillDown && <ChevronRight className="w-5 h-5 text-gray-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDownModal;
