import { expect, test } from "@playwright/test";

test.describe("auth", () => {
  test("shows login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });

  test("login flow with backend", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("test@gmail.com");
    await page.getByLabel(/senha/i).fill("test");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page).toHaveURL("/");
    await expect(
      page.getByText(/usuário.*test@gmail.com.*logado/i),
    ).toBeVisible();
  });
});
