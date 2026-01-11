import React from 'react';
import { TrendingUp, Clock, Activity } from 'lucide-react';
import { Observation } from '../../types';

interface ObservationChartProps {
  observations: Observation[];
  metricName: string;
}

export default function ObservationChart({ observations, metricName }: ObservationChartProps) {
  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Generate mock historical data for the chart visualization
  const generateChartData = () => {
    const points = [];
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
      let value;
      
      // Generate realistic values based on metric type
      switch (metricName.toLowerCase()) {
        case 'heart rate':
          value = 70 + Math.random() * 40; // 70-110 bpm
          break;
        case 'oxygen saturation':
          value = 95 + Math.random() * 5; // 95-100%
          break;
        case 'blood pressure':
          value = 115 + Math.random() * 20; // 115-135 mmHg
          break;
        case 'temperature':
          value = 97.5 + Math.random() * 2; // 97.5-99.5°F
          break;
        default:
          value = 50 + Math.random() * 50;
      }
      
      points.push({ timestamp: timestamp.toISOString(), value: Math.round(value * 10) / 10 });
    }
    return points;
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));
  const range = maxValue - minValue;

  // Generate SVG path
  const svgWidth = 600;
  const svgHeight = 200;
  const padding = 40;
  
  const pathData = chartData
    .map((point, index) => {
      const x = padding + (index / (chartData.length - 1)) * (svgWidth - 2 * padding);
      const y = padding + ((maxValue - point.value) / range) * (svgHeight - 2 * padding);
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{metricName} Trend</h3>
          <p className="text-sm text-gray-600">Last 24 hours</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <TrendingUp className="h-4 w-4" />
          <span>Real-time monitoring</span>
        </div>
      </div>

      <div className="mb-6">
        <svg width="100%" height="200" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
          <defs>
            <pattern id="grid" width="60" height="40" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <path
            d={pathData}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {chartData.map((point, index) => {
            const x = padding + (index / (chartData.length - 1)) * (svgWidth - 2 * padding);
            const y = padding + ((maxValue - point.value) / range) * (svgHeight - 2 * padding);
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                className="hover:fill-blue-700 cursor-pointer"
              >
                <title>{`${point.value} at ${formatTimestamp(point.timestamp)}`}</title>
              </circle>
            );
          })}
          
          <text x="10" y={padding} fill="#6B7280" fontSize="12" dy="0.3em">
            {maxValue.toFixed(1)}
          </text>
          <text x="10" y={svgHeight - padding} fill="#6B7280" fontSize="12" dy="0.3em">
            {minValue.toFixed(1)}
          </text>
        </svg>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Readings</h4>
        <div className="space-y-2">
          {observations.slice(0, 3).map((observation) => (
            <div key={observation.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {observation.value} {observation.unit}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(observation.timestamp)} at {formatTimestamp(observation.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Normal
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}