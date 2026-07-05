import React from 'react';
import { render } from '@testing-library/react-native';
import TenantScreen from './TenantScreen';

jest.mock('./TenantController', () => ({
  useTenantController: jest.fn(() => ({
    dbReady: true,
    activeTenancy: null,
    existingAgreement: null,
    name: 'Ram Kumar Shrestha',
    setName: jest.fn(),
    phone: '9841000000',
    setPhone: jest.fn(),
    idType: 'citizenship',
    setIdType: jest.fn(),
    idPhotoUri: null,
    setIdPhotoUri: jest.fn(),
    deposit: '10000',
    setDeposit: jest.fn(),
    bsYear: '2083',
    setBsYear: jest.fn(),
    bsMonth: '03',
    setBsMonth: jest.fn(),
    bsDay: '15',
    setBsDay: jest.fn(),
    handleTakePhoto: jest.fn(),
    handlePickPhoto: jest.fn(),
    handleOnboardTenant: jest.fn(),
    lastOnboardedTenancyId: null,
    setLastOnboardedTenancyId: jest.fn(),
    lastOnboardedBsDate: '',
    lastOnboardedDeposit: 0,
    roomBaseRent: 12000,
  })),
}));

jest.mock('../postings/PostingController', () => ({
  useListingController: jest.fn(() => ({
    dbReady: true,
    existingPosting: null,
    title: '',
    setTitle: jest.fn(),
    description: '',
    setDescription: jest.fn(),
    contactPhone: '',
    setContactPhone: jest.fn(),
    isSaving: false,
    handlePublish: jest.fn(),
    handleUpdate: jest.fn(),
    handleRemove: jest.fn(),
  })),
}));



describe('TenantScreen UI Flow Integration', () => {
  it('renders onboarding form correctly in vacant state', async () => {
    const mockBack = jest.fn();
    const tree = await render(
      <TenantScreen roomId="room-1" roomNumber="101" houseId="house-1" onBack={mockBack} />
    );

    // Verify main components render without crashing
    expect(tree).toBeDefined();
    
    // Destructure query helpers from resolved render result
    const { getByText, getByPlaceholderText } = tree;
    expect(getByText('Onboard Tenant')).toBeDefined();
    expect(getByText('Post Publicly')).toBeDefined();
    expect(getByText('Tenant Information')).toBeDefined();
    expect(getByPlaceholderText('e.g., Ram Kumar Shrestha')).toBeDefined();
    expect(getByPlaceholderText('e.g., 98XXXXXXXX')).toBeDefined();
  });
});
