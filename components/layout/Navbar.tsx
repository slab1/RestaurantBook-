'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSelector } from '@/components/i18n/LanguageSelector';
import { CurrencySelector } from '@/components/i18n/CurrencySelector';
import { Menu, X, Search, User, MapPin } from 'lucide-react';

export function Navbar() {
  const { t, locale, direction } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  return (
    <nav 
      className="bg-white shadow-md sticky top-0 z-50"
      dir={direction}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">
                DineBook
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link 
              href="/restaurants" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('nav.restaurants')}
            </Link>
            <Link 
              href="/bookings" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('nav.bookings')}
            </Link>
            
            {/* Search Icon */}
            <button 
              className="text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Location */}
            <button 
              className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Location"
            >
              <MapPin className="h-5 w-5 mr-1" />
              <span className="text-sm">Lagos, NG</span>
            </button>
          </div>

          {/* Right side - i18n Controls & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* Currency Selector */}
            <CurrencySelector />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                aria-label="User menu"
              >
                <User className="h-6 w-6" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {t('nav.account')}
                  </Link>
                  <Link
                    href="/signin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {t('nav.signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/restaurants"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.restaurants')}
            </Link>
            <Link
              href="/bookings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.bookings')}
            </Link>
            <Link
              href="/account"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.account')}
            </Link>
            
            {/* Mobile i18n Controls */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-gray-500 mb-2">
                  {t('common.language')}
                </p>
                <LanguageSelector />
              </div>
              
              <div className="px-3 py-2 mt-2">
                <p className="text-sm font-medium text-gray-500 mb-2">
                  {t('common.currency')}
                </p>
                <CurrencySelector />
              </div>
            </div>

            {/* Mobile Auth Links */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <Link
                href="/signin"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.signIn')}
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-primary-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.signUp')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
