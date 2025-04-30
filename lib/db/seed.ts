import { db } from './drizzle';
import { users, agencies, services } from './schema';
import { hashPassword } from '@/lib/auth/password';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Starting seed process...');

  // Clean up existing data
  // Create agencies
  console.log('Creating agencies...');
  
  const [planformAgency] = await db.insert(agencies).values({
    name: 'Planform.ai',
    description: 'AI-powered marketing strategy platform',
    websiteUrl: 'https://planform.ai',
    primaryColor: '#3b82f6',
    isActive: true,
  }).returning();
  
  const [hayesAgency] = await db.insert(agencies).values({
    name: 'Hayes Media',
    description: 'Boutique digital marketing agency',
    websiteUrl: 'https://hayesmedia.co.za',
    primaryColor: '#10b981',
    isActive: true,
  }).returning();
  
  const [growthStudioAgency] = await db.insert(agencies).values({
    name: 'Growth Studio',
    description: 'Growth marketing and conversion optimization',
    websiteUrl: 'https://growthstudio.com',
    primaryColor: '#8b5cf6',
    isActive: true,
  }).returning();
  
  console.log(`Created ${3} agencies`);
  
  // Create users
  console.log('Creating users...');
  
  // Admin user for Planform
  const adminPasswordHash = await hashPassword('admin123');
  const [adminUser] = await db.insert(users).values({
    name: 'Admin User',
    email: 'admin@planform.ai',
    passwordHash: adminPasswordHash,
    agencyId: planformAgency.id,
    isVerified: true,
  }).returning();
  
  // Test user for Hayes Media
  const testPasswordHash = await hashPassword('password123');
  const [hayesUser] = await db.insert(users).values({
    name: 'Michael Hayes',
    email: 'michael@hayesmedia.co.za',
    passwordHash: testPasswordHash,
    agencyId: hayesAgency.id,
    isVerified: true,
  }).returning();
  
  // Growth Studio user
  const [growthUser] = await db.insert(users).values({
    name: 'Sarah Johnson',
    email: 'sarah@growthstudio.com',
    passwordHash: testPasswordHash,
    agencyId: growthStudioAgency.id,
    isVerified: true,
  }).returning();
  
  // Free user with no agency
  const [freeUser] = await db.insert(users).values({
    name: 'Free User',
    email: 'free@example.com',
    passwordHash: testPasswordHash,
    isVerified: true,
  }).returning();
  
  console.log(`Created ${4} users`);

  // Seed services for Planform agency
  console.log('Creating services for Planform agency...');
  
  const planformServices = [
    {
      agencyId: planformAgency.id,
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
      agencyId: planformAgency.id,
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
      agencyId: planformAgency.id,
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
    }
  ];
  
  for (const service of planformServices) {
    await db.insert(services).values(service);
  }
  
  // Create services for Hayes Media
  console.log('Creating services for Hayes Media agency...');
  
  const hayesServices = [
    {
      agencyId: hayesAgency.id,
      serviceId: 'social_media_management',
      name: 'Social Media Management',
      description: 'Full-service social media management for your business.',
      outcomes: [
        'Professional social presence',
        'Consistent, on-brand content',
        'Higher engagement rates',
        'Growth in qualified followers'
      ],
      priceLower: 2500,
      priceUpper: 6000,
      whenToRecommend: [
        'Inconsistent social posting',
        'Low engagement on social channels',
        'Needs professional content creation',
        'Wants cohesive cross-platform presence'
      ]
    },
    {
      agencyId: hayesAgency.id,
      serviceId: 'email_marketing',
      name: 'Email Marketing',
      description: 'Strategic email marketing designed to nurture leads and drive sales.',
      outcomes: [
        'Higher email engagement',
        'Improved conversion rates',
        'Consistent lead nurturing',
        'Increased customer lifetime value'
      ],
      priceLower: 2000,
      priceUpper: 5000,
      whenToRecommend: [
        'Poor email engagement metrics',
        'No segmentation strategy',
        'Generic, non-branded emails',
        'Needs better lead nurturing'
      ]
    }
  ];
  
  for (const service of hayesServices) {
    await db.insert(services).values(service);
  }
  
  // Create services for Growth Studio
  console.log('Creating services for Growth Studio agency...');
  
  const growthServices = [
    {
      agencyId: growthStudioAgency.id,
      serviceId: 'conversion_optimization',
      name: 'Conversion Optimization',
      description: 'Systematic enhancement of customer journeys to improve conversion rates.',
      outcomes: [
        'Higher conversion rates',
        'Streamlined customer journeys',
        'Increased average order value',
        'Improved customer experience'
      ],
      priceLower: 4000,
      priceUpper: 10000,
      whenToRecommend: [
        'Low website conversion rates',
        'High cart abandonment',
        'Complex purchase processes',
        'Needs optimization for higher conversions'
      ]
    },
    {
      agencyId: growthStudioAgency.id,
      serviceId: 'ppc_advertising',
      name: 'PPC Advertising',
      description: 'Managed pay-per-click campaigns to drive targeted traffic and leads.',
      outcomes: [
        'Higher quality leads',
        'Lower cost per acquisition',
        'Increased ROAS',
        'Access to targeted audience segments'
      ],
      priceLower: 3000,
      priceUpper: 12000,
      whenToRecommend: [
        'Poor ad performance',
        'High cost per acquisition',
        'Low quality leads',
        'Needs targeted audience reach'
      ]
    },
    {
      agencyId: growthStudioAgency.id,
      serviceId: 'analytics_setup',
      name: 'Analytics Setup',
      description: 'Custom analytics implementation to track the metrics that matter for your business.',
      outcomes: [
        'Clear visibility into performance',
        'Data-driven decision making',
        'Regular optimization opportunities',
        'Simplified reporting'
      ],
      priceLower: 1500,
      priceUpper: 4000,
      whenToRecommend: [
        'Lacking performance insights',
        'Difficulty proving marketing ROI',
        'No consolidated reporting',
        'Needs better decision-making tools'
      ]
    }
  ];
  
  for (const service of growthServices) {
    await db.insert(services).values(service);
  }
  
  console.log(`Created ${planformServices.length + hayesServices.length + growthServices.length} services across all agencies`);
  
  console.log('Seed completed successfully!');
  console.log(`
Test login credentials:
- Admin: admin@planform.ai / admin123
- Hayes Media: michael@hayesmedia.co.za / password123
- Growth Studio: sarah@growthstudio.com / password123
- Free user: free@example.com / password123
  `);
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
