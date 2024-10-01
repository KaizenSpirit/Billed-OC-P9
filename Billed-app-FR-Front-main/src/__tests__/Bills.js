/**
 * @jest-environment jsdom
 */

import {screen, waitFor,fireEvent} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

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

  describe("When I click on New Bill button", () => {
    test("Then it should navigate to the New Bill page", () => {
      const onNavigate = jest.fn();
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
      const newBillButton = document.createElement('button');
      newBillButton.setAttribute('data-testid', 'btn-new-bill');
      document.body.appendChild(newBillButton);
  
      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);
      newBillButton.addEventListener('click', handleClickNewBill);
      fireEvent.click(newBillButton);
  
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });
  })

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

  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.com" }));
      
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      
      await waitFor(() => screen.getByText("Mes notes de frais"));
      
      const billsList = screen.getByTestId("tbody");
      expect(billsList).toBeTruthy();
      expect(billsList.children.length).toBeGreaterThan(0); 
    });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      );
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@test.com"
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          }
        };
      });
        
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
        
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          }
        };
      });
        
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
        
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
      });
    });
  });
});

