import  { useState } from 'react';
import { Customer } from '../../types';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerView from './CustomerView';

export default function CustomerManager() {
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'view'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setCurrentView('add');
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('edit');
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('view');
  };

  // const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
  //   if (currentView === 'edit' && selectedCustomer) {
  //     updateCustomer(selectedCustomer.id, customerData);
  //   } else {
  //     addCustomer(customerData);
  //   }
  //   setCurrentView('list');
  //   setSelectedCustomer(null);
  // };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedCustomer(null);
  };

  const handleEditFromView = () => {
    setCurrentView('edit');
  };

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
          onSave={()=>{}}
          onCancel={handleCancel}
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