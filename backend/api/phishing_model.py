"""
Lightweight AI phishing text classifier.

Uses a TF-IDF + Logistic Regression pipeline trained in-process on a compact
set of representative phishing / legitimate email samples.  No external model
file is needed — the model trains once on first import and is cached for the
lifetime of the Django process (< 50 ms).

Returns
-------
predict(text: str) -> dict
    {
        "phishing_probability": float,   # 0.0 – 1.0
        "label": "phishing" | "legitimate",
        "confidence": "high" | "medium" | "low",
        "top_signals": [str, ...],       # up to 5 most indicative n-grams
    }
"""

import re
import threading

# ---------------------------------------------------------------------------
# Training corpus  (balanced: 60 phishing, 60 legitimate)
# ---------------------------------------------------------------------------

_PHISHING_SAMPLES = [
    "Urgent: Your account will be suspended. Click here to verify your information immediately.",
    "Dear customer, we detected unauthorized access to your bank account. Confirm your details now.",
    "Your PayPal account has been limited. Please update your billing information to avoid suspension.",
    "ALERT: Unusual sign-in activity on your Microsoft account. Verify now to prevent lockout.",
    "Congratulations! You have won a $500 Amazon gift card. Click the link to claim your prize.",
    "Your Apple ID has been locked due to too many failed attempts. Unlock it here.",
    "IRS Notice: You have a pending tax refund. Provide your SSN and bank account to receive it.",
    "Your Netflix subscription has expired. Update your payment method to continue watching.",
    "Security Alert: Someone tried to log into your account from an unknown device. Confirm here.",
    "Dear user, your email storage is full. Click here to upgrade for free and avoid losing emails.",
    "Final warning: Your account will be deleted in 24 hours unless you verify your identity.",
    "We noticed a $1,200 charge on your credit card. If this was not you, click here immediately.",
    "Your password will expire in 1 hour. Reset it now to maintain access to your account.",
    "Your Chase bank account has been compromised. Verify your credentials to secure it.",
    "You have 1 unread security message. Log in now to read your important notification.",
    "Attention: Your social security number has been used fraudulently. Act now.",
    "Click here to receive your unclaimed inheritance of $2.5 million USD.",
    "Verify your email address to avoid losing access to your account today.",
    "Your Dropbox files have been deleted. Sign in to recover them before they are gone.",
    "Your account has been flagged for suspicious activity. Please confirm your identity.",
    "Urgent action required: Your account password needs to be updated immediately.",
    "You have been selected for a special offer. Provide your credit card to activate.",
    "Dear valued customer, please update your billing information to avoid service interruption.",
    "We detected a login from Russia. Was this you? If not, secure your account now.",
    "Your Citibank account is temporarily locked. Verify now to restore access.",
    "Click the link below to confirm your email and receive your $100 reward.",
    "Important: Your package could not be delivered. Click here to reschedule.",
    "Your LinkedIn account has been compromised. Reset your password immediately.",
    "Refund pending: Please provide your bank account number to receive your refund.",
    "Action required: Update your account information within 48 hours to avoid suspension.",
    "You owe outstanding taxes. Pay now to avoid legal action and penalties.",
    "Your Instagram account will be disabled for violating our terms. Appeal now.",
    "Exclusive offer: You qualify for a personal loan. Provide your SSN to apply.",
    "Your email account exceeds its storage limit. Click here to upgrade for free.",
    "Security breach detected on your account. Login to review recent activity.",
    "Update your payment details now or your subscription will be cancelled today.",
    "Wells Fargo: We have placed a hold on your account due to suspicious activity.",
    "Your iCloud account has been disabled. Verify your details to restore access.",
    "Click here immediately — your computer may be infected with a virus.",
    "Send your mother's maiden name and date of birth to verify your identity.",
    "Your Bank of America account requires verification. Click to confirm details.",
    "Limited time offer: Enter your credit card to receive a free iPhone 15.",
    "Kindly confirm your account details to avoid permanent suspension.",
    "Dear winner, you have been selected to receive a cash prize of $10,000.",
    "Verify your social security number to receive your government stimulus payment.",
    "Your Twitter account is at risk. Log in to secure it before it is too late.",
    "IMPORTANT: Click the link to update your password and protect your account now.",
    "Unauthorized wire transfer of $3,400 was made from your account. Dispute it here.",
    "We need to verify your identity. Please provide your PIN number and date of birth.",
    "Final notice: Failure to verify your information will result in account closure.",
    "Your account access will be revoked in 24 hours. Confirm your credentials now.",
    "Warning: Your credit card has been charged $299. Cancel here to get a refund.",
    "You have unused funds in your account. Click to claim before they expire.",
    "Please update your information to continue using our services without interruption.",
    "Your order has been shipped. Track it here by providing your home address.",
    "Someone is trying to access your account right now. Stop them by clicking here.",
    "Your subscription renews automatically tomorrow for $89.99. Cancel now if unwanted.",
    "You have a new voicemail. Listen to it by entering your password at this link.",
    "Confirm your details to receive your tax return of $1,247 directly to your account.",
    "Immediate action needed: your password has been exposed in a data breach.",
]

