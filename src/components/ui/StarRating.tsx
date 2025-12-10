import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    readonly?: boolean;
    showCount?: boolean;
    count?: number;
}

export function StarRating({
    rating,
    onRatingChange,
    size = 'md',
    readonly = false,
    showCount = false,
    count = 0
}: StarRatingProps) {
    const sizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    const handleClick = (value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleClick(star)}
                    disabled={readonly}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
                >
                    <Star
                        className={`${sizeClasses[size]} ${star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-none text-slate-300'
                            }`}
                    />
                </button>
            ))}
            {showCount && count > 0 && (
                <span className="text-sm text-slate-500 ml-1">
                    ({count})
                </span>
            )}
        </div>
    );
}
