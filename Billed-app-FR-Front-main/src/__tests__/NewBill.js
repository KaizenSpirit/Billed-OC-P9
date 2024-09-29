/**
 * @jest-environment jsdom
 */

import mockStore from "../__mocks__/store";
import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes";

jest.mock("../app/store", () => mockStore);

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

beforeEach(() => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({ type: "Employee", email: "a@a" })
  );
  global.alert = jest.fn();
});

describe("Given I am connected as an employee and on NewBill Page", () => {
  test("Then the NewBill page should be displayed with the correct UI", () => {
    document.body.innerHTML = NewBillUI();
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
  });
});

