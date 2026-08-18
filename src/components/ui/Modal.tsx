'use client'

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { concatClassNames } from '@lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

function Modal({ open, onClose, children, className }: ModalProps) {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'
      onClick={onClose}
    >
      <div
        className={concatClassNames('relative max-h-full max-w-full', className)}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type='button'
          onClick={onClose}
          aria-label={t('close')}
          className='cursor-pointer absolute -top-10 right-0 text-slate-50 hover:text-slate-300 transition-colors'
        >
          <X className='w-6 h-6' />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
