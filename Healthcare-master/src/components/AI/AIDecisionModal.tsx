import React, { useState } from 'react';
import { CheckCircle, XCircle, Brain, AlertCircle } from 'lucide-react';
import { AIDecision } from '../../types';

interface AIDecisionModalProps {
  decision: AIDecision;
  onConfirm: (decision: AIDecision, note?: string) => void;
  onReject: (decision: AIDecision, note?: string) => void;
  onClose: () => void;
}

export default function AIDecisionModal({ decision, onConfirm, onReject, onClose }: AIDecisionModalProps) {
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    onConfirm(decision, note);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    onReject(decision, note);
    setIsProcessing(false);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'triage':
        return 'Triage Assessment';
      case 'meeting_summary':
      return 'Meeting Summary';
      case 'chat_summary':
        return 'Chat Summary';
      case 'rpm_alert':
        return 'RPM Alert';
      default:
        return 'AI Recommendation';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                AI Recommendation Review
              </h3>
              <p className="text-sm text-gray-600">
                {getTypeLabel(decision.type)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">AI Recommendation</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{decision.content.text}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confidence Score
              </label>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(decision.content.confidence)}`}>
                {Math.round(decision.content.confidence * 100)}%
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generated
              </label>
              <p className="text-sm text-gray-600">
                {new Date(decision.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {decision.content.provenance && decision.content.provenance.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Sources
              </label>
              <div className="bg-blue-50 rounded-lg p-3">
                <ul className="text-sm text-blue-800 space-y-1">
                  {decision.content.provenance.map((source, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {decision.content.confidence < 0.6 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  <strong>Low Confidence:</strong> This recommendation has a confidence score below 60%. 
                  Please review carefully before accepting.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes about your decision..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <XCircle className="h-4 w-4" />
            <span>{isProcessing ? 'Rejecting...' : 'Reject'}</span>
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-4 py-2 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{isProcessing ? 'Confirming...' : 'Confirm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}