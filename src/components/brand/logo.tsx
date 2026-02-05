import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export const RhineRouteLogo = ({
    className,
    height = 48,
    dark = false
}: {
    className?: string,
    height?: number,
    dark?: boolean
}) => {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <Image
                src="/images/logo.png"
                alt="Rhine Route"
                width={height * 2}
                height={height}
                className="w-auto object-contain shrink-0"
                style={{ height: height }}
                priority
            />
            <div className="flex flex-col leading-none">
                <span className={cn(
                    "font-black tracking-tighter uppercase",
                    dark ? "text-white" : "text-slate-900"
                )} style={{ fontSize: height * 0.45 }}>
                    Rhine <span style={{ color: "#DC2626" }}>Route</span>
                </span>
            </div>
        </div>
    );
};

export default RhineRouteLogo;
