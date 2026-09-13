import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const SERVICE_DETAILS_MAP = {
  equipment: {
    category: 'FACILITIES & GEAR',
    tagline: 'World-Class Biomechanical Equipment & Free-Weight Arena',
    image: '/img/services/services-1.jpg',
    lead: 'Train with elite-grade biomechanical selectorized stations, competition Olympic barbells, calibrated bumper plates, and functional cardio ergometers engineered for maximum hypertrophy and joint longevity.',
    features: [
      {
        icon: 'fa-trophy',
        title: 'Olympic Lifting Platforms',
        desc: 'Competition Eleiko barbells, heavy-duty power cages, calibrated bumper plates, and reinforced deadlift wood platforms.'
      },
      {
        icon: 'fa-cogs',
        title: 'Biomechanical Machines',
        desc: 'Hammer Strength plate-loaded stations and Matrix pin-selected machines providing anatomically optimized resistance curves.'
      },
      {
        icon: 'fa-heartbeat',
        title: 'Functional Cardio Zone',
        desc: 'Concept2 Rowers, SkiErgs, Assault AirBikes, curved motorless treadmills, and Woodway performance runners.'
      },
      {
        icon: 'fa-shield',
        title: 'Sanitized & Ergonomic',
        desc: 'Hospital-grade HEPA air filtration and continuous equipment sanitization protocols to keep you healthy and safe.'
      }
    ],
    perks: [
      '24/7 Unlimited Access for VIP & Active members',
      'Complimentary induction & equipment walkthrough',
      'Free locker & private shower access'
    ],
    bookingName: 'Modern equipment'
  },
  nutrition: {
    category: 'DIETETICS & BODY COMPOSITION',
    tagline: 'Personalized Sports Nutrition & Metabolic Acceleration',
    image: '/img/services/services-2.jpg',
    lead: 'Fitness is 70% nutrition. Our registered sports nutritionists craft targeted macronutrient and caloric formulas engineered to accelerate fat burning, optimize hormone health, and build lean muscle tissue.',
    features: [
      {
        icon: 'fa-apple',
        title: 'Custom Macro & Calorie Targets',
        desc: 'Individualized protein, carbohydrate, and healthy fat distribution balanced for your metabolic rate and goals.'
      },
      {
        icon: 'fa-line-chart',
        title: 'InBody Body Composition Scans',
        desc: 'Multi-frequency segmental analysis tracking skeletal muscle mass, visceral fat levels, and intracellular water ratio.'
      },
      {
        icon: 'fa-cutlery',
        title: 'Meal Prep & Recipe Blueprints',
        desc: 'Actionable whole-food meal prep menus, smart grocery shopping lists, and delicious recipes tailored for busy schedules.'
      },
      {
        icon: 'fa-comments',
        title: '1-on-1 Dietitian Check-ins',
        desc: 'Bi-weekly reviews with certified nutritionists to adapt caloric intake as your metabolism and workload adapt.'
      }
    ],
    perks: [
      'InBody scan included with all multi-month plans',
      'Tailored vegan, vegetarian, and non-veg diet plans',
      'Sports supplementation and hydration guides'
    ],
    bookingName: 'Healthy nutrition plan'
  },
  training: {
    category: 'MASTER COACHING',
    tagline: '1-on-1 Periodized Personal Coaching for Accelerated Results',
    image: '/img/services/services-4.jpg',
    lead: 'Fast-track your physique and strength goals with certified master trainers. Every workout is scientifically periodized for maximum hypertrophy, fat oxidation, athletic power, and injury prevention.',
    features: [
      {
        icon: 'fa-user-md',
        title: 'Certified Master Coaches',
        desc: 'NSCA, CSCS, and ACE accredited trainers with extensive expertise in strength conditioning and athletic coaching.'
      },
      {
        icon: 'fa-crosshairs',
        title: 'Movement Screen & Prehab',
        desc: 'Pinpoint muscular imbalances, spinal alignment issues, and mobility restrictions to bulletproof your joints.'
      },
      {
        icon: 'fa-bolt',
        title: 'Progressive Overload Strategy',
        desc: 'Systematic tracking of reps, volume load, and tempo to eliminate plateaus and guarantee weekly progress.'
      },
      {
        icon: 'fa-check-circle',
        title: 'Daily Accountability',
        desc: 'Direct coach messaging, form checks on demand, and relentless motivation to push past your personal limits.'
      }
    ],
    perks: [
      'Complimentary initial fitness assessment session',
      'Custom workout routines tracked via Member Portal',
      'Direct form analysis and injury prevention coaching'
    ],
    bookingName: 'Professional training plan'
  },
  needs: {
    category: 'ADAPTIVE FITNESS',
    tagline: 'Custom Workouts Tailored to Your Body, Schedule & Goals',
    image: '/img/services/services-3.jpg',
    lead: 'No two fitness journeys are identical. We analyze your posture, injury history, and lifestyle constraints to build a fully adaptive regimen that yields maximum return on your invested training time.',
    features: [
      {
        icon: 'fa-sliders',
        title: 'Bespoke Program Architecture',
        desc: 'Workouts sculpted to match your exact goals—whether shedding 20 lbs, conquering a marathon, or fixing chronic back pain.'
      },
      {
        icon: 'fa-medkit',
        title: 'Corrective Mobility & Joint Health',
        desc: 'Therapeutic movements designed to rebuild shoulder, hip, and lumbar mobility damaged by desk work and sitting.'
      },
      {
        icon: 'fa-tachometer',
        title: 'Heart-Rate Zone Conditioning',
        desc: 'Targeted cardiovascular intervals mapped to your anaerobic threshold for peak heart health and stamina.'
      },
      {
        icon: 'fa-calendar',
        title: 'Lifestyle Synchronization',
        desc: 'Flexible 30, 45, or 60-minute routines that comfortably integrate into demanding work and family schedules.'
      }
    ],
    perks: [
      'Comprehensive posture & spine analysis',
      'Dynamic program updates every 4 weeks',
      'Priority access to expert coaches & facilities'
    ],
    bookingName: 'Unique to your needs'
  }
};

