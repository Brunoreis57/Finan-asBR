import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardStatProps {
  title: string;
  value: string;
  status: 'positive' | 'negative' | 'neutral';
}

function DashboardStat({ title, value, status }: DashboardStatProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        
        {status !== 'neutral' && (
          <div className={`flex items-center rounded-full px-2 py-1 text-xs ${
            status === 'positive' 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}>
            {status === 'positive' ? (
              <>
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>Up</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-3 w-3 mr-1" />
                <span>Down</span>
              </>
            )}
          </div>
        )}
      </div>
      
      <p className={`text-2xl font-semibold mt-2 ${
        status === 'positive' 
          ? 'text-emerald-600 dark:text-emerald-400' 
          : status === 'negative' 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-gray-800 dark:text-gray-200'
      }`}>
        {value}
      </p>
    </div>
  );
}

export default DashboardStat;