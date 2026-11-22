import { createClient } from '@supabase/supabase-js';

// استبدل هذه القيم بالمفاتيح الجديدة تماماً لمشروع المنتجات
const supabaseUrl = "https://ettmnjryolwetfsxkqpz.supabase.co";
const supabaseKey = "sb_publishable_flLGQmL24XJpBwZCdd28Yg_sQ6MyGdS";

export const supabase = createClient(supabaseUrl, supabaseKey);
