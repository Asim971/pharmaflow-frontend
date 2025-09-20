import { ReactNode } from 'react';

// Motion Presets for Pharmaceutical UI
export interface MotionPresets {
  hover: {
    transform: string;
    boxShadow: string;
    duration: string;
    easing: string;
  };
  active: {
    scale: string;
    duration: string;
  };
  enter: {
    opacity: string;
    y: string;
    duration: string;
    stagger: string;
  };
  success: {
    pulse: string;
    confetti: string;
    reduceMotionFallback: boolean;
  };
}

// Component Selection Rules
export interface ComponentSelectionRules {
  choose_stepper: string;
  choose_map: string;
  choose_table: string;
  choose_card: string;
  choose_modal: string;
}

// Implementation Patterns
export interface ImplementationPatterns {
  images_and_uploads: string[];
  forms: string[];
  maps: string[];
}

// Performance Constraints
export interface PerformanceConstraints {
  list_virtualization: boolean;
  lazy_load_images: boolean;
  skeleton_first_render: boolean;
  prefetch_key_data: boolean;
}

// Accessibility Rules
export interface AccessibilityRules {
  reduce_motion_support: boolean;
  aria_roles_required: string[];
  contrast_minimum: string;
  keyboard_navigation: string;
}

// Pharmaceutical-specific Patterns
export interface PharmaceuticalPatterns {
  dgda_compliance: {
    signature_required: string[];
    audit_trail: string;
    compliance_indicators: string;
    trust_badges: string;
  };
  trust_building: {
    verified_indicators: string;
    progress_transparency: string;
    security_messaging: string;
    regulatory_badges: string;
  };
  mobile_optimization: {
    touch_targets: string;
    offline_support: string;
    bandwidth_optimization: string;
    field_team_patterns: string;
  };
}

// Main Configuration Interface
export interface ModernComponentPreferences {
  priority_list: string[];
  rules_for_selection: ComponentSelectionRules;
  motion_presets: MotionPresets;
  implementation_patterns: ImplementationPatterns;
  performance_constraints: PerformanceConstraints;
  accessibility_rules: AccessibilityRules;
  pharmaceutical_patterns: PharmaceuticalPatterns;
}

// Component-specific Interfaces
export interface PolishedStepperProps {
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
  className?: string;
}

export interface KPICardProps {
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
  className?: string;
}

export interface TerritoryMapProps {
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
  className?: string;
}

export interface AdvancedDataTableProps {
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
  className?: string;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'file' | 'date' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: any;
  options?: { value: string; label: string }[];
  dgdaRequired?: boolean;
}

export interface ValidationSchema {
  [key: string]: any;
}

export interface GuidedFormProps {
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
  className?: string;
}

// Configuration Export
export const ModernComponentPreferencesConfig: ModernComponentPreferences = {
  priority_list: [
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

  rules_for_selection: {
    choose_stepper: "for any multi-step flow > 2 steps; use glass + progress + shield-check",
    choose_map: "for any geospatial data or territory assignment; include offline support",
    choose_table: "for >10 rows or complex lists; use virtualization + inline charts",
    choose_card: "for KPIs and short summaries; include microcharts and actions",
    choose_modal: "for focused tasks requiring approval or signature; trap focus and provide accessible keyboard shortcuts"
  },

  motion_presets: {
    hover: {
      transform: "translateY(-4px)",
      boxShadow: "lg",
      duration: "0.18s",
      easing: "cubic-bezier(0.2,0.8,0.2,1)"
    },
    active: {
      scale: "0.98",
      duration: "0.06s"
    },
    enter: {
      opacity: "0->1",
      y: "6px->0",
      duration: "0.28s",
      stagger: "0.05s"
    },
    success: {
      pulse: "0.6s",
      confetti: "subtle",
      reduceMotionFallback: true
    }
  },

  implementation_patterns: {
    images_and_uploads: [
      "client-side compression",
      "chunked_upload", 
      "progress_ring",
      "hash_and_verify_on_server"
    ],
    forms: [
      "autosave",
      "idempotency_key",
      "inline_validation",
      "help_drawer_examples"
    ],
    maps: [
      "cluster_markers",
      "choropleth_layer",
      "drill_side_panel",
      "tile_caching_for_pwa"
    ]
  },

  performance_constraints: {
    list_virtualization: true,
    lazy_load_images: true,
    skeleton_first_render: true,
    prefetch_key_data: true
  },

  accessibility_rules: {
    reduce_motion_support: true,
    aria_roles_required: ["stepper", "progressbar", "dialog", "table"],
    contrast_minimum: "4.5:1 for text", 
    keyboard_navigation: "full for all interactive components"
  },

  pharmaceutical_patterns: {
    dgda_compliance: {
      signature_required: ["submission", "approval", "rejection"],
      audit_trail: "all_user_actions",
      compliance_indicators: "visible_throughout_flow",
      trust_badges: "prominently_displayed"
    },
    trust_building: {
      verified_indicators: "green_checkmarks_with_animation",
      progress_transparency: "show_submission_status_realtime",
      security_messaging: "data_encryption_indicators",
      regulatory_badges: "dgda_approved_stamps"
    },
    mobile_optimization: {
      touch_targets: "minimum_44px",
      offline_support: "critical_forms_cached",
      bandwidth_optimization: "progressive_image_loading",
      field_team_patterns: "quick_photo_capture_gps"
    }
  }
} as const;