import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface ChaseButtonProps {
    onClick: () => void;
    loading: boolean;
    disabled: boolean;
}

export function ChaseButton({ onClick, loading, disabled }: ChaseButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!buttonRef.current || disabled) return;

        const btn = buttonRef.current;

        const onMouseEnter = () => {
            gsap.to(btn, { scale: 1.05, duration: 0.2, ease: "power1.out" });
            gsap.to(btn, { boxShadow: "0 0 15px rgba(59, 130, 246, 0.6)", duration: 0.2 });
        };

        const onMouseLeave = () => {
            gsap.to(btn, { scale: 1, duration: 0.2, ease: "power1.out" });
            gsap.to(btn, { boxShadow: "0 0 0px rgba(59, 130, 246, 0)", duration: 0.2 });
        };

        const onMouseDown = () => {
            if (!loading) {
                 gsap.to(btn, { scale: 0.95, duration: 0.1 });
            }
        };

        const onMouseUp = () => {
             if (!loading) {
                gsap.to(btn, { scale: 1.05, duration: 0.1 });
             }
        };

        btn.addEventListener('mouseenter', onMouseEnter);
        btn.addEventListener('mouseleave', onMouseLeave);
        btn.addEventListener('mousedown', onMouseDown);
        btn.addEventListener('mouseup', onMouseUp);

        return () => {
            btn.removeEventListener('mouseenter', onMouseEnter);
            btn.removeEventListener('mouseleave', onMouseLeave);
            btn.removeEventListener('mousedown', onMouseDown);
            btn.removeEventListener('mouseup', onMouseUp);
        };
    }, [disabled, loading]);

    useEffect(() => {
        if (loading && buttonRef.current) {
            gsap.to(buttonRef.current, {
                rotation: 360,
                repeat: -1,
                duration: 1,
                ease: "linear",
                scale: 0.9
            });
        } else if (buttonRef.current) {
            gsap.killTweensOf(buttonRef.current);
            gsap.to(buttonRef.current, { rotation: 0, scale: 1, duration: 0.3 });
        }
    }, [loading]);


    return (
        <button
            ref={buttonRef}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-full font-bold text-white shadow-lg transition-colors border-2 ${
                disabled
                    ? 'bg-gray-400 border-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-400 hover:from-blue-600 hover:to-indigo-700'
            }`}
        >
            {loading ? '⏳' : '🚀 Chase'}
        </button>
    );
}
