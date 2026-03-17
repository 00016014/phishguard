'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface SimulationScenario {
  id: number;
  type: 'email' | 'sms' | 'website' | 'social';
  content: {
    subject?: string;
    sender?: string;
    body: string;
    image?: string;
    imageAlt?: string;
    url?: string;
  };
  indicators: string[];
  isPhishing: boolean;
  explanation: string;
}

interface SimulationModalProps {
  scenario: SimulationScenario | null;
  onClose: () => void;
  onSubmit: (isPhishing: boolean) => void;
}

export default function SimulationModal({ scenario, onClose, onSubmit }: SimulationModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!scenario) return null;

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    onSubmit(selectedAnswer);
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    onClose();
  };

  const isCorrect = selectedAnswer === scenario.isPhishing;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-headline font-bold text-foreground">
              Phishing Simulation
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze this {scenario.type} and determine if it's a phishing attempt
            </p>
          </div>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-surface rounded-md transition-colors"
            aria-label="Close modal"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-surface rounded-lg p-6 mb-6 border border-border">
            {scenario.type === 'email' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-4 border-b border-border">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">From:</div>
                    <div className="font-medium text-foreground">{scenario.content.sender}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Subject:</div>
                  <div className="font-semibold text-foreground text-lg">
                    {scenario.content.subject}
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                    {scenario.content.body}
                  </div>
                  {scenario.content.image && (
                    <div className="mt-4">
                      <AppImage
                        src={scenario.content.image}
                        alt={scenario.content.imageAlt || 'Email content image'}
                        className="rounded-md w-full max-w-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {scenario.type === 'sms' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                  <Icon name="DevicePhoneMobileIcon" size={20} />
                  <span>SMS Message</span>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="text-sm text-muted-foreground mb-2">
                    From: {scenario.content.sender}
                  </div>
                  <div className="text-foreground whitespace-pre-wrap">{scenario.content.body}</div>
                </div>
              </div>
            )}

            {scenario.type === 'website' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 bg-muted rounded-md p-3">
                  <Icon name="GlobeAltIcon" size={20} className="text-muted-foreground" />
                  <span className="text-sm font-mono text-foreground">{scenario.content.url}</span>
                </div>
                {scenario.content.image && (
                  <AppImage
                    src={scenario.content.image}
                    alt={scenario.content.imageAlt || 'Website screenshot'}
                    className="rounded-md w-full border border-border"
                  />
                )}
                <div className="text-foreground whitespace-pre-wrap">{scenario.content.body}</div>
              </div>
            )}

            {scenario.type === 'social' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                    <Icon name="UserIcon" size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{scenario.content.sender}</div>
                    <div className="text-xs text-muted-foreground">2 hours ago</div>
                  </div>
                </div>
                <div className="text-foreground whitespace-pre-wrap">{scenario.content.body}</div>
                {scenario.content.image && (
                  <AppImage
                    src={scenario.content.image}
                    alt={scenario.content.imageAlt || 'Social media post image'}
                    className="rounded-md w-full"
                  />
                )}
              </div>
            )}
          </div>

          {!showResult ? (
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-lg text-foreground">
                Is this a phishing attempt?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedAnswer(true)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedAnswer === true
                      ? 'border-error bg-error/10'
                      : 'border-border hover:border-error/50 hover:bg-error/5'
                  }`}
                >
                  <Icon
                    name="ExclamationTriangleIcon"
                    size={32}
                    className={`mx-auto mb-3 ${selectedAnswer === true ? 'text-error' : 'text-muted-foreground'}`}
                  />
                  <div
                    className={`font-semibold ${selectedAnswer === true ? 'text-error' : 'text-foreground'}`}
                  >
                    Yes, it's phishing
                  </div>
                </button>

                <button
                  onClick={() => setSelectedAnswer(false)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedAnswer === false
                      ? 'border-success bg-success/10'
                      : 'border-border hover:border-success/50 hover:bg-success/5'
                  }`}
                >
                  <Icon
                    name="CheckCircleIcon"
                    size={32}
                    className={`mx-auto mb-3 ${selectedAnswer === false ? 'text-success' : 'text-muted-foreground'}`}
                  />
                  <div
                    className={`font-semibold ${selectedAnswer === false ? 'text-success' : 'text-foreground'}`}
                  >
                    No, it's legitimate
                  </div>
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="w-full py-3 px-6 bg-brand-accent text-white font-cta font-semibold rounded-md hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Submit Answer
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-lg border-2 ${isCorrect ? 'border-success bg-success/10' : 'border-error bg-error/10'}`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Icon
                    name={isCorrect ? 'CheckCircleIcon' : 'XCircleIcon'}
                    size={32}
                    className={isCorrect ? 'text-success' : 'text-error'}
                    variant="solid"
                  />
                  <div>
                    <h3
                      className={`text-xl font-headline font-bold ${isCorrect ? 'text-success' : 'text-error'}`}
                    >
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </h3>
                    <p className="text-sm text-foreground">
                      This {scenario.isPhishing ? 'was' : 'was not'} a phishing attempt
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 border border-border">
                <h4 className="font-headline font-bold text-foreground mb-3 flex items-center space-x-2">
                  <Icon name="LightBulbIcon" size={20} className="text-warning" />
                  <span>Explanation</span>
                </h4>
                <p className="text-foreground mb-4 whitespace-pre-wrap">{scenario.explanation}</p>

                {scenario.indicators.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h5 className="font-semibold text-foreground mb-3">Key Indicators:</h5>
                    <ul className="space-y-2">
                      {scenario.indicators.map((indicator, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Icon
                            name="CheckIcon"
                            size={16}
                            className="text-brand-accent mt-0.5 flex-shrink-0"
                          />
                          <span className="text-sm text-foreground">{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-6 bg-brand-primary text-white font-cta font-semibold rounded-md hover:bg-brand-primary/90 transition-all"
                >
                  Next Challenge
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
