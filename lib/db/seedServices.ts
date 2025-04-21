import { db } from './drizzle';
import { services } from './schema';

async function seedServices() {
  console.log('Seeding services for Planform.ai...');

  // Delete existing services to avoid duplicates
  await db.delete(services);

  // Define luxury marketing services
  const marketingServices = [
    {
      serviceId: 'luxury_brand_strategy',
      name: 'Luxury Brand Strategy',
      description: 'Comprehensive brand strategy development tailored for luxury markets. Includes competitor analysis, positioning, brand voice, and complete visual identity guidelines.',
      outcomes: [
        'Clear market positioning', 
        'Distinctive brand voice', 
        'Cohesive visual identity system', 
        'Elevated brand perception'
      ],
      priceLower: 20000,
      priceUpper: 45000,
      whenToRecommend: [
        'Brand feels generic or outdated',
        'Entering luxury market segment',
        'Inconsistent brand messaging',
        'Need to justify premium pricing'
      ]
    },
    {
      serviceId: 'premium_website_redesign',
      name: 'Premium Website Redesign',
      description: 'Complete redesign of your digital presence with custom animations, premium content strategy, and tailored user journeys designed to convert high-value clients.',
      outcomes: [
        'Elevated online presence',
        'Higher conversion of premium clients',
        'Reduced bounce rate',
        'Increased average time on site'
      ],
      priceLower: 35000,
      priceUpper: 80000,
      whenToRecommend: [
        'Website feels outdated',
        'Low conversion rates',
        'Brand identity not reflected online',
        'High bounce rates'
      ]
    },
    {
      serviceId: 'content_strategy',
      name: 'Luxury Content Strategy',
      description: 'Strategic content planning and creation focused on storytelling that resonates with affluent audiences. Includes editorial calendar, content creation guidelines, and premium asset development.',
      outcomes: [
        'Cohesive brand storytelling',
        'Higher engagement metrics',
        'Improved organic visibility',
        'Increased thought leadership'
      ],
      priceLower: 15000,
      priceUpper: 30000,
      whenToRecommend: [
        'Inconsistent content quality',
        'Low engagement with existing content',
        'Need for thought leadership',
        'Weak content differentiation'
      ]
    },
    {
      serviceId: 'seo_strategy',
      name: 'Prestige SEO Program',
      description: 'Sophisticated search optimization focused on high-intent, luxury market search terms. Includes technical SEO audit, competitor analysis, content gap analysis, and monthly optimization.',
      outcomes: [
        'Higher rankings for luxury keywords',
        'Increased qualified organic traffic',
        'Enhanced domain authority',
        'Improved search visibility'
      ],
      priceLower: 8000,
      priceUpper: 15000,
      whenToRecommend: [
        'Low organic traffic',
        'Poor rankings for valuable keywords',
        'Technical SEO issues',
        'Needs better visibility against competitors'
      ]
    },
    {
      serviceId: 'social_media_management',
      name: 'Curated Social Media Management',
      description: 'Full-service social media management focused on platforms favored by affluent audiences. Includes strategy, content creation, community management, and performance analytics.',
      outcomes: [
        'Elevated social presence',
        'Consistent, on-brand content',
        'Higher engagement rates',
        'Growth in qualified followers'
      ],
      priceLower: 6000,
      priceUpper: 12000,
      whenToRecommend: [
        'Inconsistent social posting',
        'Low engagement on social channels',
        'Needs professional content creation',
        'Wants cohesive cross-platform presence'
      ]
    },
    {
      serviceId: 'luxury_email_campaigns',
      name: 'Premium Email Marketing Suite',
      description: 'Strategic email marketing designed to nurture high-value prospects. Includes segmentation strategy, custom template design, automation setup, and performance optimization.',
      outcomes: [
        'Higher email engagement',
        'Improved conversion rates',
        'Consistent nurturing of prospects',
        'Increased customer lifetime value'
      ],
      priceLower: 5000,
      priceUpper: 10000,
      whenToRecommend: [
        'Poor email engagement metrics',
        'No segmentation strategy',
        'Generic, non-branded emails',
        'Needs better lead nurturing'
      ]
    },
    {
      serviceId: 'ppc_management',
      name: 'Elite PPC Management',
      description: 'Managed pay-per-click campaigns targeting high-net-worth individuals. Includes audience research, creative development, A/B testing, and continuous optimization.',
      outcomes: [
        'Higher quality leads',
        'Lower cost per acquisition',
        'Increased ROAS',
        'Access to premium audience segments'
      ],
      priceLower: 10000,
      priceUpper: 20000,
      whenToRecommend: [
        'Poor ad performance',
        'High cost per acquisition',
        'Low quality leads',
        'Needs targeted audience reach'
      ]
    },
    {
      serviceId: 'influencer_partnerships',
      name: 'Curated Influencer Partnerships',
      description: 'Strategic influencer collaborations with carefully vetted partners who resonate with luxury audiences. Includes influencer identification, relationship management, content guidance, and performance tracking.',
      outcomes: [
        'Authentic brand endorsements',
        'Access to new affluent audiences',
        'High-quality content creation',
        'Increased brand credibility'
      ],
      priceLower: 20000,
      priceUpper: 50000,
      whenToRecommend: [
        'Needs access to new audience segments',
        'Wants authentic endorsements',
        'Previous unsuccessful influencer work',
        'Lacks social proof'
      ]
    },
    {
      serviceId: 'analytics_dashboard',
      name: 'Performance Analytics Suite',
      description: 'Custom analytics dashboard that tracks the metrics most relevant to luxury marketing performance. Includes setup, custom reporting, quarterly strategy refinements, and executive summaries.',
      outcomes: [
        'Clear visibility into marketing performance',
        'Data-driven decision making',
        'Regular optimization opportunities',
        'Simplified executive reporting'
      ],
      priceLower: 4000,
      priceUpper: 8000,
      whenToRecommend: [
        'Lacking marketing performance insights',
        'Difficulty proving marketing ROI',
        'No consolidated reporting',
        'Needs better decision-making tools'
      ]
    },
    {
      serviceId: 'conversion_optimization',
      name: 'Luxury Conversion Optimization',
      description: 'Systematic enhancement of customer journeys to improve conversion rates for high-ticket offerings. Includes UX audits, A/B testing, customer journey mapping, and ongoing optimization.',
      outcomes: [
        'Higher conversion rates',
        'Streamlined customer journeys',
        'Increased average order value',
        'Improved customer experience'
      ],
      priceLower: 12000,
      priceUpper: 25000,
      whenToRecommend: [
        'Low website conversion rates',
        'High cart abandonment',
        'Complex purchase processes',
        'Needs optimization for high-value transactions'
      ]
    }
  ];

  // Insert services into the database
  for (const service of marketingServices) {
    await db.insert(services).values(service);
  }

  console.log(`Seeded ${marketingServices.length} Planform.ai services successfully.`);
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