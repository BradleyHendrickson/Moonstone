"use client";
import React from "react";
//import { createClient } from "@/utils/supabase/server";
//import { redirect } from "next/navigation";


import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/client'
import ProjectManager from '@/components/entry/ProjectManager'



export default function ProtectedPage() {

  const supabase = createClient()
  //get the current user
  async function isLoggedIn() {
    const { data: { user } } = await supabase.auth.getUser()

    console.log(user)
  }
  
  isLoggedIn()

  return (
      <>
      <ProjectManager />
      </>
  );
}
