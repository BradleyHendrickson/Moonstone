

'use client'
import React, { useEffect } from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Button } from 'reactstrap';
import { IconDiamonds} from  '@tabler/icons-react'
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation'
import logoSvg from '/public/logo.svg'; 
import logoBlackSvg from '/public/logo_black.svg';
import { usePathname } from "next/navigation";
import Image from 'next/image';

export default function ClientSideNav({signedIn}) {

    const pathname = usePathname()

    function signOut() {
        const supabase = createClient()
        const {error} = supabase.auth.signOut()

        if (error) {
            console.error(error)
            return
        }

        window.location.href = '/login'
        
    }

    var mybutton = <Button style={{marginLeft:"2rem"}} color="success" href="/login">Sign In</Button>
    if (signedIn) {
           mybutton = <Button style={{marginLeft:"2rem"}} onClick={signOut}>Log Out</Button>
    }

    const activeRoute = (routeName) => {

        if (pathname === routeName) {
            return true
        }

        return false
      };

    return (
        
        <Navbar color="dark" dark expand="xs">
        <NavbarBrand href="/">    
        <Image
            priority
            src={logoSvg}
            alt="Moonstone"
            width={35}
        />
        <span style={{marginLeft:"0.75rem"}}>Moonstone</span></NavbarBrand>
        <Nav className="ml-auto" navbar>
            <NavItem
                //hide this on xs devices
                className="d-none d-sm-block"
            >
                <NavLink href="/dashboard/" 
                    //show as active if the current path is /dashboard/
                    active={activeRoute("/dashboard") ? true : false}
                >Dashboard</NavLink>
            </NavItem>

            <NavItem>
                {mybutton}
            </NavItem>
        </Nav>
    </Navbar>
    )
}
