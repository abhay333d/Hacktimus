import { useEffect, useState } from 'react';

interface ScrollingNumberProps {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
}

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function ScrollingNumber({ value, direction = 'up', className = '' }: ScrollingNumberProps) {
  // Convert number to array of digits
  const digits = value.toString().split('').map(Number);
  
  return (
    <div className={`flex overflow-hidden h-[1em] leading-none ${className}`}>
      {digits.map((digit, index) => (
        <Digit 
          key={index} 
          digit={digit} 
          direction={direction} 
          delay={index * 100} 
        />
      ))}
    </div>
  );
}

function Digit({ digit, direction, delay }: { digit: number; direction: 'up' | 'down'; delay: number }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsMounted(true), 100);
  }, []);
  
  const finalPosition = -digit * 10;
  const startPosition = direction === 'up' ? 0 : -90;

  return (
    <div className="relative w-[0.6em] h-[1em]">
       <div 
         className="absolute left-0 top-0 transition-transform duration-[2000ms] ease-out w-full"
         style={{ 
           transform: `translateY(${isMounted ? finalPosition : startPosition}%)`,
           transitionDelay: `${delay}ms`
         }}
       >
         {NUMBERS.map((num) => (
           <div key={num} className="h-[1em] flex items-center justify-center">
             {num}
           </div>
         ))}
       </div>
    </div>
  );
}
