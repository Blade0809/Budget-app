import { describe, expect, it } from "vitest";
import { t } from "../src/i18n.js";

describe("i18n", () => {
  it("returns English translations", () => {
    expect(t("en", "dashboard")).toBe("Dashboard");
  });

  it("returns Chinese translations", () => {
    expect(t("zh", "dashboard")).toBe("控制面板");
  });

  it("falls back to English for missing languages", () => {
    expect(t("fr", "dashboard")).toBe("Dashboard");
  });

  it("returns the key when no translation exists", () => {
    expect(t("en", "missing.key")).toBe("missing.key");
  });
});
