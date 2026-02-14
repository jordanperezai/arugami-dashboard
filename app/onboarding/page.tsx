'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  Scissors,
  Home,
  Briefcase,
  Coffee,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  ChevronRight,
  Loader2,
  Sparkles,
  MapPin,
  Phone,
  Star,
  Bell,
  RefreshCw,
  Receipt,
  Car,
  Wrench,
  FileText,
  Mail,
  Clock
} from 'lucide-react';
import { BRAND } from '@/lib/brand';

// ============================================
// LOCALSTORAGE KEY
// ============================================
const ONBOARDING_STORAGE_KEY = 'arugami_onboarding_progress';

// ============================================
// DATA CONSTANTS
// ============================================

const BUSINESS_TYPES = [
  { id: 'restaurant', label: 'Restaurant / Café', icon: Coffee },
  { id: 'salon', label: 'Salon / Studio', icon: Scissors },
  { id: 'realestate', label: 'Real Estate', icon: Home },
  { id: 'freelancer', label: 'Freelancer / Agency', icon: Briefcase },
  { id: 'other', label: 'Something else', icon: Building2 },
];

// Pain points with the automations they unlock (show, don't tell)
const PAIN_POINTS = [
  {
    id: 'followup',
    label: 'Following up with customers',
    icon: MessageSquare,
    automations: ['Missed call text-back', 'Lead nurture sequences']
  },
  {
    id: 'sales',
    label: 'Keeping track of sales',
    icon: TrendingUp,
    automations: ['CRM sync', 'Pipeline tracking']
  },
  {
    id: 'marketing',
    label: 'Social media / marketing',
    icon: Zap,
    automations: ['Social media analytics', 'DM auto-replies', 'Lead capture from DMs']
  },
  {
    id: 'bookings',
    label: 'Managing bookings / orders',
    icon: Calendar,
    automations: ['Appointment reminders', 'No-show recovery']
  },
  {
    id: 'organized',
    label: 'Just staying organized',
    icon: Users,
    automations: ['Task automation', 'Weekly reports']
  },
];

// Value metrics by business type (shown on Magic Moment screen)
const VALUE_METRICS: Record<string, { hours: string; leads: string; rating: string }> = {
  restaurant: { hours: '12+', leads: '35', rating: '4.7' },
  salon: { hours: '8+', leads: '28', rating: '4.9' },
  realestate: { hours: '15+', leads: '42', rating: '4.6' },
  freelancer: { hours: '10+', leads: '18', rating: '4.8' },
  other: { hours: '10+', leads: '23', rating: '4.8' },
};

// Logo helper using logos.dev API
const logoKey = process.env.NEXT_PUBLIC_LOGO_DEV_KEY || '';
const getLogo = (domain: string) => `https://img.logo.dev/${domain}?token=${logoKey}`;

const TOOLS: Record<string, { id: string; name: string; logo: string }[]> = {
  restaurant: [
    { id: 'toast', name: 'Toast', logo: getLogo('toasttab.com') },
    { id: 'clover', name: 'Clover', logo: getLogo('clover.com') },
    { id: 'square', name: 'Square', logo: getLogo('squareup.com') },
    { id: 'doordash', name: 'DoorDash', logo: getLogo('doordash.com') },
  ],
  salon: [
    { id: 'vagaro', name: 'Vagaro', logo: getLogo('vagaro.com') },
    { id: 'fresha', name: 'Fresha', logo: getLogo('fresha.com') },
    { id: 'square', name: 'Square', logo: getLogo('squareup.com') },
    { id: 'schedulicity', name: 'Schedulicity', logo: getLogo('schedulicity.com') },
  ],
  realestate: [
    { id: 'zillow', name: 'Zillow', logo: getLogo('zillow.com') },
    { id: 'realtor', name: 'Realtor.com', logo: getLogo('realtor.com') },
    { id: 'followupboss', name: 'Follow Up Boss', logo: getLogo('followupboss.com') },
  ],
  freelancer: [
    { id: 'honeybook', name: 'HoneyBook', logo: getLogo('honeybook.com') },
    { id: 'calendly', name: 'Calendly', logo: getLogo('calendly.com') },
    { id: 'stripe', name: 'Stripe', logo: getLogo('stripe.com') },
    { id: 'convertkit', name: 'ConvertKit', logo: getLogo('convertkit.com') },
  ],
  other: [
    { id: 'google', name: 'Google', logo: getLogo('google.com') },
    { id: 'square', name: 'Square', logo: getLogo('squareup.com') },
    { id: 'stripe', name: 'Stripe', logo: getLogo('stripe.com') },
    { id: 'quickbooks', name: 'QuickBooks', logo: getLogo('intuit.com') },
  ],
};

const COMMON_TOOLS = [
  { id: 'mailchimp', name: 'Mailchimp', logo: getLogo('mailchimp.com') },
  { id: 'google', name: 'Google Business', logo: getLogo('google.com') },
  { id: 'facebook', name: 'Facebook & Instagram', logo: getLogo('facebook.com') },
];

// Tools that support OAuth (one-click connect)
const OAUTH_SUPPORTED = ['clover', 'toast', 'square', 'mailchimp', 'stripe', 'quickbooks', 'calendly', 'google', 'honeybook', 'convertkit'];

// Tools that need Browser-Use (social media) - connect later
// Facebook requires Business Verification for OAuth, so we use Browser-Use instead
const BROWSER_USE_TOOLS = ['instagram', 'facebook'];

// Tool preview messages by business type
const TOOL_PREVIEW_MESSAGES: Record<string, string> = {
  restaurant: 'We integrate with Toast, Clover, Square, and more.',
  salon: 'We integrate with Fresha, Vagaro, Square, and more.',
  realestate: 'We integrate with Follow Up Boss, Zillow, and more.',
  freelancer: 'We integrate with HoneyBook, Calendly, ConvertKit, and more.',
  other: 'We integrate with Google, Square, Stripe, and more.',
};

// Automation previews by business type - shows value before dashboard
// Addresses: "What do you actually DO for me?" (Alex persona)
const AUTOMATION_PREVIEWS: Record<string, { icon: typeof Phone; label: string; description: string }[]> = {
  restaurant: [
    { icon: Phone, label: 'Missed Call Text-Back', description: 'Auto-reply when you miss a call' },
    { icon: Star, label: 'Review Requests', description: 'Ask happy customers for Google reviews' },
    { icon: Receipt, label: 'Order Confirmations', description: 'Instant order status updates' },
  ],
  salon: [
    { icon: Bell, label: 'Appointment Reminders', description: '24hr + 1hr before each booking' },
    { icon: RefreshCw, label: 'Rebooking Prompts', description: 'Remind clients to book again' },
    { icon: Calendar, label: 'No-Show Recovery', description: 'Reschedule missed appointments' },
  ],
  realestate: [
    { icon: Mail, label: 'Lead Follow-ups', description: 'Instant response to new inquiries' },
    { icon: Calendar, label: 'Showing Reminders', description: 'Confirm appointments automatically' },
    { icon: FileText, label: 'Market Updates', description: 'Weekly listing alerts to buyers' },
  ],
  freelancer: [
    { icon: Clock, label: 'Invoice Reminders', description: 'Gentle payment follow-ups' },
    { icon: Calendar, label: 'Meeting Confirmations', description: 'Reduce no-shows automatically' },
    { icon: Star, label: 'Testimonial Requests', description: 'Collect reviews after projects' },
  ],
  other: [
    { icon: Phone, label: 'Missed Call Text-Back', description: 'Never lose a lead again' },
    { icon: Star, label: 'Review Requests', description: 'Build your online reputation' },
    { icon: Mail, label: 'Follow-up Sequences', description: 'Nurture leads automatically' },
  ],
};

// Persona-aware messaging after business type selection
const PERSONA_MESSAGES: Record<string, { headline: string; subtext: string }> = {
  restaurant: { headline: "We'll handle the tech.", subtext: "You focus on the food." },
  salon: { headline: "Your tools, automated.", subtext: "While you work with clients." },
  realestate: { headline: "Your CRM, supercharged.", subtext: "Close more deals, less admin." },
  freelancer: { headline: "Your business, on autopilot.", subtext: "More time for actual work." },
  other: { headline: "We'll handle the tech.", subtext: "You focus on your customers." },
};

// ============================================
// BUSINESS LOOKUP (Google Places mock)
// ============================================
type BusinessLookupResult = {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  type: string;
  photoUrl?: string;
  address: string;
};

