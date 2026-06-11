export interface ExternalLink {
  label: string;
  url: string;
}

export interface Article {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  image?: string;
  body?: string[];
  externalLinks?: ExternalLink[];
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export const articles: Article[] = [
  {
    slug: "oparo-finalists-property-innovation-awards-2025",
    date: "October 23, 2025",
    title: "Oparo Finalists at Property Innovation Awards 2025 in 6 Categories",
    excerpt:
      "Oparo and Toby Wilde recognised across multiple categories at the Property Week Innovation Awards 2025, marking a milestone moment in our mission to redefine how technology, data, and purpose-driven investment shape the future of real estate.",
    image: "/news/property-week-innovation.jpg",
  },
  {
    slug: "lifeproven-podcast-toby-wilde-scaling-supported-housing",
    date: "October 15, 2025",
    title: "LifeProven Podcast: Toby Wilde on Scaling Supported Housing",
    excerpt:
      "In the latest LifeProven Podcast, Toby Wilde joins host Adam Hinds to discuss how data-led investment is transforming supported housing in the UK. LifeProven is a premium B2B podcast platform connecting thought leaders and innovators with institutional clients and investors.",
    image: "/news/lifeproven-podcast.jpg",
    body: [
      "In the latest LifeProven Podcast, Toby Wilde joins host Adam Hinds to discuss how data-led investment is transforming supported housing in the UK. LifeProven is a premium B2B podcast platform connecting thought leaders and innovators with institutional clients and investors, including BlackRock, Global Mutual, UrbanSplash, Amazon, and Oxford Properties. Their audience relies on actionable insights into strategy, technology, and impact.",
      "Oparo Social, a dedicated brand within Oparo Group, applies algorithm-led investment to identify undervalued or overlooked real estate assets. Partnering with housing associations and local authorities, the company converts these properties into stable, well-managed homes for people facing homelessness, domestic abuse, addiction recovery, or neurodiversity.",
      "This episode covers scalable, repeatable delivery of over 135 supported homes, psychologically informed design to enhance resident wellbeing, balancing profit, purpose, and public-sector value, and insights from Toby's journey in PropTech and social investment.",
      "For LifeProven, this episode demonstrates how private capital, technology, and operational discipline can generate measurable social impact at scale — insights valued by their top-tier clients.",
    ],
    externalLinks: [
      {
        label: "Listen to the full episode",
        url: "https://www.lifeproven.co.uk/podcast/social-impact-investor-of-the-year-how-oparo-social-delivers-supported-housing-at-scale",
      },
    ],
  },
  {
    slug: "wilde-to-speak-at-uk-construction-week-conference",
    date: "May 1, 2025",
    title: "Wilde to Speak at UK Construction Week Conference",
    excerpt:
      'Join Toby Wilde, Founder of Oparo Ltd, at UK Construction Week 2025 for a panel on "Driving Efficiency & Affordability: The Role of Technology in Constructing Homes." The session will explore how technology, digital tools, and innovative construction methods are transforming the delivery of high-quality, cost-effective homes.',
    image: "/news/ukcw.jpg",
    body: [
      "08 May 2025 | 11:30 – 12:15 | Digital Construction Hub, London",
      "The construction industry is under pressure to deliver more homes, faster and more affordably, without compromising on quality or sustainability. Rising costs, regulatory complexity, and growing demand are forcing a step-change in how we think about building — and technology is at the centre of that shift.",
      'This session, "Driving Efficiency & Affordability: The Role of Technology in Constructing Homes," takes place as part of UK Construction Week, the UK\'s largest construction and built environment event. UK Construction Week brings together thousands of professionals — from developers and contractors to architects, engineers, and technology providers — offering a hub for innovation, networking, and learning across the entire sector.',
      "Toby Wilde, Founder of Oparo Ltd, will join a panel chaired by Gary McClusksey, Global Design Managing Director at Greystar, alongside Nick Towe (LoCaL Homes), Rachel Witcherley (Homes England), and James Summerland (Intratone). Together, they'll discuss how data, digital tools, and new construction techniques are driving both efficiency and affordability across the residential sector.",
      "At Oparo, technology is more than a support function — it's the foundation of how we build, manage, and sustain housing. Our REACT and RAM platforms demonstrate how digital innovation can reduce cost, improve delivery, and enhance long-term social and environmental value.",
      "Join us at the Digital Construction Hub in London during UK Construction Week to explore how collaboration between tech innovators, investors, and housing experts is shaping the next era of homebuilding.",
    ],
  },
  {
    slug: "finalist-hat-trick-for-oparo-at-the-2025-property-week-resi-awards",
    date: "April 15, 2025",
    title: "Finalist Hat-Trick for Oparo at the 2025 Property Week RESI Awards",
    excerpt:
      "Oparo has achieved a finalist hat-trick at the 2025 Property Week RESI Awards, earning nominations for Specialist Developer of the Year, Outstanding Achievement in Affordable Housing, and Residential PropTech Innovation of the Year. Through its REACT and RAM platforms, Oparo blends PropTech innovation with social purpose.",
    image: "/news/resi-awards.webp",
    body: [
      "Oparo has achieved a triple finalist position at this year's Property Week RESI Awards 2025 — one of the UK's most respected platforms for celebrating innovation, leadership, and excellence across the residential sector.",
      "This year, Oparo Social is recognised in three categories that collectively define our impact-driven mission: Specialist Developer of the Year, Outstanding Achievement in Affordable Housing (Under 150 Developments), and Residential PropTech Innovation of the Year (Property Platform).",
      "These nominations reflect Oparo's continued evolution as a business that bridges data intelligence, social purpose, and real-world delivery in housing.",
      "The Specialist Developer of the Year nomination recognises developers that deliver unique value — not just in product, but in purpose. Oparo's work with Registered Providers and local authorities has consistently prioritised affordability, sustainability, and community integration. Every project is underpinned by psychologically informed design and delivered within Local Housing Allowance (LHA) constraints, proving that innovation and social responsibility are not mutually exclusive.",
      "The second nomination, Outstanding Achievement in Affordable Housing (Under 150 Developments), highlights the measurable progress of Oparo Social in addressing the housing crisis at a structural level. By pairing data-driven site acquisition with efficient conversion models, Oparo delivers homes that are affordable, functional, and sustainable.",
      "Our partnerships with Registered Providers have resulted in hundreds of units delivered or in pipeline, and our lease-based supported housing conversions continue to provide long-term solutions for vulnerable residents across the UK.",
      "This nomination reinforces what the market has already begun to recognise — that scalable impact begins with operational integrity and a genuine commitment to outcomes, not optics.",
      "The third recognition — Residential PropTech Innovation of the Year (Property Platform) — acknowledges Oparo's commitment to technological transformation through its proprietary platforms Oparo REACT (Real Estate and Computer Technology) and Oparo RAM (Remote Asset Management).",
      "These systems process over 500 million data points with over 90% accuracy, enabling real-time decision-making, predictive maintenance, and performance optimisation across assets. It's not technology for its own sake — it's technology that makes social housing viable, measurable, and scalable.",
      "While others focus on retrofitting technology into existing processes, Oparo has built its operations around data from inception. This integrated foundation is why Oparo remains ahead of both the technology curve and the impact agenda.",
      "Being shortlisted alongside major names — from Far East Consortium and Greencore Homes to Savills Investment Management and Westminster City Council — is more than an honour. It's validation that impact-driven housing has a legitimate seat at the table of innovation and investment.",
      "The triple nomination at the RESI Awards 2025 cements Oparo's reputation as one of the UK's most forward-thinking developers and a genuine force for good in the social housing and PropTech space.",
      "For Oparo, awards are milestones, not endpoints. They validate a vision that's been consistent since day one: housing should serve people and investors equally — sustainably, intelligently, and transparently.",
      "As Oparo Social continues to expand its partnerships with local authorities and Registered Providers, this recognition serves as both motivation and mandate. The housing sector doesn't just need new buildings — it needs new thinking. And that's what Oparo delivers.",
    ],
  },
  {
    slug: "housing-affordability-and-the-role-of-technology-housing-innovation-show",
    date: "February 15, 2025",
    title: "Housing Affordability and the Role of Technology — Housing Innovation Show",
    excerpt:
      "Technology, Policy and Planning: Why the Housing Crisis Won't Be Solved by Innovation Alone. Joined Gary McLuskey (Greystar), Nick Towe (LoCaL Homes), and Rachel Witcherley (Homes England) to discuss how technology is reshaping Housing Affordability and Social Housing.",
    image: "/news/housing-innovation.png",
    body: [
      "Technology, Policy and Planning: Why the Housing Crisis Won't Be Solved by Innovation Alone",
      "I joined Gary McLuskey (Greystar), Nick Towe (LoCaL Homes), and Rachel Witcherley (Homes England) to discuss how technology is reshaping Housing Affordability and Social Housing.",
      "The conversation was framed around innovation, efficiency and affordability — but I argued that technology, while essential, can't solve the systemic barriers holding back delivery on its own.",
      "We have structural and bureaucratic problems that innovation alone cannot code our way out of.",
      "My proposal is pragmatic: Establish a National Development Agency, led by an independent body such as Homes England, to coordinate development across the UK. Through a centralised tendering platform, SME developers could bid on projects based not purely on land value but on social housing delivery, tenure mix, and timescale.",
      "Combine that with a national reversionary freehold framework, giving local authorities long-term stakes in developments, and we could finally align incentives between the public and private sectors.",
      "The UK doesn't lack ambition or technology — it lacks coherence. Let's build that first.",
    ],
  },
  {
    slug: "oparo-wins-uk-finance-awards-social-impact-investor-of-the-year-2024",
    date: "February 10, 2025",
    title: "Oparo Wins UK Finance Awards Social Impact Investor of the Year 2024",
    excerpt:
      "Oparo has been named Social Impact Investor of the Year 2024 at the UK Financial Awards by SME News. This recognition marks more than a milestone — it reflects a belief we've held from the start that technology and empathy can coexist to create sustainable housing solutions.",
    image: "/news/uk-finance-awards.jpg",
  },
  {
    slug: "celebrating-esg-edge-2024-recognition-that-matters",
    date: "December 15, 2024",
    title: "Celebrating ESG Edge 2024: Recognition That Matters",
    excerpt:
      "Oparo Social was proud to be shortlisted for ESG Investor of the Year and Outstanding Achievement in ESG at the ESG Edge Awards 2024. Standing alongside some of the UK's leading real estate investors, the recognition highlights Oparo's commitment to combining technology, data, and purpose.",
    image: "/news/esg-awards.jpg",
    body: [
      "Last night's ESG Edge Awards 2024 brought together some of the most forward-thinking organisations in UK real estate — and we were proud to be part of it.",
      "Oparo was shortlisted for both ESG Investor of the Year and Outstanding Achievement in ESG, alongside an impressive group of peers including AXA IM Alts, Bridges Fund Management, Civitas Investment Management, Harrison Street, and Octopus Real Estate.",
      "We didn't take home the trophy this year, but being recognised among such respected names is a huge achievement in itself. Oparo started with a simple belief: that technology, data, and purpose could come together to change how investment in housing works. That belief has taken us from a small team with big ideas to standing shoulder-to-shoulder with some of the industry's most established players.",
      "Our REACT and RAM platforms continue to prove that ESG isn't just a report or a policy — it's a way of operating. They help partners and investors make smarter decisions, manage homes more efficiently, and measure the social outcomes that matter most. Real impact comes from doing, not just talking about it.",
      "The evening wasn't really about competition, it was about community.",
      "It was inspiring to see so many people working towards a more responsible, sustainable and human version of real estate. That's exactly the movement Oparo was built to be part of.",
      "We're incredibly proud of our team, our investors and our partners who've helped get us here. Recognition at this level reinforces our mission: proving that impact-led investment isn't a side project — it's the future of housing.",
      "Congratulations to all the winners and nominees. If the atmosphere in that room is anything to go by, the future of ESG in real estate looks brighter than ever — and we plan to keep pushing it forward.",
    ],
  },
  {
    slug: "uk-housing-awards-nomination",
    date: "September 24, 2024",
    title: "UK Housing Awards — Nomination",
    excerpt:
      "Oparo Social and its partner Xp Property has been shortlisted for the Best Supported Housing Landlord award at the UK Housing Awards 2024. This recognition reinforces our commitment to delivering high-quality, sustainable housing solutions that empower communities.",
    image: "/news/uk-housing-awards.jpg",
    body: [
      "We are proud to announce that Oparo Social - Oparo Group and its partner Xp Property has been shortlisted for the Best Supported Housing Landlord award at the UK Housing Awards 2024.",
      "This recognition reinforces our commitment to delivering high-quality, sustainable housing solutions that empower communities and transform lives. At Oparo Social, we believe that strong partnerships and innovative approaches are essential to meeting the needs of the most vulnerable in society.",
      "We look forward to the awards ceremony on 26th November 2024 in Manchester and remain dedicated to driving meaningful social impact through responsible financial stewardship.",
    ],
  },
  {
    slug: "oparo-recognised-in-housing-technology-magazines-best-proptechs-of-20242025",
    date: "September 9, 2024",
    title: "Oparo Recognised in Housing Technology Magazine's Best PropTechs of 2024/2025",
    excerpt:
      "Oparo, the first algorithm-driven real estate investment company, is proud to announce its inclusion in Housing Technology magazine's esteemed annual round-up of the best PropTech companies and IT start-ups for 2024/2025.",
    image: "/news/housing-tech-magazine.jpg",
    body: [
      "Oparo, the first algorithm-driven real estate investment company, is proud to announce its inclusion in Housing Technology magazine's esteemed annual round-up of the best PropTech companies and IT start-ups for 2024/2025. This recognition underscores Oparo's innovative contributions to the social housing sector.",
      "Housing Technology's fifth annual report highlights nearly 50 emerging software providers focused on revolutionizing social housing. Unlike the wider PropTech industry, which spans commercial property, residential sales, student accommodation, and private lettings, this report exclusively features companies that address the unique needs of social housing providers.",
      "Oparo has distinguished itself with its technology-driven model that delivers social housing at or below the challenging levels set by housing benefits. Collaborating exclusively with housing providers and local authorities, Oparo has successfully completed numerous projects. The company's approach is rooted in achieving scale and cost efficiency through high-quality, psychologically-informed design units.",
      "Oparo's technology identifies land and opportunities to deliver assets in line with the Local Housing Allowance. Additionally, Oparo's remote asset management platform enhances resident wellness, community building, maintenance reporting, and project management. Integrating IoT devices, the platform monitors condensation, damp, mould, illegal substances, and anti-social behaviour, providing a comprehensive solution for investment partners.",
      "Oparo is dedicated to transforming the social housing sector through innovative, technology-driven solutions. By delivering high-quality, affordable housing and enhancing the living experience for residents, Oparo is setting new standards in real estate investment and management.",
    ],
  },
  {
    slug: "navigating-the-complex-world-of-supported-housing-the-rodcast",
    date: "September 9, 2024",
    title: "Navigating the Complex World of Supported Housing: The RODCAST",
    excerpt:
      "In the intricate realm of supported housing, where social responsibility intersects with real estate management, challenges abound. A candid conversation delving into the moral, financial, and operational struggles inherent in the sector.",
    image: "/news/rodcast.jpg",
    body: [
      "In the intricate realm of supported housing, where social responsibility intersects with real estate management, challenges abound. A recent podcast sheds light on these complexities through a candid conversation with an industry expert, Toby, who delves into the moral, financial, and operational struggles inherent in this field. This discussion is invaluable for anyone interested in supported housing, real estate management, or the broader issues of social impact and ethical investment.",
      "Supported housing provides accommodation and additional support to individuals with specific needs, including those recovering from substance abuse, mental health issues, or homelessness. It aims to offer a stable environment conducive to recovery and integration into society. However, managing such housing comes with unique challenges that can strain even the most seasoned professionals.",
      "One of the most pressing issues discussed is the challenge of dealing with problematic tenants. In supported housing, the presence of a single tenant with active substance abuse issues can adversely affect the entire community. This is particularly troubling when these individuals are not suited for the specific type of supported housing they are in. Toby highlights the moral dilemma of wanting to remove such tenants to ensure the well-being of others while grappling with the ethical implications of potentially leaving them without a home.",
      "The podcast also explores the financial strains associated with supported housing. Toby shares his personal experiences with market fluctuations that have severely impacted his ability to refinance properties and maintain operational stability. The discussion reveals a broader issue: many investors and financial institutions lack a deep understanding of the complexities of supported housing, leading to misconceptions and potentially misguided investments.",
      "Expanding supported housing beyond high-value areas is another hurdle. Toby explains that due to financial constraints and the necessity for substantial capital investment, it is often not feasible to establish supported housing projects in lower-value regions. This limits the ability to address the growing need for supported housing in less affluent areas.",
      "This podcast provides an honest and detailed look into the operational and moral challenges faced by those managing supported housing. It offers a behind-the-scenes perspective on the complexities involved, shedding light on the less visible aspects of the sector.",
      "Toby's narrative goes beyond financial metrics and operational procedures to touch on the ethical dimensions of supported housing. The podcast delves into the tough decisions faced by asset owners and managers, highlighting the delicate balance between financial sustainability and the responsibility to provide safe, supportive environments for vulnerable individuals.",
      "One of the most compelling aspects of the podcast is the emphasis on the human element of supported housing. Toby's reflections on the impact of his work on individuals' lives and the kindness he received from mentors and investors underscore the deeply personal nature of this work. It's a reminder of the importance of compassion and ethical considerations in managing supported housing.",
      "Whether you are a real estate investor, a social worker, or simply someone interested in understanding how supported housing operates, this podcast offers valuable perspectives and practical advice. It is a testament to the importance of balancing financial and moral responsibilities while striving to make a positive impact on the lives of those in need.",
    ],
  },
  {
    slug: "disrupting-the-real-estate-space-how-oparo-social-is-part-of-a-winning-ecosystem",
    date: "September 9, 2024",
    title: "Disrupting the Real Estate Space: How Oparo Social is Part of a Winning Ecosystem",
    excerpt:
      "The UK property market is a dynamic and often challenging space, but companies like XP Property are showing the industry how innovation and expertise can lead to exceptional growth.",
    image: "/news/disrupting-real-estate.jpg",
    body: [
      "The UK property market is a dynamic and often challenging space, but companies like XP Property are showing the industry how innovation and expertise can lead to exceptional growth. Recently featured in an article on how they're disrupting the UK real estate scene, my business partners, Ben Richards and Jack Jiggens, have built a thriving ecosystem of businesses, and I'm proud that Oparo Social is a key component of this success.",
      "Oparo Social is more than just a social housing provider; we're part of a larger vision shared with XP Property. With over £20 million in assets, our portfolio focuses on creating sustainable housing solutions that benefit both the community and our investors. Our partnership with XP Property is essential, as it allows us to integrate our social housing initiatives into a broader real estate strategy that is both profitable and socially responsible.",
      "XP Property, led by Ben and Jack, has an impressive track record, having completed over £80 million in real estate transactions across London and the Home Counties. Their experience, combined with our shared commitment to community welfare, has enabled us to build a business model that delivers on both financial and social metrics.",
      "The article highlights how Ben and Jack are not only disrupting the UK property market with their core business but are also managing complementary ventures like AURA Architecture & Interiors, XP Surveys, and Central Suites. These businesses, like Oparo Social, benefit from the vertical integration within XP Property's ecosystem.",
      "A prime example of our collective impact is the Abingdon project, where XP Property transformed a block of 14 flats, generating a return of over 200% on the original equity. This project is emblematic of our shared approach to property development — one that combines strategic planning with meticulous execution.",
      "As we look to the future, Oparo Social remains committed to growing our portfolio and expanding our impact on the social housing sector. With the backing of XP Property's formidable team and the counsel of experienced non-executive directors and board advisors, we are well-positioned to continue this journey.",
    ],
  },
  {
    slug: "how-oparo-social-is-revolutionizing-social-housing-with-industry-titans",
    date: "September 9, 2024",
    title: "How Oparo Social is Revolutionizing Social Housing with Industry Titans",
    excerpt:
      "Recently featured in The Independent, business partners Ben Richards and Jack Jiggens have been making waves in the UK property market with their firm, XP Property. At Oparo Social, we are proud to be part of this ecosystem.",
    image: "/news/independent-feature.jpg",
    body: [
      "Recently featured in The Independent, my business partners, Ben Richards and Jack Jiggens, have been making waves in the UK property market with their firm, XP Property. Their success story is one of resilience, innovation, and strategic growth. At Oparo Social, we are proud to be part of this journey, particularly in the realm of social housing — a sector that is close to my heart.",
      "At Oparo Social, our mission is to provide sustainable, high-quality social housing solutions. With Oparo's portfolio exceeding £50 million, we've aligned our values with those of XP Property, focusing on community welfare, stability, and long-term investment. Our properties gain stable income through the Universal Credit system, ensuring that our efforts contribute to the well-being of our tenants while providing a reliable return for our investors.",
      "Working alongside Ben and Jack, we've created a vertically integrated business model that strengthens our market position and enhances the quality of our projects. Their experience in managing high-yield, award-winning developments complements our goal of creating housing solutions that are not only profitable but also socially responsible.",
      "Our collaboration has enabled us to push the boundaries of what's possible in the social housing sector. By leveraging XP Property's extensive network and resources, we've been able to scale our operations and enhance the services we provide to our tenants.",
      "As we continue to grow, our focus remains on delivering value — both to our investors and to the communities we serve. With XP Property's ongoing success and our shared commitment to innovation, the future looks bright for both our ventures.",
      "The recent feature in The Independent highlights the incredible work being done by Ben and Jack at XP Property. At Oparo Social, we're proud to be part of this ecosystem and look forward to continuing our mission of providing sustainable social housing solutions.",
    ],
  },
  {
    slug: "oparo-social-featured-in-blue-bricks-magazine",
    date: "August 28, 2024",
    title: "Oparo Social Featured in Blue Bricks Magazine",
    excerpt:
      "Oparo Social featured in Blue Bricks Magazine, highlighting our approach to data-driven social housing investment.",
    image: "/news/blue-bricks.jpg",
  },
  {
    slug: "oparo-social-win-social-housing-investor-of-the-year",
    date: "June 30, 2024",
    title: "Oparo Social Win Social Housing Investor of the Year!",
    excerpt:
      'Oparo Social named "Social Housing Investor of the Year" at the prestigious HMO Awards. This esteemed accolade celebrates Oparo Social\'s exemplary contributions to the social housing sector.',
    image: "/news/hmo-awards.png",
    body: [
      'Oparo Social is delighted to announce its recent recognition as the "Social Housing Investor of the Year" at the prestigious HMO Awards, awarded in June. This esteemed accolade celebrates Oparo Social\'s exemplary commitment to advancing social housing solutions and its significant impact on resident wellbeing and community development.',
      "The HMO Awards' decision to honor Oparo Social underscores the company's innovative approach and resilience in the real estate sector. Through advanced technology and strategic partnerships with regulated providers and local authorities, Oparo Social has consistently delivered high-quality, sustainable housing solutions tailored to the needs of communities across the UK.",
      '"We are deeply honored to receive the \'Social Housing Investor of the Year\' award from the HMO Awards," said Toby Wilde, Founder at Oparo Social. "At Oparo, we recognise that anyone, at any time, may require the support and care of their community, free from judgement, we are committed to providing housing that not only meets but exceeds what is available on the private market. This award reaffirms our dedication to creating supportive environments where residents can thrive."',
      "Oparo Social extends sincere gratitude to the HMO Awards for this esteemed honour and reaffirms its commitment to excellence in social housing investment. The company looks forward to continuing its mission of pioneering innovation and delivering positive outcomes for residents and stakeholders alike.",
    ],
  },
  {
    slug: "partners-in-property-london-birthday",
    date: "May 9, 2024",
    title: "Partners in Property London Birthday",
    excerpt:
      "A very special May event as PIP London turns 5. The team over at The Dickins Inn, St Catherine's Dock put together their very special 5th birthday event with an amazing line-up.",
    image: "/news/pip-birthday.jpg",
  },
  {
    slug: "oparo-social-nominated-for-best-social-housing-investor",
    date: "March 31, 2024",
    title: "Oparo Social Nominated for Best Social Housing Investor",
    excerpt:
      "Oparo Social nominated as finalists for the 'Progressive Social Housing Investor' at The HMO Awards 23/24.",
    image: "/news/hmo-awards.png",
  },
  {
    slug: "the-big-social-housing-debate",
    date: "March 30, 2024",
    title: "The Big Social Housing Debate",
    excerpt:
      "Partners in Property brings The Big Social Housing Debate — some of the most experienced people in the Social Housing sector, in one place, at one time, to answer all your questions.",
    image: "/news/social-housing-debate.jpg",
    body: [
      "Partners in Property brings you a FREE PIP TASTER!",
      "THE BIG SOCIAL HOUSING DEBATE — 15th April 2024, 7:00pm - 9:00pm",
      "Some of the most experienced people in the Social Housing sector, in one place, at one time, to answer all your questions.",
      "This won't be recorded or repeated. If you have any interest in social housing whatsoever, then this is for you!",
    ],
  },
  {
    slug: "using-institutional-finance-in-supported-living",
    date: "November 14, 2022",
    title: "Using Institutional Finance in Supported Living",
    excerpt:
      "In this episode of The Supported Living Property Podcast, Toby Wilde explains how he is working with institutional lenders to develop supported and social housing, sharing practical advice for property investors.",
    image: "/news/supported-living-podcast.jpg",
  },
  {
    slug: "oparo-social-nominated-for-impact-investor-award",
    date: "August 28, 2022",
    title: "Oparo Social Nominated for Impact Investor Award",
    excerpt:
      "Oparo Social nominated for the Best Progressive Social Housing Investor at the HMO awards 2022. Fantastic recognition for the entire Oparo Social team.",
    image: "/news/oparo-social-nominated.jpg",
  },
  {
    slug: "top-101-london-real-estate-investment-startups-companies",
    date: "August 21, 2022",
    title: "Top 101 London Real Estate Investment Startups & Companies",
    excerpt:
      "Estate Innovators list of Top Real Estate Investment Companies in London featuring PropTech investment company the Oparo Group.",
    image: "/news/top-101.jpg",
  },
  {
    slug: "social-impact-panel-pip-live-2022",
    date: "July 30, 2022",
    title: "Social Impact Panel PIP Live 2022",
    excerpt:
      "Proud to have taken part in the Partners in Property Live Conference 2022 in Solihull. Covered the Social and Supported Housing space, dealing with local authorities and housing associations, and growing a portfolio sustainably.",
    image: "/news/pip-live-2022.jpg",
  },
  {
    slug: "competitive-dealmaking-in-uk-property-will-mallard-interviews-toby-wilde-and-jay",
    date: "April 1, 2022",
    title: "Competitive Dealmaking in UK Property — Will Mallard Interviews Toby Wilde and Jay Howard",
    excerpt:
      "How do you get deals put together when there is competition? Panel conversation with active operators each with decades of property deal experiences.",
    image: "/news/competitive-dealmaking.jpg",
  },
  {
    slug: "will-mallard-my-property-world-conversations-podcast",
    date: "January 23, 2022",
    title: "Will Mallard — My Property World Conversations Podcast",
    excerpt:
      "How does a property investment house and a property tech business get started? What's really the difference between West London and rest of the country?",
    image: "/news/will-mallard-podcast.jpg",
  },
  {
    slug: "toby-wilde-joins-the-board-of-family-owned-business",
    date: "December 14, 2021",
    title: "Toby Wilde Joins The Board of Family Owned Business",
    excerpt:
      "Toby Wilde joins the Board of Family Construction, Property Development and Investment business.",
    image: "/news/family-board.jpg",
  },
  {
    slug: "oparo-group-q2-round-up",
    date: "November 2, 2021",
    title: "Oparo Group Q2 Round Up",
    excerpt:
      "2 New Transactions. 119 Units In Legals or Under Construction. £120m to Deploy in The Right Deals. £300m of Assets Flagged by Our Algorithm.",
    image: "/news/oparo-q2.jpg",
  },
  {
    slug: "property-data-panel-the-property-investor-show-2021",
    date: "October 30, 2021",
    title: "Property Data Panel, The Property Investor Show 2021",
    excerpt:
      "The video from the 2021 PropTech and Property Data panel at The Property Investor Show at the Excel featuring PropTech founder Toby Wilde.",
    image: "/news/property-investor-show.png",
  },
  {
    slug: "prepare-for-heated-debates-at-this-years-property-investor-show",
    date: "September 12, 2021",
    title: "Prepare for Heated Debates at This Year's Property Investor Show",
    excerpt: "PropTech Founders Panel Debate at The Property Investor Show.",
    image: "/news/heated-debates.jpg",
  },
  {
    slug: "trading-suspended-with-reverse-takeover-by-sprift-in-works",
    date: "May 22, 2021",
    title: "Trading Suspended with Reverse Takeover by Sprift in Works",
    excerpt:
      "The London Stock Exchange has suspended trading in Immedia Group plc from AIM with the announcement of an agreement for the reverse takeover of Immedia by Sprift Technologies Limited.",
    image: "/news/sprift-takeover.jpg",
  },
  {
    slug: "property-people-podcast-with-saam-lowni",
    date: "May 14, 2021",
    title: "Property People Podcast with Saam Lowni",
    excerpt:
      "Meet Toby Wilde, Founder of PropTech firm Oparo, believed to be the first REACT Investment house in the UK. Toby comes from a third-generation family business focused on property development and construction.",
    image: "/news/property-people-podcast.jpg",
  },
  {
    slug: "oparo-group-q1-roundup",
    date: "April 30, 2021",
    title: "Oparo Group Q1 Roundup",
    excerpt:
      "5 Transactions Completed Totalling 33 Units. 8 Assets in Legals Totalling 39 units. 2 Refurbishments Completed. In-House Algorithm & Appraisal system progress.",
    image: "/news/oparo-q1.jpg",
  },
  {
    slug: "property-sisters-2021-property-predictions-interview-with-toby-wilde",
    date: "January 27, 2021",
    title: "Property Sisters 2021 Property Predictions Interview with Toby Wilde",
    excerpt:
      "PropTech has become a real buzzword in the property investment and development industry. Toby Wilde has a vision for the future which is unique in the industry.",
    image: "/news/property-sisters.jpg",
  },
  {
    slug: "oparo-progress-q4-2020",
    date: "January 1, 2021",
    title: "Oparo Progress: Q4 2020",
    excerpt:
      "14 Units Acquired. 94 Unit Pipeline in Legals. 2 Construction Projects Started. Capital Under Advisory Increased to £122m. 1 Loan Completed.",
    image: "/news/oparo-q4-2020.jpg",
  },
  {
    slug: "global-family-office-summit-2020-toby-wilde-as-panelist",
    date: "December 1, 2020",
    title: "Global Family Office Summit 2020 — Toby Wilde as Panelist",
    excerpt:
      "Panel topic: next-generation Family Office leaders — are NextGens simply custodians of legacy and capital, or entrepreneurs to modernise and grow wealth?",
    image: "/news/family-office-summit.jpg",
  },
  {
    slug: "building-a-new-world-how-proptech-can-help-post-covid",
    date: "August 31, 2020",
    title: "Building A New World: How PropTech Can Help Post Covid",
    excerpt:
      "Bridging & Commercial Magazine August/September Edition. Invited to contribute to the article Building For A New World.",
    image: "/news/building-new-world.jpg",
  },
  {
    slug: "proptech-myths-the-return-podcast-with-anna-harper",
    date: "August 14, 2020",
    title: "PropTech Myths — The Return Podcast with Anna Harper",
    excerpt:
      "Discussed the common myths around how and whether PropTechs can solve housing market problems. A controversial episode with ADHD in full flow.",
    image: "/news/return-podcast.jpg",
  },
  {
    slug: "focus-on-why-podcast-evolution-of-data-with-toby-wilde",
    date: "June 29, 2020",
    title: "Focus On Why Podcast — Evolution of Data with Toby Wilde",
    excerpt:
      "Toby Wilde shares why he works at the intersection of real estate and technology, and the vision behind OPARO, a REACT firm which is algorithm-based, people-driven and has real estate investment at its heart.",
    image: "/news/focus-on-why.jpg",
  },
  {
    slug: "react-private-equity-firm-raises-73m",
    date: "June 28, 2020",
    title: "REACT Private Equity Firm Raises £73m",
    excerpt:
      "Oparo, a real estate and computer technology (REACT) private equity firm, has announced its inaugural raise. Oparo's proprietary technology flags financially stressed and distressed assets using big data and machine learning.",
    image: "/news/oparo-raises-73m.png",
  },
  {
    slug: "proptech-firm-oparo-raises-73m-property-industry-eye",
    date: "June 28, 2020",
    title: "PropTech Firm Oparo Raises £73m — Property Industry Eye",
    excerpt:
      "Property and computer tech investor Oparo has raised £73m in its inaugural fund raising.",
    image: "/news/oparo-pie.jpg",
    externalLinks: [
      {
        label: "Read the article on Property Week",
        url: "https://www.propertyweek.com/finance/proptech-firm-oparo-raises-73m/5108245.article",
      },
    ],
  },
  {
    slug: "proptech-firm-oparo-raises-73m-the-times",
    date: "June 27, 2020",
    title: "PropTech Firm Oparo Raises £73m — The Times",
    excerpt:
      "Real estate & computer technology investment company announces its inaugural raise.",
    image: "/news/oparo-times.jpg",
  },
  {
    slug: "proptech-2020-the-dawn-of-react-funds",
    date: "March 10, 2020",
    title: "PropTech 2020: The Dawn of REACT Funds",
    excerpt:
      "By Toby Wilde and Alexander Shepherd of OPARO. As we enter a new decade the smoke signals for U.K. Real Estate look positive, as the industry maintains a transition towards professionalisation and institutionalisation.",
    image: "/news/dawn-of-react.jpg",
    body: [
      "By Toby Wilde and Alexander Shepherd of OPARO.",
      "As we enter a new decade the smoke signals for U.K. Real Estate look positive, as the industry maintains a transition towards professionalisation and institutionalisation (due largely to government intervention); and what of PropTech 4.0, how will it influence the sector and 'REACT' to these changes over the next decade?",
      "The overwhelming Conservative Party majority in December's General Election sent a positive shockwave throughout the U.K., and sentiment towards real estate changed literally overnight. RightMove in December predicted a 2.0% price increase in the U.K. residential market and higher transaction volumes in 2020, and what transpired was a 1.7% price increase in December 2019 alone, according to the Halifax.",
      "The same market forecasters who predict a revival in the residential market, see the polar opposite for the more traditional institutional real estate asset classes (excluding industrial), specifically retail and offices. Technological advancements have caused a downturn in fortunes for U.K. retail and office investors, in addition to the well publicised decline of the high street, causing insolvencies.",
      'When M&G suspended activity on their Property Portfolio Fund, Mervyn Howard, the Executive Chairman of Apache Capital (£2.6bn AUM over 6,000 residential units) lead the conversation stating that residential: "assets are labelled as alternative when all of them are about putting a roof over someone\'s head — as fundamental a real estate sector as you can imagine". Institutional investment in housing has traditionally been reserved, due to the decentralised nature of the assets, cost of management, maintenance and the human capital requirements.',
      "PropTech has now come of age, management tools like CRM software Konnexsion, outsourced viewing services like ViewBer and the availability of data, which mitigates many of these barriers. The future of Real Estate and PropTech over the next decade will be what we have defined as REACT (real estate and computer technology) Funds, which use algorithms (data and technology) to improve appraisals, significantly reducing uncertainty and systemising management.",
      "Companies like Oparo (in the U.K.), Skyline (in the U.S.) and IMMO Capital (in Germany) have all been discreetly working on building the necessary tools for years now, and actively raising capital for direct real estate investment to target blended returns of rental yield and capital appreciation, via value enhancement acquisitions. As more and more of these algorithm driven deals evidence the improved efficiency and effectiveness of this new computerised method of identifying value add real estate assets, the larger private and more institutional investors will take note.",
      "The negative impact on real estate investment roles will be significant, as Investors and Developers realise the speed, accuracy and cost effectiveness of technological capital, overwhelmingly surpasses that of human capital, as happened in many sectors of the banking and finance world.",
      "However, from another perspective, imagine being a large scale developer or fund manager who in addition to having to generate a ROI (return on investment), no longer feel the burden to deploy capital in order to meet a hefty payroll each month. We believe this could result in improved bidding standards and capital deployment across the sector.",
      "REACT Funds will revolutionise Real Estate investment through speed of appraisal and informed decision making in the same way Hedge Funds disrupted securities trading, ushering in a new era of PropTech that no longer relies on subscription services. Potentially the biggest real estate disruptor in the 2020s.",
    ],
    externalLinks: [
      {
        label: "CityAM: Why the future is in residential",
        url: "https://www.cityam.com/funds-need-to-get-smart-why-the-future-is-in-residential-not-retail-assets/",
      },
      {
        label: "The Independent: House prices rise after election",
        url: "https://www.independent.co.uk/property/house-and-home/property/house-prices-rise-buy-sell-election-results-rightmove-a9247776.html",
      },
      {
        label: "The Guardian: UK house prices rise in December",
        url: "https://www.theguardian.com/money/2020/jan/08/uk-house-prices-rise-december-pushing-annual-rise-to-4-per-cent",
      },
    ],
  },
  {
    slug: "featured-in-the-oxford-university-proptech-report",
    date: "March 10, 2020",
    title: "Featured in the Oxford University PropTech Report",
    excerpt:
      "Fantastic research paper by Professor Andrew Baum of Oxford University on the future of PropTech, a follow up to his paper PropTech 3.0.",
    image: "/news/oxford-report.png",
  },
  {
    slug: "the-return-podcast-anna-harper-interview",
    date: "December 27, 2019",
    title: "The Return Podcast — Anna Harper Interview",
    excerpt:
      "Discussed how property investors can use data and algorithms to drive better decisions, identify more profitable opportunities, safeguard against risk and drive efficiency.",
    image: "/news/return-podcast.jpg",
  },
  {
    slug: "where-next-for-proptech",
    date: "August 12, 2019",
    title: "Where Next for PropTech?",
    excerpt:
      'It is broadly recognised that PropTech is in its third phase. "PropTech" is evidently going through a renaissance and is becoming a highly desirable investment opportunity for both Venture Capitalists and Angels.',
    image: "/news/where-next-proptech.jpg",
  },
  {
    slug: "venture-property-podcast-interview",
    date: "June 23, 2019",
    title: "Venture Property Podcast Interview",
    excerpt: "Toby Wilde interview on the Venture Property Podcast.",
    image: "/news/venture-property.jpg",
  },
  {
    slug: "what-are-housing-policies-of-tory-leadership-candidates",
    date: "June 23, 2019",
    title: "What Are Housing Policies of Tory Leadership Candidates?",
    excerpt: "Analysis of housing policies from the Tory leadership candidates.",
    image: "/news/tory-housing.jpg",
  },
  {
    slug: "how-technology-is-changing-homebuying",
    date: "June 23, 2019",
    title: "How Technology is Changing Homebuying",
    excerpt: "Exploring the impact of technology on the homebuying process.",
    image: "/news/tech-homebuying.jpg",
  },
  {
    slug: "agent-provocateur-has-the-time-come-to-rethink-home-information-packs",
    date: "June 22, 2019",
    title: "Agent Provocateur: Has the Time Come to Rethink Home Information Packs?",
    excerpt:
      "Examining whether the time has come to reconsider Home Information Packs and their role in the property market.",
    image: "/news/home-info-packs.jpg",
  },
  {
    slug: "proptech-today-can-agents-improve-fall-through-rates-with-innovation",
    date: "June 22, 2019",
    title: "PropTech Today: Can Agents Improve Fall-Through Rates with Innovation?",
    excerpt:
      "Exploring how estate agents can leverage PropTech innovation to reduce fall-through rates.",
    image: "/news/fall-through-rates.jpg",
  },
  {
    slug: "proptech-today-14-industry-leaders-give-their-2018-predictions",
    date: "June 22, 2019",
    title: "PropTech Today: 14 Industry Leaders Give Their 2018 Predictions",
    excerpt:
      "Industry leaders share their predictions for the PropTech sector.",
    image: "/news/2018-predictions.jpg",
  },
  {
    slug: "will-gdpr-contribute-to-more-agents-dying-out",
    date: "August 20, 2018",
    title: "Will GDPR Contribute to More Agents Dying Out?",
    excerpt:
      "We live in exciting times; our world is more dynamic and inventive than it has been in well over 100 years. Technology has the potential to allow the industry to thrive, but turbulent times accompany exciting ones.",
    image: "/news/gdpr-agents.jpg",
    body: [
      "We live in exciting times; our world is more dynamic and inventive than it has been in well over 100 years. But, as is always the case, exciting times are also turbulent times, you can't have one without the other.",
      "Technology has the potential to allow property to truly fly, shedding the historical weight of inefficiency to reach heights it never previously could. However, this opportunity has bought with it great threat, and with 2018 already set to be a tough year for residential agents, one new governmental reaction to evolving technology could act to make things even harder. Could GDPR cause even more agents to shut their doors than are already expected?",
      "The EU General Data Protection Regulation (GDPR) comes into effect on 25th May, 2018. Failure to comply by that date, and on every following day, could result in enormous fines.",
      "This is the most significant data protection act in over 20 years, and the punishment for non-compliance reflects that; fines can reach up to 20 million Euros or 4% of group worldwide turnover, whichever is greater.",
      "These penalties will, of course, be scaled to match the company in breach. So if a small indie firm is fined, it won't be for 20 million euros. It will, however, be a significant amount. With many agents struggling in the current housing climate, such a penalty could very realistically result in bankruptcy.",
      "In order to avoid GDPR fines, you have to understand what GDPR is, and to do that, you have to have an understanding of how businesses use modern technology. This is a knowledge base that many agents are notoriously shaky on.",
      "GDPR is wide reaching and all encompassing. It covers every single aspect of personal data that a business collects. And while most agents will be aware of the big ones, like addresses and banking details, many may not realise that the regulations also extend to IP addresses if you offer free Wifi in your offices, and they also include the data you have on your own employees.",
      "What's more, GDPR demands you have the ability to store data securely and be able to report any hacks or breaches within 72 hours of them occurring.",
      "For those agents who have yet to succumb to the lure of technology in their day to day businesses, the ability to ensure all of this is nigh on impossible. The size and scale of the required data audit is intimidating to say the least.",
      "In such a situation, agents are left with a choice; either they hire an external consultant or company to come in and complete their data audit for them, identifying the flaws and explaining the solutions, or they make the leap into the world of technology by moving their everyday processes onto a platform which guarantees GDPR compliance in an instant.",
      'Laura McLoughney, Data Protection Consultant & Director of Riverlight Developments: "First of all, it is no-one\'s intention to go out hunting for fines; the Information Commissioner\'s Office (ICO), just want to ensure compliance, not discover non-compliance. It\'s a subtle but important difference."',
      '"I think the biggest thing for agents here is awareness. I say educate yourself about your business; understand how information flows, who handles it and how it gets passed along the chain."',
      '"However, I think agents should also see GDPR as an opportunity. Once compliance has been ensured, agents should then be shouting from the rooftops to let everyone know. It\'s a great chance for firms to demonstrate to the world that they are raising the standard."',
      "Technology has set in motion the second industrial revolution; like it or not, it's undeniable. Everything we do in the world of business is moving over to the digital. While many agents have so far managed to thrive without it, it's simply a matter of time before doing so becomes impossible.",
      "Here at Sprift, we are firm believers in co-creation. We want to work with agents to help build the best possible platform for them. These are exciting but turbulent times; the arrival of GDPR marks an important milestone in our appreciation for what technology is going to do to our society.",
    ],
  },
];
