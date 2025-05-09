'use client';
import React, { useState } from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Button, NavbarToggler, Collapse, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { createClient } from '@/utils/supabase/client';
import logoSvg from '/public/logo.svg';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function ClientSideNav({ signedIn }) {
    const [isOpen, setIsOpen] = useState(false);
    const [modal, setModal] = useState(false);
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

    const toggleNavbar = () => setIsOpen(!isOpen);
    const toggleModal = () => setModal(!modal);

    const activeRoute = (routeName) => pathname === routeName;

    const showNav = pathname !== "/login";

    const renderedNav = (
        <Nav className="ml-auto" navbar>
            <NavItem className="d-none d-md-block">
                <NavLink href="/projects/" active={activeRoute("/projects")}>
                    Projects
                </NavLink>
            </NavItem>

            <NavItem className="d-none d-md-block">
                <NavLink href="/tracker/" active={activeRoute("/tracker")}>
                    Time Tracker
                </NavLink>
            </NavItem>
            <NavItem className="d-none d-md-block">
                <NavLink href="/weeklysummary/" active={activeRoute("/weeklysummary")}>
                    Weekly Summary
                </NavLink>
            </NavItem>
            <NavItem className="d-none d-md-block">
                <NavLink href="/weeklyplan/" active={activeRoute("/weeklyplan")}>
                    Weekly Plan
                </NavLink>
            </NavItem>
            <NavItem >
                <NavLink style={{ float: "right" }} href="/settings/" active={activeRoute("/settings")}>
                    Settings
                </NavLink>
            </NavItem>
            <NavItem>
                <Button style={{ marginLeft: "2rem" }} color={signedIn ? "secondary" : "success"} onClick={signedIn ? toggleModal : () => window.location.href = '/login'}>
                    {signedIn ? "Log Out" : "Sign In"}
                </Button>
            </NavItem>
        </Nav>
    );

    const renderedMobileNav = (
        <Nav navbar>
            <NavItem>
                <NavLink style={{ float: "right" }} href="/projects/" active={activeRoute("/projects")}>
                    Projects
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink style={{ float: "right" }} href="/tracker/" active={activeRoute("/tracker")}>
                    Time Tracker
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink style={{ float: "right" }} href="/weeklysummary/" active={activeRoute("/weeklysummary")}>
                    Weekly Summary
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink style={{ float: "right" }} href="/weeklyplan/" active={activeRoute("/weeklyplan")}>
                    Weekly Plan
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink style={{ float: "right" }} href="/settings/" active={activeRoute("/settings")}>
                    Settings
                </NavLink>
            </NavItem>
            <NavItem>
                <Button style={{ marginTop: "0.5rem", marginBottom: "0.5rem", float: "right" }} color={signedIn ? "secondary" : "success"} onClick={signedIn ? toggleModal : () => window.location.href = '/login'}>
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
            {showNav && <NavbarToggler onClick={toggleNavbar} />}
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

            {/* Log Out Confirmation Modal */}
            <Modal isOpen={modal} toggle={toggleModal} centered>
                <ModalHeader toggle={toggleModal}>Confirm Log Out</ModalHeader>
                <ModalBody>
                    Are you sure you want to log out?
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={signOut}>Log Out</Button>{' '}
                    <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </Navbar>
    );
}