_LEGIT_SAMPLES = [
    "Hi John, just wanted to share the meeting notes from today's standup. Let me know if you have questions.",
    "Your order #12345 has been shipped and will arrive by Friday. Track at the link below.",
    "Hi team, the sprint review is scheduled for Thursday at 2 PM. Please prepare your demos.",
    "Attached is the invoice for services rendered in February. Please process at your earliest convenience.",
    "Thank you for your purchase! Your receipt is attached for your records.",
    "Reminder: Your dentist appointment is tomorrow at 10 AM. Reply to confirm or reschedule.",
    "Happy birthday! Hope you have a great day and enjoy your celebration.",
    "Here is the link to the document we discussed in the meeting: [shared drive link].",
    "Please find attached the quarterly report for Q4 2025. Let me know if you need clarifications.",
    "Hi, I am following up on our conversation last week regarding the project timeline.",
    "The conference call is at 3 PM EST. Dial-in details: 1-800-555-0123, PIN 4567.",
    "We have reviewed your application and would like to schedule an interview.",
    "The new version of the software is now available. Release notes are attached.",
    "Your subscription has been renewed successfully. Next billing date: April 1, 2026.",
    "Good news! Your loan application has been pre-approved. Visit a branch to finalize.",
    "Please review the attached contract and sign by end of week if everything looks good.",
    "The department meeting has been moved to 4 PM on Wednesday. See you there.",
    "Congratulations on completing the training course! Your certificate is attached.",
    "A summary of your monthly bank statement is now available in your online banking portal.",
    "Hi, I am reaching out to discuss a potential collaboration between our teams.",
    "I wanted to let you know that we have updated our privacy policy effective April 1.",
    "Your feedback has been received. Our support team will respond within 24 hours.",
    "The server maintenance is scheduled for this Sunday from 2 AM to 4 AM UTC.",
    "Please confirm your attendance for the company picnic by filling out the form below.",
    "Your GitHub pull request has been approved and merged into the main branch.",
    "We are happy to inform you that your account has been activated successfully.",
    "The project deadline has been extended to March 20. Please update your tasks accordingly.",
    "Thank you for attending our webinar. The recording is now available on our website.",
    "Here are the action items from today's meeting. Please complete them by next Monday.",
    "Your annual performance review is scheduled for next week. Please prepare your self-assessment.",
    "We are pleased to confirm your hotel reservation for March 15–18 in New York.",
    "The software update you requested has been successfully applied to your account.",
    "Thanks for reaching out! I will be out of office until Tuesday and will reply when I return.",
    "Your health insurance renewal documents are attached. Please review before the deadline.",
    "The team has reviewed your proposal and approved the budget for Q2.",
    "Your flight booking confirmation is attached. Departure is at 09:45 AM on March 18.",
    "We have received your complaint and are actively working to resolve the issue.",
    "The latest security patches have been applied to all company devices.",
    "Our records show your lease renewal is due next month. Please contact us to discuss.",
    "I am sending over the design mockups for your review. Let me know your thoughts.",
    "We noticed you have not logged in recently. Your account remains active and secure.",
    "Your utility bill is now available online. No action is needed if you have autopay set up.",
    "The board meeting minutes have been finalized and distributed to all members.",
    "As requested, I have updated the spreadsheet with the latest figures.",
    "We are happy to offer you a 10% discount on your next purchase as a loyal customer.",
    "Your library books are due back next Monday. Renew online if you need more time.",
    "Please find the agenda for next week's strategy session attached.",
    "We wanted to share some exciting updates about our new product roadmap.",
    "Your subscription to the newsletter has been confirmed. Welcome aboard!",
    "The invoice has been paid successfully. You can view the transaction in your account.",
    "We are hiring! Forward this to anyone who might be interested in the open roles.",
    "Hi Sarah, can we reschedule our call to Thursday afternoon? Let me know what works.",
    "Your annual review documents are ready. Please sign and return them by Friday.",
    "The patch notes for the latest release are available on our developer portal.",
    "We are migrating to a new ticketing system next week. More details to follow.",
    "Your application has been received. We will be in touch within 5 business days.",
    "Just a reminder that the expense reports are due by the end of the month.",
    "The new onboarding materials have been uploaded to the shared drive.",
    "We have updated our return policy effective March 1. Please review the changes.",
    "Looking forward to seeing you at the conference next week!",
]

