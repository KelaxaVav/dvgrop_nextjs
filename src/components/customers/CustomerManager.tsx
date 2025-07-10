import  { useEffect, useState } from 'react';
import { Customer } from '../../types';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerView from './CustomerView';
import { fetchCustomers } from '../../Service/fetch';
import { useDispatch } from 'react-redux';
// import { useData } from '../../contexts/DataContext';

export default function CustomerManager() {
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'view'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
   const [isEditMode,setIsEditMode]=useState(false);
  const dispatch=useDispatch();
// const { addCustomer, updateCustomer } = useData();
  useEffect(()=>{
    fetchCustomers(dispatch)
},[dispatch])

  const handleAddCustomer = () => {
    setIsEditMode(false)
    setSelectedCustomer(null);
    setCurrentView('add');
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditMode(true)
    setCurrentView('edit');
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('view');
  };


  const handleCancel = () => {
    setCurrentView('list');
    setSelectedCustomer(null);
  };

  const handleEditFromView = () => {
    setCurrentView('edit');
  };

  //  const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
  //   if (currentView === 'edit' && selectedCustomer) {
  //     updateCustomer(selectedCustomer._id, customerData);
  //   } else {
  //     addCustomer(customerData);
  //   }
  //   setCurrentView('list');
  //   setSelectedCustomer(null);
  // };
console.log("cuirenjabda",currentView)
  return (
    <>
      {currentView === 'list' && (
        <CustomerList
          onAddCustomer={handleAddCustomer}
          onEditCustomer={handleEditCustomer}
          onViewCustomer={handleViewCustomer}
        />
      )}

      {(currentView === 'add' || currentView === 'edit') && (
        <CustomerForm
          customer={selectedCustomer || undefined}
          // onSave={handleSaveCustomer}
          onCancel={handleCancel}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
         
        />
      )}

      {currentView === 'view' && selectedCustomer && (
        <CustomerView
          customer={selectedCustomer}
          onClose={handleCancel}
          onEdit={handleEditFromView}
        />
      )}
    </>
  );
}