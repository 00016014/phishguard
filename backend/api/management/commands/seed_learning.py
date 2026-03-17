from django.core.management.base import BaseCommand
from api.models import LearningModule

class Command(BaseCommand):
    help = 'Seed the database with initial learning modules'

    def handle(self, *args, **options):
        challenges = [
            {
                "id": 1,
                "title": "Email Phishing Basics",
                "description": "Learn to identify common email phishing attempts through interactive scenarios and real-world examples.",
                "difficulty": "Beginner",
                "type": "Quiz",
                "duration": "15 min",
                "points": 100,
                "icon": "EnvelopeIcon",
                "content_data": {
                    "questions": [
                        {
                            "id": 1,
                            "question": "What is the most reliable way to verify if an email is legitimate?",
                            "options": [
                                "Check if the email looks professional",
                                "Click the link to see if it goes to the right website",
                                "Contact the company directly using official contact information",
                                "Reply to the email asking if it's legitimate"
                            ],
                            "correctAnswer": 2,
                            "explanation": "Always contact the company directly using official contact information from their website or documentation you already have. Never use contact information provided in a suspicious email, as it could lead you to the attackers."
                        },
                        {
                            "id": 2,
                            "question": "Which of these is a red flag in an email sender address?",
                            "options": [
                                "The domain matches the company name exactly",
                                "The email uses a free email service like Gmail",
                                "The email has a professional signature",
                                "The sender's name is spelled correctly"
                            ],
                            "correctAnswer": 1,
                            "explanation": "Legitimate businesses typically use their own domain for official communications, not free email services. While some small businesses might use Gmail, major companies and financial institutions will always use their branded domain."
                        },
                        {
                            "id": 3,
                            "question": "What should you do if you receive an unexpected email asking you to verify your account?",
                            "options": [
                                "Click the link and enter your information quickly",
                                "Reply with your account details",
                                "Delete it and contact the company directly through official channels",
                                "Forward it to your friends to warn them"
                            ],
                            "correctAnswer": 2,
                            "explanation": "Never click links or provide information in response to unexpected verification requests. Delete the email and contact the company directly using contact information from their official website or your account statements."
                        }
                    ]
                }
            },
            {
                "id": 2,
                "title": "Advanced URL Analysis",
                "description": "Master the art of detecting malicious URLs and understanding domain spoofing techniques.",
                "difficulty": "Advanced",
                "type": "Simulation",
                "duration": "25 min",
                "points": 250,
                "icon": "LinkIcon",
                "content_data": {
                    "type": "email",
                    "content": {
                        "subject": "Urgent: Your Account Will Be Suspended",
                        "sender": "security@paypa1-support.com",
                        "body": "Dear Valued Customer,\n\nWe have detected unusual activity on your account. Your account will be suspended within 24 hours unless you verify your information immediately.\n\nClick here to verify your account: http://paypa1-verify.com/secure\n\nFailure to verify will result in permanent account closure.\n\nBest regards,\nPayPal Security Team"
                    },
                    "indicators": [
                        "Suspicious sender domain (paypa1 instead of paypal)",
                        "Creates urgency and fear of account suspension",
                        "Suspicious URL with misspelled domain",
                        "Generic greeting instead of personalized",
                        "Threatens negative consequences"
                    ],
                    "isPhishing": True,
                    "explanation": "This is a classic phishing email. The sender domain uses '1' instead of 'l' in PayPal, creating a lookalike domain. The email creates artificial urgency and fear to pressure quick action without careful consideration. Legitimate companies never ask you to verify account information through email links. The URL is clearly suspicious with a misspelled domain. Always navigate directly to official websites rather than clicking email links."
                }
            },
            {
                "id": 3,
                "title": "Phishing Defense Assessment 1",
                "description": "Comprehensive assessment that combines email, URL, and social engineering detection skills.",
                "difficulty": "Intermediate",
                "type": "Assessment",
                "duration": "30 min",
                "points": 300,
                "icon": "ClipboardDocumentCheckIcon",
                "content_data": {
                    "questions": [
                        {
                            "id": 1,
                            "question": "A login email says your account will be disabled in 2 hours. What is the safest first action?",
                            "options": [
                                "Click the provided link and verify immediately",
                                "Reply to the sender and ask if it is real",
                                "Open the official website directly and check account notifications",
                                "Forward the email to coworkers for advice"
                            ],
                            "correctAnswer": 2,
                            "explanation": "Use a trusted path to the service (typed URL/bookmark). Never trust the email link in urgent account messages."
                        },
                        {
                            "id": 2,
                            "question": "Which URL is most suspicious?",
                            "options": [
                                "https://security.microsoft.com",
                                "https://micros0ft-security-help.com",
                                "https://learn.microsoft.com",
                                "https://account.microsoft.com"
                            ],
                            "correctAnswer": 1,
                            "explanation": "Lookalike domains (micros0ft with a zero) are common in phishing campaigns."
                        },
                        {
                            "id": 3,
                            "question": "What is the best response to an unsolicited MFA approval request?",
                            "options": [
                                "Approve it quickly so login is not blocked",
                                "Ignore it and report suspicious activity immediately",
                                "Approve it if it repeats more than twice",
                                "Send your OTP code to IT support via chat"
                            ],
                            "correctAnswer": 1,
                            "explanation": "Unsolicited MFA prompts can indicate credential theft. Deny and report immediately."
                        }
                    ]
                }
            },
            {
                "id": 4,
                "title": "SMS Phishing Detection",
                "description": "Identify smishing attempts and learn to recognize suspicious text message patterns.",
                "difficulty": "Beginner",
                "type": "Simulation",
                "duration": "20 min",
                "points": 150,
                "icon": "DevicePhoneMobileIcon",
                "content_data": {
                    "type": "sms",
                    "content": {
                        "sender": "+1-555-0123",
                        "body": "BANK ALERT: Suspicious activity detected on your account ending in 4892. Reply YES to confirm recent $2,847 transaction or NO to block. Reply within 1 hour."
                    },
                    "indicators": [
                        "Unsolicited message about account activity",
                        "Requests immediate response via text",
                        "Uses fear and urgency tactics",
                        "Asks for sensitive confirmation via SMS",
                        "Generic sender number"
                    ],
                    "isPhishing": True,
                    "explanation": "This is a smishing (SMS phishing) attempt. Banks never ask you to confirm transactions via text message replies. The message creates urgency with a time limit to prevent careful consideration. Legitimate fraud alerts from banks will direct you to call official customer service numbers or use secure banking apps. The sender is a generic number, not an official short code. Always contact your bank directly using the number on your card or official website."
                }
            },
            {
                "id": 5,
                "title": "Website Spoofing Recognition",
                "description": "Learn to spot fake websites and understand certificate validation techniques.",
                "difficulty": "Intermediate",
                "type": "Quiz",
                "duration": "20 min",
                "points": 175,
                "icon": "GlobeAltIcon",
                "content_data": {
                    "questions": [
                        {
                            "id": 1,
                            "question": "What is the most important indicator of a secure website?",
                            "options": [
                                "The website looks professional",
                                "HTTPS in the URL with a valid certificate",
                                "The website has a contact form",
                                "The website has social media links"
                            ],
                            "correctAnswer": 1,
                            "explanation": "HTTPS with a valid certificate ensures encrypted communication between you and the website. However, note that phishing sites can also have HTTPS, so always verify the exact domain name as well."
                        },
                        {
                            "id": 2,
                            "question": "Which URL is most likely to be a phishing attempt for Amazon?",
                            "options": [
                                "https://www.amazon.com",
                                "https://www.amaz0n.com",
                                "https://amazon.co.uk",
                                "https://smile.amazon.com"
                            ],
                            "correctAnswer": 1,
                            "explanation": "The URL uses a zero '0' instead of the letter 'o' in Amazon, creating a lookalike domain. This is a common technique called typosquatting. Always carefully check the exact spelling of domain names."
                        },
                        {
                            "id": 3,
                            "question": "What should you do if a website asks for unusual information during login?",
                            "options": [
                                "Provide the information if the site looks legitimate",
                                "Close the browser and access the site through a bookmark or typing the URL",
                                "Call the phone number listed on the website",
                                "Continue if the site has HTTPS"
                            ],
                            "correctAnswer": 1,
                            "explanation": "If a website asks for unusual information (like full SSN, PIN, or security questions during normal login), it's a red flag. Close the browser and access the legitimate site directly through a trusted bookmark or by typing the URL yourself."
                        }
                    ]
                }
            },
            {
                "id": 6,
                "title": "Threat Intelligence Assessment 2",
                "description": "Scenario-based assessment focused on IOC recognition, reporting, and mitigation decisions.",
                "difficulty": "Advanced",
                "type": "Assessment",
                "duration": "35 min",
                "points": 350,
                "icon": "ShieldCheckIcon",
                "content_data": {
                    "questions": [
                        {
                            "id": 1,
                            "question": "You receive a vendor invoice with a new bank account number. Which control helps most before payment?",
                            "options": [
                                "Pay immediately to avoid late fees",
                                "Verify bank detail changes through a known out-of-band channel",
                                "Ask the email sender to confirm again",
                                "Only check the email signature block"
                            ],
                            "correctAnswer": 1,
                            "explanation": "Out-of-band verification is essential for preventing Business Email Compromise payment fraud."
                        },
                        {
                            "id": 2,
                            "question": "Which IOC set is strongest evidence of a phishing campaign?",
                            "options": [
                                "One typo in a newsletter",
                                "Urgent wording only",
                                "Lookalike domain, mismatched reply-to, and credential-harvesting page",
                                "Email sent outside office hours"
                            ],
                            "correctAnswer": 2,
                            "explanation": "A combination of technical and behavioral indicators provides high-confidence detection."
                        },
                        {
                            "id": 3,
                            "question": "After confirming a malicious URL, what should be done first?",
                            "options": [
                                "Share it publicly before notifying security",
                                "Block indicators and preserve evidence for investigation",
                                "Ignore it if no one clicked",
                                "Only warn one department"
                            ],
                            "correctAnswer": 1,
                            "explanation": "Immediate containment and evidence preservation enables both protection and incident response."
                        }
                    ]
                }
            }
        ]

        for challenge in challenges:
            LearningModule.objects.update_or_create(
                id=challenge['id'],
                defaults={
                    "title": challenge['title'],
                    "description": challenge['description'],
                    "difficulty": challenge['difficulty'],
                    "type": challenge['type'],
                    "duration": challenge['duration'],
                    "points": challenge['points'],
                    "icon": challenge['icon'],
                    "content_data": challenge['content_data']
                }
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded learning modules'))
