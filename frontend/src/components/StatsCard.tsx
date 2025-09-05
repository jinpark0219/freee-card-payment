import { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react'
import clsx from 'clsx'

interface StatsCardProps {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, "ref"> & {
      title?: string | undefined;
      titleId?: string | undefined;
    } & RefAttributes<SVGSVGElement>
  >
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon 
}: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon 
            className="h-8 w-8 text-gray-400" 
            aria-hidden="true"
            data-testid="stats-icon"
          />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              <div className={clsx(
                'ml-2 flex items-baseline text-sm font-medium',
                {
                  'text-green-600': changeType === 'increase',
                  'text-red-600': changeType === 'decrease',
                }
              )}>
                {change}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}