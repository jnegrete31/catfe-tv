import { describe, it, expect } from "vitest";
import {
  getActivePolls,
  getCurrentPoll,
  getPollWithResults,
  createPoll,
  updatePoll,
  deletePoll,
  submitPollVote,
} from "./db";

describe("Polls System", () => {
  describe("getActivePolls", () => {
    it("should return an array of polls", async () => {
      const polls = await getActivePolls();
      expect(Array.isArray(polls)).toBe(true);
    });
  });

  describe("getCurrentPoll", () => {
    it("should return null or a poll object", async () => {
      const poll = await getCurrentPoll();
      if (poll) {
        expect(poll).toHaveProperty("id");
        expect(poll).toHaveProperty("question");
        expect(poll).toHaveProperty("options");
        expect(poll).toHaveProperty("status");
      } else {
        expect(poll).toBeNull();
      }
    });
  });

  describe("createPoll", () => {
    it("should create a new poll and return its id", async () => {
      const testPoll = {
        question: "Test Poll Question?",
        options: [
          { id: "opt1", text: "Option 1" },
          { id: "opt2", text: "Option 2" },
        ],
        isRecurring: false,
      };

      const result = await createPoll(testPoll);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");

      // Clean up - delete the test poll
      if (result.id) {
        await deletePoll(result.id);
      }
    });
  });

  describe("getPollWithResults", () => {
    it("should return poll with vote counts when poll exists", async () => {
      // First create a test poll
      const testPoll = {
        question: "Test Results Poll?",
        options: [
          { id: "opt1", text: "Option A" },
          { id: "opt2", text: "Option B" },
        ],
        isRecurring: false,
      };

      const created = await createPoll(testPoll);
      const pollId = created.id;

      try {
        const poll = await getPollWithResults(pollId);
        expect(poll).toBeDefined();
        if (poll) {
          expect(poll.question).toBe("Test Results Poll?");
          expect(poll.totalVotes).toBeGreaterThanOrEqual(0);
          expect(poll.parsedOptions).toBeDefined();
          expect(Array.isArray(poll.parsedOptions)).toBe(true);
        }
      } finally {
        // Clean up
        await deletePoll(pollId);
      }
    });

    it("should return null for non-existent poll", async () => {
      const poll = await getPollWithResults(999999);
      expect(poll).toBeNull();
    });
  });

  describe("submitPollVote", () => {
    it("should record a vote for a poll", async () => {
      // Create a test poll
      const testPoll = {
        question: "Test Voting Poll?",
        options: [
          { id: "vote-opt1", text: "Vote Option 1" },
          { id: "vote-opt2", text: "Vote Option 2" },
        ],
        isRecurring: false,
      };

      const created = await createPoll(testPoll);
      const pollId = created.id;
      const testFingerprint = `test-fp-${Date.now()}`;

      try {
        // Activate the poll first
        await updatePoll(pollId, { status: "active" });

        // Record a vote
        await submitPollVote(pollId, "vote-opt1", testFingerprint);

        // Verify vote count increased
        const pollAfter = await getPollWithResults(pollId);
        expect(pollAfter?.totalVotes).toBeGreaterThanOrEqual(1);
      } finally {
        // Clean up
        await deletePoll(pollId);
      }
    });
  });

  describe("updatePoll", () => {
    it("should update poll status", async () => {
      // Create a test poll
      const testPoll = {
        question: "Test Update Poll?",
        options: [{ id: "upd1", text: "Update Option" }],
        isRecurring: false,
      };

      const created = await createPoll(testPoll);
      const pollId = created.id;

      try {
        // Update to active
        await updatePoll(pollId, { status: "active" });

        const updated = await getPollWithResults(pollId);
        expect(updated?.status).toBe("active");
      } finally {
        // Clean up
        await deletePoll(pollId);
      }
    });
  });
});