// Mock business database - simulates Google Places API results
// In production, this would call /api/business-lookup which hits Google Places
const MOCK_BUSINESSES: Record<string, BusinessLookupResult> = {
  'cubita': {
    name: 'Cubita Café',
    location: 'Jersey City, NJ',
    rating: 4.7,
    reviewCount: 127,
    type: 'restaurant',
    address: '270 Grove St, Jersey City, NJ 07302',
  },
  'cubita café': {
    name: 'Cubita Café',
    location: 'Jersey City, NJ',
    rating: 4.7,
    reviewCount: 127,
    type: 'restaurant',
    address: '270 Grove St, Jersey City, NJ 07302',
  },
  'cubita cafe': {
    name: 'Cubita Café',
    location: 'Jersey City, NJ',
    rating: 4.7,
    reviewCount: 127,
    type: 'restaurant',
    address: '270 Grove St, Jersey City, NJ 07302',
  },
  "joey's auto": {
    name: "Joey's Auto Service",
    location: 'Newark, NJ',
    rating: 4.5,
    reviewCount: 89,
    type: 'other',
    address: '123 Market St, Newark, NJ 07102',
  },
  'glow studio': {
    name: 'Glow Beauty Studio',
    location: 'Hoboken, NJ',
    rating: 4.9,
    reviewCount: 203,
    type: 'salon',
    address: '456 Washington St, Hoboken, NJ 07030',
  },
  'hudson realty': {
    name: 'Hudson County Realty',
    location: 'Jersey City, NJ',
    rating: 4.3,
    reviewCount: 45,
    type: 'realestate',
    address: '789 Newark Ave, Jersey City, NJ 07306',
  },
};

// Simulates Google Places API lookup
const lookupBusiness = async (query: string): Promise<BusinessLookupResult | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const normalizedQuery = query.toLowerCase().trim();

  // Check for exact or partial matches
  for (const [key, business] of Object.entries(MOCK_BUSINESSES)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      return business;
    }
  }

  return null;
};

// Automation scenarios - concrete before/after examples
const AUTOMATION_SCENARIOS: Record<string, {
  logo: string;
  logoAlt: string;
  scenario: string;
  before: string;
  after: string;
  metric: string;
}[]> = {
  restaurant: [
    {
      logo: getLogo('google.com'),
      logoAlt: 'Google',
      scenario: 'Missed Call Recovery',
      before: 'Customer calls at 6pm, you\'re busy → they call your competitor',
      after: 'Auto-text in 30 seconds: "Thanks for calling! We\'ll get back to you ASAP"',
      metric: '5 calls saved this week',
    },
    {
      logo: getLogo('google.com'),
      logoAlt: 'Google',
      scenario: 'Review Generation',
      before: 'Great customers leave without reviewing',
      after: 'Next-day text: "Thanks for visiting! Mind leaving us a quick review?"',
      metric: '12 new reviews this month',
    },
  ],
  salon: [
    {
      logo: getLogo('google.com'),
      logoAlt: 'Google',
      scenario: 'No-Show Prevention',
      before: 'Client forgets appointment → empty chair, lost revenue',
      after: '24hr + 2hr reminders with easy reschedule link',
      metric: '3 no-shows prevented this week',
    },
    {
      logo: getLogo('instagram.com'),
      logoAlt: 'Instagram',
      scenario: 'Rebooking Prompts',
      before: 'Clients forget to book their next appointment',
      after: 'Auto-text at 3 weeks: "Ready for your next appointment?"',
      metric: '8 rebookings this month',
    },
  ],
  realestate: [
    {
      logo: getLogo('google.com'),
      logoAlt: 'Google',
      scenario: 'Lead Response',
      before: 'New inquiry sits in inbox for hours → lead goes cold',
      after: 'Instant response: "Thanks for your interest! I\'ll call you within the hour"',
      metric: '15 leads captured this week',
    },
    {
      logo: getLogo('zillow.com'),
      logoAlt: 'Zillow',
      scenario: 'Showing Confirmations',
      before: 'Buyers forget showing times → wasted drive',
      after: 'Auto-confirm 24hrs before + send directions',
      metric: '0 no-shows this month',
    },
  ],
  freelancer: [
    {
      logo: getLogo('stripe.com'),
      logoAlt: 'Stripe',
      scenario: 'Invoice Follow-up',
      before: 'Awkwardly chasing payments manually',
      after: 'Friendly auto-reminder at 7, 14, 30 days',
      metric: '$2,400 collected faster',
    },
    {
      logo: getLogo('calendly.com'),
      logoAlt: 'Calendly',
      scenario: 'Meeting Prep',
      before: 'Clients show up unprepared → wasted time',
      after: 'Auto-send prep doc + reminder 1hr before',
      metric: '100% prepared meetings',
    },
  ],
  other: [
    {
      logo: getLogo('google.com'),
      logoAlt: 'Google',
      scenario: 'Missed Call Recovery',
      before: 'Missed call = lost customer',
      after: 'Auto-text in 30 seconds captures the lead',
      metric: '5 leads saved this week',
    },
    {
      logo: getLogo('google.com'),
      logoAlt: 'Google',
      scenario: 'Review Requests',
      before: 'Happy customers never leave reviews',
      after: 'Auto-request after every transaction',
      metric: '15 new reviews this month',
    },
  ],
};

// ============================================
// COMPONENT
// ============================================

