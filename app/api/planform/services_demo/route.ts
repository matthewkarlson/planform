import { NextResponse } from 'next/server';

// Example demo data for services
const demoServices = [
  {
    id: 1,
    agencyId: 1,
    serviceId: 'website_redesign',
    name: 'Website Redesign & Development',
    description: 'A complete overhaul of your website with modern design principles, focusing on conversion optimization and user experience.',
    outcomes: [
      'Increased visitor engagement',
      'Improved conversion rates',
      'Mobile-friendly responsive design',
      'Faster page load times',
      'Enhanced user experience'
    ],
    priceLower: 5000,
    priceUpper: 15000,
    whenToRecommend: [
      'Website is outdated',
      'High bounce rates',
      'Poor mobile experience',
      'Low conversion rates'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 2,
    agencyId: 1,
    serviceId: 'seo_strategy',
    name: 'SEO Strategy & Implementation',
    description: 'Comprehensive search engine optimization to improve your organic rankings and drive more qualified traffic to your website.',
    outcomes: [
      'Higher search engine rankings',
      'Increased organic traffic',
      'Better targeting of ideal customers',
      'Improved content strategy',
      'Regular progress reporting'
    ],
    priceLower: 2000,
    priceUpper: 5000,
    whenToRecommend: [
      'Low organic traffic',
      'Poor search visibility',
      'Content marketing focus',
      'Local business visibility needs'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 3,
    agencyId: 1,
    serviceId: 'conversion_optimization',
    name: 'Conversion Rate Optimization',
    description: 'Data-driven analysis and strategic improvements to turn more of your visitors into leads and customers.',
    outcomes: [
      'Higher conversion rates',
      'Increased lead quality',
      'Better ROI on existing traffic',
      'Improved user journey',
      'A/B testing insights'
    ],
    priceLower: 3000,
    priceUpper: 7000,
    whenToRecommend: [
      'Good traffic but poor conversions',
      'Uncertain about what users want',
      'High cart abandonment',
      'Unclear user journey'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 4,
    agencyId: 1,
    serviceId: 'content_strategy',
    name: 'Content Strategy & Creation',
    description: 'Strategic content planning and creation that speaks directly to your target audience and drives engagement.',
    outcomes: [
      'More engaging website content',
      'Regular blog publishing',
      'Improved brand messaging',
      'Content that converts',
      'SEO-optimized writing'
    ],
    priceLower: 1500,
    priceUpper: 4000,
    whenToRecommend: [
      'Struggling to create content',
      'Content doesn\'t convert',
      'Need thought leadership',
      'Supporting SEO efforts'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 5,
    agencyId: 1,
    serviceId: 'lead_nurturing',
    name: 'Lead Nurturing System',
    description: 'Automated email sequences and content delivery to nurture leads through your sales funnel.',
    outcomes: [
      'Automated lead follow-up',
      'Higher conversion to sales',
      'Reduced sales cycle',
      'More qualified prospects',
      'Increased customer lifetime value'
    ],
    priceLower: 2500,
    priceUpper: 6000,
    whenToRecommend: [
      'Getting leads that don\'t convert',
      'Long sales cycles',
      'Need for marketing automation',
      'Poor lead qualification'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
];

export async function GET() {
  // Return the demo services data
  return NextResponse.json(demoServices);
} 