/**
 * @jest-environment jsdom
 */

// imports nécessaires
import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";

// Description du premier test
describe("Given I am connected as an employee and on NewBill Page", () => {
  test("Then the NewBill page should be displayed with the correct UI", () => {
    // Définir le contenu du DOM avec le formulaire NewBill
    document.body.innerHTML = NewBillUI();
    
    // Vérification que la page s'affiche avec les bons éléments
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
  });
});

