import { z } from 'zod';
export const schemas = {
  pages: {
    home: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subheadline": z.string(),
        "ctaPrimary": z.string(),
        "ctaSecondary": z.string()
      }),
      "stats": z.array(z.object({
        "id": z.string(),
        "value": z.string(),
        "label": z.string()
      })),
      "about": z.object({
        "badge": z.string(),
        "headline": z.string(),
        "body": z.string(),
        "benefits": z.array(z.string())
      }),
      "products": z.array(z.object({
        "id": z.string(),
        "name": z.string(),
        "category": z.string(),
        "description": z.string()
      })),
      "process": z.array(z.object({
        "id": z.string(),
        "step": z.string(),
        "title": z.string(),
        "description": z.string()
      })),
      "benefits": z.array(z.object({
        "id": z.string(),
        "icon": z.string(),
        "title": z.string(),
        "description": z.string()
      })),
      "testimonials": z.array(z.object({
        "id": z.string(),
        "name": z.string(),
        "location": z.string(),
        "quote": z.string(),
        "years": z.string()
      })),
      "cta": z.object({
        "headline": z.string(),
        "subtext": z.string(),
        "ctaPrimary": z.string(),
        "ctaSecondary": z.string()
      }),
      "reach": z.object({
        "headline": z.string(),
        "subtext": z.string(),
        "states": z.string(),
        "districts": z.string(),
        "farmers": z.string()
      })
    }),
    about: z.object({
      "hero": z.object({
        "badge": z.string(),
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "overview": z.object({
        "headline": z.string(),
        "body1": z.string(),
        "body2": z.string(),
        "established": z.string(),
        "employees": z.string(),
        "plants": z.string(),
        "capacity": z.string()
      }),
      "mission": z.object({
        "headline": z.string(),
        "mission": z.string(),
        "vision": z.string(),
        "values": z.array(z.object({
          "id": z.string(),
          "title": z.string(),
          "desc": z.string()
        }))
      }),
      "milestones": z.array(z.object({
        "id": z.string(),
        "year": z.string(),
        "event": z.string()
      })),
      "awards": z.array(z.object({
        "id": z.string(),
        "title": z.string(),
        "body": z.string()
      }))
    }),
    products: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "categories": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      })),
      "products": z.array(z.object({
        "id": z.string(),
        "name": z.string(),
        "category": z.string(),
        "npk": z.string(),
        "form": z.string(),
        "crops": z.string(),
        "image": z.string().optional(),
        "desc": z.string(),
        "benefits": z.array(z.string())
      }))
    }),
    benefits: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "financialBenefits": z.array(z.object({
        "id": z.string(),
        "title": z.string(),
        "value": z.string(),
        "desc": z.string()
      })),
      "subsidySchemes": z.array(z.object({
        "id": z.string(),
        "scheme": z.string(),
        "ministry": z.string(),
        "desc": z.string(),
        "benefit": z.string()
      })),
      "operationalSupport": z.array(z.object({
        "id": z.string(),
        "icon": z.string(),
        "title": z.string(),
        "desc": z.string()
      })),
      "investmentTiers": z.array(z.object({
        "id": z.string(),
        "tier": z.string(),
        "investment": z.string(),
        "area": z.string(),
        "products": z.string(),
        "support": z.string()
      }))
    }),
    franchise: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "overview": z.object({
        "headline": z.string(),
        "body": z.string(),
        "highlights": z.array(z.object({
          "id": z.string(),
          "label": z.string(),
          "desc": z.string()
        }))
      }),
      "types": z.array(z.object({
        "id": z.string(),
        "type": z.string(),
        "icon": z.string(),
        "investment": z.string(),
        "territory": z.string(),
        "desc": z.string(),
        "requirements": z.array(z.string())
      })),
      "eligibility": z.object({
        "headline": z.string(),
        "criteria": z.array(z.object({
          "id": z.string(),
          "item": z.string()
        }))
      }),
      "cta": z.object({
        "headline": z.string(),
        "body": z.string(),
        "button": z.string()
      })
    }),
    franchiseprocess: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "stages": z.array(z.object({
        "id": z.string(),
        "step": z.string(),
        "title": z.string(),
        "duration": z.string(),
        "desc": z.string(),
        "docs": z.array(z.string()),
        "status": z.string()
      })),
      "timeline": z.object({
        "total": z.string(),
        "note": z.string()
      }),
      "faq": z.array(z.object({
        "id": z.string(),
        "q": z.string(),
        "a": z.string()
      }))
    }),
    faq: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "categories": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      })),
      "faqs": z.array(z.object({
        "id": z.string(),
        "cat": z.string(),
        "q": z.string(),
        "a": z.string()
      }))
    }),
    contact: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "offices": z.array(z.object({
        "id": z.string(),
        "name": z.string(),
        "address": z.string(),
        "email": z.string(),
        "hours": z.string()
      })),
      "formTitle": z.string(),
      "formSubtitle": z.string(),
      "subjects": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      }))
    }),
    apply: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "steps": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "desc": z.string()
      })),
      "franchiseTypes": z.array(z.object({
        "id": z.string(),
        "value": z.string(),
        "label": z.string(),
        "desc": z.string(),
        "investment": z.string()
      })),
      "indianStates": z.array(z.object({
        "id": z.string(),
        "value": z.string()
      })),
      "requiredDocs": z.array(z.object({
        "id": z.string(),
        "field": z.string(),
        "label": z.string(),
        "required": z.boolean(),
        "accept": z.string()
      }))
    }),
    login: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "leftPanel": z.object({
        "heading": z.string(),
        "headingHighlight": z.string(),
        "description": z.string()
      }),
      "features": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "desc": z.string()
      })),
      "footer": z.string(),
      "applyPrompt": z.string(),
      "applyLinkText": z.string()
    }),
    dashboard: z.object({
      "overview": z.object({
        "welcomeLabel": z.string(),
        "noProfileNote": z.string(),
        "progressTitle": z.string(),
        "quickAccessTitle": z.string()
      }),
      "stats": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "sub": z.string()
      })),
      "quickLinks": z.array(z.object({
        "id": z.string(),
        "to": z.string(),
        "label": z.string()
      })),
      "progressStages": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      }))
    }),
    dashboard_modules: z.object({
      "payments": z.object({
        "title": z.string(),
        "totalLabel": z.string(),
        "paidLabel": z.string(),
        "pendingLabel": z.string(),
        "emptyText": z.string()
      }),
      "invoices": z.object({
        "title": z.string(),
        "emptyText": z.string()
      }),
      "documents": z.object({
        "title": z.string(),
        "emptyText": z.string()
      }),
      "notifications": z.object({
        "title": z.string(),
        "markAllRead": z.string(),
        "emptyText": z.string()
      }),
      "support": z.object({
        "title": z.string(),
        "newTicketBtn": z.string(),
        "emptyText": z.string(),
        "form": z.object({
          "subjectLabel": z.string(),
          "descriptionLabel": z.string(),
          "categoryLabel": z.string(),
          "priorityLabel": z.string(),
          "submitBtn": z.string(),
          "cancelBtn": z.string()
        })
      }),
      "profile": z.object({
        "title": z.string(),
        "saveBtn": z.string(),
        "savedMsg": z.string()
      }),
      "password": z.object({
        "title": z.string(),
        "currentLabel": z.string(),
        "newLabel": z.string(),
        "confirmLabel": z.string(),
        "submitBtn": z.string()
      }),
      "stock": z.object({
        "title": z.string(),
        "emptyText": z.string()
      }),
      "delivery": z.object({
        "title": z.string(),
        "emptyText": z.string()
      })
    })
  }
};
export type Schemas = typeof schemas;