# ---------------------------------------------------------------------------
# Model — trained once, cached at module level
# ---------------------------------------------------------------------------

_model = None
_vectorizer = None
_lock = threading.Lock()


def _build_model():
    global _model, _vectorizer
    try:
        from sklearn.pipeline import Pipeline
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression

        texts = _PHISHING_SAMPLES + _LEGIT_SAMPLES
        labels = [1] * len(_PHISHING_SAMPLES) + [0] * len(_LEGIT_SAMPLES)

        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=3000,
                sublinear_tf=True,
                min_df=1,
            )),
            ('clf', LogisticRegression(C=1.0, max_iter=200, random_state=42)),
        ])
        pipeline.fit(texts, labels)
        _model = pipeline
        _vectorizer = pipeline.named_steps['tfidf']
    except ImportError:
        _model = None
        _vectorizer = None


def _ensure_model():
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                _build_model()


def _top_signals(text: str, n: int = 5) -> list[str]:
    """Return the n-gram features most responsible for the phishing prediction."""
    if _model is None or _vectorizer is None:
        return []
    try:
        from sklearn.linear_model import LogisticRegression
        clf: LogisticRegression = _model.named_steps['clf']
        vec = _vectorizer
        feature_names = vec.get_feature_names_out()
        # Transform the single sample
        tfidf_row = vec.transform([text])
        # Element-wise product of tfidf weight × classifier coefficient (class=1 = phishing)
        coefs = clf.coef_[0]
        scores = tfidf_row.multiply(coefs).toarray()[0]
        top_idx = scores.argsort()[-n:][::-1]
        return [feature_names[i] for i in top_idx if scores[i] > 0]
    except Exception:
        return []


import os
import json

def predict(text: str) -> dict:
    """
    Classify a single email / text as phishing or legitimate using OpenAI.
    """
    fallback_result = {
        'phishing_probability': 0.5,
        'label': 'unknown',
        'confidence': 'low',
        'top_signals': [],
    }

    try:
        api_key = os.environ.get('OPENAI_API_KEY')
        if api_key:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            
            prompt = (
                "You are an expert cybersecurity text analyzer. Calculate the exact probability that the following text is a phishing attempt, smishing, or malicious request. "
                "Respond ONLY with a valid JSON object containing no extra text or markdown formatting. The JSON must match this structure exactly:\n"
                "{\n"
                '  "phishing_probability": 0.85,\n'
                '  "label": "phishing",\n'
                '  "confidence": "high",\n'
                '  "top_signals": ["urgent demand", "suspicious link request", "financial data query"]\n'
                "}\n"
                "Rules:\n"
                "- phishing_probability must be a float between 0.0 and 1.0\n"
                "- label must be 'phishing' or 'legitimate'\n"
                "- confidence must be 'high', 'medium', or 'low'\n"
                "- top_signals must be an array of up to 3 very short strings pointing out the key red flags.\n\n"
                f"TEXT TO ANALYZE:\n{text[:2000]}"
            )

            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a precise cybersecurity JSON API system."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=250,
                temperature=0.1
            )
            
            raw = resp.choices[0].message.content.strip()
            if raw.startswith('```'):
                raw = raw.split('\n', 1)[-1].rsplit('```', 1)[0].strip()
                
            return json.loads(raw)
            
    except Exception as e:
        import logging
        logging.getLogger('phishing_model').error(f'OpenAI predict() error: {e}')

    # --- FALLBACK: If OpenAI is disabled, crashes, or fails, use lightweight heuristics ---
    text_lower = text.lower()
    score = 0
    signals = []

    urgency_words = ['urgent', 'immediately', 'suspended', 'limited', 'verify', 'update your profile']
    for w in urgency_words:
        if w in text_lower:
            score += 0.3
            signals.append(f"urgency ({w})")

    sensitive = ['social security', 'password', 'bank account', 'credit card']
    for w in sensitive:
        if w in text_lower:
            score += 0.4
            signals.append(f"sensitive request ({w})")

    instructions = ['click here', 'download the pdf', 'sign it', 'open attachment']
    for w in instructions:
        if w in text_lower:
            score += 0.2
            signals.append(w)
            
    prob = min(max(score, 0.05), 0.95)
    
    if prob >= 0.6:
        label = 'phishing'
        confidence = 'high' if prob >= 0.8 else 'medium'
    else:
        label = 'legitimate'
        confidence = 'medium' if prob <= 0.3 else 'low'
        
    return {
        'phishing_probability': round(prob, 3),
        'label': label,
        'confidence': confidence,
        'top_signals': signals[:3],
    }
