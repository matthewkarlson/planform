import { db } from './drizzle';
import { services } from './schema';
import { eq } from 'drizzle-orm';

async function seedServices() {
  console.log('Starting service seed process for Planform.ai...');

  // Clean up existing services for Planform.ai
  console.log('Cleaning up existing services for agencyId=1...');
  await db.delete(services).where(eq(services.agencyId, 1));
  
  // Define 10 services for Planform agency
  const planformServices = [
    {
      agencyId: 1, // Planform.ai
      serviceId: 'brand_strategy',
      name: 'Brand Strategy',
      description: 'Comprehensive brand strategy development tailored for your market.',
      outcomes: [
        'Clear market positioning', 
        'Distinctive brand voice', 
        'Cohesive visual identity system', 
        'Elevated brand perception'
      ],
      priceLower: 10000,
      priceUpper: 25000,
      whenToRecommend: [
        'Brand feels generic or outdated',
        'Inconsistent brand messaging',
        'Need to justify premium pricing'
      ]
    },
    {
      agencyId: 1,
      serviceId: 'website_redesign',
      name: 'Website Redesign',
      description: 'Complete redesign of your digital presence with custom design and content strategy.',
      outcomes: [
        'Elevated online presence',
        'Higher conversion rates',
        'Reduced bounce rate',
        'Increased average time on site'
      ],
      priceLower: 15000,
      priceUpper: 40000,
      whenToRecommend: [
        'Website feels outdated',
        'Low conversion rates',
        'Brand identity not reflected online',
        'High bounce rates'
      ]
    },
    {
      agencyId: 1,
      serviceId: 'seo_optimization',
      name: 'SEO Optimization',
      description: 'Comprehensive search engine optimization to improve rankings and traffic.',
      outcomes: [
        'Higher search rankings',
        'Increased organic traffic',
        'Enhanced domain authority',
        'Improved search visibility'
      ],
      priceLower: 3000,
      priceUpper: 8000,
      whenToRecommend: [
        'Low organic traffic',
        'Poor rankings for valuable keywords',
        'Technical SEO issues',
        'Needs better visibility against competitors'
      ]
    },
    {
      agencyId: 1,
      serviceId: 'content_marketing',
      name: 'Content Marketing Strategy',
      description: 'Strategic content creation and distribution to engage your audience and drive business results.',
      outcomes: [
        'Higher audience engagement',
        'Improved thought leadership positioning',
        'Increased organic traffic',
        'Better lead quality and conversion'
      ],
      priceLower: 4000,
      priceUpper: 12000,
      whenToRecommend: [
        'Inconsistent content production',
        'Low engagement with current content',
        'Needs to establish industry authority',
        'Limited content conversion strategy'
      ]
    },
    {
      agencyId: 1,
      serviceId: 'ecommerce_optimization',
      name: 'E-Commerce Optimization',
      description: 'Comprehensive analysis and improvement of your online store to maximize sales and customer satisfaction.',
      outcomes: [
        'Increased conversion rate',
        'Higher average order value',
        'Reduced cart abandonment',
        'Improved customer satisfaction'
      ],
      priceLower: 6000,
      priceUpper: 18000,
      whenToRecommend: [
        'High shopping cart abandonment',
        'Low product page conversion',
        'Poor mobile shopping experience',
        'Need for improved customer journey'
      ]
    },
    {
      agencyId: 1,
      serviceId: 'marketing_automation',
      name: 'Marketing Automation',
      description: 'Implementation of automated marketing processes to nurture leads and increase efficiency.',
      outcomes: [
        'Streamlined lead management',
        'Consistent lead nurturing',
        'Increased marketing efficiency',
        'Improved conversion rates'
      ],
      priceLower: 5000,
      priceUpper: 15000,
      whenToRecommend: [
        'Manual marketing processes',
        'Inconsistent follow-up with leads',
        'Need for scalable marketing',
        'Disjointed customer communication'
      ]
    },
    {
      agencyId: 1,
      serviceId: 'social_media_strategy',
      name: 'Social Media Strategy',
      description: 'Develop a comprehensive social media strategy to build your brand and engage your audience.',
      outcomes: [
        'Cohesive brand presence',
        'Increased engagement',
        'Community growth',
        'Higher social conversion'
      ],
      priceLower: 4000,
      priceUpper: 10000,
      whenToRecommend: [
        'Inconsistent social presence',
        'Low engagement metrics',
        'Poor social media ROI',
        'Need for improved brand voice'
      ]
    },
    {
      agencyId: 1,
      serviceId: 'conversion_rate_optimization',
      name: 'Conversion Rate Optimization',
      description: 'Data-driven approach to optimize your website and marketing for maximum conversions.',
      outcomes: [
        'Higher conversion rates',
        'Improved user experience',
        'Better ROI on traffic',
        'Data-backed design decisions'
      ],
      priceLower: 5000,
      priceUpper: 12000,
      whenToRecommend: [
        'Low website conversion rates',
        'High traffic but low conversion',
        'Need for data-driven improvements',
        'Unclear user journeys'
      ]
    },
    {
      agencyId: 1,
      serviceId: 'digital_advertising',
      name: 'Digital Advertising Management',
      description: 'Strategic management of paid digital channels to drive targeted traffic and conversions.',
      outcomes: [
        'Increased qualified traffic',
        'Lower cost per acquisition',
        'Higher ROAS',
        'Improved targeting precision'
      ],
      priceLower: 4000,
      priceUpper: 15000,
      whenToRecommend: [
        'Ineffective ad campaigns',
        'High cost per acquisition',
        'Need for scalable lead generation',
        'Poor ad targeting'
      ]
    },
    {
      agencyId: 1,
      serviceId: 'market_research',
      name: 'Market Research & Analysis',
      description: 'Comprehensive research to understand your market, competitors, and customers.',
      outcomes: [
        'Deep customer insights',
        'Clear competitive positioning',
        'Identified market opportunities',
        'Data-backed strategy decisions'
      ],
      priceLower: 8000,
      priceUpper: 20000,
      whenToRecommend: [
        'Limited market understanding',
        'Need for product-market fit',
        'Entering new markets',
        'Developing marketing strategy'
      ]
    }
  ];
  
  // Insert all services
  console.log(`Inserting ${planformServices.length} services for Planform.ai...`);
  
  for (const service of planformServices) {
    await db.insert(services).values(service);
  }
  
  console.log('Service seed completed successfully!');
}

seedServices()
  .catch((error) => {
    console.error('Service seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Service seed process finished. Exiting...');
    process.exit(0);
  }); 