
import React from 'react';
//simple reactstrap navbar with links to /dashboard/ and /timecard/

import ClientSideNav from '@/components/navigation/ClientSideNav'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export default async function TopNav() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()

    console.log(data)

    var signedIn = false
    if (error || !data?.user) {
        console.log("not signed in")
        signedIn = false 
    } else {
        console.log("signed in")
        signedIn = true
    }

    return (
        <ClientSideNav signedIn={signedIn} />
    );
}