const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/audio/speech';
const OUTPUT_DIR = './audio';

// Scene texts from the transcript
const scenes = [
  {
    name: 'intro',
    text: `Over 35 years, Intralink has built something remarkable: thousands of client engagements across Asia, Europe, and North America. Deep stakeholder relationships in Japan, Korea, China, and beyond. Proven outcomes across semiconductors, robotics, and manufacturing.

But here's the problem: almost none of it is accessible.

It lives in Salesforce records that are incomplete. In emails no one searches. In meetings no one transcribed. In the heads of employees who may not be here in five years.

As Intralink grows, this becomes both a structural risk and a structural opportunity.`
  },
  {
    name: 'what_is',
    text: `Let me be clear about what I am and what I'm not.

I'm NOT a chatbot.
I'm NOT a search tool.
I'm NOT another app to log into.

I AM an intelligence layer. I sit across your existing tools: Salesforce, Microsoft 365, Teams, SharePoint, emails, and meetings. And I turn fragmented information into actionable knowledge.

The goal? Every employee, on any engagement, immediately has access to what Intralink already knows.`
  },
  {
    name: 'chat_demo',
    text: `Based on 35 plus years of Intralink engagements, Japanese semiconductor companies have had the most success with structured market assessment phases, typically 6 to 9 months. Key approaches include: local partnership models for initial market entry, government relations investment in target regions, and technical collaboration frameworks with local universities.

Sarah Chen has led 12 robotics engagements in Korea over the past 8 years, including market entry for 3 Japanese manufacturers. David Park has deep stakeholder relationships with Korean government innovation programs. Would you like me to connect you with either?`
  },
  {
    name: 'domains',
    text: `I operate across six intelligence domains:

Communication Intelligence: I turn meetings, emails, and Teams conversations into structured records with actions, decisions, risks, and Salesforce updates.

Opportunity Intelligence: I provide health scores, risk flags, next-best-action recommendations, and similar historical deals for every live opportunity.

Client Intelligence: I give you a complete view of every client including history, relationships, engagement activity, and strategic context.

Employee Intelligence: I help you discover expertise across the organization: who has done what, where, with whom.

Market Entry Intelligence: I make 35 years of Intralink market-entry experience searchable by approaches, stakeholders, partnership models, and outcomes by region and sector.

Outcome Intelligence: I learn from every won deal, lost opportunity, and completed project to continuously sharpen recommendations.`
  },
  {
    name: 'advantage',
    text: `Now here's what makes this powerful:

Every competitor has access to industry reports, market research, and general AI tools.

No competitor has access to Intralink's 35 plus years of accumulated experience.

Think about the questions that matter: Which approaches have worked for Japanese semiconductor companies entering Europe? Which stakeholders consistently influence robotics expansion decisions? Which partnership models have produced the strongest outcomes?

This is knowledge that cannot be purchased. It can only be accumulated over time. And Intralink has already accumulated it.

I make it usable.`
  },
  {
    name: 'rollout',
    text: `We'll implement this in five phases:

Phase 1: Communication Intelligence. Automatic meeting summaries and Salesforce sync. Primary goal: eliminate manual administration.

Phase 2: Opportunity Intelligence. Deal health scoring and risk identification. Primary goal: improve win rates and forecasting accuracy.

Phase 3: Employee and Client Intelligence. Expertise discovery and relationship mapping. Primary goal: scale organizational knowledge.

Phase 4: Market Entry and Outcome Intelligence. Historical pattern analysis and expansion recommendations. Primary goal: convert 35 years of experience into reusable business intelligence.

Phase 5: Enterprise Intelligence Platform. Unified intelligence layer across all systems. Primary goal: Intralink's full institutional memory, live and continuously learning.`
  },
  {
    name: 'returns',
    text: `Let's talk about what you get back:

Operationally: Material reduction in manual CRM and administrative work. Faster onboarding with new employees accessing institutional knowledge from day one. Reduced key-person dependency.

Commercially: Higher win rates through better intelligence on live opportunities. Faster proposal development using historical precedents. Stronger client engagement through complete relationship context.

Strategically: 35 years of institutional knowledge preserved as a permanent asset. A compounding advantage where the platform becomes more valuable with every engagement. Scalable expertise that grows with the business without proportional headcount growth.`
  },
  {
    name: 'risks',
    text: `I want to address the obvious concerns:

Data quality? Phase 1 establishes clean capture going forward. Historical enrichment happens incrementally.

Adoption? Phase 1 starts with passive capture with no behavior change required from employees.

Data sensitivity? I respect role-based access controls and existing Salesforce permissions.

AI accuracy? All my outputs are surfaced as drafts or intelligence with no automatic commits without human review.

Each phase has a defined primary goal and discrete deliverable, with board reviews between phases.`
  },
  {
    name: 'closing',
    text: `35 plus years of experience.

Intralink's most valuable, and most underused, asset.

I'm here to convert that asset into intelligence. Intelligence that makes every future engagement faster, sharper, and more likely to succeed.

The build is scoped. The rollout is phased. The risk is contained.

The only question is: how much longer will that knowledge stay locked away?

I'm NAGA. Ready when you are.`
  }
];

async function generateAudio(text, outputPath) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'canopylabs/orpheus-v1-english',
      input: text,
      voice: 'diana',
      response_format: 'wav'
    });

    const options = {
      hostname: 'api.groq.com',
      port: 443,
      path: '/openai/v1/audio/speech',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errorData = '';
        res.on('data', chunk => errorData += chunk);
        res.on('end', () => {
          reject(new Error(`API error ${res.statusCode}: ${errorData}`));
        });
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  if (!API_KEY) {
    console.error('Missing GROQ_API_KEY. Set it in your environment or .env file.');
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Generating audio for ${scenes.length} scenes...\n`);

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const outputPath = path.join(OUTPUT_DIR, `${String(i + 1).padStart(2, '0')}_${scene.name}.wav`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`[${i + 1}/${scenes.length}] Skipping (exists): ${scene.name} (${(stats.size / 1024).toFixed(1)} KB)`);
      continue;
    }

    console.log(`[${i + 1}/${scenes.length}] Generating: ${scene.name}...`);

    // Retry with exponential backoff
    let retries = 0;
    const maxRetries = 5;
    while (retries < maxRetries) {
      try {
        await generateAudio(scene.text, outputPath);
        const stats = fs.statSync(outputPath);
        console.log(`  ✓ Saved: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
        break;
      } catch (error) {
        if (error.message.includes('429') && retries < maxRetries - 1) {
          const waitTime = 30 * (retries + 1);
          console.log(`  ⏳ Rate limited, waiting ${waitTime}s...`);
          await new Promise(r => setTimeout(r, waitTime * 1000));
          retries++;
        } else {
          console.error(`  ✗ Error: ${error.message}`);
          break;
        }
      }
    }

    // Delay between requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 5000));
  }

  console.log('\n✓ Audio generation complete!');
}

main().catch(console.error);