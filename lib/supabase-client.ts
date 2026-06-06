// Step 3: Supabase Realtime Client wrapper
import { supabaseClientSim, realtimeEngine } from './mock-db';

export const supabase = supabaseClientSim;

export const supabaseRealtime = {
  // Subscription wrapper resembling Supabase Realtime JS API
  subscribeToStorefrontConfig(merchantId: string, onUpdate: (config: any) => void) {
    return realtimeEngine.subscribe(`realtime:storefront_config:${merchantId}`, (data) => {
      onUpdate(data.config);
    });
  }
};
