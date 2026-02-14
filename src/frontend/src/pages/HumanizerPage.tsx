import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Copy, Check, Loader2, ArrowRight, ScanSearch, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useHumanizeText, useDetectAI } from '../hooks/useQueries';
import { toast } from 'sonner';

interface DetectionResult {
  isAI: boolean;
  confidence?: number;
  message: string;
}

export default function HumanizerPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  const { mutate: humanize, isPending: isHumanizing } = useHumanizeText();
  const { mutate: detectAI, isPending: isDetecting } = useDetectAI();

  const parseDetectionResult = (result: string): DetectionResult => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(result);
      
      // Handle different response formats
      if (parsed.results && Array.isArray(parsed.results) && parsed.results.length > 0) {
        // OpenAI moderation API format
        const firstResult = parsed.results[0];
        const isFlagged = firstResult.flagged || false;
        
        return {
          isAI: isFlagged,
          message: isFlagged 
            ? 'This text appears to be AI-generated or contains flagged content.'
            : 'This text appears to be human-written.',
        };
      }
      
      // Generic JSON response
      if (typeof parsed.isAI === 'boolean') {
        return {
          isAI: parsed.isAI,
          confidence: parsed.confidence,
          message: parsed.message || (parsed.isAI 
            ? 'This text appears to be AI-generated.' 
            : 'This text appears to be human-written.'),
        };
      }
      
      // If we can't parse the structure, return a generic message
      return {
        isAI: false,
        message: 'Detection completed. Please review the results.',
      };
    } catch (e) {
      // If not JSON, treat as plain text message
      return {
        isAI: false,
        message: result || 'Detection completed.',
      };
    }
  };

  const handleDetectAI = () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setDetectionError(null);
    setDetectionResult(null);

    detectAI(inputText, {
      onSuccess: (result) => {
        try {
          const parsedResult = parseDetectionResult(result);
          setDetectionResult(parsedResult);
          toast.success('Detection complete!');
        } catch (error) {
          setDetectionError('Failed to parse detection results');
          toast.error('Detection completed but results could not be parsed');
        }
      },
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to detect AI text';
        setDetectionError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  const handleHumanize = () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to humanize');
      return;
    }

    humanize(inputText, {
      onSuccess: (result) => {
        setOutputText(result);
        toast.success('Text humanized successfully!');
      },
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to humanize text';
        toast.error(errorMessage);
      }
    });
  };

  const handleCopy = async () => {
    if (!outputText) return;

    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setDetectionResult(null);
    setDetectionError(null);
  };

  const charCount = inputText.length;
  const hasOutput = outputText.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="mb-8 text-center md:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Text Transformation
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Make AI Text Sound{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Human
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Transform robotic AI-generated content into natural, engaging text that resonates with your
            audience.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  1
                </div>
                Input Text
              </CardTitle>
              <CardDescription>Paste your AI-generated text below</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              {/* Detection Result */}
              {detectionResult && (
                <Alert className={detectionResult.isAI ? 'border-destructive/50 bg-destructive/5' : 'border-accent/50 bg-accent/5'}>
                  {detectionResult.isAI ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  )}
                  <AlertTitle className="ml-2">Detection Result</AlertTitle>
                  <AlertDescription className="ml-2 mt-2 text-sm">
                    {detectionResult.message}
                    {detectionResult.confidence !== undefined && (
                      <span className="ml-2 text-muted-foreground">
                        (Confidence: {Math.round(detectionResult.confidence * 100)}%)
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Detection Error */}
              {detectionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="ml-2">Detection Error</AlertTitle>
                  <AlertDescription className="ml-2 mt-2 text-sm">
                    {detectionError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Detect AI Button */}
              <Button
                onClick={handleDetectAI}
                disabled={!inputText.trim() || isDetecting || isHumanizing}
                variant="outline"
                className="gap-2"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-4 w-4" />
                    Detect AI
                  </>
                )}
              </Button>

              <div className="relative flex-1">
                <Textarea
                  placeholder="Paste your AI-generated text here... For example: 'In the realm of digital communication, it is imperative to acknowledge that...'"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setDetectionResult(null);
                    setDetectionError(null);
                  }}
                  className="min-h-[300px] resize-none text-base"
                  disabled={isHumanizing || isDetecting}
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {charCount} characters
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleHumanize}
                  disabled={!inputText.trim() || isHumanizing || isDetecting}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  {isHumanizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Humanizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Humanize Text
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                {inputText && (
                  <Button onClick={handleClear} variant="outline" size="lg" disabled={isHumanizing || isDetecting}>
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  2
                </div>
                Humanized Output
              </CardTitle>
              <CardDescription>Your natural, human-like text</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="relative flex-1">
                {hasOutput ? (
                  <div className="min-h-[300px] rounded-md border bg-muted/30 p-4 text-base leading-relaxed">
                    {outputText}
                  </div>
                ) : (
                  <div className="flex min-h-[300px] items-center justify-center rounded-md border border-dashed bg-muted/20">
                    <div className="text-center">
                      <Sparkles className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        Your humanized text will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={handleCopy}
                disabled={!hasOutput}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Natural Tone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Transforms robotic AI text into conversational, authentic writing that sounds genuinely human.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <svg
                  className="h-6 w-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <CardTitle className="text-lg">Preserves Meaning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Maintains the original message and intent while improving readability and engagement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <svg
                  className="h-6 w-6 text-secondary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <CardTitle className="text-lg">Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get your humanized text in seconds with our powerful AI processing engine.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
