import { toast } from 'react-toastify';

export const handleSuccess = (msg) => {
  toast.success(msg, {
    toastId: 'success-toast',
    position: 'top-right',
    autoClose: 3000,
  });
};

export const handleError = (msg) => {
  toast.error(msg, {
    position: 'top-right',
    autoClose: 3000,
  });
};
