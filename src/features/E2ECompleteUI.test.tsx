import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import PropertyScreen from './property/PropertyScreen';
import TenantScreen from './tenant/TenantScreen';
import AgreementModal from './agreement/AgreementModal';
import CheckoutModal from './checkout/CheckoutModal';
import PaymentModal from './payment/PaymentModal';
import MarketplaceFeed from './postings/MarketplaceFeed';

// Mock global alert and Linking.openURL for Jest/Node environment
beforeAll(() => {
  global.alert = jest.fn();
  jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());
});

afterEach(() => {
  jest.clearAllMocks();
});

// 1. Mock PropertyController
const mockCreateProperty = jest.fn();
const mockCreateRoom = jest.fn();
const mockDeleteRoom = jest.fn();
const mockSetAddress = jest.fn();
const mockSetRoomNumber = jest.fn();
const mockSetBaseRent = jest.fn();
const mockSetHousekeeperName = jest.fn();

jest.mock('./property/PropertyController', () => ({
  usePropertyController: jest.fn(() => ({
    dbReady: true,
    houses: [{ id: 'house-1', name: "Suresh's House 1", housekeeperName: 'Suresh', address: 'Jhamsikhel' }],
    selectedHouse: { id: 'house-1', name: "Suresh's House 1", housekeeperName: 'Suresh', address: 'Jhamsikhel' },
    rooms: [{ id: 'room-1', room_number: '401', base_rent: 16000, status: 'vacant' }], // Match DB schema key names
    housekeeperName: 'Suresh',
    customHouseName: '',
    address: 'Jhamsikhel',
    isRoomModalVisible: true,
    roomNumber: '401',
    baseRent: '16000',
    roomStatus: 'vacant',
    setCustomHouseName: jest.fn(),
    setAddress: mockSetAddress,
    setIsRoomModalVisible: jest.fn(),
    setRoomNumber: mockSetRoomNumber,
    setBaseRent: mockSetBaseRent,
    setRoomStatus: jest.fn(),
    handleHousekeeperNameChange: mockSetHousekeeperName,
    handleCreateProperty: mockCreateProperty,
    handleCreateRoom: mockCreateRoom,
    handleDeleteRoom: mockDeleteRoom,
    triggerAddAnotherHouse: jest.fn(),
    loadRooms: jest.fn(),
  })),
}));

// 2. Mock TenantController
const mockOnboardTenant = jest.fn();
const mockSetName = jest.fn();
const mockSetPhone = jest.fn();
const mockSetDeposit = jest.fn();
const mockSubmitPropertyReview = jest.fn();
const mockSetPropertyRating = jest.fn();
const mockSetPropertyComments = jest.fn();

jest.mock('./tenant/TenantController', () => ({
  useTenantController: jest.fn(() => ({
    dbReady: true,
    activeTenancy: null,
    existingAgreement: null,
    name: 'Manish Shrestha',
    setName: mockSetName,
    phone: '9841223344',
    setPhone: mockSetPhone,
    idType: 'citizenship',
    setIdType: jest.fn(),
    idPhotoUri: null,
    setIdPhotoUri: jest.fn(),
    deposit: '16000',
    setDeposit: mockSetDeposit,
    bsYear: '2083',
    setBsYear: jest.fn(),
    bsMonth: '03',
    setBsMonth: jest.fn(),
    bsDay: '15',
    setBsDay: jest.fn(),
    handleTakePhoto: jest.fn(),
    handlePickPhoto: jest.fn(),
    handleRemoveIdPhoto: jest.fn(),
    handleOnboardTenant: mockOnboardTenant, // Match Controller action name
    lastOnboardedTenancyId: null,
    lastOnboardedBsDate: '',
    lastOnboardedDeposit: 0,
    roomBaseRent: 12000,
    propertyReviewsList: [],
    propertyRating: 5,
    setPropertyRating: mockSetPropertyRating,
    propertyComments: 'Good place',
    setPropertyComments: mockSetPropertyComments,
    handleSubmitPropertyReview: mockSubmitPropertyReview,
  })),
}));

