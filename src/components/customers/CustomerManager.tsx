import  { useEffect, useState } from 'react';
import { Customer } from '../../types';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerView from './CustomerView';
import { fetchCustomers } from '../../utils/fetch';
import { useDispatch } from 'react-redux';

export default function CustomerManager() {
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'view'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const dispatch=useDispatch();

  useEffect(()=>{
    fetchCustomers(dispatch)
},[dispatch])

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