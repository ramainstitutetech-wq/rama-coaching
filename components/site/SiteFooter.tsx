import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img
              src="/logo.jpeg"
              alt="Rama Coaching Center Logo"
              className="h-14 w-auto mb-3"
            />
            <h3 className="text-xl font-bold mb-4">About Us</h3>
            <p className="text-gray-400 text-sm">
              Rama Coaching Center And Computer Education Center is committed to providing quality computer education to students in Fatehpur, Uttar Pradesh and surrounding areas.
            </p>
            <div className="mt-4">
              <p className="text-gray-400 text-sm flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" /> Fatehpur, Uttar Pradesh 212601
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="/franchise" className="text-gray-400 hover:text-white transition-colors">Franchise</Link></li>
              <li><Link href="/verification" className="text-gray-400 hover:text-white transition-colors">Verification</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Our Courses</h3>
            <ul className="space-y-2">
              <li><Link href="/courses" className="text-gray-400 hover:text-white transition-colors">RSCIT / Basic Computer</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-white transition-colors">Tally Prime</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-white transition-colors">Digital Marketing</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-white transition-colors">RSCFA Accounting</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-white transition-colors">ADCA / DCA Diploma</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Fatehpur, Uttar Pradesh 212601</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <Link href="tel:08299121689" className="hover:text-white transition-colors">08299121689</Link>
              </li>
              <li className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <Link href="mailto:info@ramacoaching.com" className="hover:text-white transition-colors">info@ramacoaching.com</Link>
              </li>
              <li className="flex items-center text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm">
              © Rama Coaching Center And Computer Education Center. All Rights Reserved.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-gray-500 text-xs">Designed & Developed by</span>
              <Link 
                href="https://expecto.online" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
              >
                <span className="text-red-500 font-bold">Expecto</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
