import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.VITE_API_KEY,
);
////////////////////////////////////////////////////////////////////////////////
// Handful of helper functions to be called from route loaders and actions
export async function getContacts(search) {
  try {
    let query = supabase.from("Contacts").select("*");
    if (search) {
      query = query.or(`first.eq.${search},last.eq.${search}`);
    }
    query = query.order("last").order("createdAt");
    let { data, error } = await query;

    return data;
  } catch (error) {
    console.error("Error fetching random cats:", error);
    throw error;
  }
}

export async function createEmptyContact() {
  try {
    const { data, error } = await supabase
      .from("Contacts")
      .insert([{}])
      .select();

    return data[0];
  } catch (error) {
    console.error("Error adding contact:", error);
    throw error;
  }
}

export async function getContact(id) {
  try {
    let { data, error } = await supabase
      .from("Contacts")
      .select("*")
      .eq("id", id);

    if (!error) {
      if (data.length === 0) {
        return null;
      }
      return data;
    } else {
      console.log(" get contact err", error);
    }
  } catch (error) {
    console.error("Error fetching contact", error);
    throw error;
  }
}

export async function updateContact(id, updates) {
  try {
    const contact = await getContact(id);
    if (!contact) {
      throw "Not found";
    }

    const { data, error } = await supabase
      .from("Contacts")
      .update(updates)
      .eq("id", id)
      .select();

    return data[0];
  } catch (error) {
    console.error("Error updating contact", error);
    throw error;
  }
}

export async function deleteContact(id) {
  try {
    const { error } = await supabase.from("Contacts").delete().eq("id", id);
    console.log("delete error", error);
  } catch (error) {
    console.error("Error deleting contact", error);
    throw error;
  }
}
