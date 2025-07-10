import { toast } from 'react-toastify';

export const showToastSuccess = (text: string, isEditMode: boolean) => {
  toast.success(
    isEditMode
      ? `"${text}" updated successfully`
      : `"${text}" created successfully`,
    {
      style: {
        backgroundColor: "#3c8c3f", 
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
        backgroundColor: "#3c8c3f", 
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
        backgroundColor:"#3c8c3f", 
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
        backgroundColor: "#3c8c3f", 
        color: 'white',
      },
    }
  );
};
