import { createClient, SupabaseClient } from "@supabase/supabase-js";

import Config from "@/config";
import { Database } from "@/types/db.extended";


const supabaseUrl = Config.supabase.url;
const supabaseServiceRoleKey = Config.supabase.serviceRoleKey;

export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseServiceRoleKey);