// Wrap in Suspense for useSearchParams (Next.js 14+ requirement)
export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        background: '#0a0a0a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Loader2 size={32} color="#F2A900" className="animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [connectingTool, setConnectingTool] = useState<string | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState<{
    step: number;
    businessName: string;
    businessType: string;
    location: string;
    painPoints: string[];
  } | null>(null);
  const [showToolToast, setShowToolToast] = useState(false);
  const [pendingBusinessType, setPendingBusinessType] = useState('');

  // Business lookup state
  const [isSearching, setIsSearching] = useState(false);
  const [businessLookup, setBusinessLookup] = useState<BusinessLookupResult | null>(null);
  const [lookupConfirmed, setLookupConfirmed] = useState(false);

  // White-glove tracking
  const [whiteGloveClicked, setWhiteGloveClicked] = useState(false);
  const [showWhiteGloveToast, setShowWhiteGloveToast] = useState(false);

  // Check for saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (saved) {
        const progress = JSON.parse(saved);
        // Only show resume modal if they got past step 0 (welcome screen)
        if (progress.step > 0) {
          setSavedProgress(progress);
          setShowResumeModal(true);
        }
      }
    } catch {
      // Invalid data, clear it
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  }, []);

  // Save progress after each meaningful step change
  useEffect(() => {
    // Only save if we've started (past welcome screen)
    if (step > 0 && !showMagic) {
      const progress = {
        step,
        businessName,
        businessType,
        location,
        painPoints,
      };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
    }
    // Clear progress when they complete onboarding (showMagic = done)
    if (showMagic) {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  }, [step, businessName, businessType, location, painPoints, showMagic]);

  // Resume from saved progress
  const handleResume = () => {
    if (savedProgress) {
      setStep(savedProgress.step);
      setBusinessName(savedProgress.businessName);
      setBusinessType(savedProgress.businessType);
      setLocation(savedProgress.location);
      setPainPoints(savedProgress.painPoints);
    }
    setShowResumeModal(false);
  };

  // Start fresh - clear saved progress
  const handleStartFresh = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setSavedProgress(null);
    setShowResumeModal(false);
  };

  // Auto-transition from celebration to Magic Moment after 2.5s
  // Skips the domain step - domain setup happens in dashboard
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
        setShowMagic(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  // Handle tool toast - show for 4s, then transition to pain points (step 3)
  // Increased from 2s to give users time to absorb the integration flow
  // Location step removed - we detect location from business name lookup
  useEffect(() => {
    if (showToolToast && pendingBusinessType) {
      const timer = setTimeout(() => {
        setShowToolToast(false);
        setBusinessType(pendingBusinessType);
        setPendingBusinessType('');
        setStep(3); // Go directly to pain points (was step 4, now step 3)
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToolToast, pendingBusinessType]);

  // Auto-hide white-glove toast after 4 seconds
  useEffect(() => {
    if (showWhiteGloveToast) {
      const timer = setTimeout(() => {
        setShowWhiteGloveToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showWhiteGloveToast]);

  // Handle white-glove Calendly click
  const handleWhiteGloveClick = () => {
    setWhiteGloveClicked(true);
    setShowWhiteGloveToast(true);
    // Store in localStorage so Magic Moment knows
    localStorage.setItem('arugami_white_glove_requested', 'true');
    // Open Calendly in new tab
    window.open('https://calendly.com/arugami/setup', '_blank');
  };

  // Debounced business lookup when user types business name
  useEffect(() => {
    if (businessName.length < 3) {
      setBusinessLookup(null);
      setLookupConfirmed(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const result = await lookupBusiness(businessName);
      setBusinessLookup(result);
      setIsSearching(false);

      // Auto-fill location if found
      if (result) {
        setLocation(result.location);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [businessName]);

  // Handler for confirming business lookup - shows tool toast then advances to Pain Points
  const handleConfirmBusiness = () => {
    if (businessLookup) {
      setBusinessName(businessLookup.name);
      setLocation(businessLookup.location);
      setLookupConfirmed(true);
      // Auto-select business type if we detected it
      if (businessLookup.type && BUSINESS_TYPES.find(t => t.id === businessLookup.type)) {
        // Show the tool toast with integration logos (same as manual business type selection)
        // This ensures known businesses see the cool visual too!
        setPendingBusinessType(businessLookup.type);
        setShowToolToast(true);
        // Tool toast will auto-advance to Pain Points after 4 seconds (see useEffect)
      }
    }
  };

  // Calculate total steps based on whether we detected the business
  // If business was found + confirmed, we skip the type selection step (2 steps total)
  // If not found, we need them to select type manually (3 steps total)
  const totalSteps = lookupConfirmed && businessLookup?.type ? 2 : 3;

  // Handler for business type selection
  const handleBusinessTypeSelect = (typeId: string) => {
    setPendingBusinessType(typeId);
    setShowToolToast(true);
  };

  // Handle OAuth callback - check if we just connected a tool
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    
    if (connected && !selectedTools.includes(connected)) {
      // Tool was just connected via OAuth
      setSelectedTools(prev => [...prev, connected]);
      setStep(5); // Make sure we're on tools step
      // Clear URL params
      router.replace('/onboarding', { scroll: false });
    }
    
    if (error) {
      console.error('OAuth error:', error, searchParams.get('provider'));
      // Could show a toast/notification here
      router.replace('/onboarding', { scroll: false });
    }
  }, [searchParams, selectedTools, router]);

  // Initiate OAuth flow for a tool
  const connectWithOAuth = (toolId: string) => {
    setConnectingTool(toolId);
    // Redirect to our OAuth authorize endpoint
    // It will redirect to the provider, then back to us with ?connected=toolId
    window.location.href = `/api/oauth/${toolId}/authorize?returnTo=/onboarding&clientId=onboarding`;
  };

  // Handle tool click based on type
  const handleToolClick = (toolId: string) => {
    if (selectedTools.includes(toolId)) return;
    
    if (OAUTH_SUPPORTED.includes(toolId)) {
      // OAuth tool - redirect to auth
      connectWithOAuth(toolId);
    } else if (BROWSER_USE_TOOLS.includes(toolId)) {
      // Social media - mark for later setup
      // For now, just show as "will connect later"
      setSelectedTools(prev => [...prev, toolId]);
    } else {
      // Unknown tool - simulate connection (fallback)
      setIsConnecting(true);
      setTimeout(() => {
        setSelectedTools(prev => [...prev, toolId]);
        setIsConnecting(false);
      }, 1500);
    }
  };

  // Steps content
  const renderStep = () => {
    switch (step) {
      case 0: // Welcome - Grid Activation
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Animated Grid Background */}
            <div style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none'
            }}>
              {/* Horizontal grid lines */}
              {[...Array(10)].map((_, i) => (
                <div
                  key={`h-${i}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${(i + 1) * 10}%`,
                    height: 1,
                    background: `linear-gradient(90deg, transparent 0%, ${BRAND.utilitySlate}30 20%, ${BRAND.utilitySlate}30 80%, transparent 100%)`
                  }}
                />
              ))}

              {/* Vertical grid lines */}
              {[...Array(14)].map((_, i) => (
                <div
                  key={`v-${i}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${(i + 1) * 7}%`,
                    width: 1,
                    background: `linear-gradient(180deg, transparent 0%, ${BRAND.utilitySlate}30 20%, ${BRAND.utilitySlate}30 80%, transparent 100%)`
                  }}
                />
              ))}

              {/* Energy pulse lines - horizontal */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  top: '30%',
                  left: 0,
                  width: '30%',
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${BRAND.amber}60, ${BRAND.amber}, ${BRAND.amber}60, transparent)`,
                  filter: 'blur(1px)'
                }}
              />
              <motion.div
                animate={{ x: ['200%', '-100%'] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear', delay: 2 }}
                style={{
                  position: 'absolute',
                  top: '60%',
                  left: 0,
                  width: '25%',
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${BRAND.teal}60, ${BRAND.teal}, ${BRAND.teal}60, transparent)`,
                  filter: 'blur(1px)'
                }}
              />

              {/* Energy pulse lines - vertical */}
              <motion.div
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear', delay: 1 }}
                style={{
                  position: 'absolute',
                  left: '21%',
                  top: 0,
                  height: '30%',
                  width: 1,
                  background: `linear-gradient(180deg, transparent, ${BRAND.teal}60, ${BRAND.teal}, ${BRAND.teal}60, transparent)`,
                  filter: 'blur(1px)'
                }}
              />
              <motion.div
                animate={{ y: ['200%', '-100%'] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear', delay: 4 }}
                style={{
                  position: 'absolute',
                  left: '77%',
                  top: 0,
                  height: '25%',
                  width: 1,
                  background: `linear-gradient(180deg, transparent, ${BRAND.amber}60, ${BRAND.amber}, ${BRAND.amber}60, transparent)`,
                  filter: 'blur(1px)'
                }}
              />

              {/* Grid intersection nodes */}
              {[
                { x: 21, y: 30, color: BRAND.teal, delay: 0 },
                { x: 49, y: 50, color: BRAND.amber, delay: 1 },
                { x: 70, y: 20, color: BRAND.teal, delay: 2 },
                { x: 35, y: 70, color: BRAND.amber, delay: 0.5 },
                { x: 84, y: 60, color: BRAND.teal, delay: 1.5 },
                { x: 14, y: 60, color: BRAND.amber, delay: 2.5 },
                { x: 63, y: 80, color: BRAND.teal, delay: 3 },
              ].map((node, i) => (
                <motion.div
                  key={`node-${i}`}
                  animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.3, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: node.delay }}
                  style={{
                    position: 'absolute',
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: node.color,
                    boxShadow: `0 0 10px ${node.color}50`
                  }}
                />
              ))}
            </div>

            {/* Progress Indicator - Step dots at top */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                position: 'absolute',
                top: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8,
                zIndex: 20
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  style={{
                    width: i === 0 ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === 0 ? BRAND.amber : BRAND.utilitySlate,
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </motion.div>

            {/* Glow backdrop behind main content */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                height: 500,
                background: `radial-gradient(ellipse at center, ${BRAND.gridCharcoal}ee 0%, ${BRAND.gridCharcoal}cc 30%, transparent 70%)`,
                filter: 'blur(40px)',
                zIndex: 5,
                pointerEvents: 'none'
              }}
            />

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                position: 'relative',
                zIndex: 10,
                textAlign: 'left',
                maxWidth: 560,
                padding: '0 24px'
              }}
            >
              {/* Status indicator bar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 32,
                  padding: '8px 14px',
                  background: BRAND.gridCharcoal,
                  border: `1px solid ${BRAND.utilitySlate}`,
                  borderRadius: 4
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: BRAND.teal,
                      boxShadow: `0 0 8px ${BRAND.teal}`
                    }}
                  />
                  <span style={{
                    color: BRAND.teal,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    fontFamily: 'monospace'
                  }}>
                    Grid Online
                  </span>
                </div>
                <div style={{ width: 1, height: 14, background: BRAND.utilitySlate }} />
                <span style={{
                  color: BRAND.concrete,
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  fontFamily: 'monospace'
                }}>
                  North Jersey
                </span>
              </motion.div>

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 24
                }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 0 0px ${BRAND.amber}00`,
                      `0 0 12px ${BRAND.amber}60`,
                      `0 0 0px ${BRAND.amber}00`
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: BRAND.amber
                  }}
                />
                <span style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: BRAND.concreteLite,
                  letterSpacing: '-0.01em'
                }}>
                  arugami
                </span>
              </motion.div>

              {/* Main headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  fontSize: 44,
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: 16,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1
                }}
              >
                Digital infrastructure
                <br />
                <span style={{ color: BRAND.concrete }}>for your business.</span>
              </motion.h1>

              {/* Subhead */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{
                  fontSize: 17,
                  color: BRAND.concrete,
                  marginBottom: 40,
                  lineHeight: 1.6,
                  maxWidth: 400
                }}
              >
                The grid beneath your business — always on, always handled.
              </motion.p>

              {/* CTA Button - Power Activation Style */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${BRAND.amber}30` }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '16px 28px',
                  background: 'white',
                  color: 'black',
                  fontSize: 15,
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                <Zap size={18} />
                <span>Activate Service</span>
                <ArrowRight size={18} />
              </motion.button>

              {/* Social proof - styled as connection status */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{
                  marginTop: 32,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: BRAND.teal
                      }}
                    />
                  ))}
                </div>
                <span style={{
                  color: BRAND.concrete,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  letterSpacing: 0.5
                }}>
                  50+ businesses connected
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        );

      case 1: // Business Name + Lookup (Grid Connection)
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Animated Grid Background - Dimmer than welcome */}
            <div style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
              opacity: 0.6
            }}>
              {/* Horizontal grid lines */}
              {[...Array(10)].map((_, i) => (
                <div
                  key={`h-${i}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${(i + 1) * 10}%`,
                    height: 1,
                    background: `linear-gradient(90deg, transparent 0%, ${BRAND.utilitySlate}25 20%, ${BRAND.utilitySlate}25 80%, transparent 100%)`
                  }}
                />
              ))}

              {/* Vertical grid lines */}
              {[...Array(14)].map((_, i) => (
                <div
                  key={`v-${i}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${(i + 1) * 7}%`,
                    width: 1,
                    background: `linear-gradient(180deg, transparent 0%, ${BRAND.utilitySlate}25 20%, ${BRAND.utilitySlate}25 80%, transparent 100%)`
                  }}
                />
              ))}

              {/* Scanning pulse - only when searching */}
              {isSearching && (
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    width: '40%',
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${BRAND.amber}80, ${BRAND.amber}, ${BRAND.amber}80, transparent)`,
                    filter: 'blur(2px)',
                    boxShadow: `0 0 20px ${BRAND.amber}60`
                  }}
                />
              )}

              {/* Connection established pulse - when business found */}
              {businessLookup && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 100,
                    height: 100,
                    marginLeft: -50,
                    marginTop: -50,
                    borderRadius: '50%',
                    border: `2px solid ${BRAND.teal}`,
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* Grid nodes - more active when searching */}
              {[
                { x: 21, y: 30, delay: 0 },
                { x: 49, y: 50, delay: 0.5 },
                { x: 70, y: 20, delay: 1 },
                { x: 35, y: 70, delay: 0.3 },
                { x: 84, y: 60, delay: 0.8 },
                { x: 14, y: 60, delay: 1.2 },
              ].map((node, i) => (
                <motion.div
                  key={`node-${i}`}
                  animate={{
                    opacity: isSearching ? [0.3, 1, 0.3] : [0.15, 0.4, 0.15],
                    scale: isSearching ? [1, 1.5, 1] : [1, 1.2, 1]
                  }}
                  transition={{ duration: isSearching ? 0.8 : 3, repeat: Infinity, delay: node.delay }}
                  style={{
                    position: 'absolute',
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: businessLookup ? BRAND.teal : BRAND.amber,
                    boxShadow: `0 0 8px ${businessLookup ? BRAND.teal : BRAND.amber}40`
                  }}
                />
              ))}
            </div>

            {/* Progress Indicator - Step 2 active */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                position: 'absolute',
                top: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8,
                zIndex: 20
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  style={{
                    width: i === 1 ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === 1 ? BRAND.amber : i < 1 ? BRAND.teal : BRAND.utilitySlate,
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </motion.div>

            {/* Glow backdrop behind main content */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 550,
                height: 450,
                background: `radial-gradient(ellipse at center, ${BRAND.gridCharcoal}f0 0%, ${BRAND.gridCharcoal}cc 35%, transparent 70%)`,
                filter: 'blur(30px)',
                zIndex: 5,
                pointerEvents: 'none'
              }}
            />

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: 480,
                padding: '0 24px'
              }}
            >
              {/* Status indicator - changes based on state */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 24,
                  padding: '6px 12px',
                  background: BRAND.gridCharcoal,
                  border: `1px solid ${businessLookup ? BRAND.teal : BRAND.utilitySlate}`,
                  borderRadius: 4,
                  transition: 'border-color 0.3s'
                }}
              >
                <motion.div
                  animate={isSearching ? { opacity: [1, 0.3, 1] } : { opacity: [1, 0.5, 1] }}
                  transition={{ duration: isSearching ? 0.5 : 2, repeat: Infinity }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: businessLookup ? BRAND.teal : BRAND.amber,
                    boxShadow: `0 0 6px ${businessLookup ? BRAND.teal : BRAND.amber}`
                  }}
                />
                <span style={{
                  color: businessLookup ? BRAND.teal : BRAND.concrete,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  fontFamily: 'monospace'
                }}>
                  {isSearching ? 'Scanning Grid...' : businessLookup ? 'Signal Locked' : 'Ready to Scan'}
                </span>
              </motion.div>

              {/* Main headline */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: 12,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15
                }}
              >
                Let's connect your business
                <br />
                <span style={{ color: BRAND.concrete }}>to the grid.</span>
              </motion.h2>

              {/* Subhead */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  fontSize: 15,
                  color: BRAND.concrete,
                  marginBottom: 32,
                  lineHeight: 1.5
                }}
              >
                We'll locate you and configure your infrastructure automatically.
              </motion.p>

              {/* Scanner-style input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  position: 'relative',
                  marginBottom: 24,
                  background: `${BRAND.utilitySlate}20`,
                  borderRadius: 8,
                  border: `1px solid ${businessLookup ? BRAND.teal : isSearching ? BRAND.amber : BRAND.utilitySlate}50`,
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                  boxShadow: isSearching ? `0 0 20px ${BRAND.amber}15` : businessLookup ? `0 0 20px ${BRAND.teal}15` : 'none'
                }}
              >
                {/* Input field */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px' }}>
                  {/* Animated indicator */}
                  <motion.div
                    animate={isSearching ? {
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.5, 1]
                    } : {
                      scale: 1,
                      opacity: 1
                    }}
                    transition={{ duration: 0.6, repeat: isSearching ? Infinity : 0 }}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: businessLookup ? BRAND.teal : BRAND.amber,
                      boxShadow: `0 0 10px ${businessLookup ? BRAND.teal : BRAND.amber}60`,
                      marginRight: 12,
                      flexShrink: 0
                    }}
                  />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search for your business..."
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      setLookupConfirmed(false);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && businessName && setStep(2)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      padding: '14px 0',
                      fontSize: 17,
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                  {isSearching && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 18,
                        height: 18,
                        border: `2px solid ${BRAND.amber}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        marginLeft: 12
                      }}
                    />
                  )}
                </div>

                {/* Scan line animation inside input */}
                {isSearching && (
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '30%',
                      height: 2,
                      background: `linear-gradient(90deg, transparent, ${BRAND.amber}, transparent)`,
                      borderRadius: 1
                    }}
                  />
                )}
              </motion.div>

              {/* Business Found Card - Connection established */}
              <AnimatePresence>
                {businessLookup && !lookupConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20 }}
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.gridCharcoal} 0%, ${BRAND.utilitySlate}30 100%)`,
                      borderRadius: 12,
                      padding: 20,
                      marginBottom: 24,
                      border: `1px solid ${BRAND.teal}40`,
                      boxShadow: `0 0 30px ${BRAND.teal}10`
                    }}
                  >
                    {/* Status badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px',
                      background: `${BRAND.teal}15`,
                      borderRadius: 4,
                      marginBottom: 14
                    }}>
                      <motion.div
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: BRAND.teal,
                          boxShadow: `0 0 6px ${BRAND.teal}`
                        }}
                      />
                      <span style={{
                        color: BRAND.teal,
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        fontFamily: 'monospace'
                      }}>
                        Signal Acquired
                      </span>
                    </div>

                    {/* Business info */}
                    <h3 style={{ color: 'white', fontSize: 20, fontWeight: 600, margin: 0, marginBottom: 4 }}>
                      {businessLookup.name}
                    </h3>
                    <p style={{ color: BRAND.concrete, fontSize: 13, margin: 0, marginBottom: 12 }}>
                      {businessLookup.address}
                    </p>

                    {/* Rating row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={13} fill={BRAND.amber} color={BRAND.amber} />
                        <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>
                          {businessLookup.rating}
                        </span>
                      </div>
                      <span style={{ color: BRAND.concrete, fontSize: 12 }}>
                        ({businessLookup.reviewCount} reviews)
                      </span>
                      <span style={{ color: BRAND.utilitySlate }}>·</span>
                      <span style={{ color: BRAND.concrete, fontSize: 12 }}>
                        {businessLookup.location}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmBusiness}
                        style={{
                          flex: 1,
                          padding: '12px 18px',
                          background: BRAND.teal,
                          color: 'black',
                          fontSize: 14,
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8
                        }}
                      >
                        <Zap size={15} />
                        Connect this business
                      </motion.button>
                      <button
                        onClick={() => setBusinessLookup(null)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 8,
                          background: 'transparent',
                          color: BRAND.concrete,
                          fontSize: 13,
                          fontWeight: 500,
                          border: `1px solid ${BRAND.utilitySlate}`,
                          cursor: 'pointer'
                        }}
                      >
                        Not me
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirmed state - compact connected display */}
              {lookupConfirmed && businessLookup && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    background: `${BRAND.teal}10`,
                    borderRadius: 8,
                    marginBottom: 24,
                    border: `1px solid ${BRAND.teal}30`
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap size={16} color={BRAND.teal} />
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>
                      {businessLookup.name}
                    </span>
                    <span style={{ color: BRAND.teal, fontSize: 13, fontFamily: 'monospace' }}> · Connected</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={11} color={BRAND.amber} fill={BRAND.amber} />
                    <span style={{ color: BRAND.amber, fontSize: 12, fontWeight: 600 }}>
                      {businessLookup.rating}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Manual entry hint */}
              {businessName && !businessLookup && !isSearching && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: BRAND.concrete, fontSize: 13, marginBottom: 20 }}
                >
                  Can't find your business? No problem — we'll set you up manually.
                </motion.p>
              )}

              {/* Navigation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}
              >
                <button
                  onClick={() => setStep(0)}
                  style={{
                    color: BRAND.concrete,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 14,
                    padding: '8px 0'
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <motion.button
                  whileHover={businessName ? { scale: 1.02 } : {}}
                  whileTap={businessName ? { scale: 0.98 } : {}}
                  disabled={!businessName}
                  onClick={() => {
                    if (lookupConfirmed && businessLookup?.type) {
                      setStep(3);
                    } else {
                      setStep(2);
                    }
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 8,
                    background: businessName ? BRAND.amber : BRAND.utilitySlate,
                    color: businessName ? 'black' : BRAND.concrete,
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: businessName ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  Next <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        );

      case 2: // Business Type (only shown if we didn't detect from lookup)
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-xl w-full"
          >
            <div style={{ marginBottom: 32 }}>
              <span style={{ color: BRAND.amber, fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Step 2 of {totalSteps}</span>
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 12 }}>
              Nice to meet you, {businessName}.
            </h2>
            <p style={{ fontSize: 18, color: BRAND.textMuted, marginBottom: 8 }}>
              Got it. What do you do?
            </p>
            <p style={{ fontSize: 13, color: BRAND.concrete, marginBottom: 32 }}>
              We'll show you features that matter for your business.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 40 }}>
              {BUSINESS_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleBusinessTypeSelect(type.id)}
                    style={{
                      padding: '20px',
                      borderRadius: 16,
                      background: BRAND.lightGray,
                      border: '1px solid transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#333';
                      e.currentTarget.style.borderColor = BRAND.amber;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = BRAND.lightGray;
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <Icon size={24} color={BRAND.amber} />
                    <span style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>{type.label}</span>
                  </button>
                );
              })}
            </div>
            
            <button onClick={() => setStep(1)} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
               <ArrowLeft size={16} /> Back
            </button>
          </motion.div>
        );

      // Location step removed - we detect location from business name lookup
      // See: lookupBusiness() and "We found you!" card in step 1

      case 3: // Pain Points (final step) - System Configuration
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Animated Grid Background - Subtle */}
            <div style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
              opacity: 0.5
            }}>
              {/* Horizontal grid lines */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={`h-${i}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${(i + 1) * 8}%`,
                    height: 1,
                    background: `linear-gradient(90deg, transparent 0%, ${BRAND.utilitySlate}20 20%, ${BRAND.utilitySlate}20 80%, transparent 100%)`
                  }}
                />
              ))}

              {/* Vertical grid lines */}
              {[...Array(16)].map((_, i) => (
                <div
                  key={`v-${i}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${(i + 1) * 6}%`,
                    width: 1,
                    background: `linear-gradient(180deg, transparent 0%, ${BRAND.utilitySlate}20 20%, ${BRAND.utilitySlate}20 80%, transparent 100%)`
                  }}
                />
              ))}

              {/* Grid nodes that light up based on selections */}
              {[
                { x: 18, y: 25, index: 0 },
                { x: 42, y: 35, index: 1 },
                { x: 66, y: 20, index: 2 },
                { x: 30, y: 65, index: 3 },
                { x: 78, y: 55, index: 4 },
                { x: 12, y: 50, index: 0 },
                { x: 54, y: 75, index: 2 },
                { x: 84, y: 30, index: 1 },
              ].map((node, i) => (
                <motion.div
                  key={`node-${i}`}
                  animate={{
                    opacity: painPoints.length > node.index % 5 ? [0.4, 1, 0.4] : [0.1, 0.25, 0.1],
                    scale: painPoints.length > node.index % 5 ? [1, 1.4, 1] : [1, 1.1, 1]
                  }}
                  transition={{ duration: painPoints.length > node.index % 5 ? 1.5 : 4, repeat: Infinity, delay: i * 0.3 }}
                  style={{
                    position: 'absolute',
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: painPoints.length > node.index % 5 ? BRAND.teal : BRAND.utilitySlate,
                    boxShadow: painPoints.length > node.index % 5 ? `0 0 12px ${BRAND.teal}60` : 'none',
                    transition: 'background 0.3s, box-shadow 0.3s'
                  }}
                />
              ))}

              {/* Connection lines when systems are active */}
              {painPoints.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(ellipse at 50% 50%, ${BRAND.teal}08 0%, transparent 50%)`,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>

            {/* Progress Indicator - Step 3 active (or step 2 if skipped type) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                position: 'absolute',
                top: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8,
                zIndex: 20
              }}
            >
              {[0, 1, 2, 3].map((i) => {
                const activeStep = totalSteps === 2 ? 2 : 3;
                const isActive = i === (totalSteps === 2 ? 2 : 3);
                const isComplete = i < (totalSteps === 2 ? 2 : 3);
                return (
                  <motion.div
                    key={i}
                    style={{
                      width: isActive ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: isActive ? BRAND.amber : isComplete ? BRAND.teal : BRAND.utilitySlate,
                      transition: 'all 0.3s ease'
                    }}
                  />
                );
              })}
            </motion.div>

            {/* Glow backdrop */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 650,
                height: 600,
                background: `radial-gradient(ellipse at center, ${BRAND.gridCharcoal}f5 0%, ${BRAND.gridCharcoal}dd 30%, transparent 65%)`,
                filter: 'blur(40px)',
                zIndex: 5,
                pointerEvents: 'none'
              }}
            />

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: 520,
                padding: '0 24px'
              }}
            >
              {/* Status indicator - shows active systems count */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                  padding: '6px 12px',
                  background: BRAND.gridCharcoal,
                  border: `1px solid ${painPoints.length > 0 ? BRAND.teal : BRAND.utilitySlate}`,
                  borderRadius: 4,
                  transition: 'border-color 0.3s'
                }}
              >
                <motion.div
                  animate={painPoints.length > 0 ? { opacity: [1, 0.4, 1] } : { opacity: 0.5 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: painPoints.length > 0 ? BRAND.teal : BRAND.concrete,
                    boxShadow: painPoints.length > 0 ? `0 0 6px ${BRAND.teal}` : 'none'
                  }}
                />
                <span style={{
                  color: painPoints.length > 0 ? BRAND.teal : BRAND.concrete,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  fontFamily: 'monospace'
                }}>
                  {painPoints.length === 0 ? 'Select Systems' : `${painPoints.length} System${painPoints.length > 1 ? 's' : ''} Active`}
                </span>
              </motion.div>

              {/* Main headline */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: 10,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                {businessName ? `${businessName.split(' ')[0]}, what's been hard?` : "What's been hard lately?"}
              </motion.h2>

              {/* Subhead */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  fontSize: 15,
                  color: BRAND.concrete,
                  marginBottom: 28,
                  lineHeight: 1.5
                }}
              >
                Select your pain points. We'll activate the right automations.
              </motion.p>

              {/* Pain point system toggles */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}
              >
                {PAIN_POINTS.map((point, idx) => {
                  const Icon = point.icon;
                  const isSelected = painPoints.includes(point.id);
                  return (
                    <motion.div
                      key={point.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.05 }}
                      layout
                      style={{
                        borderRadius: 10,
                        background: isSelected ? `${BRAND.teal}12` : `${BRAND.utilitySlate}30`,
                        border: `1px solid ${isSelected ? BRAND.teal + '50' : 'transparent'}`,
                        overflow: 'hidden',
                        transition: 'all 0.25s ease',
                        boxShadow: isSelected ? `0 0 20px ${BRAND.teal}10` : 'none'
                      }}
                    >
                      <button
                        onClick={() => {
                          if (isSelected) setPainPoints(prev => prev.filter(p => p !== point.id));
                          else setPainPoints(prev => [...prev, point.id]);
                        }}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14
                        }}
                      >
                        {/* Toggle indicator */}
                        <motion.div
                          animate={isSelected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: `2px solid ${isSelected ? BRAND.teal : BRAND.utilitySlate}`,
                            background: isSelected ? BRAND.teal : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? `0 0 10px ${BRAND.teal}40` : 'none'
                          }}
                        >
                          {isSelected && <Check size={14} color="black" strokeWidth={3} />}
                        </motion.div>

                        {/* Icon */}
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: isSelected ? `${BRAND.amber}15` : `${BRAND.utilitySlate}50`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'background 0.2s'
                        }}>
                          <Icon size={16} color={isSelected ? BRAND.amber : BRAND.concrete} />
                        </div>

                        {/* Label */}
                        <span style={{
                          color: isSelected ? 'white' : BRAND.concreteLite,
                          fontSize: 15,
                          fontWeight: 500,
                          flex: 1,
                          transition: 'color 0.2s'
                        }}>
                          {point.label}
                        </span>

                        {/* Active indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                              padding: '3px 8px',
                              background: `${BRAND.teal}20`,
                              borderRadius: 4
                            }}
                          >
                            <span style={{
                              color: BRAND.teal,
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              fontFamily: 'monospace'
                            }}>
                              Active
                            </span>
                          </motion.div>
                        )}
                      </button>

                      {/* Reveal automations when selected */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{
                              padding: '0 16px 14px 68px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6
                            }}>
                              <span style={{
                                color: BRAND.concrete,
                                fontSize: 10,
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                marginBottom: 4
                              }}>
                                Automations enabled:
                              </span>
                              {point.automations.map((auto, autoIdx) => (
                                <motion.div
                                  key={auto}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: autoIdx * 0.1 }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                  }}
                                >
                                  <Zap size={11} color={BRAND.amber} />
                                  <span style={{ color: BRAND.amber, fontSize: 13, fontWeight: 500 }}>
                                    {auto}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* White-glove option - Managed Service */}
              {(businessType === 'restaurant' || businessType === 'other') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  style={{
                    padding: 16,
                    background: `linear-gradient(135deg, ${BRAND.gridCharcoal} 0%, ${BRAND.utilitySlate}20 100%)`,
                    borderRadius: 10,
                    border: `1px solid ${BRAND.teal}30`,
                    marginBottom: 24
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${BRAND.teal} 0%, ${BRAND.teal}cc 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 0 15px ${BRAND.teal}30`
                    }}>
                      <Phone size={18} color="black" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: 0, marginBottom: 2 }}>
                        Want us to handle everything?
                      </p>
                      <p style={{ color: BRAND.concrete, fontSize: 12, margin: 0 }}>
                        We'll configure your entire grid. No tech skills needed.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleWhiteGloveClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '10px 14px',
                        background: BRAND.teal,
                        color: 'black',
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      Book Call <ArrowRight size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Navigation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <button
                  onClick={() => setStep(totalSteps === 2 ? 1 : 2)}
                  style={{
                    color: BRAND.concrete,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 14,
                    padding: '8px 0'
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <motion.button
                  whileHover={painPoints.length > 0 ? { scale: 1.02 } : {}}
                  whileTap={painPoints.length > 0 ? { scale: 0.98 } : {}}
                  disabled={painPoints.length === 0}
                  onClick={() => setShowCelebration(true)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 8,
                    background: painPoints.length > 0 ? BRAND.amber : BRAND.utilitySlate,
                    color: painPoints.length > 0 ? 'black' : BRAND.concrete,
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: painPoints.length > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  Activate Grid <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        );

      // Domain step removed - domain setup now happens in dashboard settings
      // See MASTER TODO: "arugami Client Onboarding (No Lock-In) — REBUILD"
    }
  };

  // Helper to get pain point labels
  const getPainPointLabel = (id: string) => {
    const point = PAIN_POINTS.find(p => p.id === id);
    return point?.label || id;
  };

  // Celebration moment (between step 4 and 5)
  if (showCelebration) {
    return (
      <div style={{
        minHeight: '100vh',
        background: BRAND.dark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Grid Background - Power surge effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          {/* Grid lines */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`h-${i}`}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${(i + 1) * 10}%`,
                height: 1,
                background: `linear-gradient(90deg, transparent 0%, ${BRAND.utilitySlate}30 20%, ${BRAND.utilitySlate}30 80%, transparent 100%)`
              }}
            />
          ))}
          {[...Array(14)].map((_, i) => (
            <div
              key={`v-${i}`}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${(i + 1) * 7}%`,
                width: 1,
                background: `linear-gradient(180deg, transparent 0%, ${BRAND.utilitySlate}30 20%, ${BRAND.utilitySlate}30 80%, transparent 100%)`
              }}
            />
          ))}

          {/* Power surge pulse - radiating from center */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 200,
              height: 200,
              marginLeft: -100,
              marginTop: -100,
              borderRadius: '50%',
              border: `2px solid ${BRAND.teal}`,
              pointerEvents: 'none'
            }}
          />
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 200,
              height: 200,
              marginLeft: -100,
              marginTop: -100,
              borderRadius: '50%',
              border: `2px solid ${BRAND.teal}`,
              pointerEvents: 'none'
            }}
          />

          {/* Grid nodes activating in sequence */}
          {[
            { x: 21, y: 30, delay: 0.2 },
            { x: 49, y: 20, delay: 0.4 },
            { x: 70, y: 40, delay: 0.3 },
            { x: 35, y: 70, delay: 0.5 },
            { x: 77, y: 65, delay: 0.6 },
            { x: 14, y: 50, delay: 0.35 },
            { x: 63, y: 80, delay: 0.7 },
            { x: 28, y: 25, delay: 0.45 },
            { x: 84, y: 30, delay: 0.55 },
            { x: 42, y: 55, delay: 0.25 },
          ].map((node, i) => (
            <motion.div
              key={`node-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.6], scale: [0, 1.5, 1] }}
              transition={{ duration: 0.8, delay: node.delay }}
              style={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: BRAND.teal,
                boxShadow: `0 0 15px ${BRAND.teal}80`
              }}
            />
          ))}
        </div>

        {/* Glow backdrop */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 400,
            background: `radial-gradient(ellipse at center, ${BRAND.gridCharcoal}f0 0%, ${BRAND.gridCharcoal}cc 30%, transparent 70%)`,
            filter: 'blur(40px)',
            zIndex: 5,
            pointerEvents: 'none'
          }}
        />

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: 400,
            width: '100%',
            textAlign: 'center'
          }}
        >
          {/* Checkmark with pulse effect */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              position: 'relative',
              width: 72,
              height: 72,
              margin: '0 auto 28px'
            }}
          >
            {/* Pulse rings */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                border: `2px solid ${BRAND.teal}40`
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              style={{
                position: 'absolute',
                inset: -16,
                borderRadius: '50%',
                border: `1px solid ${BRAND.teal}30`
              }}
            />
            {/* Main checkmark circle */}
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: BRAND.teal,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 30px ${BRAND.teal}50`
              }}
            >
              <Check size={36} color="black" strokeWidth={3} />
            </div>
          </motion.div>

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: `${BRAND.teal}15`,
              borderRadius: 4,
              marginBottom: 20,
              border: `1px solid ${BRAND.teal}30`
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: BRAND.teal,
                boxShadow: `0 0 6px ${BRAND.teal}`
              }}
            />
            <span style={{
              color: BRAND.teal,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontFamily: 'monospace'
            }}>
              Systems Configured
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 20 }}
          >
            Got it.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: 14, color: BRAND.concrete, marginBottom: 24 }}
          >
            Activating your automations:
          </motion.p>

          {/* Activated systems list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {painPoints.slice(0, 3).map((pointId, i) => (
              <motion.div
                key={pointId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 16px',
                  background: `${BRAND.utilitySlate}50`,
                  borderRadius: 8,
                  border: `1px solid ${BRAND.teal}30`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.15, type: 'spring' }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: BRAND.teal,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={12} color="black" strokeWidth={3} />
                  </motion.div>
                  <span style={{ color: 'white', fontSize: 14 }}>{getPainPointLabel(pointId)}</span>
                </div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 0.15 }}
                  style={{
                    color: BRAND.teal,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontFamily: 'monospace'
                  }}
                >
                  Online
                </motion.span>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{ fontSize: 13, color: BRAND.concrete, fontFamily: 'monospace' }}
          >
            Finalizing configuration...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Resume Modal - "Welcome back"
  if (showResumeModal && savedProgress) {
    return (
      <div style={{
        minHeight: '100vh',
        background: BRAND.dark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
          style={{ textAlign: 'center' }}
        >
          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: BRAND.amber,
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <span style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: 18,
              color: BRAND.concreteLite,
              letterSpacing: '-0.01em'
            }}>
              arugami
            </span>
          </div>

          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 16 }}>
            Welcome back{savedProgress.businessName ? `, ${savedProgress.businessName}` : ''}.
          </h2>
          <p style={{ fontSize: 18, color: BRAND.textMuted, marginBottom: 40 }}>
            Continue where you left off?
          </p>

          {/* Progress preview */}
          <div style={{
            background: BRAND.utilitySlate,
            borderRadius: 12,
            padding: 20,
            marginBottom: 32,
            textAlign: 'left'
          }}>
            <p style={{ fontSize: 12, color: BRAND.concrete, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Your progress
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {savedProgress.businessName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color={BRAND.teal} />
                  <span style={{ color: BRAND.concreteLite, fontSize: 14 }}>Business: {savedProgress.businessName}</span>
                </div>
              )}
              {savedProgress.businessType && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color={BRAND.teal} />
                  <span style={{ color: BRAND.concreteLite, fontSize: 14 }}>Type: {BUSINESS_TYPES.find(t => t.id === savedProgress.businessType)?.label}</span>
                </div>
              )}
              {savedProgress.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color={BRAND.teal} />
                  <span style={{ color: BRAND.concreteLite, fontSize: 14 }}>Location: {savedProgress.location}</span>
                </div>
              )}
              {savedProgress.painPoints.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color={BRAND.teal} />
                  <span style={{ color: BRAND.concreteLite, fontSize: 14 }}>{savedProgress.painPoints.length} pain point{savedProgress.painPoints.length > 1 ? 's' : ''} selected</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={handleResume}
              style={{
                width: '100%',
                padding: '18px 36px',
                borderRadius: 100,
                background: 'white',
                color: 'black',
                fontSize: 16,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Continue <ArrowRight size={18} />
            </button>

            <button
              onClick={handleStartFresh}
              style={{
                width: '100%',
                padding: '14px 32px',
                borderRadius: 100,
                background: 'transparent',
                color: BRAND.textMuted,
                fontSize: 14,
                fontWeight: 500,
                border: `1px solid ${BRAND.lightGray}`,
                cursor: 'pointer',
              }}
            >
              Start fresh
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Tool Preview Toast - shows integration flow diagram
  if (showToolToast && pendingBusinessType) {
    const tools = TOOLS[pendingBusinessType]?.slice(0, 4) || [];
    const outcomes = [
      { icon: Users, label: 'Leads Captured' },
      { icon: TrendingUp, label: 'Reviews Growing' },
      { icon: Calendar, label: 'Bookings Synced' },
    ];

    return (
      <div style={{
        minHeight: '100vh',
        background: BRAND.dark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <h3 style={{ fontSize: 24, fontWeight: 600, color: 'white', marginBottom: 8 }}>
              {BUSINESS_TYPES.find(t => t.id === pendingBusinessType)?.label}
            </h3>
            <p style={{ fontSize: 14, color: BRAND.concrete }}>
              Your tools, connected and automated
            </p>
          </motion.div>

          {/* Flow Diagram */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            position: 'relative'
          }}>
            {/* Left: Integration Logos */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'flex-end'
            }}>
              {tools.map((tool, i) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <span style={{ fontSize: 12, color: BRAND.concrete, minWidth: 60, textAlign: 'right' }}>
                    {tool.name}
                  </span>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 6,
                  }}>
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 4 }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<span style="font-weight:600;color:#333;font-size:16px">${tool.name[0]}</span>`;
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Connection Lines - Left */}
            <svg width="60" height="200" style={{ overflow: 'visible' }}>
              {tools.map((_, i) => {
                const startY = 22 + i * 56;
                const endY = 100;
                return (
                  <motion.path
                    key={i}
                    d={`M 0 ${startY} Q 30 ${startY} 45 ${endY}`}
                    fill="none"
                    stroke={BRAND.teal}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  />
                );
              })}
              {/* Animated data particles */}
              {tools.map((_, i) => {
                const startY = 22 + i * 56;
                return (
                  <motion.circle
                    key={`particle-${i}`}
                    r="4"
                    fill={BRAND.amber}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{
                      delay: 0.8 + i * 0.2,
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    <animateMotion
                      dur="1s"
                      repeatCount="indefinite"
                      begin={`${0.8 + i * 0.2}s`}
                      path={`M 0 ${startY} Q 30 ${startY} 45 100`}
                    />
                  </motion.circle>
                );
              })}
            </svg>

            {/* Center: arugami Hub */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: `linear-gradient(135deg, ${BRAND.amber} 0%, ${BRAND.amber}dd 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 40px ${BRAND.amber}40`,
                position: 'relative',
                zIndex: 10
              }}
            >
              <Zap size={36} color="black" />
              {/* Pulse ring */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: 28,
                  border: `2px solid ${BRAND.amber}`,
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Connection Lines - Right */}
            <svg width="60" height="200" style={{ overflow: 'visible' }}>
              {outcomes.map((_, i) => {
                const startY = 100;
                const endY = 32 + i * 56;
                return (
                  <motion.path
                    key={i}
                    d={`M 15 ${startY} Q 30 ${endY} 60 ${endY}`}
                    fill="none"
                    stroke={BRAND.teal}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                  />
                );
              })}
              {/* Animated data particles - right side */}
              {outcomes.map((_, i) => {
                const endY = 32 + i * 56;
                return (
                  <motion.circle
                    key={`particle-r-${i}`}
                    r="4"
                    fill={BRAND.teal}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{
                      delay: 1.2 + i * 0.2,
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    <animateMotion
                      dur="1s"
                      repeatCount="indefinite"
                      begin={`${1.2 + i * 0.2}s`}
                      path={`M 15 100 Q 30 ${endY} 60 ${endY}`}
                    />
                  </motion.circle>
                );
              })}
            </svg>

            {/* Right: Outcomes */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'flex-start'
            }}>
              {outcomes.map((outcome, i) => {
                const Icon = outcome.icon;
                return (
                  <motion.div
                    key={outcome.label}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: `${BRAND.teal}15`,
                      border: `1px solid ${BRAND.teal}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={20} color={BRAND.teal} />
                    </div>
                    <span style={{ fontSize: 12, color: BRAND.concreteLite, minWidth: 80 }}>
                      {outcome.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 48
            }}
          >
            <Loader2 size={16} color={BRAND.concrete} className="animate-spin" />
            <span style={{ fontSize: 13, color: BRAND.concrete }}>Setting up your dashboard...</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Magic Moment (Data Reveal) - Grid Fully Online
  if (showMagic) {
    return (
      <div style={{
        minHeight: '100vh',
        background: BRAND.dark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Grid Background - Fully powered */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          {/* Grid lines - slightly more visible for "powered up" state */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`h-${i}`}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${(i + 1) * 8}%`,
                height: 1,
                background: `linear-gradient(90deg, transparent 0%, ${BRAND.utilitySlate}25 15%, ${BRAND.utilitySlate}25 85%, transparent 100%)`
              }}
            />
          ))}
          {[...Array(16)].map((_, i) => (
            <div
              key={`v-${i}`}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${(i + 1) * 6}%`,
                width: 1,
                background: `linear-gradient(180deg, transparent 0%, ${BRAND.utilitySlate}25 15%, ${BRAND.utilitySlate}25 85%, transparent 100%)`
              }}
            />
          ))}

          {/* Ambient energy flow - slow moving */}
          <motion.div
            animate={{ x: ['-50%', '150%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              top: '25%',
              left: 0,
              width: '40%',
              height: 1,
              background: `linear-gradient(90deg, transparent, ${BRAND.teal}40, ${BRAND.teal}60, ${BRAND.teal}40, transparent)`,
              filter: 'blur(1px)'
            }}
          />
          <motion.div
            animate={{ x: ['150%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              top: '75%',
              left: 0,
              width: '35%',
              height: 1,
              background: `linear-gradient(90deg, transparent, ${BRAND.teal}40, ${BRAND.teal}60, ${BRAND.teal}40, transparent)`,
              filter: 'blur(1px)'
            }}
          />

          {/* Grid nodes - all active, gentle pulse */}
          {[
            { x: 12, y: 20 }, { x: 30, y: 15 }, { x: 48, y: 25 }, { x: 66, y: 12 }, { x: 84, y: 22 },
            { x: 18, y: 45 }, { x: 36, y: 50 }, { x: 72, y: 48 }, { x: 90, y: 42 },
            { x: 6, y: 70 }, { x: 24, y: 78 }, { x: 42, y: 72 }, { x: 60, y: 80 }, { x: 78, y: 68 }, { x: 94, y: 75 },
          ].map((node, i) => (
            <motion.div
              key={`node-${i}`}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
              transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
              style={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: BRAND.teal,
                boxShadow: `0 0 10px ${BRAND.teal}60`
              }}
            />
          ))}

          {/* Ambient teal glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at 50% 50%, ${BRAND.teal}08 0%, transparent 50%)`,
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* Glow backdrop behind content */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700,
            height: 800,
            background: `radial-gradient(ellipse at center, ${BRAND.gridCharcoal}f5 0%, ${BRAND.gridCharcoal}e0 25%, transparent 60%)`,
            filter: 'blur(50px)',
            zIndex: 5,
            pointerEvents: 'none'
          }}
        />

        {/* Main Content - Emotional Payoff */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: 480,
            width: '100%',
            textAlign: 'center'
          }}
        >
          {/* Grid Online Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 14px',
              background: BRAND.gridCharcoal,
              border: `1px solid ${BRAND.teal}40`,
              borderRadius: 4,
              marginBottom: 24
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: BRAND.teal,
                boxShadow: `0 0 8px ${BRAND.teal}`
              }}
            />
            <span style={{
              color: BRAND.teal,
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              fontFamily: 'monospace'
            }}>
              Grid Online
            </span>
          </motion.div>

          {/* Big Personalized Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 style={{
              fontSize: 42,
              fontWeight: 700,
              color: 'white',
              marginBottom: 8,
              letterSpacing: '-0.03em',
              lineHeight: 1.1
            }}>
              Welcome to the grid,
              <br />
              <span style={{ color: BRAND.amber }}>{businessName?.split(' ')[0] || 'friend'}.</span>
            </h1>
            <p style={{
              fontSize: 17,
              color: BRAND.concrete,
              marginBottom: 32,
              lineHeight: 1.5
            }}>
              Your infrastructure is live. Here's what changes now.
            </p>
          </motion.div>

          {/* Value Metrics Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              background: `linear-gradient(135deg, ${BRAND.utilitySlate}80 0%, ${BRAND.gridCharcoal} 100%)`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              border: `1px solid ${BRAND.utilitySlate}`,
              textAlign: 'left'
            }}
          >
            <p style={{
              fontSize: 13,
              color: BRAND.concrete,
              marginBottom: 20,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontWeight: 500
            }}>
              Businesses like yours see
            </p>

            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              {[
                { value: VALUE_METRICS[businessType]?.hours || '10+', label: 'hrs saved', sublabel: 'per week', color: BRAND.amber },
                { value: VALUE_METRICS[businessType]?.leads || '23', label: businessType === 'freelancer' ? 'more inquiries' : 'more leads', sublabel: 'per month', color: BRAND.teal },
                { value: VALUE_METRICS[businessType]?.rating || '4.8', label: '★ avg rating', sublabel: 'on Google', color: '#5FE385' },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '16px 8px',
                    background: BRAND.gridCharcoal,
                    borderRadius: 10,
                    border: `1px solid ${metric.color}20`
                  }}
                >
                  <p style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: metric.color,
                    margin: 0,
                    lineHeight: 1
                  }}>
                    {metric.value}
                  </p>
                  <p style={{
                    fontSize: 12,
                    color: 'white',
                    margin: 0,
                    marginTop: 6,
                    fontWeight: 500
                  }}>
                    {metric.label}
                  </p>
                  <p style={{
                    fontSize: 10,
                    color: BRAND.concrete,
                    margin: 0,
                    marginTop: 2
                  }}>
                    {metric.sublabel}
                  </p>
                </motion.div>
              ))}
            </div>

            <p style={{
              fontSize: 12,
              color: BRAND.concrete,
              margin: 0,
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              after 90 days on the grid
            </p>
          </motion.div>

          {/* Phone Notification Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            style={{
              background: BRAND.gridCharcoal,
              borderRadius: 16,
              padding: 20,
              marginBottom: 28,
              border: `1px solid ${BRAND.utilitySlate}`,
              textAlign: 'left'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                background: `linear-gradient(135deg, ${BRAND.amber} 0%, ${BRAND.amber}80 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={10} color="black" />
              </div>
              <span style={{
                fontSize: 11,
                color: BRAND.concrete,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontWeight: 500
              }}>
                Preview: Your first automation
              </span>
            </div>

            {/* iOS-style notification */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.3, type: 'spring', damping: 15 }}
              style={{
                background: `linear-gradient(135deg, ${BRAND.utilitySlate} 0%, ${BRAND.utilitySlate}cc 100%)`,
                borderRadius: 14,
                padding: 14,
                marginBottom: 14,
                border: `1px solid ${BRAND.concrete}20`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${BRAND.utilitySlate}`,
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* Notification header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 8
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: BRAND.amber,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={14} color="black" />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>arugami</span>
                </div>
                <span style={{ color: BRAND.concrete, fontSize: 12 }}>now</span>
              </div>

              {/* Notification content */}
              <div style={{ paddingLeft: 38 }}>
                <p style={{
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: 4
                }}>
                  New lead captured
                </p>
                <p style={{
                  color: BRAND.concreteLite,
                  fontSize: 13,
                  margin: 0,
                  lineHeight: 1.4
                }}>
                  Maria G. called while you were busy.
                  <br />
                  <span style={{ color: BRAND.teal }}>Auto-replied:</span> "Thanks for calling {businessName?.split(' ')[0] || 'us'}! We'll get back to you ASAP."
                </p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              style={{
                fontSize: 13,
                color: BRAND.concrete,
                margin: 0,
                textAlign: 'center'
              }}
            >
              This happens automatically. <span style={{ color: 'white' }}>You do nothing.</span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              style={{
                fontSize: 12,
                color: BRAND.concrete,
                margin: 0,
                marginTop: 8,
                textAlign: 'center',
                fontStyle: 'italic'
              }}
            >
              Try doing that yourself at 6pm on a Friday.
            </motion.p>
          </motion.div>

          {/* Urgency Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 16
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: BRAND.amber
              }}
            />
            <span style={{
              color: BRAND.amber,
              fontSize: 14,
              fontWeight: 600
            }}>
              Your first automation is 60 seconds away
            </span>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            whileHover={{ scale: 1.02, boxShadow: `0 0 40px ${BRAND.amber}40` }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard?launch=concierge')}
            style={{
              width: '100%',
              padding: '18px 24px',
              borderRadius: 10,
              background: BRAND.amber,
              color: 'black',
              fontSize: 16,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
            }}
          >
            <Zap size={18} />
            Enter Your Dashboard
            <ArrowRight size={18} />
          </motion.button>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: BRAND.concrete,
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            A2P and EIN steps can be finalized while the grid is already running.
          </p>

          {/* White-glove help option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            style={{ marginTop: 16, textAlign: 'center' }}
          >
            {whiteGloveClicked ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                background: `${BRAND.teal}15`,
                borderRadius: 8,
                border: `1px solid ${BRAND.teal}30`
              }}>
                <Check size={16} color={BRAND.teal} />
                <span style={{ color: BRAND.teal, fontSize: 13, fontWeight: 500 }}>
                  Setup call requested — check your email
                </span>
              </div>
            ) : (
              <button
                onClick={handleWhiteGloveClick}
                style={{
                  background: 'none',
                  border: 'none',
                  color: BRAND.concrete,
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Not technical? We'll do it for you.{' '}
                <span style={{ color: BRAND.teal, textDecoration: 'underline' }}>Book a setup call</span>
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: BRAND.dark,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Progress Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: BRAND.darkGray, zIndex: 50 }}>
        <motion.div
          style={{ height: '100%', background: BRAND.amber }}
          initial={{ width: 0 }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 32,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: `radial-gradient(circle, ${BRAND.amber}10 0%, transparent 70%)`, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: `radial-gradient(circle, ${BRAND.teal}15 0%, transparent 70%)`, filter: 'blur(60px)', pointerEvents: 'none' }} />

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
      
      {/* Footer */}
      {step > 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: '#333', fontSize: 12 }}>
          arugami © 2025 · Secure 256-bit Encryption
        </div>
      )}

      {/* White-glove confirmation toast */}
      <AnimatePresence>
        {showWhiteGloveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              background: BRAND.teal,
              color: 'black',
              padding: '16px 24px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: `0 4px 20px ${BRAND.teal}40`,
              zIndex: 100,
            }}
          >
            <Check size={20} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Setup call requested!</p>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Check the new tab to pick a time</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        input::placeholder {
          color: #444;
        }
      `}</style>
    </div>
  );
}
