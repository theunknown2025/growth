'use client'
import { Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { RadialLinearScale } from 'chart.js';
import { useRef } from 'react';
import { cn } from '@/shadcn/utils';
import { useGetSimpleEvaluationById } from '@/actions/evaluation';
import { TestResult } from '@/types/evaluation';

// Register the scale with Chart.js
Chart.register(RadialLinearScale);

interface ResultDetailItemProps {
  evaluationId: string;
}

export function ResultDetailItem({ evaluationId }: ResultDetailItemProps) {
  const { simpleevaluation } = useGetSimpleEvaluationById(evaluationId);

  const marketResearchQualityScore =
    (simpleevaluation?.scores as Record<string, number> | undefined)?.['Market Research Quality'] ?? 0;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const statusClass = getScoreColor(marketResearchQualityScore);

  return (
    <div className="border-b border-purple-primary/20 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">
          {simpleevaluation?.status || 'Evaluation Result'}
        </h3>
        <div className={cn('text-sm font-medium', statusClass)}>
          {simpleevaluation?.status === 'completed' ? 'Completed' : 'In Progress'}
        </div>
        <div className={cn('text-sm font-medium', statusClass)}>
          Score: {marketResearchQualityScore}/10
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div className="bg-[#0F0A19] p-3 rounded-lg border border-purple-primary/10">
          <h4 className="text-xs font-medium text-gray-400 mb-1">Feedback</h4>
          <p className="text-sm text-gray-300">
            {!simpleevaluation 
              ? 'No feedback available' 
              : typeof simpleevaluation.feedbacks === 'object' 
                ? JSON.stringify(simpleevaluation.feedbacks) 
                : simpleevaluation.feedbacks}
          </p>
        </div>

        <div className="bg-[#0F0A19] p-3 rounded-lg border border-purple-primary/10">
          <h4 className="text-xs font-medium text-gray-400 mb-1">Recommendation</h4>
          <p className="text-sm text-gray-300">
            {simpleevaluation 
              ? (typeof simpleevaluation.recommendations === 'object'
                  ? JSON.stringify(simpleevaluation.recommendations)
                  : simpleevaluation.recommendations)
              : 'No recommendation available'}
          </p>
        </div>
      </div>
    </div>
  );
}

interface RadarChartProps {
  results: {
    scores: Record<string, number>;
  };
  setChartImage: (image: string) => void;
}

function RadarChartComponent({ results, setChartImage }: RadarChartProps) {
  const chartRef = useRef<any>(null);
  const scoreKeys = Object.keys(results?.scores || {});

  if (scoreKeys.length === 0) {
    return <div>No data available</div>;
  }

  const scoreValues = scoreKeys.map(key => results.scores[key]);

  const data = {
    labels: scoreKeys,
    datasets: [
      {
        label: 'Performance Scores',
        data: scoreValues,
        backgroundColor: 'rgba(0, 123, 255, 0.3)',
        borderColor: '#007bff',
        borderWidth: 2,
        pointBackgroundColor: '#007bff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          font: {
            size: 16,
          },
          backdropColor: 'rgba(0,0,0,0)',
        },
        pointLabels: {
          font: {
            size: 16,
          },
        },
        grid: {
          color: 'rgba(255,255,255,0.15)',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: 16,
          },
        },
      },
      setImagePlugin: {
        id: 'setImagePlugin',
        afterRender: (chart: any) => {
          if (setChartImage) {
            setChartImage(chart.toBase64Image());
          }
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '100%', margin: '0 auto' }}>
      <Radar
        ref={chartRef}
        data={data}
        options={options}
        plugins={[options.plugins.setImagePlugin]}
      />
    </div>
  );
}