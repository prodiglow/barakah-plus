import { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

type DialogType = 'success' | 'error' | 'info' | 'confirm';

interface AlertDialogContextProps {
    showAlert: (title: string, message: string, type?: DialogType) => Promise<void>;
    showConfirm: (title: string, message: string) => Promise<boolean>;
}

const AlertDialogContext = createContext<AlertDialogContextProps | undefined>(undefined);

export const useAlertDialog = () => {
    const context = useContext(AlertDialogContext);
    if (!context) {
        throw new Error('useAlertDialog must be used within a AlertDialogProvider');
    }
    return context;
};

export const AlertDialogProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<DialogType>('info');
    const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
    const [onCancel, setOnCancel] = useState<(() => void) | null>(null);

    const showAlert = (title: string, message: string, type: DialogType = 'info'): Promise<void> => {
        return new Promise((resolve) => {
            setTitle(title);
            setMessage(message);
            setType(type);
            setOnConfirm(() => () => {
                setOpen(false);
                resolve();
            });
            setOnCancel(null); // No cancel for alerts
            setOpen(true);
        });
    };

    const showConfirm = (title: string, message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTitle(title);
            setMessage(message);
            setType('confirm');
            setOnConfirm(() => () => {
                setOpen(false);
                resolve(true);
            });
            setOnCancel(() => () => {
                setOpen(false);
                resolve(false);
            });
            setOpen(true);
        });
    };

    const handleClose = () => {
        if (type === 'confirm' && onCancel) {
            onCancel();
        } else if (onConfirm) {
            onConfirm();
        } else {
            setOpen(false);
        }
    };

    const handleConfirmAction = () => {
        if (onConfirm) {
            onConfirm();
        }
    };

    return (
        <AlertDialogContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{ color: type === 'error' ? 'error.main' : type === 'success' ? 'success.main' : 'inherit' }}>
                    {title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" style={{ whiteSpace: 'pre-line' }}>
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {type === 'confirm' ? (
                        <>
                            <Button onClick={handleClose} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmAction} color="primary" autoFocus variant="contained">
                                Confirm
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleConfirmAction} color="primary" autoFocus>
                            OK
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </AlertDialogContext.Provider>
    );
};