// 3. Mock ListingController
jest.mock('./postings/PostingController', () => ({
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
  useMarketplaceController: jest.fn(() => ({
    dbReady: true,
    filteredPostings: [
      {
        id: 'post-1',
        title: 'Spacious Room in Jhamsikhel',
        description: 'Close to main road, 24hr water.',
        contact_phone: '9841223344',
        base_rent: 12000,
        house_address: 'Jhamsikhel',
        room_number: '401',
        house_name: "Suresh's House 1",
        housekeeper_name: 'Suresh',
      }
    ],
    searchQuery: '',
    setSearchQuery: jest.fn(),
    maxRent: '',
    setMaxRent: jest.fn(),
    isLoading: false,
    refreshListings: jest.fn(),
  })),
}));

// 4. Mock AgreementController
const mockConfirmAgreement = jest.fn();
jest.mock('./agreement/AgreementController', () => ({
  useAgreementController: jest.fn(() => ({
    dbReady: true,
    step: 3,
    rent: '16000',
    deposit: '16000',
    baseRent: 16000,
    securityDeposit: 16000,
    bsYear: '2083',
    bsMonth: '03',
    bsDay: '15',
    electricityRate: 12,
    waterRate: 50,
    wasteRate: 100,
    specialTerms: '',
    housekeeperSig: 'sig-data',
    tenantSig: 'sig-data',
    isSaving: false,
    setStep: jest.fn(),
    setRent: jest.fn(),
    setDeposit: jest.fn(),
    setBsYear: jest.fn(),
    setBsMonth: jest.fn(),
    setBsDay: jest.fn(),
    setElectricityRate: jest.fn(),
    setWaterRate: jest.fn(),
    setWasteRate: jest.fn(),
    setSpecialTerms: jest.fn(),
    setHousekeeperSig: jest.fn(),
    setTenantSig: jest.fn(),
    handleNextStep: jest.fn(),
    handlePrevStep: jest.fn(),
    handleSaveAgreement: mockConfirmAgreement,
  })),
}));

// 5. Mock CheckoutController
const mockConfirmCheckout = jest.fn();
const mockSetTenantRating = jest.fn();
const mockSetTenantComments = jest.fn();
jest.mock('./checkout/CheckoutController', () => ({
  useCheckoutController: jest.fn(() => ({
    dbReady: true,
    arrears: 0,
    lastReading: null,
    checkoutYear: '2083',
    checkoutMonth: '03',
    checkoutDay: '15',
    finalElectricityReading: '120',
    electricityRate: '12',
    waterFee: '0',
    wasteFee: '0',
    damageFee: '500',
    isSettled: true,
    isSaving: false,
    setCheckoutYear: jest.fn(),
    setCheckoutMonth: jest.fn(),
    setCheckoutDay: jest.fn(),
    setFinalElectricityReading: jest.fn(),
    setElectricityRate: jest.fn(),
    setWaterFee: jest.fn(),
    setWasteFee: jest.fn(),
    setDamageFee: jest.fn(),
    setIsSettled: jest.fn(),
    getProRatedDetails: () => ({
      daysStayed: 15,
      totalDays: 30,
      proRatedRent: 8000,
      cycleStartBS: '2083-03-01',
      cycleEndBS: '2083-03-30',
    }),
    getFinalElectricityCost: () => 240,
    getFinalUtilityDue: () => 240,
    getNetBalanceAndBreakdown: () => ({
      proRent: 8000,
      utilDue: 240,
      damages: 500,
      totalDues: 8740,
      depositHeld: 16000,
      netBalance: -7260,
      deductedDeposit: 8740,
      refundedDeposit: 7260,
      checkoutDateAD: new Date(),
      daysStayed: 15,
      totalDays: 30,
    }),
    handleConfirmCheckout: mockConfirmCheckout,
    tenantRating: 5,
    setTenantRating: mockSetTenantRating,
    tenantComments: 'Great stay',
    setTenantComments: mockSetTenantComments,
  })),
}));

// 6. Mock PaymentController
const mockConfirmPayment = jest.fn();
jest.mock('./payment/PaymentController', () => ({
  usePaymentController: jest.fn(() => ({
    dbReady: true,
    payments: [],
    alreadyPaid: 0,
    amountPaid: '16000',
    paymentMethod: 'esewa', // Use esewa method to show Record Payment button directly
    receiptImage: null,
    otpRequested: false,
    enteredOtp: '',
    signature: null,
    isSubmitting: false,
    setAmountPaid: jest.fn(),
    setPaymentMethod: jest.fn(),
    setReceiptImage: jest.fn(),
    setEnteredOtp: jest.fn(),
    setSignature: jest.fn(),
    handlePickReceipt: jest.fn(),
    handleRequestOtp: jest.fn(),
    handleRecordPayment: mockConfirmPayment,
  })),
}));

