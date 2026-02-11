import { describe, it, expect, vi, beforeEach } from "vitest";

// Since the chime module uses browser Web Audio API, we test the module structure
// and verify it exports the expected functions

describe("Chime utility", () => {
  it("should export playWelcomeChime and playReminderChime functions", async () => {
    // Mock the AudioContext for Node.js environment
    const mockOscillator = {
      type: "sine",
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockGain = {
      gain: { 
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    
    (globalThis as any).AudioContext = vi.fn().mockImplementation(() => ({
      state: "running",
      currentTime: 0,
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
    }));

    // Dynamic import after mocking
    const chimeModule = await import("../client/src/lib/chime");
    
    expect(typeof chimeModule.playWelcomeChime).toBe("function");
    expect(typeof chimeModule.playReminderChime).toBe("function");
  });

  it("playWelcomeChime should not throw when AudioContext is available", async () => {
    const mockOscillator = {
      type: "sine",
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockGain = {
      gain: { 
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    
    (globalThis as any).AudioContext = vi.fn().mockImplementation(() => ({
      state: "running",
      currentTime: 0,
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
    }));

    const { playWelcomeChime } = await import("../client/src/lib/chime");
    
    // Should not throw
    expect(() => playWelcomeChime(0.3)).not.toThrow();
  });

  it("playReminderChime should not throw when AudioContext is available", async () => {
    const mockOscillator = {
      type: "sine",
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockGain = {
      gain: { 
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    
    (globalThis as any).AudioContext = vi.fn().mockImplementation(() => ({
      state: "running",
      currentTime: 0,
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
    }));

    const { playReminderChime } = await import("../client/src/lib/chime");
    
    // Should not throw
    expect(() => playReminderChime(0.25)).not.toThrow();
  });

  it("should silently fail when AudioContext is not available", async () => {
    // Remove AudioContext to simulate unsupported environment
    delete (globalThis as any).AudioContext;
    
    // Re-import to get fresh module
    vi.resetModules();
    const { playWelcomeChime, playReminderChime } = await import("../client/src/lib/chime");
    
    // Should not throw even without AudioContext
    expect(() => playWelcomeChime()).not.toThrow();
    expect(() => playReminderChime()).not.toThrow();
  });
});
