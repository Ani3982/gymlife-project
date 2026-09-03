import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Custom Scalable Vector Logo for GymLife AI Assistant
const GymLifeAiLogo = ({ size = 28, glow = true, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'block', filter: glow ? 'drop-shadow(0 2px 8px rgba(243, 97, 0, 0.45))' : 'none' }}
  >
    <defs>
      <linearGradient id="aiOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff944d" />
        <stop offset="50%" stopColor="#f36100" />
        <stop offset="100%" stopColor="#d34200" />
      </linearGradient>
      <linearGradient id="aiPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#ffcaa6" />
      </linearGradient>
      <linearGradient id="aiRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f36100" />
        <stop offset="100%" stopColor="#ffaa00" />
      </linearGradient>
    </defs>

    {/* Dark Hexagonal / Circular Shield Base */}
    <rect x="3" y="3" width="42" height="42" rx="12" fill="#121216" stroke="url(#aiRingGrad)" strokeWidth="2" />

    {/* Orbiting Tech Arcs */}
    <path
      d="M8 20C8 13.3726 13.3726 8 20 8"
      stroke="#ff944d"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M40 28C40 34.6274 34.6274 40 28 40"
      stroke="#ff944d"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.9"
    />

    {/* Gym Dumbbell Geometry */}
    {/* Left Outer Plate */}
    <rect x="9" y="16" width="4" height="16" rx="2" fill="url(#aiOrangeGrad)" />
    {/* Left Inner Plate */}
    <rect x="14.5" y="19" width="3" height="10" rx="1.5" fill="url(#aiOrangeGrad)" />
    {/* Right Outer Plate */}
    <rect x="35" y="16" width="4" height="16" rx="2" fill="url(#aiOrangeGrad)" />
    {/* Right Inner Plate */}
    <rect x="30.5" y="19" width="3" height="10" rx="1.5" fill="url(#aiOrangeGrad)" />
    {/* Center Bar */}
    <rect x="16" y="22.5" width="16" height="3" rx="1.5" fill="#555562" />

    {/* Central Glowing AI Intelligence Core (4-Point Star) */}
    <path
      d="M24 10L26.5 21.5L38 24L26.5 26.5L24 38L21.5 26.5L10 24L21.5 21.5L24 10Z"
      fill="url(#aiPlateGrad)"
    />
    <circle cx="24" cy="24" r="3.2" fill="#f36100" />
    <circle cx="24" cy="24" r="1.4" fill="#ffffff" />
  </svg>
);

const BENTO_FEATURES = [
  {
    id: 'bmi',
    title: 'BMI & Body Analysis',
    desc: 'Instant health metrics & tailored goal targets',
    icon: 'fa-calculator',
    iconColor: '#f36100',
    path: '/bmi-calculator',
    actionText: 'Calculate BMI',
    query: 'Calculate my BMI step-by-step'
  },
  {
    id: 'timetable',
    title: 'Class Timetable',
    desc: 'Live weekly boxing, HIIT, cycling & strength schedules',
    icon: 'fa-calendar',
    iconColor: '#ff7800',
    path: '/class-timetable',
    actionText: 'View Schedule',
    query: 'Show class timetable & book a slot'
  },
  {
    id: 'plans',
    title: 'Memberships & Pricing',
    desc: 'Compare Drop-In ($39), Unlimited ($59) & VIP ($99)',
    icon: 'fa-tags',
    iconColor: '#f36100',
    path: '/services',
    actionText: 'Explore Plans',
    query: 'Help me choose a Membership Plan'
  },
  {
    id: 'trainers',
    title: 'Personal Trainers',
    desc: 'Certified bodybuilding, fat loss & fitness coaches',
    icon: 'fa-users',
    iconColor: '#ff7800',
    path: '/team',
    actionText: 'Meet Trainers',
    query: 'Find personal trainers & book consultation'
  }
];

