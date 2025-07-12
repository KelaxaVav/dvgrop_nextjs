import { useState } from 'react';
import { X, Mail, Phone, Tag, Plus, Save } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useData } from '../../contexts/DataContext';
import { EmailContact } from '../../types';
import Select from "react-select";
import { useSelectionOptions } from '../../custom_component/selection_options';

interface ContactFormProps {
  contact?: EmailContact;
  onClose: () => void;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  source: 'customer_registration' | 'loan_approval' | 'manual_entry';
  customerId?: string;
  loanId?: string;
  isSubscribed: boolean;
  tags: string[];
}

export default function ContactForm({ contact, onClose }: ContactFormProps) {
  // const { addEmailContact, updateEmailContact, customers } = useData();
  const [newTag, setNewTag] = useState('');
  const { sourceOptions,customerOptions } = useSelectionOptions();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    defaultValues: {
      name: contact?.name || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      source: (contact?.source as 'customer_registration' | 'loan_approval' | 'manual_entry') || 'manual_entry',
      customerId: contact?.customerId || '',
      loanId: contact?.loanId || '',
      isSubscribed: contact?.isSubscribed ?? true,
      tags: contact?.tags || [],
    },
  });

  const tags = watch('tags');

  const onSubmit = (data: ContactFormData) => {
    
    // const contactData: Omit<EmailContact, 'id' | 'createdAt' | 'updatedAt'> = {
    //   ...data,
    //   customerId: data.customerId || undefined,
    //   loanId: data.loanId || undefined,
    //   syncStatus: 'pending',
    // };

    // if (contact) {
    //   updateEmailContact(contact.id, contactData);
    // } else {
    //   addEmailContact(contactData);
    // }
    // onClose();
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setValue('tags', [...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setValue('tags', tags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <p className="text-gray-600">
            {contact ? 'Update contact information' : 'Add a new contact to your email list'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Contact Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                    })}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    {...register('phone', { required: 'Phone number is required' })}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <Select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      {...field}
                      options={sourceOptions}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption ? selectedOption?.value : '');
                      }}
                      value={
                        sourceOptions.find(option => option?.value === field?.value) || null
                      }
                      isClearable
                      placeholder="Select Customer"
                      // classNamePrefix="react-select"
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Additional Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID (Optional)</label>
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={customerOptions}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption ? selectedOption?.value : '');
                      }}
                      value={
                        customerOptions.find(option => option?.value === field?.value) || null
                      }
                      isClearable
                      placeholder="Select Customer (Optional)"
                      classNamePrefix="react-select"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan ID (Optional)</label>
                <input
                  {...register('loanId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter loan ID if applicable"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a tag"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.length > 0 ? (
                    tags.map((tag, idx) => (
                      <div key={idx} className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                        <span className="text-sm text-gray-800">{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No tags added yet</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <Controller
                  name="isSubscribed"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="isSubscribed"
                      checked={field.value}
                      onChange={field.onChange}
                      name={field.name}
                      ref={field.ref}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                  )}
                />
                <label htmlFor="isSubscribed" className="ml-2 block text-sm text-gray-900">
                  Subscribed to email communications
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {contact ? 'Update Contact' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
