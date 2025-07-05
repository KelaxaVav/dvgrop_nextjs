import React, { useState } from 'react';
import { Save, RefreshCw, MessageSquare, Languages } from 'lucide-react';

interface SMSTemplateFormProps {
  templates: any;
  updateTemplate: (type: string, language: string, template: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

export default function SMSTemplateForm({ templates, updateTemplate, language, onLanguageChange }: SMSTemplateFormProps) {
  const [editedTemplates, setEditedTemplates] = useState({...templates});
  const [activeTemplate, setActiveTemplate] = useState('loanApplication');

  const handleTemplateChange = (type: string, lang: string, value: string) => {
    setEditedTemplates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [lang]: value
      }
    }));
  };

  const handleSaveTemplate = (type: string) => {
    updateTemplate(type, 'english', editedTemplates[type].english);
    updateTemplate(type, 'tamil', editedTemplates[type].tamil);
  };

  const resetTemplate = (type: string) => {
    setEditedTemplates(prev => ({
      ...prev,
      [type]: {
        ...templates[type]
      }
    }));
  };

  const templateTypes = [
    { id: 'loanApplication', name: 'Loan Application', description: 'Sent when a new loan application is submitted' },
    { id: 'loanApproval', name: 'Loan Approval', description: 'Sent when a loan is approved and disbursed' },
    { id: 'paymentReceipt', name: 'Payment Receipt', description: 'Sent when a payment is received' },
    { id: 'latePayment', name: 'Late Payment Reminder', description: 'Sent when a payment is overdue' },
    { id: 'preDueReminder', name: 'Pre-Due Reminder', description: 'Sent one day before payment is due' },
    { id: 'loanRejection', name: 'Loan Rejection', description: 'Sent when a loan application is rejected' }
  ];

  const placeholderInfo = {
    loanApplication: ['[Name]', '[amount]', '[LoanID]'],
    loanApproval: ['[Name]', '[amount]', '[date]'],
    paymentReceipt: ['[amount]', '[date]', '[balance]'],
    latePayment: ['[amount]', '[date]'],
    preDueReminder: ['[amount]', '[date]'],
    loanRejection: ['[LoanID]']
  };

  return (
    <div className="space-y-6">
      {/* Language Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Languages className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Template Language</h3>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => onLanguageChange('english')}
              className={`px-4 py-2 rounded-lg ${
                language === 'english' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('tamil')}
              className={`px-4 py-2 rounded-lg ${
                language === 'tamil' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tamil
            </button>
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templateTypes.map((template) => (
          <div
            key={template.id}
            onClick={() => setActiveTemplate(template.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              activeTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                template.id === 'loanApplication' ? 'bg-blue-100 text-blue-600' :
                template.id === 'loanApproval' ? 'bg-green-100 text-green-600' :
                template.id === 'paymentReceipt' ? 'bg-purple-100 text-purple-600' :
                template.id === 'latePayment' ? 'bg-red-100 text-red-600' :
                template.id === 'preDueReminder' ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-gray-800">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Template Editor */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Edit {templateTypes.find(t => t.id === activeTemplate)?.name} Template
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={() => resetTemplate(activeTemplate)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={() => handleSaveTemplate(activeTemplate)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* English Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              English Template
            </label>
            <textarea
              value={editedTemplates[activeTemplate].english}
              onChange={(e) => handleTemplateChange(activeTemplate, 'english', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter SMS template text..."
            />
          </div>

          {/* Tamil Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamil Template
            </label>
            <textarea
              value={editedTemplates[activeTemplate].tamil}
              onChange={(e) => handleTemplateChange(activeTemplate, 'tamil', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter Tamil SMS template text..."
            />
          </div>

          {/* Placeholder Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Available Placeholders</h4>
            <div className="flex flex-wrap gap-2">
              {(placeholderInfo[activeTemplate as keyof typeof placeholderInfo] || []).map((placeholder) => (
                <span key={placeholder} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                  {placeholder}
                </span>
              ))}
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Use these placeholders in your template. They will be replaced with actual values when the SMS is sent.
            </p>
          </div>

          {/* Preview */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Preview</h4>
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="bg-white p-3 rounded-lg inline-block max-w-md shadow-sm">
                <p className="text-gray-800">
                  {editedTemplates[activeTemplate][language === 'english' ? 'english' : 'tamil']}
                </p>
                <p className="text-xs text-gray-500 text-right mt-1">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}