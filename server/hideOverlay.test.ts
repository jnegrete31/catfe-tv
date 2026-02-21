import { describe, expect, it, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Track created screen IDs for cleanup
const createdScreenIds: number[] = [];

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Clean up all test screens after all tests complete
afterAll(async () => {
  const ctx = createAdminContext();
  const caller = appRouter.createCaller(ctx);
  for (const id of createdScreenIds) {
    try {
      await caller.screens.delete({ id });
    } catch {
      // Screen may already be deleted, ignore
    }
  }
});

describe("hideOverlay field", () => {
  it("creates a screen with hideOverlay defaulting to false and verifies via getAll", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.create({
      title: "Test HideOverlay Default",
      type: "EVENT",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    createdScreenIds.push(result.id);

    // Verify the field via getAll
    const allScreens = await caller.screens.getAll();
    const created = allScreens.find((s: any) => s.id === result.id);
    expect(created).toBeDefined();
    expect(created!.hideOverlay).toBe(false);
  });

  it("creates a screen with hideOverlay set to true and verifies via getAll", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.create({
      title: "Test HideOverlay True",
      type: "EVENT",
      hideOverlay: true,
    });

    expect(result).toBeDefined();
    createdScreenIds.push(result.id);

    const allScreens = await caller.screens.getAll();
    const created = allScreens.find((s: any) => s.id === result.id);
    expect(created).toBeDefined();
    expect(created!.hideOverlay).toBe(true);
  });

  it("updates hideOverlay from false to true", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create with default (false)
    const result = await caller.screens.create({
      title: "Test HideOverlay Update",
      type: "EVENT",
    });
    createdScreenIds.push(result.id);

    // Update to true
    await caller.screens.update({
      id: result.id,
      data: { hideOverlay: true },
    });

    // Verify
    const allScreens = await caller.screens.getAll();
    const updated = allScreens.find((s: any) => s.id === result.id);
    expect(updated).toBeDefined();
    expect(updated!.hideOverlay).toBe(true);
  });

  it("getAll returns hideOverlay field as boolean for all screens", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const screens = await caller.screens.getAll();
    expect(screens.length).toBeGreaterThan(0);
    for (const s of screens) {
      expect(typeof s.hideOverlay).toBe("boolean");
    }
  });
});
