import { useEffect, useState } from 'react';
import { Customer } from '../../types';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerView from './CustomerView';
import { fetchCustomers } from '../../services/fetch';
import { useDispatch } from 'react-redux';
import { subscribeLoading } from '../../utils/loading';
import PageLoader from '../../custom_component/loading';

export default function CustomerManager() {
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'view'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeLoading(setLoading);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchCustomers(dispatch)
  }, [dispatch])

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
    <div style={{ position: 'relative' }}>
      {loading && (
        <PageLoader loading={true} />
      )}
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
          isEditMode={currentView === 'edit'}

        />
      )}

      {currentView === 'view' && selectedCustomer && (
        <CustomerView
          customer={selectedCustomer}
          onClose={handleCancel}
          onEdit={handleEditFromView}
        />
      )}
      </div>
    </>
  );
}