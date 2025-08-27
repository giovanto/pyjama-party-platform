'use client';

import Image from 'next/image';
import { config } from '@/lib/config';

export function Footer() {
  return (
    <footer className="footer bg-gray-50 border-t border-gray-200 py-12">
      <div className="footer__container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="footer__content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="footer__section">
            <Image 
              src="/assets/brand/bot-logo.svg" 
              alt="Back-on-Track logo" 
              width={120} 
              height={40}
              className="footer__logo h-8 w-auto mb-4"
            />
            <p className="footer__description text-gray-600 text-sm">
              Building the sustainable transport network Europe deserves
            </p>
          </div>
          
          <div className="footer__section">
            <h4 className="footer__title text-gray-900 font-semibold mb-4">Platform</h4>
            <ul className="footer__links space-y-2">
              <li>
                <a href="/privacy" className="footer__link text-gray-600 hover:text-bot-green transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="footer__link text-gray-600 hover:text-bot-green transition-colors text-sm">
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="/about#contact" className="footer__link text-gray-600 hover:text-bot-green transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div className="footer__section">
            <h4 className="footer__title text-gray-900 font-semibold mb-4">🚂 Back-on-Track</h4>
            <ul className="footer__links space-y-2">
              <li>
                <a 
                  href="https://back-on-track.eu" 
                  className="footer__link footer__link--primary text-bot-green hover:text-bot-green/80 transition-colors text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🏠 Main Website
                </a>
              </li>
              <li>
                <a 
                  href="https://back-on-track.eu/membership" 
                  className="footer__link text-gray-600 hover:text-bot-green transition-colors text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  👥 Become a Member
                </a>
              </li>
              <li>
                <a 
                  href="https://back-on-track.eu/newsletter" 
                  className="footer__link text-gray-600 hover:text-bot-green transition-colors text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📧 Newsletter
                </a>
              </li>
              <li>
                <a 
                  href="https://back-on-track.eu/position-paper" 
                  className="footer__link text-gray-600 hover:text-bot-green transition-colors text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Policy Paper
                </a>
              </li>
            </ul>
          </div>
          
          <div className="footer__section">
            <h4 className="footer__title text-gray-900 font-semibold mb-4">🎪 Action Group</h4>
            <ul className="footer__links space-y-2">
              <li>
                <a 
                  href="mailto:action-wg@back-on-track.eu" 
                  className="footer__link text-gray-600 hover:text-bot-green transition-colors text-sm"
                >
                  ✉️ Join Action Group
                </a>
              </li>
              <li>
                <a 
                  href={config.app.discordInvite} 
                  className="footer__link text-gray-600 hover:text-bot-green transition-colors text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Discord
                </a>
              </li>
              <li>
                <a 
                  href="https://back-on-track.eu/night-train-conference-2025" 
                  className="footer__link text-gray-600 hover:text-bot-green transition-colors text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🏛️ Berlin Conference
                </a>
              </li>
              <li>
                <a href="https://toolkit.backontrack.eu/party-kit"
                   className="footer__link text-gray-600 hover:text-bot-green transition-colors text-sm"
                   target="_blank" rel="noopener noreferrer">📦 Pajama Party Kit</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer__bottom border-t border-gray-200 mt-8 pt-8">
          <p className="footer__copyright text-center text-gray-500 text-sm">
            © 2025 Back-on-Track AISBL. Made with ❤️ for sustainable European travel.
          </p>
        </div>
      </div>
    </footer>
  );
}
