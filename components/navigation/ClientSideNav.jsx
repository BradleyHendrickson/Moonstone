'use client'
import React, { useState } from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Button, NavbarToggler, Collapse } from 'reactstrap';
import { createClient } from '@/utils/supabase/client';
import logoSvg from '/public/logo.svg';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function ClientSideNav({ signedIn }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    function signOut() {
        const supabase = createClient();
        const { error } = supabase.auth.signOut();

        if (error) {
            console.error(error);
            return;
        }

        window.location.href = '/login';
    }

    const toggle = () => setIsOpen(!isOpen);

    const activeRoute = (routeName) => pathname === routeName;

    const showNav = pathname !== "/login";

    const renderedNav = (
        <Nav className="ml-auto" navbar>
            <NavItem className="d-none d-md-block">
                <NavLink href="/weeklysummary/" active={activeRoute("/weeklysummary")}>
                    Weekly Summary
                </NavLink>
            </NavItem>
            <NavItem className="d-none d-md-block">
                <NavLink href="/dashboard/" active={activeRoute("/dashboard")}>
                    Dashboard
                </NavLink>
            </NavItem>
            <NavItem>
                <Button style={{ marginLeft: "2rem" }} color={signedIn ? "secondary" : "success"} onClick={signedIn ? signOut : () => window.location.href = '/login'}>
                    {signedIn ? "Log Out" : "Sign In"}
                </Button>
            </NavItem>
        </Nav>
    );

    const renderedMobileNav = (
        <Nav navbar>
            <NavItem>
                <NavLink href="/weeklysummary/" active={activeRoute("/weeklysummary")}>
                    Weekly Summary
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink href="/dashboard/" active={activeRoute("/dashboard")}>
                    Dashboard
                </NavLink>
            </NavItem>
            <NavItem>
                <Button style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }} color={signedIn ? "secondary" : "success"} onClick={signedIn ? signOut : () => window.location.href = '/login'}>
                    {signedIn ? "Log Out" : "Sign In"}
                </Button>
            </NavItem>
        </Nav>
    );

    return (
        <Navbar color="dark" dark expand="md">
            <NavbarBrand href="/">    
                <Image
                    priority
                    src={logoSvg}
                    alt="Moonstone"
                    width={35}
                />
                <span style={{ marginLeft: "0.75rem" }}>Moonstone</span>
            </NavbarBrand>
            {showNav && <NavbarToggler onClick={toggle} />}
            <Collapse isOpen={isOpen} navbar className="justify-content-end">
                {showNav && (
                    <>
                        <div className="d-none d-md-block">
                            {renderedNav}
                        </div>
                        <div className="d-md-none">
                            {renderedMobileNav}
                        </div>
                    </>
                )}
            </Collapse>
        </Navbar>
    );
}