const POPULAR_TOPICS = [
  { label: '🎯 Workout Roadmap', query: 'Recommend a custom workout roadmap' },
  { label: '🥊 Boxing & HIIT', query: 'Tell me about Boxing and HIIT classes' },
  { label: '🔑 Member Portal', query: 'How do I access the Member Portal?' },
  { label: '📍 Hours & Location', query: 'What are your gym hours and location?' },
  { label: '🖼️ Gym Gallery', query: 'Show me gym facilities and photo gallery' }
];

const ChatBot = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [navNotification, setNavNotification] = useState(null);
  const [showTeaser, setShowTeaser] = useState(true);

  // When messages is empty, the bot shows the beautiful Opening Hero View!
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const chatPanelRef = useRef(null);
  const launcherBtnRef = useRef(null);

  // Handle Click Outside & Escape Key to close the assistant
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        chatPanelRef.current &&
        !chatPanelRef.current.contains(event.target) &&
        launcherBtnRef.current &&
        !launcherBtnRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Navigate directly to route
  const handleNavigate = (path, label) => {
    if (!path) return;
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setNavNotification(`Shifted to ${label || path}`);
    setTimeout(() => {
      setNavNotification(null);
    }, 2800);
  };

  // Structured Knowledge Base
  const getKnowledgeResponse = (userQuery) => {
    const text = userQuery.toLowerCase().trim();

    // 1. BMI CALCULATOR
    if (text.includes('bmi') || text.includes('calculate') || text.includes('weight') || text.includes('height') || text.includes('body mass') || text.includes('obese')) {
      return {
        title: 'BMI & Body Composition Guide',
        intro: 'Follow these steps to analyze your body metrics and optimize your training goals:',
        steps: [
          {
            num: 1,
            title: 'Open the BMI Calculator Tool',
            desc: 'Navigate directly to our interactive health calculator.',
            action: { label: 'Go to BMI Calculator', path: '/bmi-calculator', icon: 'fa-calculator' }
          },
          {
            num: 2,
            title: 'Enter Measurements',
            desc: 'Input your Height (cm), Weight (kg), Age, and Sex to obtain your score.'
          },
          {
            num: 3,
            title: 'Align with Training Plan',
            desc: 'Underweight (<18.5), Normal (18.5–24.9), Overweight (25–29.9), or Obese (30+).',
            action: { label: 'Explore Tailored Classes', path: '/classes', icon: 'fa-dumbbell' }
          }
        ],
        suggestions: [
          'What workout is best for fat loss?',
          'Help me choose a Membership Plan',
          'Find personal trainers & book consultation'
        ]
      };
    }

    // 2. TIMETABLE & CLASSES
    if (text.includes('timetable') || text.includes('schedule') || text.includes('when') || text.includes('time slot') || text.includes('calendar')) {
      return {
        title: 'Class Schedule & Timetable',
        intro: 'Here is how to check session timings and reserve your spot:',
        steps: [
          {
            num: 1,
            title: 'View the Live Timetable',
            desc: 'Review weekly schedules for Weightlifting, Boxing, Cycling, and HIIT.',
            action: { label: 'Open Class Timetable', path: '/class-timetable', icon: 'fa-calendar' }
          },
          {
            num: 2,
            title: 'Filter by Time of Day',
            desc: 'Morning (6:00 AM – 10:00 AM), Afternoon (2:00 PM – 5:00 PM), Evening (6:00 PM – 9:00 PM).'
          },
          {
            num: 3,
            title: 'Reserve Your Appointment',
            desc: 'Book a session or schedule a 1-on-1 consultation.',
            action: { label: 'Book an Appointment', path: '/contact', icon: 'fa-calendar-check-o' }
          }
        ],
        suggestions: [
          'What classes do you offer?',
          'Find personal trainers & book consultation',
          'Help me choose a Membership Plan'
        ]
      };
    }

    // 3. MEMBERSHIP & PRICING
    if (text.includes('price') || text.includes('pricing') || text.includes('plan') || text.includes('cost') || text.includes('membership') || text.includes('fees') || text.includes('join') || text.includes('enroll')) {
      return {
        title: 'Membership & Pricing Guide',
        intro: 'Choose the membership that aligns best with your fitness routine:',
        steps: [
          {
            num: 1,
            title: 'Compare Plan Options',
            desc: '• Drop-In: $39.00/class\n• 6-Month Unlimited: $59.00/mo\n• 12-Month VIP: $99.00/mo with 24/7 access & sauna.',
            action: { label: 'View Pricing & Plans', path: '/services', icon: 'fa-tags' }
          },
          {
            num: 2,
            title: 'Register Your Account',
            desc: 'Create an online profile for instant gym and portal access.',
            action: { label: 'Sign Up for Membership', path: '/signup', icon: 'fa-user-plus' }
          }
        ],
        suggestions: [
          'Show class timetable & book a slot',
          'Calculate my BMI step-by-step',
          'How do I access the Member Portal?'
        ]
      };
    }

    // 4. CLASSES
    if (text.includes('class') || text.includes('program') || text.includes('boxing') || text.includes('cycling') || text.includes('kettlebell') || text.includes('hiit') || text.includes('workout')) {
      return {
        title: 'GymLife Training Programs',
        intro: 'Explore our certified coaching programs and strength disciplines:',
        steps: [
          {
            num: 1,
            title: 'Browse Program Details',
            desc: 'Learn about Weightlifting, Boxing, Indoor Cycling, and Kettlebell conditioning.',
            action: { label: 'View Class Programs', path: '/classes', icon: 'fa-dumbbell' }
          },
          {
            num: 2,
            title: 'Check the Weekly Timetable',
            desc: 'Find scheduled days and available coaches.',
            action: { label: 'Open Class Timetable', path: '/class-timetable', icon: 'fa-calendar' }
          }
        ],
        suggestions: [
          'Show class timetable & book a slot',
          'Find personal trainers & book consultation',
          'Help me choose a Membership Plan'
        ]
      };
    }

    // 5. TRAINERS & COACHES
    if (text.includes('trainer') || text.includes('coach') || text.includes('instructor') || text.includes('athart') || text.includes('rachel') || text.includes('personal train')) {
      return {
        title: 'Personal Trainers & Private Coaching',
        intro: 'Get matched with expert certified coaches for customized guidance:',
        steps: [
          {
            num: 1,
            title: 'Meet Our Trainer Team',
            desc: 'Review profiles for bodybuilding, fat loss, and athletic conditioning.',
            action: { label: 'View Trainers Team', path: '/team', icon: 'fa-users' }
          },
          {
            num: 2,
            title: 'Book a 1-on-1 Consultation',
            desc: 'Send an inquiry to schedule private training sessions.',
            action: { label: 'Contact & Book Trainer', path: '/contact', icon: 'fa-calendar-plus-o' }
          }
        ],
        suggestions: [
          'What classes do you offer?',
          'Help me choose a Membership Plan',
          'What are your gym hours & location?'
        ]
      };
    }

    // 6. MEMBER PORTAL & LOGIN
    if (text.includes('login') || text.includes('sign in') || text.includes('portal') || text.includes('dashboard') || text.includes('account') || text.includes('signup') || text.includes('register')) {
      return {
        title: 'Member Portal & Account',
        intro: 'Access your personal membership profile, schedule, and bookings:',
        steps: [
          {
            num: 1,
            title: 'Sign in to Member Portal',
            desc: 'Enter your registered email/username and password.',
            action: { label: 'Member Login', path: '/login', icon: 'fa-sign-in' }
          },
          {
            num: 2,
            title: 'Access Member Dashboard',
            desc: 'View active membership pass, booked appointments, and class attendance.',
            action: { label: 'Member Dashboard', path: '/dashboard', icon: 'fa-tachometer' }
          },
          {
            num: 3,
            title: 'New Member Registration',
            desc: 'Create an account in seconds to enroll in classes and gym programs.',
            action: { label: 'Sign Up Now', path: '/signup', icon: 'fa-user-plus' }
          }
        ],
        suggestions: [
          'Help me choose a Membership Plan',
          'Show class timetable & book a slot',
          'What are your gym hours & location?'
        ]
      };
    }

    // 7. GALLERY & FACILITIES
    if (text.includes('gallery') || text.includes('facility') || text.includes('photos') || text.includes('pictures') || text.includes('equipment')) {
      return {
        title: 'Gym Facilities & Photo Gallery',
        intro: 'Explore our state-of-the-art training zones, Olympic weights, cardio arena, and amenities:',
        steps: [
          {
            num: 1,
            title: 'Browse High-Res Gallery',
            desc: 'View photos of our heavy lifting platform, boxing ring, cycling studio, and sauna.',
            action: { label: 'Open Photo Gallery', path: '/gallery', icon: 'fa-picture-o' }
          },
          {
            num: 2,
            title: 'Learn About Our Facilities',
            desc: 'Read about our 24/7 VIP access, locker rooms, clean showers, and nutrition bar.',
            action: { label: 'About Our Gym', path: '/about-us', icon: 'fa-building' }
          }
        ],
        suggestions: [
          'What are your gym hours & location?',
          'Help me choose a Membership Plan',
          'Show class timetable & book a slot'
        ]
      };
    }

    // 7. HOURS & CONTACT
    if (text.includes('hour') || text.includes('open') || text.includes('time') || text.includes('location') || text.includes('address') || text.includes('where') || text.includes('contact') || text.includes('phone')) {
      return {
        title: 'Gym Location & Operating Hours',
        intro: 'Here are the hours and contact information for GymLife:',
        steps: [
          {
            num: 1,
            title: 'Operating Hours',
            desc: '• VIP Members: 24/7 Unlimited Access\n• Staffed Hours (Mon–Fri): 6:00 AM – 10:00 PM\n• Staffed Hours (Sat–Sun): 8:00 AM – 8:00 PM'
          },
          {
            num: 2,
            title: 'Location & Direct Contact',
            desc: '333 Middle Winchendon Rd, Rindge, NH 03461\nPhone: 125-711-811 / 125-668-886',
            action: { label: 'Open Contact & Map Page', path: '/contact', icon: 'fa-map-marker' }
          }
        ],
        suggestions: [
          'Calculate my BMI step-by-step',
          'Help me choose a Membership Plan',
          'Show class timetable & book a slot'
        ]
      };
    }

    // 8. CUSTOM WORKOUT ROADMAP
    if (text.includes('roadmap') || text.includes('routine') || text.includes('start') || text.includes('goal')) {
      return {
        title: 'Personalized 4-Stage Fitness Blueprint',
        intro: 'Follow this structured roadmap to achieve your fitness targets:',
        steps: [
          {
            num: 1,
            title: 'Establish Your Baseline',
            desc: 'Calculate your BMI and current fitness metrics.',
            action: { label: 'Calculate BMI', path: '/bmi-calculator', icon: 'fa-calculator' }
          },
          {
            num: 2,
            title: 'Select Training Disciplines',
            desc: 'Mix strength training with HIIT cardio sessions.',
            action: { label: 'Browse Classes', path: '/classes', icon: 'fa-dumbbell' }
          },
          {
            num: 3,
            title: 'Commit to a Weekly Schedule',
            desc: 'Pick your regular training days on the Timetable.',
            action: { label: 'Class Timetable', path: '/class-timetable', icon: 'fa-calendar' }
          },
          {
            num: 4,
            title: 'Unlock Membership & Coaching',
            desc: 'Choose an unlimited or VIP plan for maximum gains.',
            action: { label: 'View Pricing Plans', path: '/services', icon: 'fa-tags' }
          }
        ],
        suggestions: [
          'Calculate my BMI step-by-step',
          'Help me choose a Membership Plan',
          'Find personal trainers & book consultation'
        ]
      };
    }

    // DEFAULT FALLBACK
    return {
      title: 'How Can I Assist You?',
      intro: `Here are quick direct options related to "${userQuery}":`,
      steps: [
        {
          num: 1,
          title: 'Calculate Body Mass Index (BMI)',
          desc: 'Get your health metric in seconds.',
          action: { label: 'Open BMI Calculator', path: '/bmi-calculator', icon: 'fa-calculator' }
        },
        {
          num: 2,
          title: 'Explore Weekly Class Timetable',
          desc: 'Browse strength, cycling, and boxing slots.',
          action: { label: 'View Class Timetable', path: '/class-timetable', icon: 'fa-calendar' }
        },
        {
          num: 3,
          title: 'Membership & Pricing Plans',
          desc: 'Compare drop-in, monthly, and VIP access.',
          action: { label: 'Explore Pricing Plans', path: '/services', icon: 'fa-tags' }
        }
      ],
      suggestions: [
        'Calculate my BMI step-by-step',
        'Show class timetable & book a slot',
        'Help me choose a Membership Plan',
        'What are your gym hours & location?'
      ]
    };
  };

  const handleSendMessage = (queryText) => {
    if (!queryText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getKnowledgeResponse(queryText);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        title: botResponse.title,
        intro: botResponse.intro,
        steps: botResponse.steps || [],
        suggestions: botResponse.suggestions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetToHero = () => {
    setMessages([]);
  };

  const handleBentoClick = (item) => {
    handleSendMessage(item.query);
    handleNavigate(item.path, item.title);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <>
      {/* Floating Teaser Pill when Closed */}
      {!isOpen && showTeaser && (
        <div
          onClick={() => {
            setIsOpen(true);
            setShowTeaser(false);
          }}
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            backgroundColor: '#141418',
            border: '1px solid rgba(243, 97, 0, 0.45)',
            borderRadius: '24px',
            padding: '8px 14px',
            boxShadow: '0 10px 32px rgba(0,0,0,0.7), 0 0 16px rgba(243, 97, 0, 0.25)',
            zIndex: 9998,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'heroFloat 3s ease-in-out infinite'
          }}
        >
          <div style={{ width: '18px', height: '18px', flexShrink: 0 }}>
            <GymLifeAiLogo size={18} glow={false} />
          </div>
          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '600' }}>
            Need guidance? <strong style={{ color: '#f36100' }}>Ask GymLife AI</strong>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTeaser(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#777',
              cursor: 'pointer',
              fontSize: '13px',
              padding: '0 2px',
              marginLeft: '4px'
            }}
            aria-label="Close tooltip"
          >
            &times;
          </button>
        </div>
      )}

      {/* Floating Launcher Button with Custom Glowing AI Logo */}
      <button
        ref={launcherBtnRef}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setShowTeaser(false);
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '62px',
          height: '62px',
          borderRadius: '50%',
          backgroundColor: '#121216',
          border: '2px solid rgba(243, 97, 0, 0.75)',
          boxShadow: '0 8px 28px rgba(243, 97, 0, 0.5), 0 0 18px rgba(243, 97, 0, 0.3)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="gymlife-ai-btn"
        aria-label="Toggle GymLife AI Fitness Assistant"
      >
        {isOpen ? (
          <i className="fa fa-times" style={{ color: '#fff', fontSize: '20px' }}></i>
        ) : (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GymLifeAiLogo size={34} glow={true} />
            {/* Pulsing Active Indicator */}
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#00e676',
                border: '2px solid #111',
                boxShadow: '0 0 8px #00e676',
                animation: 'beaconPulse 2s infinite'
              }}
            />
          </div>
        )}
      </button>

      {/* Styles */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes beaconPulse {
          0% { transform: scale(0.9); opacity: 0.85; }
          50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 12px #00e676; }
          100% { transform: scale(0.9); opacity: 0.85; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gymlife-ai-btn:hover {
          transform: scale(1.08) rotate(3deg);
          border-color: #ff944d !important;
          box-shadow: 0 12px 36px rgba(243, 97, 0, 0.7), 0 0 24px rgba(243, 97, 0, 0.45);
        }
        .bento-hero-card {
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .bento-hero-card:hover {
          transform: translateY(-3px);
          background: linear-gradient(145deg, #202028 0%, #171720 100%) !important;
          border-color: rgba(243, 97, 0, 0.5) !important;
          box-shadow: 0 6px 20px rgba(243, 97, 0, 0.25);
        }
        .bento-hero-card:hover .bento-arrow {
          transform: translateX(4px);
          color: #f36100 !important;
        }
        .bento-hero-card:hover .bento-icon-box {
          transform: scale(1.1);
          background-color: #f36100 !important;
        }
        .bento-hero-card:hover .bento-icon-box i {
          color: #ffffff !important;
        }
        .ai-nav-card {
          transition: all 0.2s ease;
        }
        .ai-nav-card:hover {
          background-color: #f36100 !important;
          border-color: #f36100 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(243, 97, 0, 0.35);
        }
        .ai-nav-card:hover * {
          color: #ffffff !important;
        }
        .ai-topic-pill {
          transition: all 0.2s ease;
        }
        .ai-topic-pill:hover {
          background-color: rgba(243, 97, 0, 0.18) !important;
          border-color: #f36100 !important;
          color: #ffffff !important;
          transform: translateY(-1px);
        }
        .ai-scroll-container::-webkit-scrollbar {
          width: 4px;
        }
        .ai-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .ai-scroll-container::-webkit-scrollbar-thumb {
          background: #2a2a32;
          border-radius: 4px;
        }
      `}</style>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          ref={chatPanelRef}
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '400px',
            maxWidth: 'calc(100vw - 32px)',
            height: '590px',
            maxHeight: 'calc(100vh - 115px)',
            backgroundColor: '#101014',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
            border: '1px solid #222228',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9998,
            fontFamily: "'Muli', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #181820 0%, #111116 100%)',
              borderBottom: '1px solid #24242c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <GymLifeAiLogo size={36} glow={true} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ color: '#ffffff', margin: 0, fontSize: '14.5px', fontWeight: '800', letterSpacing: '0.2px' }}>
                    GymLife AI Coach
                  </h4>
                  <span
                    style={{
                      fontSize: '9.5px',
                      backgroundColor: 'rgba(0, 230, 118, 0.15)',
                      color: '#00e676',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      border: '1px solid rgba(0, 230, 118, 0.3)'
                    }}
                  >
                    ONLINE
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00e676' }} />
                  <span style={{ color: '#888892', fontSize: '11px' }}>
                    Active: <span style={{ color: '#f36100', fontWeight: '600' }}>{location.pathname}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Home / Reset button */}
              <button
                onClick={handleResetToHero}
                title="Return to Opening View"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: messages.length > 0 ? '#f36100' : '#777782',
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: '7px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <i className="fa fa-home"></i>
              </button>
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: '#9999a5',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '7px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
          </div>

          {/* Navigation Toast Banner */}
          {navNotification && (
            <div
              style={{
                backgroundColor: 'rgba(243, 97, 0, 0.95)',
                color: '#fff',
                padding: '7px 16px',
                fontSize: '11.5px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 10px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa fa-check-circle"></i>
                <span>{navNotification}</span>
              </div>
              <i className="fa fa-arrow-right" style={{ fontSize: '10px' }}></i>
            </div>
          )}

          {/* Messages / Hero View Content Area */}
          <div
            className="ai-scroll-container"
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: '#0b0b0e'
            }}
          >
            {/* 🌟 OPENING HERO VIEW (When no messages sent yet) */}
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '8px' }}>
                {/* Hero Card Greeting with Glowing AI Emblem */}
                <div
                  style={{
                    position: 'relative',
                    padding: '20px 18px',
                    borderRadius: '16px',
                    background: 'linear-gradient(145deg, #181822 0%, #121218 100%)',
                    border: '1px solid rgba(243, 97, 0, 0.3)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Subtle ambient decorative circle */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      width: '110px',
                      height: '110px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(243,97,0,0.25) 0%, rgba(243,97,0,0) 70%)',
                      filter: 'blur(10px)',
                      pointerEvents: 'none'
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <GymLifeAiLogo size={36} glow={true} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.2px' }}>
                        Welcome to GymLife AI
                      </h3>
                      <span style={{ fontSize: '11px', color: '#f36100', fontWeight: '600' }}>
                        Your Smart Fitness & Navigation Concierge
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '12.5px', color: '#a5a5b2', lineHeight: '1.55' }}>
                    I provide <strong style={{ color: '#ffffff' }}>step-by-step guidance</strong> and <strong style={{ color: '#f36100' }}>direct page shifting</strong> across workouts, trainers, schedules, and memberships.
                  </p>
                </div>

                {/* Section Title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#888896', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    ⚡ Instant 1-Click Navigation
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#f36100', fontWeight: '700' }}>
                    Direct Shift
                  </span>
                </div>

                {/* 2x2 Bento Feature Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px'
                  }}
                >
                  {BENTO_FEATURES.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleBentoClick(item)}
                      className="bento-hero-card"
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#15151c',
                        border: '1px solid #22222c',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px',
                        minHeight: '110px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div
                          className="bento-icon-box"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(243, 97, 0, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          <i className={`fa ${item.icon}`} style={{ color: item.iconColor, fontSize: '14px' }}></i>
                        </div>
                        <i className="fa fa-arrow-right bento-arrow" style={{ color: '#555562', fontSize: '11px', transition: 'all 0.2s' }}></i>
                      </div>

                      <div>
                        <h4 style={{ margin: 0, fontSize: '12.5px', fontWeight: '700', color: '#ffffff' }}>
                          {item.title}
                        </h4>
                        <p style={{ margin: '3px 0 0 0', fontSize: '10.5px', color: '#888896', lineHeight: '1.35' }}>
                          {item.desc}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span style={{ fontSize: '10px', color: '#f36100', fontWeight: '700' }}>
                          {item.actionText}
                        </span>
                        <i className="fa fa-chevron-right" style={{ color: '#f36100', fontSize: '8px' }}></i>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Popular Query Pills Section */}
                <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#888896', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 2px' }}>
                    💬 Popular Questions
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {POPULAR_TOPICS.map((topic, tIdx) => (
                      <button
                        key={tIdx}
                        onClick={() => handleSendMessage(topic.query)}
                        className="ai-topic-pill"
                        style={{
                          padding: '6px 11px',
                          borderRadius: '14px',
                          border: '1px solid #282834',
                          backgroundColor: '#15151d',
                          color: '#b0b0be',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* 💬 ACTIVE CONVERSATION THREAD */
              messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: msg.sender === 'user' ? '82%' : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  {msg.sender === 'user' ? (
                    /* User Bubble */
                    <div
                      style={{
                        padding: '10px 15px',
                        borderRadius: '16px 16px 2px 16px',
                        background: 'linear-gradient(135deg, #f36100 0%, #ff7800 100%)',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '600',
                        lineHeight: '1.4',
                        boxShadow: '0 4px 14px rgba(243, 97, 0, 0.3)'
                      }}
                    >
                      {msg.text}
                    </div>
                  ) : (
                    /* Bot Structured Response Card */
                    <div
                      style={{
                        backgroundColor: '#15151c',
                        borderRadius: '14px',
                        border: '1px solid #24242e',
                        padding: '15px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.35)'
                      }}
                    >
                      {msg.title && (
                        <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <GymLifeAiLogo size={20} glow={false} />
                          <span>{msg.title}</span>
                        </div>
                      )}

                      {msg.intro && (
                        <p style={{ margin: 0, fontSize: '12px', color: '#a0a0ae', lineHeight: '1.5' }}>
                          {msg.intro}
                        </p>
                      )}

                      {/* Step Cards */}
                      {msg.steps && msg.steps.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
                          {msg.steps.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              style={{
                                backgroundColor: '#1a1a22',
                                borderRadius: '10px',
                                padding: '10px 12px',
                                border: '1px solid #282834',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #f36100 0%, #ff7800 100%)',
                                    color: '#fff',
                                    fontSize: '10.5px',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}
                                >
                                  {step.num}
                                </span>
                                <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#ffffff' }}>
                                  {step.title}
                                </span>
                              </div>

                              {step.desc && (
                                <p style={{ margin: 0, fontSize: '11px', color: '#90909e', lineHeight: '1.45', paddingLeft: '28px', whiteSpace: 'pre-line' }}>
                                  {step.desc}
                                </p>
                              )}

                              {/* Direct Navigation Button for this Step */}
                              {step.action && (
                                <div style={{ paddingLeft: '28px', marginTop: '2px' }}>
                                  <button
                                    onClick={() => handleNavigate(step.action.path, step.action.label)}
                                    className="ai-nav-card"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      backgroundColor: 'rgba(243, 97, 0, 0.14)',
                                      border: '1px solid rgba(243, 97, 0, 0.4)',
                                      color: '#f36100',
                                      borderRadius: '7px',
                                      padding: '6px 11px',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <i className={`fa ${step.action.icon || 'fa-arrow-right'}`} style={{ fontSize: '11px' }}></i>
                                    <span>{step.action.label}</span>
                                    <i className="fa fa-chevron-right" style={{ fontSize: '9px', opacity: 0.7 }}></i>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Follow-up Suggestion Chips */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #22222c' }}>
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sug)}
                              className="ai-topic-pill"
                              style={{
                                backgroundColor: '#181820',
                                border: '1px solid #2c2c38',
                                color: '#b0b0be',
                                padding: '4px 9px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <span style={{ fontSize: '10px', color: '#555562', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', padding: '0 2px' }}>
                    {msg.timestamp}
                  </span>
                </div>
              ))
            )}

            {/* Typing Loader */}
            {isTyping && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  backgroundColor: '#15151c',
                  borderRadius: '12px',
                  border: '1px solid #22222c'
                }}
              >
                <GymLifeAiLogo size={18} glow={false} />
                <span style={{ color: '#90909e', fontSize: '11.5px', fontWeight: '500' }}>AI is preparing guidance...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Clean Input Area */}
          <div
            style={{
              padding: '12px 14px',
              borderTop: '1px solid #202026',
              display: 'flex',
              gap: '8px',
              backgroundColor: '#141418',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder="Ask about workouts, BMI, classes, plans..."
              style={{
                flex: 1,
                padding: '9px 13px',
                borderRadius: '10px',
                border: '1px solid #2b2b34',
                backgroundColor: '#0a0a0d',
                color: '#ffffff',
                fontSize: '12.5px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: inputText.trim()
                  ? 'linear-gradient(135deg, #f36100 0%, #ff7800 100%)'
                  : '#262630',
                border: 'none',
                cursor: inputText.trim() ? 'pointer' : 'default',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: inputText.trim() ? '0 2px 10px rgba(243, 97, 0, 0.4)' : 'none',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              title="Send Message"
            >
              <i className="fa fa-paper-plane" style={{ color: inputText.trim() ? '#fff' : '#666', fontSize: '12px' }}></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
