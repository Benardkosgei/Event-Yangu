import { create } from 'zustand';
import { Vendor } from '../types';
import { vendorService } from '../services/vendor.service';

interface VendorState {
  vendors: Vendor[];
  myVendorProfile: Vendor | null;
  isLoading: boolean;
  loadVendors: () => Promise<void>;
  loadMyVendorProfile: () => Promise<void>;
  searchVendors: (query: string) => Promise<void>;
}

export const useVendorStore = create<VendorState>((set) => ({
  vendors: [],
  myVendorProfile: null,
  isLoading: false,

  loadVendors: async () => {
    set({ isLoading: true });
    try {
      const vendors = await vendorService.getVendors();
      set({ vendors, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadMyVendorProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await vendorService.getMyVendorProfile();
      set({ myVendorProfile: profile, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  searchVendors: async (query: string) => {
    set({ isLoading: true });
    try {
      const vendors = await vendorService.searchVendors(query);
      set({ vendors, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
