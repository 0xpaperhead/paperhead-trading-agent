import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

type OverlayPortalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    closeOnOutsideClick?: boolean;
    animation?: 'fade' | 'scale' | 'none';
};

export default function OverlayPortal({
    isOpen,
    onClose,
    children,
    className = '',
    contentClassName = '',
    closeOnOutsideClick = true,
    animation = 'scale'
}: OverlayPortalProps) {
    useEffect(() => {
        // Prevent scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        
        // Re-enable scrolling when modal is closed
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle ESC key press
    useEffect(() => {
        const handleEscKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const animationProps = {
        scale: {
            initial: { scale: 0.95, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.95, opacity: 0 },
            transition: { type: "spring", bounce: 0.2 }
        },
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
        },
        none: {}
    }[animation];

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnOutsideClick) {
            onClose();
        }
        // Always stop propagation to prevent double-closing
        e.stopPropagation();
    };

    const handleContentClick = (e: React.MouseEvent) => {
        // Stop propagation to prevent closing when clicking inside the modal content
        e.stopPropagation();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className={twMerge('fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto', className)}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50"
                        onClick={handleBackdropClick}
                    />
                    <motion.div
                        {...animationProps}
                        className={twMerge('bg-base-200 rounded-lg w-full max-w-md relative z-10 m-5 my-8', contentClassName)}
                        onClick={handleContentClick}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
} 