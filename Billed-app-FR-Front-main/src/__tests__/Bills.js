/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

// Integration test for modal opening
describe("When clicking on an eye icon", () => {
  test("Then, modal should open and have a title and a file url", () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    document.body.innerHTML = BillsUI({ data: bills });
    const store = null;
    const bill = new Bills({
      document,
      onNavigate,
      store,
      localStorage: window.localStorage,
    });

    const modale = document.getElementById("modaleFile");
    $.fn.modal = jest.fn(() => modale.classList.add("show"));

    const eye = screen.getAllByTestId("icon-eye")[0];
    const handleClickIconEye = jest.fn(bill.handleClickIconEye(eye));

    eye.addEventListener("click", handleClickIconEye);
    userEvent.click(eye);
    expect(handleClickIconEye).toHaveBeenCalled();

    expect(modale.classList).toContain("show");

    expect(screen.getByText("Justificatif")).toBeTruthy();
    expect(bills[0].fileUrl).toBeTruthy();
  });
});