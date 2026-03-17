from django.core.management.base import BaseCommand
from content.models import (
    LiveStat, TrustSignal, Feature, ThreatReportSummary, 
    Testimonial, LearningModuleHighlight, ThreatIntelligence,
    PricingPlan, PricingFeature
)

class Command(BaseCommand):
    help = 'Seed the database with comprehensive content data'

    def handle(self, *args, **options):
        # 1. Live Stats
        LiveStat.objects.update_or_create(title='threatsDetected', defaults={'value': '2.4M+'})
        LiveStat.objects.update_or_create(title='usersProtected', defaults={'value': '150K+'})
        LiveStat.objects.update_or_create(title='scansCompleted', defaults={'value': '5.8M+'})

        # 2. Trust Signals
        signals = [
            {
                'type': 'certification',
                'name': 'SOC 2 Type II',
                'description': 'Security compliance certification',
                'logo': "https://img.rocket.new/generatedImages/rocket_gen_img_138fe6762-1764670064095.png",
                'alt': 'SOC 2 Type II certification badge with blue shield and checkmark'
            },
            {
                'type': 'certification',
                'name': 'ISO 27001',
                'description': 'Information security management',
                'logo': "https://img.rocket.new/generatedImages/rocket_gen_img_137a829d6-1764660532600.png",
                'alt': 'ISO 27001 certification emblem with gold and blue colors'
            },
            {
                'type': 'award',
                'name': 'Best Security Tool 2026',
                'description': 'Industry recognition award',
                'logo': "https://img.rocket.new/generatedImages/rocket_gen_img_1b554ed8a-1769535996150.png",
                'alt': 'Golden trophy award for best security tool of the year'
            },
            {
                'type': 'partnership',
                'name': 'Microsoft Partner',
                'description': 'Technology partnership',
                'logo': "https://img.rocket.new/generatedImages/rocket_gen_img_145384e6b-1764682770253.png",
                'alt': 'Microsoft partner logo with four colored squares'
            },
            {
                'type': 'partnership',
                'name': 'AWS Security',
                'description': 'Cloud security partner',
                'logo': "https://img.rocket.new/generatedImages/rocket_gen_img_1ca52ab93-1766744418904.png",
                'alt': 'AWS cloud security partnership badge with orange and white'
            },
            {
                'type': 'certification',
                'name': 'GDPR Compliant',
                'description': 'Data protection compliance',
                'logo': "https://img.rocket.new/generatedImages/rocket_gen_img_1111627e2-1764670065265.png",
                'alt': 'GDPR compliance badge with EU stars and shield icon'
            }
        ]
        for s in signals:
            TrustSignal.objects.update_or_create(name=s['name'], defaults=s)

        # 3. Features
        features = [
            {
                'icon': 'MagnifyingGlassIcon',
                'title': 'Real-Time Scanning',
                'description': 'Instant AI-powered analysis of emails, URLs, and attachments with detailed threat reports and actionable insights.',
                'link': '/scan-detect-hub',
                'color': 'primary',
                'order': 1
            },
            {
                'icon': 'CircleStackIcon',
                'title': 'Threat Database',
                'description': 'Access comprehensive repository of known phishing threats with community contributions and expert analysis.',
                'link': '/threat-intelligence-database',
                'color': 'secondary',
                'order': 2
            },
            {
                'icon': 'AcademicCapIcon',
                'title': 'Interactive Learning',
                'description': 'Gamified courses, simulated scenarios, and skill assessments to transform you into a cybersecurity advocate.',
                'link': '/interactive-learning-lab',
                'color': 'accent',
                'order': 3
            },
            {
                'icon': 'ChartBarIcon',
                'title': 'Personal Dashboard',
                'description': 'Track your security score, scan history, learning progress, and receive personalized protection recommendations.',
                'link': '/personal-dashboard',
                'color': 'success',
                'order': 4
            }
        ]
        for f in features:
            Feature.objects.update_or_create(title=f['title'], defaults=f)

        # 4. Threat Summaries (Homepage)
        summaries = [
            {
                'title': 'AI-Generated Phishing Emails',
                'category': 'Email Phishing',
                'severity': 'critical',
                'date': 'Jan 25, 2026',
                'description': 'Sophisticated phishing campaigns using AI to create highly personalized emails that bypass traditional filters and target executives.',
                'affected_users': '12,500+',
                'threat_link': 'THR-2026-HP1',
            },
            {
                'title': 'QR Code Payment Scams',
                'category': 'Mobile Threats',
                'severity': 'high',
                'date': 'Jan 23, 2026',
                'description': 'Fraudulent QR codes in public spaces redirecting users to fake payment portals that steal banking credentials and personal information.',
                'affected_users': '8,300+',
                'threat_link': 'THR-2026-HP2',
            },
            {
                'title': 'Deepfake Voice Phishing',
                'category': 'Social Engineering',
                'severity': 'critical',
                'date': 'Jan 20, 2026',
                'description': 'Voice cloning technology used to impersonate executives and request urgent wire transfers from finance departments.',
                'affected_users': '3,200+',
                'threat_link': 'THR-2026-HP3',
            }
        ]
        for s in summaries:
            ThreatReportSummary.objects.update_or_create(title=s['title'], defaults=s)

        # 5. Testimonials
        testimonials = [
            {
                'name': 'Sarah Mitchell',
                'role': 'IT Security Manager',
                'company': 'TechCorp Solutions',
                'image': "https://img.rocket.new/generatedImages/rocket_gen_img_1bdbe6c11-1763300715032.png",
                'alt': 'Professional woman with short brown hair wearing navy blazer smiling at camera',
                'quote': 'PhishGuard has transformed our security awareness training. Our employees now confidently identify threats, and we\'ve seen a 94% reduction in successful phishing attempts.',
                'rating': 5
            },
            {
                'name': 'Michael Chen',
                'role': 'Small Business Owner',
                'company': 'Chen Digital Marketing',
                'image': "https://img.rocket.new/generatedImages/rocket_gen_img_183fc715d-1763301362797.png",
                'alt': 'Asian man in gray suit with glasses looking confident in modern office',
                'quote': 'As a small business, we couldn\'t afford expensive security solutions. PhishGuard gave us enterprise-level protection at a fraction of the cost. Absolutely worth it!',
                'rating': 5
            },
            {
                'name': 'Dr. Emily Rodriguez',
                'role': 'University Professor',
                'company': 'State University',
                'image': "https://img.rocket.new/generatedImages/rocket_gen_img_1f225624a-1763293838525.png",
                'alt': 'Hispanic woman with long dark hair in professional attire smiling warmly',
                'quote': 'The interactive learning modules are perfect for teaching cybersecurity to students. The gamified approach keeps them engaged while building real-world skills.',
                'rating': 5
            }
        ]
        for t in testimonials:
            Testimonial.objects.update_or_create(name=t['name'], defaults=t)

        # 6. Module Highlights
        highlights = [
            {
                'title': 'Phishing Fundamentals',
                'description': 'Master the basics of identifying phishing attempts through email headers, suspicious links, and common red flags in communication.',
                'duration': '45 min',
                'level': 'beginner',
                'image': "https://img.rocket.new/generatedImages/rocket_gen_img_19dcf269d-1766507308737.png",
                'alt': 'Group of diverse professionals collaborating around laptop discussing cybersecurity concepts',
                'completions': '28,400',
                'rating': 4.8,
                'link': '/interactive-learning-lab?module=phishing-fundamentals'
            },
            {
                'title': 'Advanced Threat Detection',
                'description': 'Deep dive into sophisticated attack vectors including spear phishing, whaling, and business email compromise techniques.',
                'duration': '90 min',
                'level': 'intermediate',
                'image': "https://images.unsplash.com/photo-1609995113309-a62bd908a674",
                'alt': 'Computer screen displaying security code and threat analysis dashboard with blue lighting',
                'completions': '15,200',
                'rating': 4.9,
                'link': '/interactive-learning-lab?module=advanced-threat-detection'
            },
            {
                'title': 'Security Response Protocols',
                'description': 'Learn enterprise-grade incident response procedures, threat containment strategies, and post-breach recovery best practices.',
                'duration': '120 min',
                'level': 'advanced',
                'image': "https://img.rocket.new/generatedImages/rocket_gen_img_1082962de-1767061961306.png",
                'alt': 'Digital security interface with shield icons and network protection visualization',
                'completions': '9,800',
                'rating': 4.7,
                'link': '/interactive-learning-lab?module=security-response-protocols'
            }
        ]
        for h in highlights:
            LearningModuleHighlight.objects.update_or_create(title=h['title'], defaults=h)

        # 7. Threat Intelligence
        threats = [
            {
                'threat_id': 'THR-2026-001',
                'title': 'PayPal Account Verification Scam',
                'type': 'Email Phishing',
                'severity': 'critical',
                'detected_date': '01/25/2026',
                'affected_users': 15420,
                'description': 'Sophisticated phishing campaign impersonating PayPal requesting immediate account verification through fake login portal.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1771686c8-1768346925383.png',
                'alt': 'Computer screen displaying fake PayPal login page with red warning indicators',
                'origin': 'Russia',
                'status': 'active',
                'community_reports': 342,
                'detailed_analysis': 'This advanced phishing campaign uses legitimate-looking PayPal branding and creates urgency by claiming account suspension.',
                'prevention_tips': ['Always verify sender email addresses', 'Never click links in unsolicited emails', 'Enable two-factor authentication'],
                'real_world_examples': ['User received email claiming account locked', 'Business owner lost $12,000'],
                'related_threats': ['THR-2026-015'],
                'community_insights': [{'user': 'SecurityPro_Mike', 'date': '01/26/2026', 'insight': 'I received this exact email yesterday.'}]
            },
            {
                'threat_id': 'THR-2026-002',
                'title': 'IRS Tax Refund SMS Scam',
                'type': 'SMS Phishing',
                'severity': 'high',
                'detected_date': '01/24/2026',
                'affected_users': 8930,
                'description': 'Text message campaign claiming IRS tax refund approval with malicious link to fake government portal.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1d54694d4-1767918858629.png',
                'alt': 'Smartphone displaying fake IRS text message with suspicious refund claim',
                'origin': 'Nigeria',
                'status': 'active',
                'community_reports': 187,
                'detailed_analysis': 'Attackers exploit tax season anxiety by sending SMS messages claiming approved refunds.',
                'prevention_tips': ['IRS never initiates contact via text', 'Verify tax info directly on IRS.gov'],
                'real_world_examples': ['Victim clicked SMS link and entered SSN'],
                'related_threats': ['THR-2026-008'],
                'community_insights': [{'user': 'TaxExpert_John', 'date': '01/24/2026', 'insight': 'IRS NEVER contacts taxpayers via text.'}]
            },
            {
                'threat_id': 'THR-2026-003',
                'title': 'Microsoft 365 Login Credential Harvest',
                'type': 'Credential Phishing',
                'severity': 'critical',
                'detected_date': '02/10/2026',
                'affected_users': 21500,
                'description': 'Highly convincing Microsoft 365 login page replica deployed to steal enterprise credentials via compromised subdomains.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1771686c8-1768346925383.png',
                'alt': 'Fake Microsoft login page on computer screen',
                'origin': 'China',
                'status': 'active',
                'community_reports': 521,
                'detailed_analysis': 'Attackers register typosquatted domains to host convincing Microsoft 365 login replicas targeting enterprise users.',
                'prevention_tips': ['Use hardware security keys', 'Enable conditional access policies', 'Train employees on domain verification'],
                'real_world_examples': ['Enterprise lost access to 400+ accounts in one incident'],
                'related_threats': ['THR-2026-001'],
                'community_insights': [{'user': 'CloudSecAdmin', 'date': '02/11/2026', 'insight': 'Saw this target our org last week.'}]
            },
            {
                'threat_id': 'THR-2026-004',
                'title': 'QR Code Phishing in Physical Mail',
                'type': 'QR Phishing',
                'severity': 'high',
                'detected_date': '02/18/2026',
                'affected_users': 3870,
                'description': 'QR codes printed on physical letters and flyers redirect victims to malicious payment pages impersonating utility companies.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1d54694d4-1767918858629.png',
                'alt': 'Fake utility bill with suspicious QR code',
                'origin': 'Eastern Europe',
                'status': 'active',
                'community_reports': 89,
                'detailed_analysis': 'Physical mail phishing bypasses digital email filters by using printed QR codes that route to malicious sites.',
                'prevention_tips': ['Scan QR codes only from trusted sources', 'Use a QR scanner app that shows the destination URL first'],
                'real_world_examples': ['Victim scanned QR on fake water bill and entered bank details'],
                'related_threats': ['THR-2025-045'],
                'community_insights': [{'user': 'PostalAware', 'date': '02/19/2026', 'insight': 'Received one of these in my neighborhood!'}]
            },
            {
                'threat_id': 'THR-2026-005',
                'title': 'Amazon Package Delivery Smishing',
                'type': 'SMS Phishing',
                'severity': 'medium',
                'detected_date': '03/01/2026',
                'affected_users': 11200,
                'description': 'Fake Amazon package notifications sent via SMS to harvest credit card and address information.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1771686c8-1768346925383.png',
                'alt': 'Smartphone with fake Amazon delivery SMS alert',
                'origin': 'Vietnam',
                'status': 'active',
                'community_reports': 298,
                'detailed_analysis': 'Smishing campaign exploits Amazon brand trust to steal payment info under the guise of failed delivery fees.',
                'prevention_tips': ['Track packages only via the official Amazon app', 'Never pay delivery fees via SMS link'],
                'real_world_examples': ['User paid $3.99 re-delivery fee and had card cloned'],
                'related_threats': ['THR-2026-002'],
                'community_insights': [{'user': 'ShopSafe_Anna', 'date': '03/02/2026', 'insight': 'Got 3 of these in the past week.'}]
            },
            {
                'threat_id': 'THR-2025-041',
                'title': 'LinkedIn Job Offer Malware Campaign',
                'type': 'Spear Phishing',
                'severity': 'high',
                'detected_date': '10/12/2025',
                'affected_users': 6700,
                'description': 'Fake job recruiters on LinkedIn send malware-laced PDF attachments disguised as job descriptions.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1d54694d4-1767918858629.png',
                'alt': 'Fake LinkedIn recruiter profile with suspicious job attachment',
                'origin': 'North Korea',
                'status': 'mitigated',
                'community_reports': 143,
                'detailed_analysis': 'State-sponsored actors use fake recruiter profiles to target engineers and researchers with weaponized PDFs.',
                'prevention_tips': ['Verify recruiter profiles carefully', 'Never open job attachments from unknown senders'],
                'real_world_examples': ['Engineer at tech firm installed backdoor via fake job offer'],
                'related_threats': ['THR-2025-038'],
                'community_insights': [{'user': 'JobSeeker_Sam', 'date': '10/13/2025', 'insight': 'This impersonated a real company I interviewed with.'}]
            },
            {
                'threat_id': 'THR-2025-042',
                'title': 'Google Docs Comment Phishing',
                'type': 'Phishing Link',
                'severity': 'medium',
                'detected_date': '10/28/2025',
                'affected_users': 4200,
                'description': 'Attackers add malicious comments in Google Docs that trigger email notifications with phishing links to victims.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1771686c8-1768346925383.png',
                'alt': 'Google Docs interface with suspicious comment and link',
                'origin': 'Unknown',
                'status': 'mitigated',
                'community_reports': 76,
                'detailed_analysis': 'Google Docs comment notifications bypass spam filters since they come from google.com email addresses.',
                'prevention_tips': ['Be cautious with Google Docs share links from unknown users', 'Enable Google account security prompts'],
                'real_world_examples': ['Marketing team clicked phishing link thinking it was a document review request'],
                'related_threats': [],
                'community_insights': []
            },
            {
                'threat_id': 'THR-2025-043',
                'title': 'DocuSign Invoice Fraud Wave',
                'type': 'Business Email Compromise',
                'severity': 'critical',
                'detected_date': '11/05/2025',
                'affected_users': 9400,
                'description': 'Mass campaign using cloned DocuSign notification emails to redirect business invoice payments to attacker-controlled accounts.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1d54694d4-1767918858629.png',
                'alt': 'Fake DocuSign invoice notification email on laptop screen',
                'origin': 'Iran',
                'status': 'mitigated',
                'community_reports': 267,
                'detailed_analysis': 'Attackers clone DocuSign notification emails and alter bank account details in contracts to redirect wire transfers.',
                'prevention_tips': ['Verify bank account changes via phone call to known contact', 'Use DocuSign envelope ID verification'],
                'real_world_examples': ['SMB transferred $47,000 to fraudulent account via fake DocuSign'],
                'related_threats': ['THR-2025-041'],
                'community_insights': [{'user': 'FinanceDir_B', 'date': '11/06/2025', 'insight': 'We almost fell for this last quarter.'}]
            },
            {
                'threat_id': 'THR-2025-044',
                'title': 'Fake Antivirus Subscription Renewal',
                'type': 'Email Phishing',
                'severity': 'medium',
                'detected_date': '11/19/2025',
                'affected_users': 7800,
                'description': 'Emails impersonating Norton, McAfee, and Kaspersky claim subscription auto-renewals to trick victims into calling fake support lines.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1771686c8-1768346925383.png',
                'alt': 'Fake antivirus renewal email with urgent red banner',
                'origin': 'India',
                'status': 'mitigated',
                'community_reports': 411,
                'detailed_analysis': 'Vishing-enabled phishing: phone operators talk victims into granting remote access and revealing bank information.',
                'prevention_tips': ['Check your actual antivirus account online', 'Never call phone numbers in suspicious emails'],
                'real_world_examples': ['Retiree lost $2,300 after calling fake Norton support line'],
                'related_threats': [],
                'community_insights': []
            },
            {
                'threat_id': 'THR-2025-045',
                'title': 'Crypto Wallet Seed Phrase Scam',
                'type': 'Credential Phishing',
                'severity': 'critical',
                'detected_date': '12/03/2025',
                'affected_users': 5100,
                'description': 'Social media ads and fake wallet support pages prompt users to enter their 12/24-word seed phrase for "wallet recovery."',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1d54694d4-1767918858629.png',
                'alt': 'Fake cryptocurrency wallet recovery page requesting seed phrase',
                'origin': 'Unknown',
                'status': 'active',
                'community_reports': 634,
                'detailed_analysis': 'Seed phrase capture immediately and irrevocably drains all cryptocurrency from victim wallets.',
                'prevention_tips': ['NEVER share your seed phrase with anyone or any website', 'Legitimate wallets never ask for your seed phrase online'],
                'real_world_examples': ['Victim lost $84,000 in ETH after entering seed phrase on fake MetaMask site'],
                'related_threats': ['THR-2026-001'],
                'community_insights': [{'user': 'CryptoGuard', 'date': '12/04/2025', 'insight': 'Seed phrases are like master passwords — guard them with your life.'}]
            },
            {
                'threat_id': 'THR-2025-046',
                'title': 'Holiday Gift Card Scam Surge',
                'type': 'Social Engineering',
                'severity': 'medium',
                'detected_date': '12/15/2025',
                'affected_users': 13000,
                'description': 'Spike of executive impersonation attacks requesting urgent gift card purchases during holiday season.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1771686c8-1768346925383.png',
                'alt': 'Email impersonating CEO asking for gift card purchase urgently',
                'origin': 'West Africa',
                'status': 'mitigated',
                'community_reports': 188,
                'detailed_analysis': 'Attackers impersonate senior executives via look-alike email addresses to pressure employees into buying gift cards.',
                'prevention_tips': ['Establish gift card purchase verification protocols', 'Confirm unusual requests via direct phone call'],
                'real_world_examples': ['Employee bought $1,500 in Amazon gift cards thinking CEO requested them'],
                'related_threats': ['THR-2025-043'],
                'community_insights': []
            },
            # ── Homepage featured threats ───────────────────────────────────
            {
                'threat_id': 'THR-2026-HP1',
                'title': 'AI-Generated Phishing Emails',
                'type': 'Email Phishing',
                'severity': 'critical',
                'detected_date': '01/25/2026',
                'affected_users': 12500,
                'description': 'Sophisticated phishing campaigns using AI to create highly personalized emails that bypass traditional filters and target executives.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1d54694d4-1767918858629.png',
                'alt': 'AI-generated phishing email targeting corporate executive on laptop screen',
                'origin': 'Multiple',
                'status': 'active',
                'community_reports': 894,
                'detailed_analysis': 'Large language models are being weaponised by threat actors to craft hyper-personalised spear-phishing emails at scale. Unlike traditional template-based attacks, AI-generated emails reference the target\'s recent activity, use authentic writing style, and pass grammar/tone checks that legacy filters rely on. Campaigns have been observed targeting C-suite executives with fabricated Board meeting follow-up emails, investment summaries, and legal document requests.',
                'prevention_tips': [
                    'Enable AI-assisted email threat detection (e.g. Microsoft Defender for Office 365, Abnormal Security)',
                    'Enforce multi-person approval for wire transfers and sensitive data requests',
                    'Run simulated AI-phishing exercises to train employees to spot contextually perfect but unexpected emails',
                    'Apply strict DMARC / DKIM / SPF policies on your domain to reduce spoofing',
                    'Never action urgent financial requests received only by email — always verify by phone'
                ],
                'real_world_examples': [
                    'A Fortune 500 CFO received an AI-crafted email referencing a real internal project; the $2.1M transfer was only stopped by a callback verification policy',
                    'Law firm\'s managing partner received a personalised email summarising an actual case — the attachment contained a zero-day PDF exploit',
                    'Startup CEO\'s email style was cloned from public interviews; employees couldn\'t distinguish the phishing email from real ones'
                ],
                'related_threats': ['THR-2026-001', 'THR-2025-043'],
                'community_insights': [
                    {'user': 'AISecResearcher', 'date': '01/26/2026', 'insight': 'We tested GPT-4 crafted spear-phish against our security team — 68% clicked. Traditional awareness training is not enough anymore.'},
                    {'user': 'CISOJamal', 'date': '01/27/2026', 'insight': 'Deployed Abnormal Security last month. Already blocked 14 AI-phishing attempts targeting our executive team.'}
                ]
            },
            {
                'threat_id': 'THR-2026-HP2',
                'title': 'QR Code Payment Scams',
                'type': 'QR Phishing',
                'severity': 'high',
                'detected_date': '01/23/2026',
                'affected_users': 8300,
                'description': 'Fraudulent QR codes in public spaces redirecting users to fake payment portals that steal banking credentials and personal information.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1771686c8-1768346925383.png',
                'alt': 'Fraudulent QR code sticker placed over legitimate parking payment terminal',
                'origin': 'Multiple',
                'status': 'active',
                'community_reports': 512,
                'detailed_analysis': 'Attackers physically place malicious QR code stickers over legitimate payment QR codes at parking meters, restaurants, and public transport. The fake codes redirect to convincing payment portals that capture card details and OTPs. Victims realise fraud only when their legitimate payment fails or they spot an unknown charge.',
                'prevention_tips': [
                    'Check that QR code stickers haven\'t been placed over originals — look for misalignment or bubbling',
                    'Use your bank\'s official app rather than scanning to pay parking or transit fees',
                    'If a QR code payment page asks for a full card number + CVV, stop — legitimate terminals use tokenised payment',
                    'Enable transaction alerts on all cards so you spot fraud instantly'
                ],
                'real_world_examples': [
                    'City parking meters in Austin TX were hit by a QR scam wave costing motorists $42,000 in fraudulent charges',
                    'Restaurant table QR menus in London were replaced — diners\' card details stolen at checkout'
                ],
                'related_threats': ['THR-2026-004', 'THR-2026-002'],
                'community_insights': [
                    {'user': 'ParkingScamAlert', 'date': '01/24/2026', 'insight': 'Found a fake sticker on a parking meter outside our office. The underlying QR was completely hidden.'},
                    {'user': 'MobileSec_Dev', 'date': '01/25/2026', 'insight': 'Always preview the URL before proceeding when your camera app scans a QR code.'}
                ]
            },
            {
                'threat_id': 'THR-2026-HP3',
                'title': 'Deepfake Voice Phishing',
                'type': 'Voice Phishing',
                'severity': 'critical',
                'detected_date': '01/20/2026',
                'affected_users': 3200,
                'description': 'Voice cloning technology used to impersonate executives and request urgent wire transfers from finance departments.',
                'image': 'https://img.rocket.new/generatedImages/rocket_gen_img_1d54694d4-1767918858629.png',
                'alt': 'Finance employee receiving phone call with AI voice clone waveform visualisation',
                'origin': 'Multiple',
                'status': 'active',
                'community_reports': 307,
                'detailed_analysis': 'Real-time AI voice cloning tools can now reproduce a target\'s voice from as little as 3 seconds of audio sourced from public videos, podcasts, or earnings calls. Attackers call finance staff impersonating the CEO or CFO and create urgency around a same-day wire transfer for an acquisition, legal settlement, or supplier payment. The call is often followed by a spoofed email to add legitimacy.',
                'prevention_tips': [
                    'Establish a verbal codeword protocol for out-of-band transfer authorisation between executives and finance',
                    'Require video confirmation (not just voice) for transactions above a defined threshold',
                    'Treat any unexpected call requesting urgent money movement as suspicious — hang up and call back on a known number',
                    'Limit executive voice samples publicly available — review podcast, webinar, and earnings call policies',
                    'Implement a dual-approval workflow for all inbound wire transfer requests'
                ],
                'real_world_examples': [
                    'UK energy firm CEO\'s voice was cloned — a €220,000 transfer was made before the fraud was discovered',
                    'CFO of a US mid-market company transferred $1.5M after a convincing deepfake call chain involving the \'CEO\' and \'company solicitor\''
                ],
                'related_threats': ['THR-2025-043', 'THR-2025-046'],
                'community_insights': [
                    {'user': 'VoiceSecPro', 'date': '01/21/2026', 'insight': 'Tested a deepfake voice tool against our own staff — 4 out of 5 couldn\'t tell the difference from our CEO\'s actual voice.'},
                    {'user': 'FinanceDir_Keiko', 'date': '01/22/2026', 'insight': 'We now require a video call + manager co-approval for any transfer over $10K. The extra 5 minutes has saved us twice already.'}
                ]
            },
        ]
        for t in threats:
            ThreatIntelligence.objects.update_or_create(threat_id=t['threat_id'], defaults=t)

        # 8. Pricing Plans
        plans = [
            {
                'plan_id': 'free',
                'name': 'Free',
                'description': 'Perfect for individuals getting started with phishing protection.',
                'monthly_price': 0,
                'annual_price': 0,
                'cta': 'Get Started Free',
                'cta_style': 'border border-border text-foreground hover:bg-surface',
                'highlight': False,
                'icon': 'ShieldCheckIcon',
                'icon_bg': 'bg-gray-100',
                'icon_color': 'text-gray-600',
                'order': 1
            },
            {
                'plan_id': 'pro',
                'name': 'Pro',
                'description': 'For security-conscious professionals who need more power.',
                'monthly_price': 9,
                'annual_price': 7,
                'badge': 'Most Popular',
                'badge_color': 'bg-brand-primary text-white',
                'cta': 'Start Pro Trial',
                'cta_style': 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md hover:shadow-lg',
                'highlight': True,
                'icon': 'BoltIcon',
                'icon_bg': 'bg-brand-primary/10',
                'icon_color': 'text-brand-primary',
                'order': 2
            },
            {
                'plan_id': 'enterprise',
                'name': 'Enterprise',
                'description': 'For teams and organizations requiring full-scale protection.',
                'monthly_price': 49,
                'annual_price': 39,
                'badge': 'Best Value',
                'badge_color': 'bg-purple-600 text-white',
                'cta': 'Contact Sales',
                'cta_style': 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg',
                'highlight': False,
                'icon': 'BuildingOfficeIcon',
                'icon_bg': 'bg-purple-100',
                'icon_color': 'text-purple-600',
                'order': 3
            },
        ]
        for p in plans:
            PricingPlan.objects.update_or_create(plan_id=p['plan_id'], defaults=p)

        # 9. Pricing Features
        features_data = [
            {'name': 'URL Scans per month', 'category': 'Scanning', 'free_value': '10', 'pro_value': '500', 'enterprise_value': 'Unlimited', 'order': 1},
            {'name': 'Email Analysis', 'category': 'Scanning', 'free_value': 'true', 'pro_value': 'true', 'enterprise_value': 'true', 'order': 2},
            {'name': 'File Scanning', 'category': 'Scanning', 'free_value': 'false', 'pro_value': 'true', 'enterprise_value': 'true', 'order': 3},
            {'name': 'QR Code Scanning', 'category': 'Scanning', 'free_value': 'false', 'pro_value': 'true', 'enterprise_value': 'true', 'order': 4},
            {'name': 'API Calls per day', 'category': 'API Access', 'free_value': '50', 'pro_value': '5,000', 'enterprise_value': 'Unlimited', 'order': 5},
            {'name': 'API Key Access', 'category': 'API Access', 'free_value': 'false', 'pro_value': 'true', 'enterprise_value': 'true', 'order': 6},
            {'name': 'Threat Database Access', 'category': 'Threat Intelligence', 'free_value': 'Basic', 'pro_value': 'Full', 'enterprise_value': 'Full + Custom', 'order': 7},
            {'name': 'Real-time Threat Alerts', 'category': 'Threat Intelligence', 'free_value': '3 alerts', 'pro_value': 'Unlimited', 'enterprise_value': 'Unlimited', 'order': 8},
        ]
        for f in features_data:
            PricingFeature.objects.update_or_create(name=f['name'], defaults=f)

        self.stdout.write(self.style.SUCCESS('Successfully seeded all content data'))