const ServiceExploreModal = ({ service, isOpen, onClose, onBookService }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  // Determine which detailed profile to use
  const titleLower = (service.title || '').toLowerCase();
  let detailsKey = 'equipment';
  if (titleLower.includes('nutrition') || titleLower.includes('diet')) {
    detailsKey = 'nutrition';
  } else if (titleLower.includes('training') || titleLower.includes('personal')) {
    detailsKey = 'training';
  } else if (titleLower.includes('need') || titleLower.includes('unique') || titleLower.includes('custom')) {
    detailsKey = 'needs';
  }

  const details = SERVICE_DETAILS_MAP[detailsKey];

  return (
    <div 
      className="service-modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div 
        className="service-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#151515',
          borderRadius: '16px',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          border: '1px solid rgba(243, 97, 0, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(243, 97, 0, 0.2)',
          color: '#ffffff',
          position: 'relative'
        }}
      >
        {/* Banner Image & Header */}
        <div style={{
          position: 'relative',
          height: '240px',
          backgroundImage: `linear-gradient(180deg, rgba(21, 21, 21, 0.2) 0%, rgba(21, 21, 21, 0.95) 100%), url(${details.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '30px',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          {/* Close button */}
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close explore modal"
            style={{
              position: 'absolute',
              top: '18px',
              right: '20px',
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f36100';
              e.currentTarget.style.borderColor = '#f36100';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            &times;
          </button>

          <span style={{
            display: 'inline-block',
            alignSelf: 'flex-start',
            backgroundColor: '#f36100',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            padding: '4px 12px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            {details.category}
          </span>

          <h2 style={{
            color: '#ffffff',
            fontSize: '32px',
            fontFamily: '"Oswald", sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            margin: 0,
            letterSpacing: '1px'
          }}>
            {service.title}
          </h2>
          <div style={{ color: '#f36100', fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
            {details.tagline}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '30px' }}>
          <p style={{
            color: '#c4c4c4',
            fontSize: '16px',
            lineHeight: '1.7',
            marginBottom: '26px'
          }}>
            {details.lead}
          </p>

          {/* 4 Feature Highlights Grid */}
          <h4 style={{
            color: '#ffffff',
            fontSize: '18px',
            fontFamily: '"Oswald", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fa fa-star text-warning" style={{ color: '#f36100' }}></i>
            Core Program Highlights & Specifications
          </h4>

          <div className="row mb-4">
            {details.features.map((feat, idx) => (
              <div className="col-md-6 mb-3" key={idx}>
                <div style={{
                  background: '#1f1f1f',
                  padding: '18px 20px',
                  borderRadius: '10px',
                  border: '1px solid #2d2d2d',
                  height: '100%',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    minWidth: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(243, 97, 0, 0.15)',
                    border: '1px solid rgba(243, 97, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f36100',
                    fontSize: '18px'
                  }}>
                    <i className={`fa ${feat.icon}`}></i>
                  </div>
                  <div>
                    <h5 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0' }}>
                      {feat.title}
                    </h5>
                    <p style={{ color: '#9a9a9a', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Perks Bar */}
          <div style={{
            background: 'rgba(243, 97, 0, 0.08)',
            border: '1px solid rgba(243, 97, 0, 0.25)',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '30px'
          }}>
            <h6 style={{ color: '#f36100', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              <i className="fa fa-check-circle mr-2"></i> Included with GymLife Memberships:
            </h6>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {details.perks.map((perk, pIdx) => (
                <span key={pIdx} style={{ color: '#d0d0d0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa fa-check text-success" style={{ color: '#f36100' }}></i> {perk}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            justifyContent: 'flex-end',
            borderTop: '1px solid #282828',
            paddingTop: '20px'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="primary-btn"
              style={{
                background: 'transparent',
                border: '1px solid #444',
                color: '#bbb',
                cursor: 'pointer',
                padding: '12px 24px'
              }}
            >
              Close
            </button>

            <Link
              to="/class-timetable"
              onClick={onClose}
              className="primary-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#fff',
                padding: '12px 24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fa fa-calendar"></i> Class Timetable
            </Link>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onBookService) {
                  onBookService(details.bookingName || service.title);
                }
              }}
              className="primary-btn"
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: '12px 28px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f36100'
              }}
            >
              <i className="fa fa-calendar-check-o"></i> Book Free Session Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceExploreModal;
