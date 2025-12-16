import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { useEffect, useState } from "react";

interface ShatteredTextProps {
    text: string;
    className?: string;
}

// Sub-component to handle individual character animation safely
const ShatteredChar = ({
    char,
    scrollY,
    values
}: {
    char: string,
    scrollY: MotionValue<number>,
    values: { x: number, y: number, r: number }
}) => {
    // Hooks must be at the top level of a component
    const x = useTransform(scrollY, [0, 300], [0, values.x]);
    const y = useTransform(scrollY, [0, 300], [0, values.y]);
    const rotate = useTransform(scrollY, [0, 300], [0, values.r]);
    const opacity = useTransform(scrollY, [0, 200], [1, 0]);

    const springX = useSpring(x, { stiffness: 100, damping: 30 });
    const springY = useSpring(y, { stiffness: 100, damping: 30 });
    const springRotate = useSpring(rotate, { stiffness: 100, damping: 30 });

    return (
        <motion.span
            style={{
                x: springX,
                y: springY,
                rotate: springRotate,
                opacity: opacity,
                display: "inline-block",
                whiteSpace: "pre"
            }}
        >
            {char === " " ? "\u00A0" : char}
        </motion.span>
    );
};

export const ShatteredText = ({ text, className = "" }: ShatteredTextProps) => {
    const characters = text.split("");
    const { scrollY } = useScroll();

    const [randomValues, setRandomValues] = useState<{ x: number, y: number, r: number }[]>([]);

    useEffect(() => {
        setRandomValues(
            characters.map(() => ({
                x: (Math.random() - 0.5) * 800,
                y: (Math.random() - 0.5) * 800,
                r: (Math.random() - 0.5) * 720
            }))
        );
    }, [text]);

    // Render plain text during hydration or before effects run
    if (randomValues.length === 0) {
        return <span className={className}>{text}</span>;
    }

    return (
        <div className={`inline-block ${className}`}>
            {characters.map((char, index) => (
                <ShatteredChar
                    key={index}
                    char={char}
                    scrollY={scrollY}
                    values={randomValues[index]!}
                />
            ))}
        </div>
    );
};
