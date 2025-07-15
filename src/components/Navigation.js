import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  HomeIcon,
  Cog6ToothIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon,
  CircleStackIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  DocumentCheckIcon,
  TruckIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Navigation() {
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMouseEnter = () => {
    if (window.innerWidth > 768) { // Only expand on hover for desktop
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) { // Only collapse on leave for desktop
      setIsExpanded(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsExpanded(!isExpanded);
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      setIsMobileMenuOpen(false);
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-[999] p-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-lg"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Navigation Sidebar */}
      <nav 
        className={`vertical-nav bg-gradient-to-b from-blue-600 to-blue-800 print:hidden overflow-y-auto
                   ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        style={{ 
          width: isExpanded ? '240px' : '70px',
          height: '100vh' // Ensure full viewport height
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col min-h-full">
          {/* Logo/Brand section */}
          <div className="flex-shrink-0">
            <Link to="/" className={`text-white font-bold p-4 ${isExpanded ? 'text-xl' : 'text-center'}`}>
              {isExpanded ? 'SSD' : 'S'}
            </Link>
          </div>

          {/* Scrollable navigation items */}
          <div className="flex-1 flex flex-col space-y-2.5 px-2 py-4 overflow-y-auto">
            {/* Navigation Items */}
            <Link to="/" className="nav-item" onClick={handleNavClick}>
              <HomeIcon className="h-6 w-6" />
              {isExpanded && <span className="ml-3">Home</span>}
            </Link>

            {user && (user.role === "admin" || user.role === "production") && (
              <Menu as="div" className="relative">
                <Menu.Button className="nav-item w-full">
                  <Cog6ToothIcon className="h-6 w-6" />
                  {isExpanded && <span className="ml-3">Settings</span>}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className='absolute z-10 mt-2 w-48 rounded-md bg-white shadow-lg'>
                    <div className="py-1">
                      {user && user.role === "admin" && (
                        <>
                          <Menu.Item>
                            {({ active }) => (
                              <Link 
                                to="/machine" 
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                                onClick={handleNavClick}
                              >
                                Machine
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link to="/customer" className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}>
                                Customer
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link to="/vendor" className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}>
                                Vendor
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link to="/fabric" className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}>
                                Fabric
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link to="/construction" className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}>
                                Construction
                              </Link>
                            )}
                          </Menu.Item>
                        </>
                      )}
                      {user && (user.role === "admin" || user.role === "production") && (
                        <>
                          <Menu.Item>
                            {({ active }) => (
                              <Link to="/process" className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}>
                                Process
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link to="/width" className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}>
                                Width
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link to="/sfinishing" className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}>
                                Finishing
                              </Link>
                            )}
                          </Menu.Item>
                        </>
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {/* Add other menu items similarly */}
            {user && (user.role === "admin") && (
              <Link to="/polist" className="nav-item">
                <ShoppingCartIcon className="h-6 w-6" />
                {isExpanded && <span className="ml-3" style={{textDecoration:'none'}}>Purchase Order</span>}
              </Link>
            )}

            {user && (user.role === "admin" || user.role === "store") && (
              <Link to="/storeentry" className="nav-item">
                <ArchiveBoxIcon className="h-6 w-6" />
                {isExpanded && <span className="ml-3">Store</span>}
              </Link>
            )}

            {user && (user.role === "admin" || user.role === "SP1" || user.role === "SP2") && (
              <Menu as="div" className="relative">
                <Menu.Button className="nav-item w-full">
                  <CircleStackIcon className="h-6 w-6" />
                  {isExpanded && <span className="ml-3">Stock</span>}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute z-10 mt-2 w-48 rounded-md bg-white shadow-lg">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link to="/pstock" className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-gray-700'
                          )}>
                            Planning Stock
                          </Link>
                        )}
                      </Menu.Item>
                      {user && (user.role === "admin") && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link to="/bstock" className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-gray-700'
                            )}>
                              Batch Stock
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {user && (user.role === "admin" || user.role === "grey" || user.role === "SP1" || user.role === "SP2") && (
              <Link to="/greyentry" className="nav-item">
                <BeakerIcon className="h-6 w-6" />
                {isExpanded && <span className="ml-3">Grey Entry</span>}
              </Link>
            )}

            {user && (user.role === "admin" || user.role === "batch" || user.role === "SP1" || user.role === "SP2") && (
              <Link to="/planning" className="nav-item">
                <ClipboardDocumentListIcon className="h-6 w-6" />
                {isExpanded && <span className="ml-3">Planning</span>}
              </Link>
            )}

            {user && (user.role === "admin" || user.role === "production") && (
              <Link to="/labentry" className="nav-item ">
                <DocumentCheckIcon className="h-6 w-6" />
                {isExpanded && <span className="ml-3">Lab Entry</span>}
              </Link>
            )}

            {user && (user.role === "admin" || user.role === "batch" || user.role === "production" || user.role === "batchcomplete" || user.role === "SP1" || user.role === "SP2") && (
              <Link to="/batch" className="nav-item">
                <TruckIcon className="h-6 w-6" />
                {isExpanded && <span className="ml-3">Batch</span>}
              </Link>
            )}

            {user && (user.role === "admin" || user.role === "finishing" || user.role === "SP1" || user.role === "SP2") && (
              <Link to="/finishing" className="nav-item">
                <DocumentCheckIcon className="h-6 w-6" />
                {isExpanded && <span className="ml-3">Finishing</span>}
              </Link>
            )}

            {user && (user.role === "admin" || user.role === "delivery" || user.role === "SP1" || user.role === "SP2") && (
              <Link to="/delivery" className="nav-item">
                <TruckIcon className="h-6 w-6" />
                {isExpanded && <span className="ml-3">Delivery</span>}
              </Link>
            )}
          </div>

          {/* Footer section (Logout) - stays at bottom */}
          <div className="flex-shrink-0 p-4">
            {user ? (
              <button onClick={logout} className="nav-item text-red-200 hover:bg-red-700 w-full">
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
                {isExpanded && <span className="ml-3">Logout</span>}
              </button>
            ) : (
              <Link to="/login" className="nav-item">
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
                {isExpanded && <span className="ml-3">Login</span>}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[997]"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
}

export default Navigation;