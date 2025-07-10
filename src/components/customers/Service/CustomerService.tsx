import { Dispatch } from "redux";
import { deleteType, submitData } from "../../../Service/create";
import { fetchCustomers } from "../../../Service/fetch";
import { API_ROUTES } from "../../../utils/api_routes";

// export const regionEditClick = (row: any, setIsEditMode: Function, regions: IRegion[], setEditData: Function, setValue: Function) => {
//     setIsEditMode(true);
//     const region = regions.find(x => x.region_id === row.region_id);
//     handleEdit(region, setIsEditMode, setEditData);
//     setValue("name", row.name);
//     setValue("is_active", row.is_active);
// };

export const customerOnSubmitData = async (
    data: any, typeId: string, isEditMode: boolean,
    setIsEditMode: Function,oncancel:Function, dispatch: Dispatch,
) => {
   
    submitData(
        data, isEditMode, typeId || '',
        fetchCustomers,oncancel,
        setIsEditMode, data.name, `${API_ROUTES.CUSTOMERS}`, dispatch
    )
}
export const customerDelete = async (id: string, dispatch: Dispatch) => {
    deleteType(fetchCustomers,"Customer", `${API_ROUTES.CUSTOMERS}/${id}`, dispatch,)
};