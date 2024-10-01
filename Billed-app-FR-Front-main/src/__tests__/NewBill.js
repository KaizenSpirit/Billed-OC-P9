/**
 * @jest-environment jsdom
 */
import { fireEvent } from "@testing-library/dom";
import mockStore from "../__mocks__/store";
import { screen } from "@testing-library/dom";
import NewBill from "../containers/NewBill.js";
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

describe("Given I am connected as an employee", () => {
  describe("When I upload a file", () => {
    test("should update fileName when extension is valid", () => {
      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const fileInput = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      fileInput.addEventListener("change", handleChangeFile);

      const validFile = new File(["sample.jpg"], "sample.jpg", {
        type: "image/jpg",
      });
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(newBill.fileName).toBe("sample.jpg");
    });

    test("should trigger alert and reset input when extension is invalid", () => {
      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const fileInput = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      fileInput.addEventListener("change", handleChangeFile);

      const invalidFile = new File(["sample.pdf"], "sample.pdf", {
        type: "application/pdf",
      });
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(
        "Veuillez sélectionner un fichier au format jpg, jpeg ou png"
      );
      expect(fileInput.value).toBe("");
    });
  });

  describe("When I submit a new bill form", () => {
    test("Then it should call updateBill and redirect to Bills page", () => {
      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe("When I submint a new bill form", () => {
    test("Then the NewBill page should be displayed with the correct UI", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });

    describe("When I submit a new bill form", () => {
      test("Then it should create a new bill and redirect to Bills page", async () => {
        document.body.innerHTML = NewBillUI();
        //POST test
        const createBillMock = jest.spyOn(mockStore.bills(), "create").mockResolvedValueOnce({
          key: "1234",
          fileUrl: "https://localhost:3456/images/test.jpg",
        });

        const newBill = new NewBill({ 
          document, 
          onNavigate, 
          store: mockStore, 
          localStorage: window.localStorage 
        });

        fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
        fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train Paris-Lyon" } });
        fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } });
        fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-09-25" } });
        fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } });
        fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
        fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Voyage d'affaires" } });

        const fileInput = screen.getByTestId("file");
        const file = new File(["sample.jpg"], "sample.jpg", { type: "image/jpg" });
        fireEvent.change(fileInput, { target: { files: [file] } });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn(newBill.handleSubmit);
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
      
        expect(handleSubmit).toHaveBeenCalled();
        expect(createBillMock).toHaveBeenCalledTimes(1);
        expect(createBillMock).toHaveBeenCalledWith({
          data: expect.any(FormData),
          headers: { noContentType: true }
        });

        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      });
    });
  });
})