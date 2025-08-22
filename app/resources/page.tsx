import { Metadata } from 'next';
import Link from 'next/link';
import { Download, FileText, Users, MapPin, Megaphone, Shield, Video, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Organizer Resources | European Pajama Party 2025',
  description: 'Download organizer toolkits, guidelines, and materials for the September 26 European Pajama Party event.',
  keywords: 'pajama party, organizer resources, event planning, September 26, Back-on-Track',
};

export default function ResourcesPage() {
  const resources = [
    {
      category: 'Event Planning',
      items: [
        {
          title: 'Station Organizer Handbook',
          description: 'Complete guide for coordinating your local station event',
          type: 'PDF Guide',
          size: '2.4 MB',
          icon: FileText,
          downloadUrl: '/downloads/station-organizer-handbook.pdf'
        },
        {
          title: 'Timeline & Checklist',
          description: 'Week-by-week preparation timeline with actionable tasks',
          type: 'PDF Checklist',
          size: '890 KB',
          icon: Calendar,
          downloadUrl: '/downloads/event-timeline-checklist.pdf'
        },
        {
          title: 'Permit & Authorization Templates',
          description: 'Template letters for station authorities and local permits',
          type: 'Word Documents',
          size: '1.2 MB',
          icon: Shield,
          downloadUrl: '/downloads/permit-templates.zip'
        }
      ]
    },
    {
      category: 'Promotion & Communication',
      items: [
        {
          title: 'Social Media Toolkit',
          description: 'Ready-to-use posts, graphics, and hashtag guidelines',
          type: 'Design Pack',
          size: '15.3 MB',
          icon: Megaphone,
          downloadUrl: '/downloads/social-media-toolkit.zip'
        },
        {
          title: 'Press Release Template',
          description: 'Customizable press release for local media outreach',
          type: 'Word Document',
          size: '456 KB',
          icon: FileText,
          downloadUrl: '/downloads/press-release-template.docx'
        },
        {
          title: 'Event Poster Templates',
          description: 'Print-ready posters in multiple languages and sizes',
          type: 'Design Files',
          size: '8.7 MB',
          icon: FileText,
          downloadUrl: '/downloads/poster-templates.zip'
        }
      ]
    },
    {
      category: 'Day of Event',
      items: [
        {
          title: 'Equipment & Setup Guide',
          description: 'Sound system setup, safety guidelines, and equipment list',
          type: 'PDF Guide',
          size: '1.8 MB',
          icon: Users,
          downloadUrl: '/downloads/equipment-setup-guide.pdf'
        },
        {
          title: 'Volunteer Coordinator Manual',
          description: 'Managing volunteers, roles, and day-of coordination',
          type: 'PDF Manual',
          size: '2.1 MB',
          icon: Users,
          downloadUrl: '/downloads/volunteer-manual.pdf'
        },
        {
          title: 'Live Stream Setup Instructions',
          description: 'Technical setup for streaming your station to the network',
          type: 'Video Tutorial',
          size: '125 MB',
          icon: Video,
          downloadUrl: '/downloads/livestream-tutorial.mp4'
        }
      ]
    },
    {
      category: 'Branding & Materials',
      items: [
        {
          title: 'Back-on-Track Brand Guidelines',
          description: 'Logo usage, color codes, and brand consistency guide',
          type: 'PDF Guide',
          size: '3.2 MB',
          icon: FileText,
          downloadUrl: '/downloads/brand-guidelines.pdf'
        },
        {
          title: 'Printable Materials Pack',
          description: 'Banners, signs, name tags, and wristbands',
          type: 'Print Files',
          size: '12.4 MB',
          icon: FileText,
          downloadUrl: '/downloads/printable-materials.zip'
        },
        {
          title: 'Digital Assets Collection',
          description: 'Logos, icons, backgrounds for digital use',
          type: 'Design Files',
          size: '6.8 MB',
          icon: FileText,
          downloadUrl: '/downloads/digital-assets.zip'
        }
      ]
    }
  ];

  const supportResources = [
    {
      title: 'Organizer Discord Channel',
      description: 'Real-time support and coordination with other organizers',
      action: 'Join Discord',
      link: '/community#discord',
      icon: Users
    },
    {
      title: 'Station Mapping Tool',
      description: 'Find your station coordinates and connect with nearby organizers',
      action: 'Use Map Tool',
      link: '/#map',
      icon: MapPin
    },
    {
      title: 'Emergency Support Hotline',
      description: 'Day-of event support: +32 2 123 4567 (Sept 26, 15:00-22:00 CEST)',
      action: 'Save Contact',
      link: 'tel:+3221234567',
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-r from-bot-green to-bot-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Organizer Resources
          </h1>
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-4xl mx-auto">
            Everything you need to organize a successful September 26 Pajama Party 
            at your local train station.
          </p>
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-medium">
            <Calendar className="h-4 w-4 mr-2" />
            September 26, 2025 • 19:00-20:00 CEST
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Start Guide</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              New to organizing? Follow these essential steps to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-purple-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Download Handbook</h3>
              <p className="text-gray-600 mb-6">
                Start with the Station Organizer Handbook for complete planning guidance.
              </p>
              <Link
                href="/downloads/station-organizer-handbook.pdf"
                className="inline-flex items-center bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Handbook
              </Link>
            </div>

            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Join Community</h3>
              <p className="text-gray-600 mb-6">
                Connect with other organizers and get real-time support on Discord.
              </p>
              <Link
                href="/community#discord"
                className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Join Discord
              </Link>
            </div>

            <div className="bg-green-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Register Station</h3>
              <p className="text-gray-600 mb-6">
                Add your station to the official map and coordinate with nearby events.
              </p>
              <Link
                href="/pajama-party#signup-form"
                className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Register Station
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              Complete Resource Library
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Download guides, templates, and materials organized by planning phase.
            </p>
          </div>

          <div className="space-y-16">
            {resources.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">{category.category}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={itemIndex} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{item.type}</div>
                            <div className="text-xs text-gray-500">{item.size}</div>
                          </div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <Link
                          href={item.downloadUrl}
                          className="inline-flex items-center text-bot-green hover:text-bot-dark-green font-medium"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Resources */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get support from our community and organizing team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {supportResources.map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-bot-green/10 to-bot-blue/10 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-bot-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{resource.title}</h3>
                  <p className="text-gray-600 mb-6">{resource.description}</p>
                  <Link
                    href={resource.link}
                    className="inline-flex items-center bg-bot-green text-white px-6 py-3 rounded-lg hover:bg-bot-dark-green transition-colors"
                  >
                    {resource.action}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-bot-green to-bot-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-xl text-white/90 mb-8">
            Our organizing team is here to help you create an amazing event.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">General Support</h3>
              <p className="text-white/90 mb-4">Questions about organizing or planning</p>
              <Link
                href="mailto:giovanni.backontrac@gmail.com"
                className="inline-flex items-center text-white hover:text-white/80"
              >
                giovanni.backontrac@gmail.com
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Media & Press</h3>
              <p className="text-white/90 mb-4">Press inquiries and media relations</p>
              <Link
                href="mailto:giovanni.backontrac@gmail.com"
                className="inline-flex items-center text-white hover:text-white/80"
              >
                giovanni.backontrac@gmail.com
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}