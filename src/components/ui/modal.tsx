'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect, useCallback } from 'react';

export type ModalVariant = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  autoClose?: number; // Auto close after X milliseconds
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    buttonBg: 'bg-green-500 hover:bg-green-600',
    borderColor: 'border-green-200',
  },
  error: {
    icon: AlertCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    buttonBg: 'bg-red-500 hover:bg-red-600',
    borderColor: 'border-red-200',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    buttonBg: 'bg-yellow-500 hover:bg-yellow-600',
    borderColor: 'border-yellow-200',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    borderColor: 'border-blue-200',
  },
  confirm: {
    icon: AlertTriangle,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    buttonBg: 'bg-orange-500 hover:bg-orange-600',
    borderColor: 'border-orange-200',
  },
};

export function Modal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  confirmText = 'OK',
  cancelText = 'Annuler',
  onConfirm,
  children,
  showCloseButton = true,
  autoClose,
}: ModalProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  // Auto close
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  // Close on escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 ${config.borderColor}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center`}
              >
                <Icon className={`w-8 h-8 ${config.iconColor}`} />
              </motion.div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
              {title}
            </h3>

            {/* Message */}
            {message && (
              <p className="text-gray-600 text-center mb-6">
                {message}
              </p>
            )}

            {/* Custom content */}
            {children && (
              <div className="mb-6">
                {children}
              </div>
            )}

            {/* Buttons */}
            <div className={`flex gap-3 ${variant === 'confirm' ? 'justify-center' : 'justify-center'}`}>
              {variant === 'confirm' && (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-3 ${config.buttonBg} text-white font-semibold rounded-xl transition-colors`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook pour utiliser facilement les modals
import { useState } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  modalProps: { isOpen: boolean; onClose: () => void };
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    modalProps: { isOpen, onClose: () => setIsOpen(false) },
  };
}

// Toast-like notification modal (auto-closes)
interface ToastModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function ToastModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'success',
  duration = 3000,
}: ToastModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      variant={variant}
      autoClose={duration}
      showCloseButton={false}
    />
  );
}

// Confirm dialog helper
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'confirm' | 'warning';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'confirm',
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      message={message}
      variant={variant}
      confirmText={confirmText}
      cancelText={cancelText}
    />
  );
}
