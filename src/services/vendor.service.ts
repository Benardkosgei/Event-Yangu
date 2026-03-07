import { supabase } from '../lib/supabase';
import { Vendor } from '../types';

export const vendorService = {
  async getVendors(): Promise<Vendor[]> {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select(`
        *,
        users(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch vendors');
    }

    return vendors.map((vendor): Vendor => ({
      id: vendor.id,
      userId: vendor.user_id,
      businessName: vendor.business_name,
      services: vendor.services,
      description: vendor.description || '',
      portfolio: vendor.portfolio_urls || [],
      contactEmail: vendor.contact_email || '',
      contactPhone: vendor.contact_phone || '',
      rating: vendor.rating,
    }));
  },

  async createVendorProfile(vendorData: Partial<Vendor>): Promise<Vendor> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert({
        user_id: user.id,
        business_name: vendorData.businessName!,
        description: vendorData.description,
        services: vendorData.services || [],
        portfolio_urls: vendorData.portfolio || [],
        contact_email: vendorData.contactEmail,
        contact_phone: vendorData.contactPhone,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create vendor profile');
    }

    return {
      id: vendor.id,
      userId: vendor.user_id,
      businessName: vendor.business_name,
      services: vendor.services,
      description: vendor.description || '',
      portfolio: vendor.portfolio_urls || [],
      contactEmail: vendor.contact_email || '',
      contactPhone: vendor.contact_phone || '',
      rating: vendor.rating,
    };
  },

  async updateVendorProfile(vendorId: string, updates: Partial<Vendor>): Promise<Vendor> {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .update({
        business_name: updates.businessName,
        description: updates.description,
        services: updates.services,
        portfolio_urls: updates.portfolio,
        contact_email: updates.contactEmail,
        contact_phone: updates.contactPhone,
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update vendor profile');
    }

    return {
      id: vendor.id,
      userId: vendor.user_id,
      businessName: vendor.business_name,
      services: vendor.services,
      description: vendor.description || '',
      portfolio: vendor.portfolio_urls || [],
      contactEmail: vendor.contact_email || '',
      contactPhone: vendor.contact_phone || '',
      rating: vendor.rating,
    };
  },

  async getVendorByUserId(userId: string): Promise<Vendor | null> {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return {
      id: vendor.id,
      userId: vendor.user_id,
      businessName: vendor.business_name,
      services: vendor.services,
      description: vendor.description || '',
      portfolio: vendor.portfolio_urls || [],
      contactEmail: vendor.contact_email || '',
      contactPhone: vendor.contact_phone || '',
      rating: vendor.rating,
    };
  },
};