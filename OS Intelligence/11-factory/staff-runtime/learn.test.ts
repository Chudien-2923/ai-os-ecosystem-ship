import { expect, test } from "bun:test";
import { buildLearnPrompt, needsLearnPolicy } from "./learn";
import { isCloseCommand, isLoggable } from "./learning-loop";

const policy = { type: "custom_message", customType: "ai-os.staff-learn", details: { policyVersion: "0.2.9" } };

test("policy đã publish không bị chèn lại khi resume cùng branch", () => {
  expect(needsLearnPolicy([policy, { type: "message" }])).toBe(false);
  expect(needsLearnPolicy([{ ...policy, customType: "another-extension" }])).toBe(true);
});

test("compact phải nạp lại policy dù lịch sử còn marker của phiên cũ", () => {
  expect(needsLearnPolicy([policy, { type: "compaction" }, { type: "message" }])).toBe(true);
  expect(needsLearnPolicy([policy, { type: "compaction" }, policy])).toBe(false);
});

test("policy cũ không ngăn bản mới được nạp; attempt chưa publish không đổi state", () => {
  const branch = [{ ...policy, details: { policyVersion: "0.2.8" } }];
  expect(needsLearnPolicy(branch)).toBe(true);
  expect(needsLearnPolicy(branch)).toBe(true);
  branch.push(policy);
  expect(needsLearnPolicy(branch)).toBe(false);
});

test("chỉ dẫn do adapter sinh không bị ghi thành lời người dùng nguyên văn", () => {
  expect(isLoggable(buildLearnPrompt("sources/quy trình bàn giao.md"))).toBe(false);
  expect(isLoggable("Người dùng muốn học cách bàn giao này")).toBe(true);
});

test("/learn về quy trình chốt bài học không kích hoạt luồng chốt memory", () => {
  expect(isCloseCommand(buildLearnPrompt("học quy trình chốt bài học"))).toBe(false);
  expect(isCloseCommand("/skill:learn tài liệu chốt bài học")).toBe(false);
});
