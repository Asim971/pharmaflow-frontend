# Modern Component Preferences for Pharmaceutical UI

## Premium Component Architecture

This configuration defines the modern component preferences for the PharmaFlow application, focusing on premium pharmaceutical UI patterns with DGDA compliance integration.

```typescript
export const ModernComponentPreferences = {
  "priority_list": [
    "PolishedStepper",
    "KPICardWithMicrochart",
    "AuditTimeline", 
    "TerritoryMapClusterChoropleth",
    "AdvancedDataTable",
    "GuidedForm",
    "DocumentUploaderChunked",
    "BottomSheetMobile",
    "FloatingActionBar",
    "ToastWithCTA",
    "FrostedModal",
    "RichMediaCapture",
    "CampaignCanvas",
    "ProgressDonutLiquid",
    "LottieMicroAnimation"
  ],
  
  "rules_for_selection": {
    "choose_stepper": "for any multi-step flow > 2 steps; use glass + progress + shield-check",
    "choose_map": "for any geospatial data or territory assignment; include offline support",
    "choose_table": "for >10 rows or complex lists; use virtualization + inline charts",
    "choose_card": "for KPIs and short summaries; include microcharts and actions",
    "choose_modal": "for focused tasks requiring approval or signature; trap focus and provide accessible keyboard shortcuts"
  },
  
  "motion_presets": {
    "hover": {
      "transform": "translateY(-4px)",
      "boxShadow": "lg",
      "duration": "0.18s",
      "easing": "cubic-bezier(0.2,0.8,0.2,1)"
    },
    "active": {
      "scale": "0.98",
      "duration": "0.06s"
    },
    "enter": {
      "opacity": "0->1",
      "y": "6px->0", 
      "duration": "0.28s",
      "stagger": "0.05s"
    },
    "success": {
      "pulse": "0.6s",
      "confetti": "subtle",
      "reduceMotionFallback": true
    }
  },
  
  "implementation_patterns": {
    "images_and_uploads": [
      "client-side compression",
      "chunked_upload",
      "progress_ring",
      "hash_and_verify_on_server"
    ],
    "forms": [
      "autosave",
      "idempotency_key",
      "inline_validation",
      "help_drawer_examples"
    ],
    "maps": [
      "cluster_markers",
      "choropleth_layer",
      "drill_side_panel",
      "tile_caching_for_pwa"
    ]
  },
  
  "performance_constraints": {
    "list_virtualization": true,
    "lazy_load_images": true,
    "skeleton_first_render": true,
    "prefetch_key_data": true
  },
  
  "accessibility_rules": {
    "reduce_motion_support": true,
    "aria_roles_required": ["stepper", "progressbar", "dialog", "table"],
    "contrast_minimum": "4.5:1 for text",
    "keyboard_navigation": "full for all interactive components"
  },

  // Pharmaceutical-specific enhancements
  "pharmaceutical_patterns": {
    "dgda_compliance": {
      "signature_required": ["submission", "approval", "rejection"],
      "audit_trail": "all_user_actions",
      "compliance_indicators": "visible_throughout_flow",
      "trust_badges": "prominently_displayed"
    },
    
    "trust_building": {
      "verified_indicators": "green_checkmarks_with_animation",
      "progress_transparency": "show_submission_status_realtime",
      "security_messaging": "data_encryption_indicators",
      "regulatory_badges": "dgda_approved_stamps"
    },
    
    "mobile_optimization": {
      "touch_targets": "minimum_44px",
      "offline_support": "critical_forms_cached",
      "bandwidth_optimization": "progressive_image_loading",
      "field_team_patterns": "quick_photo_capture_gps"
    }
  }
} as const;
```

## Component Implementation Guidelines

### 1. PolishedStepper
```typescript
interface PolishedStepperProps {
  steps: {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'active' | 'completed' | 'error';
    dgdaRequired?: boolean;
    trustLevel?: 'low' | 'medium' | 'high';
  }[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  variant?: 'pharmaceutical' | 'dgda' | 'premium';
  showProgress?: boolean;
  allowSkipping?: boolean;
}
```

**Pharmaceutical Features:**
- DGDA compliance checkpoints
- Trust indicators with shield icons
- Glassmorphism effects with premium animations
- Mobile-optimized touch targets
- Accessibility-first keyboard navigation