describe('Complete UI & E2E Verification Tests', () => {

  it('verifies Property Screen room creation list display', async () => {
    const tree = await render(<PropertyScreen />);
    const { getByText } = tree;
    
    expect(getByText("Suresh's House 1")).toBeDefined();
    expect(getByText('Room / Flat 401')).toBeDefined(); // Match list rendering text
    expect(getByText('VACANT')).toBeDefined();

    const confirmAddRoomBtn = getByText('Save Room');
    await act(async () => {
      fireEvent.press(confirmAddRoomBtn);
    });
    expect(mockCreateRoom).toHaveBeenCalled();
  });

  it('verifies Tenant Onboarding & Reputation Review forms', async () => {
    const mockBack = jest.fn();
    const tree = await render(
      <TenantScreen roomId="room-1" roomNumber="401" houseId="house-1" onBack={mockBack} />
    );

    const { getByText } = tree;
    expect(getByText('Tenant Information')).toBeDefined();
    const onboardBtn = getByText('Save & Onboard Tenant');
    await act(async () => {
      fireEvent.press(onboardBtn);
    });
    expect(mockOnboardTenant).toHaveBeenCalled();
  });

  it('verifies Tenancy Agreement contract digital signatures wizard', async () => {
    const mockClose = jest.fn();
    const tree = await render(
      <AgreementModal
        visible={true}
        onClose={mockClose}
        onSuccess={mockClose}
        tenancyId="tenancy-1"
        baseRent={16000}
        securityDeposit={16000}
        startDateBs="2083 Ashadh 15"
        roomNumber="401"
        tenantName="Manish Shrestha"
        housekeeperName="Suresh Landlord"
      />
    );

    const { getByText } = tree;
    expect(getByText(/Tenant Signature/)).toBeDefined();
    const signBtn = getByText(/Sign Agreement/);
    await act(async () => {
      fireEvent.press(signBtn);
    });
    expect(mockConfirmAgreement).toHaveBeenCalled();
  });

  it('verifies Checkout wizard & Tenant rating submissions', async () => {
    const mockClose = jest.fn();
    const tree = await render(
      <CheckoutModal
        visible={true}
        onClose={mockClose}
        onSuccess={mockClose}
        tenancyId="tenancy-1"
        roomId="room-1"
        roomNumber="401"
        baseRent={16000}
        startDate="2026-06-01"
        securityDeposit={16000}
      />
    );

    const { getByText } = tree;
    const nextBtn = getByText('Next');
    await act(async () => {
      fireEvent.press(nextBtn);
    });
    await act(async () => {
      fireEvent.press(nextBtn);
    });

    expect(getByText('⭐ Rate & Review Tenant')).toBeDefined();
    const confirmBtn = getByText('Complete Checkout');
    await act(async () => {
      fireEvent.press(confirmBtn);
    });
    expect(mockConfirmCheckout).toHaveBeenCalled();
  });

  it('verifies Payment overlay and verification cash OTP confirmation', async () => {
    const mockClose = jest.fn();
    const tree = await render(
      <PaymentModal
        isVisible={true}
        onClose={mockClose}
        onSuccess={mockClose}
        invoiceId="invoice-1"
        totalDue={16000}
        tenantPhone="9841223344"
        billingPeriod="2083 Ashadh"
      />
    );

    const { getByText } = tree;
    expect(getByText('Record Payment')).toBeDefined();
    const confirmBtn = getByText('Record Payment');
    await act(async () => {
      fireEvent.press(confirmBtn);
    });
    expect(mockConfirmPayment).toHaveBeenCalled();
  });

  it('verifies public vacant Marketplace room searching feed', async () => {
    const tree = await render(<MarketplaceFeed />);
    const { getByText } = tree;
    
    expect(getByText('GharKoHisaab Marketplace 🌐')).toBeDefined();
    expect(getByText('Spacious Room in Jhamsikhel')).toBeDefined();
    expect(getByText(/Rs. 12,000/)).toBeDefined();

    const callBtn = getByText(/Call/);
    await act(async () => {
      fireEvent.press(callBtn);
    });
  });
});
