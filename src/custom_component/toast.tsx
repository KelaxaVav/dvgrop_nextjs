import { toast } from 'react-toastify';

export const showToastSuccess = (text: string, isEditMode: boolean) => {
  toast.success(
    isEditMode
      ? `"${text}" is updated successfully`
      : `"${text}" is created successfully`,
    {
      style: {
        backgroundColor: 'green', 
        color: 'white',
      },
    }
  );
};
export const showToastSuccess1 = (text: string,) => {
  toast.success(
    text,
    {
      style: {
        backgroundColor: 'green', 
        color: 'white',
      },
    }
  );
};

export const showDeleteSuccess = (text: string) => {
  toast.success(
      `"${text}" deleted successfully`,
    {
      style: {
        backgroundColor: 'green', 
        color: 'white',
      },
    }
  );
};
export const showToastError = (text: string) => {
  toast.error(
      text,
    {
      style: {
        backgroundColor: 'red', 
        color: 'white',
      },
    }
  );
};
