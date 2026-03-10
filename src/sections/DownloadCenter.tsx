import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';

const DownloadCenter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const documents = [
    {
      name: 'Q3 2025 Financial Report',
      category: 'Financial Reports',
      date: '2025-10-01',
      size: '2.4 MB',
      format: 'PDF',
    },
    {
      name: 'Q3 2025 Budget Analysis',
      category: 'Budget Reports',
      date: '2025-10-01',
      size: '1.8 MB',
      format: 'Excel',
    },
    {
      name: 'Risk Assessment Report - Q3',
      category: 'Risk Reports',
      date: '2025-09-28',
      size: '3.2 MB',
      format: 'PDF',
    },
    {
      name: 'Tax Filing Records - Q2 2025',
      category: 'Tax Documents',
      date: '2025-07-15',
      size: '1.2 MB',
      format: 'PDF',
    },
    {
      name: 'Expense Details - September 2025',
      category: 'Expense Reports',
      date: '2025-10-01',
      size: '890 KB',
      format: 'Excel',
    },
    {
      name: 'Investor Presentation Q3 2025',
      category: 'Investor Relations',
      date: '2025-10-05',
      size: '5.4 MB',
      format: 'PDF',
    },
    {
      name: 'Performance Metrics - YTD 2025',
      category: 'Performance Reports',
      date: '2025-10-01',
      size: '2.1 MB',
      format: 'Excel',
    },
    {
      name: 'Liquidity Analysis Report',
      category: 'Financial Reports',
      date: '2025-09-30',
      size: '1.5 MB',
      format: 'PDF',
    },
  ];

  const categories = ['all', ...Array.from(new Set(documents.map((doc) => doc.category)))];

  const filteredDocuments =
    selectedCategory === 'all'
      ? documents
      : documents.filter((doc) => doc.category === selectedCategory);

  const getFormatIcon = (format: string) => {
    return format === 'Excel' ? FileSpreadsheet : FileText;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Download Center</h1>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Documents' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc, index) => {
                const FormatIcon = getFormatIcon(doc.format);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`${
                            doc.format === 'Excel' ? 'bg-green-100' : 'bg-red-100'
                          } rounded-lg p-2`}
                        >
                          <FormatIcon
                            className={`w-5 h-5 ${
                              doc.format === 'Excel' ? 'text-green-600' : 'text-red-600'
                            }`}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{doc.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {doc.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{doc.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {doc.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Export Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="bg-blue-100 rounded-lg p-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Export All Financial Data</div>
              <div className="text-sm text-gray-600">CSV format, current quarter</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="bg-green-100 rounded-lg p-3">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Export Budget Report</div>
              <div className="text-sm text-gray-600">Excel format, YTD summary</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="bg-red-100 rounded-lg p-3">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Export Executive Summary</div>
              <div className="text-sm text-gray-600">PDF format, board-ready</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadCenter;
