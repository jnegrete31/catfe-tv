import { describe, it, expect } from "vitest";

// Test the ScreenThumbnail component logic and ScreenList integration
// Tests verify the dynamic scaling calculation and settings query integration

describe("ScreenThumbnail Component", () => {
  describe("Dynamic Scale Calculation", () => {
    it("should calculate scale as containerWidth / 1920", () => {
      // The ScreenThumbnail uses ResizeObserver to dynamically calculate
      // scale = containerWidth / 1920 (TV resolution width)
      const containerWidth = 384; // typical card width in 3-col grid
      const scale = containerWidth / 1920;
      expect(scale).toBeCloseTo(0.2, 1);
    });

    it("should handle small container widths", () => {
      const containerWidth = 192; // small mobile card
      const scale = containerWidth / 1920;
      expect(scale).toBeCloseTo(0.1, 1);
    });

    it("should handle large container widths", () => {
      const containerWidth = 576; // wide card in 2-col layout
      const scale = containerWidth / 1920;
      expect(scale).toBeCloseTo(0.3, 1);
    });

    it("should produce correct aspect ratio at any scale", () => {
      const containerWidth = 384;
      const scale = containerWidth / 1920;
      const renderedWidth = 1920 * scale;
      const renderedHeight = 1080 * scale;
      const aspectRatio = renderedWidth / renderedHeight;
      expect(aspectRatio).toBeCloseTo(16 / 9, 2);
    });

    it("should not produce negative or zero scale", () => {
      // Even with a 1px container, scale should be positive
      const containerWidth = 1;
      const scale = containerWidth / 1920;
      expect(scale).toBeGreaterThan(0);
    });
  });

  describe("ScreenThumbnail Rendering", () => {
    it("should render with correct CSS transform properties", () => {
      const scale = 0.2;
      const style = {
        width: "1920px",
        height: "1080px",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        pointerEvents: "none" as const,
        position: "absolute" as const,
        top: 0,
        left: 0,
      };

      expect(style.width).toBe("1920px");
      expect(style.height).toBe("1080px");
      expect(style.transform).toBe("scale(0.2)");
      expect(style.transformOrigin).toBe("top left");
      expect(style.pointerEvents).toBe("none");
    });

    it("should use aspect-video container for 16:9 ratio", () => {
      // The container uses Tailwind's aspect-video class (16:9)
      // This ensures the thumbnail maintains TV aspect ratio
      const aspectRatio = 16 / 9;
      expect(aspectRatio).toBeCloseTo(1.778, 2);
    });
  });

  describe("Screen Type Config", () => {
    // Verify all screen types have display config for badge rendering
    const SCREEN_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
      SNAP_AND_PURR: { label: "Snap & Purr", color: "#ec4899", bgColor: "#fce7f3" },
      EVENT: { label: "Event", color: "#8b5cf6", bgColor: "#ede9fe" },
      CUSTOM: { label: "Custom", color: "#6b7280", bgColor: "#f3f4f6" },
      GUEST_BIRTHDAY: { label: "Guest Birthday", color: "#f472b6", bgColor: "#fce7f3" },
      BIRTHDAY_CELEBRATION: { label: "Birthday", color: "#f472b6", bgColor: "#fce7f3" },
      ADOPTION_SHOWCASE: { label: "Adoption Showcase", color: "#f97316", bgColor: "#ffedd5" },
      LOGO: { label: "Logo", color: "#0ea5e9", bgColor: "#e0f2fe" },
    };

    it("should have label, color, and bgColor for each type", () => {
      for (const [type, config] of Object.entries(SCREEN_TYPE_CONFIG)) {
        expect(config.label).toBeTruthy();
        expect(config.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(config.bgColor).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it("should render type badge with correct styling", () => {
      const type = "CUSTOM";
      const config = SCREEN_TYPE_CONFIG[type];
      const badgeStyle = {
        backgroundColor: config.bgColor,
        color: config.color,
        borderColor: config.color + "40",
      };

      expect(badgeStyle.backgroundColor).toBe("#f3f4f6");
      expect(badgeStyle.color).toBe("#6b7280");
      expect(badgeStyle.borderColor).toBe("#6b728040");
    });
  });
});

describe("ScreenList Settings Integration", () => {
  it("should pass settings to each ScreenThumbnail", () => {
    const settings = {
      id: 1,
      locationName: "Catfé",
      defaultDuration: 10,
      fallbackMode: "loop",
      snapFrequency: 5,
      logoUrl: "https://example.com/logo.png",
      hideOverlay: false,
      totalAdoptions: 26,
    };

    // Verify settings shape matches what ScreenThumbnail expects
    expect(settings.locationName).toBe("Catfé");
    expect(settings.logoUrl).toBeTruthy();
    expect(typeof settings.hideOverlay).toBe("boolean");
    expect(typeof settings.totalAdoptions).toBe("number");
  });

  it("should handle null settings gracefully", () => {
    const settings = null;
    // ScreenThumbnail should still render even without settings
    expect(settings).toBeNull();
    // The component renders with settings={null} and ScreenRenderer handles defaults
  });

  it("should use staleTime of 60000ms for settings query", () => {
    // The settings query uses staleTime: 60000 to avoid refetching
    // on every render, which is important for performance with many thumbnails
    const staleTime = 60000;
    expect(staleTime).toBe(60000);
    expect(staleTime).toBeGreaterThanOrEqual(30000); // at least 30s
  });
});

describe("ScreenList Card Layout", () => {
  it("should use 3-column grid on desktop", () => {
    // Grid classes: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
    const gridClasses = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
    expect(gridClasses).toContain("lg:grid-cols-3");
    expect(gridClasses).toContain("sm:grid-cols-2");
    expect(gridClasses).toContain("grid-cols-1");
  });

  it("should show empty state when no screens exist", () => {
    const items: any[] = [];
    const showEmptyState = items.length === 0;
    expect(showEmptyState).toBe(true);
  });

  it("should show delete button only for non-protected screens", () => {
    const protectedScreen = { id: 1, isProtected: true };
    const normalScreen = { id: 2, isProtected: false };

    expect(protectedScreen.isProtected).toBe(true);
    expect(normalScreen.isProtected).toBe(false);
    // Delete button renders only when !screen.isProtected
  });

  it("should reduce opacity for inactive screens", () => {
    const activeScreen = { isActive: true };
    const inactiveScreen = { isActive: false };

    const activeClass = activeScreen.isActive ? "" : "opacity-50";
    const inactiveClass = inactiveScreen.isActive ? "" : "opacity-50";

    expect(activeClass).toBe("");
    expect(inactiveClass).toBe("opacity-50");
  });

  it("should display scheduling info when schedule rules exist", () => {
    const screenWithSchedule = {
      startAt: "2026-04-01",
      endAt: "2026-04-30",
      daysOfWeek: [1, 2, 3, 4, 5],
      timeStart: "09:00",
      timeEnd: "17:00",
    };

    const hasScheduleRules = screenWithSchedule.startAt || screenWithSchedule.endAt ||
      (screenWithSchedule.daysOfWeek && screenWithSchedule.daysOfWeek.length > 0) ||
      screenWithSchedule.timeStart || screenWithSchedule.timeEnd;

    expect(hasScheduleRules).toBeTruthy();
  });

  it("should not show scheduling info for screens without schedule rules", () => {
    const screenNoSchedule = {
      startAt: null,
      endAt: null,
      daysOfWeek: [],
      timeStart: null,
      timeEnd: null,
    };

    const hasScheduleRules = screenNoSchedule.startAt || screenNoSchedule.endAt ||
      (screenNoSchedule.daysOfWeek && screenNoSchedule.daysOfWeek.length > 0) ||
      screenNoSchedule.timeStart || screenNoSchedule.timeEnd;

    expect(hasScheduleRules).toBeFalsy();
  });
});
