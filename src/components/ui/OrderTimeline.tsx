import { CheckCircle, Circle, Clock } from 'lucide-react';

export interface TimelineItem {
    status: 'completed' | 'active' | 'pending';
    title: string;
    timestamp?: string;
    details?: string;
    estimate?: string;
}

interface OrderTimelineProps {
    items: TimelineItem[];
}

export const OrderTimeline = ({ items }: OrderTimelineProps) => {
    return (
        <div className="relative">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={index} className="relative pb-8">
                        {/* Vertical line */}
                        {!isLast && (
                            <div
                                className={`absolute left-4 top-8 w-0.5 h-full ${item.status === 'completed'
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                    }`}
                            />
                        )}

                        {/* Timeline item */}
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'completed'
                                    ? 'bg-green-500 text-white'
                                    : item.status === 'active'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-400'
                                }`}>
                                {item.status === 'completed' && <CheckCircle className="w-5 h-5" />}
                                {item.status === 'active' && <Circle className="w-5 h-5 fill-current" />}
                                {item.status === 'pending' && <Clock className="w-5 h-5" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-0.5">
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-semibold ${item.status === 'completed'
                                            ? 'text-gray-900'
                                            : item.status === 'active'
                                                ? 'text-blue-600'
                                                : 'text-gray-500'
                                        }`}>
                                        {item.title}
                                    </h3>
                                    {item.timestamp && (
                                        <span className="text-sm text-gray-500">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {item.details && (
                                    <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                                )}

                                {item.estimate && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Estimated: {item.estimate}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
