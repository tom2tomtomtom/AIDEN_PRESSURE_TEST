// Seed script for FMCG phantom memories
// Run with: node scripts/seed-memories-fmcg.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read .env.local manually
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'ppt' } }
)

// Memory templates per archetype
// Each archetype gets memories matching their psychographic profile

const memoryTemplates = {
  'skeptical-switcher': [
    // Brand Betrayal
    { text: 'My favorite cereal changed their recipe. Same box, same price, but now it tastes like cardboard. They think I wouldn\'t notice.', keywords: ['cereal', 'recipe', 'change', 'reformulation', 'taste'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'That "family size" bag of chips is now 20% smaller but costs the same. Classic shrinkflation. They\'re not fooling anyone.', keywords: ['chips', 'shrinkflation', 'size', 'price', 'family'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'purchase' },
    { text: 'The laundry detergent I\'ve used for years now requires twice as much per load. They diluted the formula but kept the price.', keywords: ['detergent', 'laundry', 'diluted', 'formula', 'concentration'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'Remember when yogurt cups were 8oz? Now they\'re 5.3oz for the same price. That\'s a 34% reduction.', keywords: ['yogurt', 'size', 'shrinkflation', 'dairy'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'They replaced real sugar with high fructose corn syrup in my kids\' juice boxes. The ingredient list never lies.', keywords: ['sugar', 'corn syrup', 'ingredients', 'juice', 'kids', 'children'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'purchase' },
    // Trust Erosion
    { text: '"All natural" on the label means nothing. I checked the ingredients - artificial flavors, preservatives, the works.', keywords: ['natural', 'artificial', 'ingredients', 'preservatives', 'label', 'claims'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'purchase' },
    { text: 'That "clinically proven" claim had an asterisk leading to a study they funded themselves. Of course it was positive.', keywords: ['clinically proven', 'study', 'research', 'claims', 'science'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'advertising' },
    { text: 'The "new and improved" version is actually worse. It\'s a cost-cutting measure disguised as innovation.', keywords: ['new', 'improved', 'formula', 'innovation'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    // Price Shock
    { text: 'Coffee went from $8 to $12 in two months. They blame "supply chain" but their profits are up 40%.', keywords: ['coffee', 'price', 'increase', 'inflation', 'supply chain'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'That subscription snack box doubled the price after the "introductory" period buried in fine print.', keywords: ['subscription', 'price', 'snack', 'fine print', 'introductory'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'purchase' },
    // Positive Discovery
    { text: 'The store brand version is literally made in the same factory. Saved 40% by reading the label closely.', keywords: ['store brand', 'generic', 'same factory', 'savings', 'value'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'Found an honest brand that actually lists the country of origin and farm sources. Rare but worth the extra dollar.', keywords: ['transparent', 'origin', 'farm', 'honest', 'sourcing'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'That small local brand delivered exactly what they promised. No marketing speak, just quality ingredients.', keywords: ['local', 'quality', 'honest', 'small brand', 'ingredients'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    // Category Disappointment
    { text: 'Every "healthy" snack bar is just candy with better marketing. 20g of sugar is 20g of sugar.', keywords: ['healthy', 'snack', 'bar', 'sugar', 'marketing'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    { text: 'Premium ice cream isn\'t premium anymore. They all use stabilizers and gums now instead of real cream.', keywords: ['ice cream', 'premium', 'stabilizers', 'cream', 'quality'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    // Social Influence
    { text: 'My neighbor works at a food company. She told me the "quality improvements" memo actually meant cost cuts.', keywords: ['insider', 'quality', 'cost cutting', 'industry'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'word_of_mouth' },
    { text: 'A consumer watchdog YouTube channel showed how most "organic" claims are essentially meaningless loopholes.', keywords: ['organic', 'claims', 'watchdog', 'loopholes', 'certification'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'social_media' },
    { text: 'Reddit thread exposed how brand loyalty programs actually track and monetize your purchase data.', keywords: ['loyalty', 'data', 'privacy', 'tracking', 'rewards'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'social_media' },
    // Additional memories
    { text: 'Bought the "value pack" only to realize per-unit price was actually higher than individual items. Caught that trick.', keywords: ['value', 'bulk', 'price', 'trick', 'comparison'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    { text: 'The "limited time" offer has been running for 6 months. Nothing about it is limited or special.', keywords: ['limited', 'offer', 'promotion', 'sale', 'urgency'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'advertising' },
    { text: 'New packaging looks fancy but there\'s 15% less product inside. Measured it myself.', keywords: ['packaging', 'size', 'shrinkflation', 'quantity'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'Finally found a brand that didn\'t change when they got acquired. Rare integrity in this market.', keywords: ['acquisition', 'integrity', 'consistent', 'quality'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'Checked three different price comparison apps before buying. The "discount" was actually their regular price.', keywords: ['discount', 'price', 'comparison', 'fake sale'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    { text: 'The ingredients list went from 8 items to 24 after the company was bought out. That tells you everything.', keywords: ['ingredients', 'acquisition', 'additives', 'quality'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'purchase' },
    { text: 'At least the store brand doesn\'t pretend to be something it\'s not. Honest about being budget-friendly.', keywords: ['store brand', 'honest', 'budget', 'value'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' }
  ],

  'loyal-defender': [
    // Positive Brand Experiences
    { text: 'Been buying this brand since my mother used it. Three generations and they\'ve never let us down.', keywords: ['heritage', 'generations', 'family', 'tradition', 'trust'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'When they had that recall, they handled it with complete transparency. That\'s how you build real trust.', keywords: ['recall', 'transparency', 'trust', 'honesty', 'safety'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'news' },
    { text: 'Same recipe for 50 years. That consistency is worth paying a bit more for.', keywords: ['recipe', 'consistent', 'quality', 'years', 'tradition'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'Customer service went above and beyond when I had an issue. Real people who actually care.', keywords: ['customer service', 'care', 'support', 'helpful'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'They\'re a family company that still makes things the right way. You can taste the difference.', keywords: ['family', 'business', 'quality', 'authentic', 'tradition'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    // Brand Loyalty Tested
    { text: 'They changed the packaging but thankfully kept everything else the same. Smart move.', keywords: ['packaging', 'change', 'same', 'quality'], emotional_residue: 'positive', trust_modifier: 1, experience_type: 'purchase' },
    { text: 'Tried a cheaper alternative once. Never again. Some things are worth paying for.', keywords: ['alternative', 'cheap', 'quality', 'worth', 'price'], emotional_residue: 'mixed', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'They almost lost me when they started messing with the formula. Glad they went back to the original.', keywords: ['formula', 'original', 'change', 'classic'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    // Heritage Stories
    { text: 'Remember when Dad would only buy this brand? Now I understand why. Quality you can count on.', keywords: ['family', 'dad', 'trust', 'quality', 'heritage'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'word_of_mouth' },
    { text: 'This brand got us through hard times. That kind of loyalty goes both ways.', keywords: ['loyalty', 'trust', 'reliable', 'consistent'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'My grandmother swore by this brand. I\'m proud to continue that tradition with my own family.', keywords: ['grandmother', 'tradition', 'family', 'heritage'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'word_of_mouth' },
    // Disappointment with New Brands
    { text: 'These new trendy brands come and go. I\'ll stick with what\'s proven.', keywords: ['trendy', 'new', 'proven', 'reliable', 'trust'], emotional_residue: 'mixed', trust_modifier: 0, experience_type: 'purchase' },
    { text: 'My neighbor switched to a new brand and regretted it immediately. Classic mistake.', keywords: ['switch', 'regret', 'new', 'brand', 'mistake'], emotional_residue: 'mixed', trust_modifier: 0, experience_type: 'word_of_mouth' },
    { text: 'All those fancy new options but nothing beats the original. If it ain\'t broke, don\'t fix it.', keywords: ['original', 'classic', 'new', 'options'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    // Category Trust
    { text: 'This company stood by their farmers during the drought. That says everything about their values.', keywords: ['farmers', 'values', 'ethical', 'community', 'support'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'news' },
    { text: 'When others cut corners, this brand maintained quality. That\'s the difference between a brand and a commodity.', keywords: ['quality', 'corners', 'standards', 'integrity'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'Read an article about how they treat their employees. Good company values show in the product.', keywords: ['employees', 'values', 'company', 'ethical', 'treatment'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'news' },
    // Trust Maintained
    { text: 'Prices went up but portions stayed the same. I appreciate that honesty.', keywords: ['price', 'honest', 'portions', 'transparency'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'They sent a personal response when I wrote to compliment their product. Old-fashioned customer care.', keywords: ['customer', 'response', 'personal', 'care', 'feedback'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'word_of_mouth' },
    { text: 'This brand sponsors local community events. They give back, not just take.', keywords: ['community', 'sponsor', 'local', 'giveback'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'news' },
    // Additional
    { text: 'Same factory, same workers, same care for 40 years. That kind of stability is priceless.', keywords: ['factory', 'stability', 'workers', 'care', 'years'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'news' },
    { text: 'When the store ran out, I went to three other stores rather than buy a different brand. Worth it.', keywords: ['loyalty', 'effort', 'worth', 'brand'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'They\'ve earned my trust over decades. That doesn\'t happen by accident.', keywords: ['trust', 'decades', 'earned', 'loyalty'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'New management promised no changes to the recipe. I\'m watching closely but hopeful.', keywords: ['management', 'recipe', 'change', 'trust'], emotional_residue: 'mixed', trust_modifier: 0, experience_type: 'news' },
    { text: 'Friends tease me for being brand loyal, but they don\'t understand consistency matters.', keywords: ['loyal', 'consistent', 'friends', 'tradition'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'word_of_mouth' }
  ],

  'value-hunter': [
    // Deal Wins
    { text: 'Stacked three coupons with a sale price - got $40 worth of groceries for $18. That\'s how it\'s done.', keywords: ['coupons', 'sale', 'deal', 'savings', 'stack'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'The store brand is made in the same facility as the name brand. Same quality, 40% less.', keywords: ['store brand', 'generic', 'savings', 'same', 'quality'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'Found the manager\'s special section - perfectly good food at 50% off just because it\'s near the date.', keywords: ['discount', 'clearance', 'manager', 'special', 'date'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'Price matched online plus used the store\'s app coupon. Saved 30% without even trying hard.', keywords: ['price match', 'coupon', 'app', 'savings', 'online'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'Bought the large size when it was on sale, now I\'m set for months at the lowest price per unit.', keywords: ['bulk', 'sale', 'unit price', 'stock up'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    // Price Deceptions
    { text: 'The "sale" price was actually higher than what I paid last month. They raised the regular price first.', keywords: ['sale', 'fake', 'price', 'deception', 'raise'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'That "value pack" has a worse per-unit price than buying singles. They\'re counting on people not checking.', keywords: ['value pack', 'unit price', 'bulk', 'trick', 'math'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'Member "exclusive" prices are just regular prices at other stores. The membership is a scam.', keywords: ['member', 'exclusive', 'membership', 'price', 'scam'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'Shrinkflation is the worst kind of hidden price increase. At least be honest about raising prices.', keywords: ['shrinkflation', 'hidden', 'price', 'honest'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'purchase' },
    { text: '"Buy one get one 50% off" sounds good until you realize it\'s only 25% off each.', keywords: ['bogo', 'promotion', 'math', 'discount', 'deception'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    // Smart Shopping Strategies
    { text: 'I track prices on a spreadsheet. Patterns emerge - buy pasta in October, paper goods in January.', keywords: ['track', 'prices', 'patterns', 'timing', 'spreadsheet'], emotional_residue: 'positive', trust_modifier: 1, experience_type: 'purchase' },
    { text: 'The cashback app literally pays me to buy what I was going to buy anyway. Free money.', keywords: ['cashback', 'app', 'rebate', 'savings', 'money'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'Ethnic grocery stores have the same products for half the price. Mainstream stores have a markup tax.', keywords: ['ethnic', 'grocery', 'price', 'savings', 'alternative'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'Loyalty points are fine but cash savings beat them every time. Points are just deferred discounts.', keywords: ['loyalty', 'points', 'cash', 'discount', 'value'], emotional_residue: 'mixed', trust_modifier: 0, experience_type: 'purchase' },
    { text: 'The Aldi version passed the blind taste test with flying colors. Brand name is just marketing.', keywords: ['aldi', 'store brand', 'taste', 'test', 'generic'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    // Premium Product Skepticism
    { text: 'Premium pasta is literally just pasta. The $8 box and the $1 box are made from the same wheat.', keywords: ['premium', 'pasta', 'same', 'price', 'markup'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    { text: 'Fancy packaging doesn\'t make food taste better. It just makes your wallet lighter.', keywords: ['packaging', 'fancy', 'premium', 'waste'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    { text: 'That artisan bread is made in the same commercial bakery as the store brand. Saw it on the delivery truck.', keywords: ['artisan', 'bakery', 'commercial', 'same', 'premium'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'word_of_mouth' },
    // Budget Wins
    { text: 'Fed my family of four a holiday dinner for under $50 by shopping sales and planning ahead.', keywords: ['budget', 'family', 'planning', 'meal', 'savings'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'The generic medicine has the exact same active ingredients. My pharmacist confirmed it.', keywords: ['generic', 'medicine', 'same', 'ingredients', 'savings'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'word_of_mouth' },
    // Additional
    { text: 'Compared unit prices across five stores for diapers. Found a $4 difference per pack. That adds up.', keywords: ['compare', 'unit price', 'diapers', 'baby', 'savings'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'That loyalty card tracks everything I buy. The 5% savings isn\'t worth the privacy invasion.', keywords: ['loyalty', 'privacy', 'tracking', 'data', 'card'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    { text: 'The sale cycle is every 6 weeks. Never buy at full price when you can plan ahead.', keywords: ['sale', 'cycle', 'planning', 'timing', 'full price'], emotional_residue: 'positive', trust_modifier: 1, experience_type: 'purchase' },
    { text: 'Found the same exact product at Dollar Tree that costs $4 at Target. Label says same manufacturer.', keywords: ['dollar', 'store', 'same', 'manufacturer', 'savings'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'The "premium" tier in their subscription is just paying more for the same product with nicer packaging.', keywords: ['subscription', 'premium', 'tier', 'same', 'packaging'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' }
  ],

  'wellness-seeker': [
    // Ingredient Discoveries
    { text: 'Found out my "natural" granola has more sugar than a candy bar. 23 grams per serving is not healthy.', keywords: ['sugar', 'natural', 'granola', 'healthy', 'ingredients'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'purchase' },
    { text: 'That clean label snack still has maltodextrin - basically just processed starch that spikes blood sugar.', keywords: ['clean', 'label', 'maltodextrin', 'starch', 'blood sugar'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'The ingredient scanner app revealed 12 additives in what I thought was a simple product.', keywords: ['app', 'scanner', 'additives', 'ingredients', 'simple'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: '"No artificial flavors" doesn\'t mean natural. It means lab-created compounds that mimic natural flavors.', keywords: ['artificial', 'natural', 'flavors', 'lab', 'chemicals'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'news' },
    { text: 'Finally found a brand that uses real food ingredients I can actually pronounce. Worth the extra cost.', keywords: ['real', 'ingredients', 'pronounce', 'clean', 'simple'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    // Health Claim Skepticism
    { text: '"Heart healthy" on the box means nothing legally. It\'s marketing, not a medical claim.', keywords: ['heart', 'healthy', 'claim', 'marketing', 'label'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'news' },
    { text: 'That probiotic yogurt has so much sugar it probably kills whatever beneficial bacteria it contains.', keywords: ['probiotic', 'yogurt', 'sugar', 'bacteria', 'gut'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'The "immune boosting" claim on that juice is not supported by any real science. I checked.', keywords: ['immune', 'boost', 'juice', 'claim', 'science'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'Low-fat versions have more sugar to compensate for taste. The nutrition math doesn\'t add up.', keywords: ['low-fat', 'sugar', 'compensate', 'nutrition'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    { text: '"Made with whole grains" can mean 1% whole grain. The claim is technically true but completely misleading.', keywords: ['whole grain', 'claim', 'misleading', 'percentage'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    // Positive Discoveries
    { text: 'This small brand actually publishes their third-party lab tests. Transparency I can trust.', keywords: ['lab', 'tests', 'transparency', 'third-party', 'trust'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'Found a protein bar that\'s literally just dates, nuts, and protein. No hidden ingredients.', keywords: ['protein', 'bar', 'simple', 'dates', 'nuts', 'clean'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'The nutrition facts match exactly what\'s in the ingredient list. Finally, an honest label.', keywords: ['nutrition', 'facts', 'honest', 'label', 'match'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'This brand responded to my question about sourcing with actual farm locations, not PR speak.', keywords: ['sourcing', 'farm', 'transparent', 'response', 'honest'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'word_of_mouth' },
    { text: 'Switched to organic dairy after reading about hormone usage in conventional. Sleep better now.', keywords: ['organic', 'dairy', 'hormones', 'conventional', 'health'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    // Greenwashing/Healthwashing
    { text: 'The "organic" label only applies to one minor ingredient. The rest is conventional.', keywords: ['organic', 'label', 'misleading', 'ingredient', 'conventional'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'purchase' },
    { text: 'That wellness influencer promoting "superfoods" turned out to be a paid advertisement.', keywords: ['influencer', 'superfoods', 'paid', 'sponsored', 'advertisement'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'social_media' },
    { text: '"Plant-based" on ultra-processed food doesn\'t make it healthy. Chips are plant-based.', keywords: ['plant-based', 'processed', 'healthy', 'chips', 'misleading'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    // Research and Learning
    { text: 'Spent an hour reading the research behind their claims. The studies were all on rats with megadoses.', keywords: ['research', 'studies', 'claims', 'science', 'rats'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'news' },
    { text: 'The nutrition podcast explained how serving sizes are manipulated to make products look healthier.', keywords: ['serving', 'size', 'manipulation', 'nutrition', 'podcast'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'social_media' },
    // Additional
    { text: 'My doctor pointed out that most "vitamin-enriched" foods use synthetic forms that aren\'t well absorbed.', keywords: ['vitamin', 'enriched', 'synthetic', 'absorption', 'doctor'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'word_of_mouth' },
    { text: 'Started reading research abstracts myself instead of trusting marketing claims. Eye-opening.', keywords: ['research', 'claims', 'marketing', 'trust', 'science'], emotional_residue: 'mixed', trust_modifier: 0, experience_type: 'news' },
    { text: 'Found a registered dietitian who actually analyzes products honestly. No sponsorship bias.', keywords: ['dietitian', 'honest', 'analysis', 'unbiased', 'trust'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'social_media' },
    { text: 'The "no added sugar" product uses concentrated fruit juice - which is basically sugar with marketing.', keywords: ['sugar', 'fruit juice', 'concentrate', 'added', 'marketing'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'Bought a food sensitivity test and discovered half the "healthy" foods I ate were inflammatory for me.', keywords: ['sensitivity', 'test', 'inflammatory', 'healthy', 'personal'], emotional_residue: 'mixed', trust_modifier: 0, experience_type: 'purchase' }
  ],

  'convenience-prioritizer': [
    // Time-Saving Wins
    { text: 'The meal kit delivered everything pre-measured. Made dinner in 20 minutes instead of an hour.', keywords: ['meal kit', 'delivery', 'time', 'quick', 'convenient'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'Subscribe-and-save means I never run out of essentials. One less thing to think about.', keywords: ['subscribe', 'auto-ship', 'essentials', 'convenient'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'The grocery app remembers my usual order. Two taps and it\'s delivered by tomorrow.', keywords: ['app', 'reorder', 'delivery', 'easy', 'quick'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'Switched to single-serve coffee pods. Sure, it costs more, but the convenience is worth it.', keywords: ['coffee', 'pods', 'single-serve', 'convenient', 'time'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'That salad kit eliminated 20 minutes of chopping. My weeknight dinners are actually possible now.', keywords: ['salad', 'kit', 'pre-cut', 'time', 'weeknight'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    // Convenience Failures
    { text: 'The "quick meal" took 45 minutes and dirtied 8 dishes. That\'s not my definition of quick.', keywords: ['quick', 'meal', 'time', 'dishes', 'false'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'Subscription auto-renewed before I could skip. Now I have 3 months of coffee I don\'t need.', keywords: ['subscription', 'auto-renew', 'skip', 'cancel', 'coffee'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'The product that promised "no prep required" still needed 15 minutes of active cooking.', keywords: ['no prep', 'cooking', 'time', 'promise', 'false'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    { text: 'App crashed during checkout three times. Online ordering shouldn\'t be harder than going to the store.', keywords: ['app', 'crash', 'online', 'order', 'frustration'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'Delivery window was 10am-6pm. Wasted my whole Saturday waiting for groceries.', keywords: ['delivery', 'window', 'waiting', 'time', 'wasted'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    // Product Reliability
    { text: 'Same quality every time. No surprises means no wasted mental energy deciding.', keywords: ['consistent', 'reliable', 'quality', 'same'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'When this product works, I don\'t have to think about it. That\'s exactly what I want.', keywords: ['works', 'easy', 'simple', 'reliable'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'Product sometimes works, sometimes doesn\'t. That inconsistency wastes more time than it saves.', keywords: ['inconsistent', 'sometimes', 'unreliable', 'time'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'Complicated instructions defeated the whole purpose. If I wanted a project, I\'d cook from scratch.', keywords: ['instructions', 'complicated', 'simple', 'purpose'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    { text: 'Return policy was so hassle-free I\'ll buy from them again just for the peace of mind.', keywords: ['return', 'easy', 'hassle-free', 'policy'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    // Decision Fatigue
    { text: 'Too many choices at the store. Grabbed the first thing I recognized just to get out faster.', keywords: ['choices', 'decision', 'fatigue', 'recognized', 'quick'], emotional_residue: 'mixed', trust_modifier: 0, experience_type: 'purchase' },
    { text: 'The curated box takes all the decisions out of it. Less mental load, same good results.', keywords: ['curated', 'decisions', 'easy', 'box', 'mental'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'I just want one good option, not 50 variations. Analysis paralysis is real.', keywords: ['options', 'variations', 'simple', 'choice'], emotional_residue: 'mixed', trust_modifier: -1, experience_type: 'purchase' },
    // Service Experiences
    { text: 'Customer service fixed the issue in one call. Efficient problem-solving is rare these days.', keywords: ['customer service', 'efficient', 'one call', 'fixed'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'Had to navigate a phone tree for 20 minutes to reach a human. That\'s 20 minutes I\'ll never get back.', keywords: ['phone', 'wait', 'time', 'human', 'frustrating'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    // Additional
    { text: 'The streamlined checkout saved 3 steps. Small improvements that respect my time add up.', keywords: ['checkout', 'streamlined', 'time', 'quick'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'Reordering the same thing takes 30 seconds. That kind of frictionless experience keeps me loyal.', keywords: ['reorder', 'quick', 'frictionless', 'easy'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'The weekly meal prep service eliminated Sunday afternoon cooking. Worth every penny.', keywords: ['meal prep', 'service', 'time', 'convenient', 'weekly'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'Online reviews helped me pick in 2 minutes. Good curation saves me from wasting time.', keywords: ['reviews', 'quick', 'decision', 'curation'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'social_media' },
    { text: '"Easy open" packaging required scissors and frustration. False advertising on convenience.', keywords: ['packaging', 'easy open', 'frustrating', 'scissors'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' }
  ],

  'status-signaler': [
    // Premium Experiences
    { text: 'The small-batch olive oil actually tastes different. You get what you pay for with quality.', keywords: ['small-batch', 'olive oil', 'quality', 'premium', 'taste'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'The sommelier-selected wine subscription introduces me to bottles I\'d never find myself.', keywords: ['sommelier', 'wine', 'subscription', 'exclusive', 'curated'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'Artisan cheese from that farm-to-table shop is incomparable to grocery store options.', keywords: ['artisan', 'cheese', 'farm', 'premium', 'quality'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'The imported chocolate has a complexity that domestic brands simply can\'t replicate.', keywords: ['imported', 'chocolate', 'premium', 'complex', 'quality'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'Members-only access to limited releases makes finding exceptional products easier.', keywords: ['members', 'limited', 'exclusive', 'access', 'special'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    // Quality Disappointments
    { text: 'That "premium" brand is now sold at Costco. So much for exclusivity.', keywords: ['premium', 'mass market', 'exclusive', 'costco'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'Paid triple for "craft" only to find it\'s made by a giant corporation. Authentic branding, industrial product.', keywords: ['craft', 'corporate', 'authentic', 'premium', 'fake'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'news' },
    { text: 'The luxury brand cut quality but kept prices. That\'s not maintaining standards, it\'s exploiting reputation.', keywords: ['luxury', 'quality', 'cut', 'price', 'standards'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'purchase' },
    { text: 'Expensive doesn\'t always mean better. That lesson cost me $200 at a fancy grocery store.', keywords: ['expensive', 'quality', 'lesson', 'fancy'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    { text: 'The "handcrafted" claim was on a mass-produced product. Completely misrepresented.', keywords: ['handcrafted', 'mass produced', 'misleading', 'fake'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'purchase' },
    // Social/Status Elements
    { text: 'Bringing that bottle to dinner sparked a 20-minute conversation. Quality is a social currency.', keywords: ['dinner', 'conversation', 'social', 'quality', 'impress'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'social_media' },
    { text: 'The kitchen store staff recognized the brand immediately. They know quality when they see it.', keywords: ['brand', 'recognition', 'quality', 'knowledgeable'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'My foodie friends were genuinely impressed by the selection. Curating good taste matters.', keywords: ['friends', 'impressed', 'taste', 'curating', 'foodie'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'social_media' },
    { text: 'That food blogger recommended this brand. Their taste has never steered me wrong.', keywords: ['blogger', 'recommendation', 'trust', 'taste', 'influence'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'social_media' },
    // Brand Standards
    { text: 'This heritage brand has maintained quality through three ownership changes. Rare discipline.', keywords: ['heritage', 'quality', 'ownership', 'standards'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'news' },
    { text: 'Their sourcing transparency sets the standard for the industry. I know exactly where my food comes from.', keywords: ['sourcing', 'transparency', 'standard', 'quality'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'When they raised prices, they explained the ingredient quality improvement. That\'s respectable.', keywords: ['price', 'quality', 'transparent', 'respect'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'news' },
    // Discovery
    { text: 'Found this brand before it went mainstream. The early adopter taste-makers know quality.', keywords: ['early', 'discover', 'mainstream', 'quality', 'taste'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'The chef-owned brand delivers restaurant quality at home. Professional standards accessible.', keywords: ['chef', 'restaurant', 'quality', 'professional'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    // Additional
    { text: 'Packaging design reflects the product quality inside. Details matter at every level.', keywords: ['packaging', 'design', 'quality', 'details'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'The unboxing experience was memorable. They understand that luxury starts before you taste.', keywords: ['unboxing', 'experience', 'luxury', 'memorable'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'Attended their exclusive tasting event. Met other discerning consumers with similar standards.', keywords: ['exclusive', 'tasting', 'event', 'discerning'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'This brand never goes on sale. That pricing integrity means something.', keywords: ['sale', 'price', 'integrity', 'value'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'Quality ingredients speak for themselves. No need for loud marketing when the product excels.', keywords: ['ingredients', 'quality', 'marketing', 'subtle'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' }
  ],

  'eco-worrier': [
    // Greenwashing Discoveries
    { text: '"Eco-friendly" packaging turns out to be non-recyclable in most facilities. Classic greenwashing.', keywords: ['eco-friendly', 'packaging', 'recyclable', 'greenwashing'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'purchase' },
    { text: 'That "carbon neutral" claim relies on offsets that don\'t actually reduce emissions.', keywords: ['carbon neutral', 'offsets', 'emissions', 'greenwashing'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'news' },
    { text: '"Made with recycled materials" covers their 5% recycled content. Technically true, practically meaningless.', keywords: ['recycled', 'materials', 'percentage', 'misleading'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    { text: 'The "sustainable" brand is owned by a company with one of the worst environmental records.', keywords: ['sustainable', 'parent company', 'owned', 'environmental'], emotional_residue: 'negative', trust_modifier: -5, experience_type: 'news' },
    { text: '"Biodegradable" only works in industrial composting facilities that don\'t exist in my city.', keywords: ['biodegradable', 'composting', 'facility', 'misleading'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'purchase' },
    // Genuine Sustainability
    { text: 'Finally found a brand with actual B Corp certification. Third-party verified, not just marketing.', keywords: ['b corp', 'certification', 'verified', 'sustainable'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'This company publishes their full supply chain emissions. Radical transparency is rare.', keywords: ['supply chain', 'emissions', 'transparency', 'report'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'news' },
    { text: 'They use truly recyclable packaging AND tell you exactly how to recycle it locally.', keywords: ['recyclable', 'packaging', 'local', 'instructions'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'The refill system actually reduces packaging by 80%. Measurable impact, not vague claims.', keywords: ['refill', 'packaging', 'reduce', 'measurable'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'Local brand with short supply chains beats imported "organic" in actual environmental impact.', keywords: ['local', 'supply chain', 'organic', 'impact'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    // Corporate Hypocrisy
    { text: 'Their Earth Day campaign ran alongside lobbying against environmental regulations.', keywords: ['earth day', 'campaign', 'lobbying', 'hypocrisy'], emotional_residue: 'negative', trust_modifier: -5, experience_type: 'news' },
    { text: 'The CEO flies private while the brand preaches sustainability. Actions speak louder.', keywords: ['ceo', 'private', 'sustainability', 'hypocrisy'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'news' },
    { text: 'Announced a "green initiative" that amounts to 0.1% of their environmental footprint.', keywords: ['initiative', 'green', 'footprint', 'meaningless'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'news' },
    { text: 'Their plastic reduction promise has a 2050 deadline. That\'s not urgency, that\'s delay tactics.', keywords: ['plastic', 'deadline', '2050', 'delay'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'news' },
    // Systemic Observations
    { text: 'Individual consumer choices matter less than corporate policy change. We need systemic solutions.', keywords: ['consumer', 'corporate', 'systemic', 'policy'], emotional_residue: 'mixed', trust_modifier: 0, experience_type: 'news' },
    { text: 'The recycling arrow symbol doesn\'t mean recyclable. It\'s just a resin identification code.', keywords: ['recycling', 'symbol', 'resin', 'code', 'misleading'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'news' },
    { text: 'Most "recyclable" plastic ends up in landfill anyway. The whole system is broken.', keywords: ['recyclable', 'plastic', 'landfill', 'system'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'news' },
    // Positive Action
    { text: 'The zero-waste store proved package-free shopping is possible. Vote with your wallet.', keywords: ['zero-waste', 'package-free', 'shopping', 'action'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'Joined a buying club that sources directly from regenerative farms. Direct impact.', keywords: ['buying club', 'regenerative', 'farms', 'direct'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    // Additional
    { text: 'Their "sustainability report" is 50 pages of PR with no actual metrics. Red flag.', keywords: ['sustainability', 'report', 'metrics', 'PR', 'greenwashing'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'news' },
    { text: 'Found a brand that actually takes back their packaging for reuse. Closed loop is real.', keywords: ['take back', 'packaging', 'reuse', 'closed loop'], emotional_residue: 'positive', trust_modifier: 4, experience_type: 'purchase' },
    { text: 'The environmental documentary exposed how "sustainable" certifications can be bought.', keywords: ['documentary', 'certifications', 'bought', 'corrupt'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'social_media' },
    { text: '"Plant-based plastic" still doesn\'t biodegrade and often can\'t be recycled with regular plastic.', keywords: ['plant-based', 'plastic', 'biodegrade', 'recycle'], emotional_residue: 'negative', trust_modifier: -3, experience_type: 'news' },
    { text: 'Support the small company doing things right, not the big one doing greenwashing at scale.', keywords: ['small', 'company', 'greenwashing', 'scale'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' }
  ],

  'trend-follower': [
    // Viral Product Experiences
    { text: 'That TikTok pasta recipe actually worked! Millions of views for a reason.', keywords: ['tiktok', 'viral', 'recipe', 'pasta', 'trend'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'social_media' },
    { text: 'The influencer-recommended snack was totally worth the hype. Actually delicious.', keywords: ['influencer', 'recommend', 'snack', 'hype', 'delicious'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'social_media' },
    { text: 'Got the new flavor before it sold out. My friends were so jealous.', keywords: ['new', 'flavor', 'sold out', 'exclusive', 'friends'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'Everyone on my feed was talking about this brand. Had to try it - lived up to the buzz.', keywords: ['feed', 'buzz', 'brand', 'trending', 'everyone'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'social_media' },
    { text: 'The limited edition collaboration sold out in minutes but I got one. Worth the refresh spam.', keywords: ['limited', 'collab', 'collaboration', 'sold out', 'exclusive'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    // Trend Disappointments
    { text: 'The viral product was just okay. Definitely not worth the 3-hour line.', keywords: ['viral', 'line', 'wait', 'overhyped', 'disappointing'], emotional_residue: 'negative', trust_modifier: -2, experience_type: 'purchase' },
    { text: 'Turns out that TikTok "discovery" was a paid placement. Felt manipulated.', keywords: ['tiktok', 'paid', 'sponsored', 'placement', 'manipulated'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'social_media' },
    { text: 'By the time I got the trending item, everyone had moved on. FOMO is exhausting.', keywords: ['trending', 'fomo', 'moved on', 'late', 'exhausting'], emotional_residue: 'negative', trust_modifier: -1, experience_type: 'purchase' },
    { text: 'The influencer showed a completely different product than what arrived. Filters lie.', keywords: ['influencer', 'filters', 'different', 'misleading', 'disappointing'], emotional_residue: 'negative', trust_modifier: -4, experience_type: 'social_media' },
    { text: 'That food trend from last month is already cringe. Trends cycle so fast.', keywords: ['trend', 'cringe', 'cycle', 'old', 'fast'], emotional_residue: 'mixed', trust_modifier: -1, experience_type: 'social_media' },
    // Social Experiences
    { text: 'Posted my haul and got so many likes. People really wanted the deets on where to buy.', keywords: ['post', 'haul', 'likes', 'share', 'where to buy'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'social_media' },
    { text: 'My friend recommended this before it blew up. Early adopter cred.', keywords: ['friend', 'recommend', 'early', 'blew up', 'before'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'word_of_mouth' },
    { text: 'The group chat was all about this product. Had to get it to stay in the conversation.', keywords: ['group chat', 'conversation', 'friends', 'social', 'had to'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'word_of_mouth' },
    { text: 'Hosted a taste test party with the new releases. Content gold and actually fun.', keywords: ['party', 'taste test', 'new', 'content', 'fun'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'social_media' },
    // Discovery
    { text: 'The algorithm knew I\'d love this before I did. Scary accurate but I\'m not complaining.', keywords: ['algorithm', 'discover', 'accurate', 'recommend', 'for you'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'social_media' },
    { text: 'Found my new favorite through a random comment thread. The internet delivers sometimes.', keywords: ['comment', 'discover', 'favorite', 'random', 'internet'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'social_media' },
    { text: 'That Reddit thread about underrated products was actually useful. Real people > ads.', keywords: ['reddit', 'underrated', 'real', 'people', 'useful'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'social_media' },
    // Brand Engagement
    { text: 'The brand replied to my story! Their social media team gets it.', keywords: ['reply', 'story', 'brand', 'social media', 'engagement'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'social_media' },
    { text: 'Their meme game is strong. A brand that doesn\'t take itself too seriously wins my attention.', keywords: ['meme', 'funny', 'brand', 'attention', 'personality'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'social_media' },
    // Additional
    { text: 'Waiting for the next drop notification. The anticipation is half the fun.', keywords: ['drop', 'notification', 'anticipation', 'waiting', 'new'], emotional_residue: 'positive', trust_modifier: 1, experience_type: 'social_media' },
    { text: 'That collab between two of my favorite brands was everything. When worlds collide right.', keywords: ['collab', 'brands', 'favorite', 'crossover'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'purchase' },
    { text: 'The aesthetic of their packaging is so photoworthy. Basically free content.', keywords: ['aesthetic', 'packaging', 'photo', 'instagram', 'content'], emotional_residue: 'positive', trust_modifier: 2, experience_type: 'purchase' },
    { text: 'All my favorite creators are posting about this. That many can\'t be wrong.', keywords: ['creators', 'posting', 'many', 'trust', 'social proof'], emotional_residue: 'positive', trust_modifier: 3, experience_type: 'social_media' },
    { text: 'Already saw three dupes of that viral product. The fast fashion of food is real.', keywords: ['dupe', 'viral', 'copy', 'fast', 'trend'], emotional_residue: 'mixed', trust_modifier: 0, experience_type: 'social_media' }
  ]
}

async function seed() {
  console.log('Seeding FMCG phantom memories...')

  // Get all archetypes
  const { data: archetypes, error: arcError } = await supabase
    .from('persona_archetypes')
    .select('id, slug, name')

  if (arcError) {
    console.error('Error fetching archetypes:', arcError)
    process.exit(1)
  }

  if (!archetypes || archetypes.length === 0) {
    console.error('No archetypes found. Run seed-archetypes.mjs first.')
    process.exit(1)
  }

  console.log(`Found ${archetypes.length} archetypes`)

  // Clear existing FMCG memories
  const { error: deleteError } = await supabase
    .from('phantom_memories')
    .delete()
    .eq('category', 'fmcg')

  if (deleteError) {
    console.error('Error clearing existing memories:', deleteError)
    process.exit(1)
  }

  console.log('Cleared existing FMCG memories')

  // Build memories for each archetype
  let totalMemories = 0
  const allMemories = []

  for (const archetype of archetypes) {
    const templates = memoryTemplates[archetype.slug]
    if (!templates) {
      console.log(`  No templates for ${archetype.name}, skipping`)
      continue
    }

    for (const template of templates) {
      allMemories.push({
        archetype_id: archetype.id,
        category: 'fmcg',
        memory_text: template.text,
        trigger_keywords: template.keywords,
        emotional_residue: template.emotional_residue,
        trust_modifier: template.trust_modifier,
        experience_type: template.experience_type,
        brand_mentioned: template.brand_mentioned || null
      })
    }
    totalMemories += templates.length
    console.log(`  Added ${templates.length} memories for ${archetype.name}`)
  }

  // Insert all memories
  const { data, error } = await supabase
    .from('phantom_memories')
    .insert(allMemories)
    .select('id')

  if (error) {
    console.error('Error seeding memories:', error)
    process.exit(1)
  }

  console.log(`\nSuccessfully seeded ${data.length} FMCG phantom memories`)

  // Summary stats
  const { data: stats } = await supabase
    .from('phantom_memories')
    .select('emotional_residue, trust_modifier')
    .eq('category', 'fmcg')

  if (stats) {
    const positive = stats.filter(m => m.emotional_residue === 'positive').length
    const negative = stats.filter(m => m.emotional_residue === 'negative').length
    const mixed = stats.filter(m => m.emotional_residue === 'mixed').length
    const avgTrust = stats.reduce((sum, m) => sum + m.trust_modifier, 0) / stats.length

    console.log('\nMemory Distribution:')
    console.log(`  Positive: ${positive}`)
    console.log(`  Negative: ${negative}`)
    console.log(`  Mixed: ${mixed}`)
    console.log(`  Avg trust modifier: ${avgTrust.toFixed(2)}`)
  }
}

seed()