### 2. KPICardWithMicrochart
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'stable';
  };
  chart?: {
    type: 'line' | 'bar' | 'donut';
    data: number[];
    labels?: string[];
  };
  status?: 'success' | 'warning' | 'error' | 'info';
  actions?: {
    label: string;
    onClick: () => void;
    icon?: string;
  }[];
  pharmaceuticalContext?: {
    regulatoryStatus?: string;
    complianceLevel?: number;
    auditTrail?: boolean;
  };
}
```

**Premium Features:**
- Micro-animations on value changes
- Interactive hover states with glassmorphism
- Trust indicators for compliance data
- Mobile-responsive chart scaling

### 3. TerritoryMapClusterChoropleth
```typescript
interface TerritoryMapProps {
  territories: {
    id: string;
    name: string;
    coordinates: [number, number][];
    metrics: Record<string, number>;
    status: 'active' | 'pending' | 'review';
    representative?: {
      name: string;
      contact: string;
      photo?: string;
    };
  }[];
  clusters?: {
    lat: number;
    lng: number;
    count: number;
    type: 'pharmacy' | 'hospital' | 'clinic';
  }[];
  onTerritorySelect?: (territory: any) => void;
  offlineMode?: boolean;
  bangladeshOptimized?: boolean;
}
```

**Pharmaceutical Map Features:**
- Bangladesh territory optimization
- Offline tile caching for field teams
- DGDA facility markers with compliance status
- Representative contact integration
- Mobile-first touch interactions

### 4. AdvancedDataTable
```typescript
interface AdvancedDataTableProps {
  columns: {
    key: string;
    title: string;
    sortable?: boolean;
    filterable?: boolean;
    width?: string;
    render?: (value: any, row: any) => ReactNode;
    pharmaceutical?: {
      sensitiveData?: boolean;
      auditRequired?: boolean;
      dgdaVisible?: boolean;
    };
  }[];
  data: any[];
  virtualizer?: boolean;
  exportable?: boolean;
  complianceMode?: boolean;
  auditTrail?: boolean;
}
```

**Enterprise Table Features:**
- Row-level virtualization for 10,000+ records
- Inline micro-charts for trends
- Compliance-aware data masking
- Export with DGDA audit logs
- Mobile horizontal scroll optimization

### 5. GuidedForm with DGDA Integration
```typescript
interface GuidedFormProps {
  sections: {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
    validation?: ValidationSchema;
    dgdaRequirements?: {
      signatureRequired?: boolean;
      witnessRequired?: boolean;
      complianceCheck?: string[];
    };
  }[];
  onSubmit: (data: any) => Promise<void>;
  autosave?: boolean;
  pharmaceuticalContext?: {
    submissionType: 'license' | 'renewal' | 'amendment';
    regulatoryRequirements: string[];
    trustLevel: number;
  };
}
```

## Motion & Animation Presets

### Pharmaceutical Motion Language
```css
.pharmaceutical-hover {
  transition: all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);
  transform: translateY(0);
}

.pharmaceutical-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 80px rgba(30, 58, 138, 0.15);
}

.dgda-success {
  animation: dgda-verified 1.5s ease-out;
}

.trust-indicator-pulse {
  animation: trust-pulse 2s ease-in-out infinite;
}
```

### Accessibility Considerations
- `prefers-reduced-motion` support for all animations
- High contrast mode compatibility
- Screen reader announcements for state changes
- Keyboard navigation patterns that match visual hierarchy

## Implementation Priority

1. **Phase 1: Core Components**
   - PolishedStepper (DGDA submission flows)
   - KPICardWithMicrochart (Dashboard metrics)
   - GuidedForm (License applications)

2. **Phase 2: Data & Maps**
   - AdvancedDataTable (Compliance records)
   - TerritoryMapClusterChoropleth (Field operations)
   - AuditTimeline (Regulatory history)

3. **Phase 3: Advanced UX**
   - FrostedModal (Approval workflows)
   - RichMediaCapture (Document uploads)
   - ProgressDonutLiquid (Processing status)

Each component integrates seamlessly with the pharmaceutical theme system and maintains DGDA compliance standards while delivering premium user experiences.