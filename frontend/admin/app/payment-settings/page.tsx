"use client";

import { useEffect, useState } from "react";
import { usePaymentSettings, useUpdatePaymentSettings } from "../hooks";

const LOCAL_FIELDS: Array<[key: string, label: string, placeholder: string]> = [
  ["bankName", "Bank Name", "e.g. Habib Bank Limited"],
  ["accountTitle", "Account Title", "e.g. Mirza IT Solution"],
  ["accountNumber", "Account Number", "e.g. 0123456789"],
  ["iban", "IBAN", "e.g. PK00HABB0000000123456789"],
  ["branchCode", "Branch Code", "e.g. 1234"],
  ["swiftCode", "SWIFT / BIC Code", "e.g. HABBPKKA"],
];

const INTL_FIELDS: Array<[key: string, label: string, placeholder: string]> = [
  ["intlBankName", "Bank Name", "e.g. Wise / Community Federal Savings Bank"],
  ["intlAccountTitle", "Account Title", "e.g. Mirza IT Solution"],
  ["intlAccountNumber", "Account Number", "e.g. 8001234567"],
  ["intlIban", "IBAN", "e.g. GB00TRWI00000000000000"],
  ["intlSwiftCode", "SWIFT / BIC Code", "e.g. TRWIGB2L"],
];

const EMPTY_FORM = {
  bankName: "", accountTitle: "", accountNumber: "", iban: "", branchCode: "", swiftCode: "", instructions: "",
  intlBankName: "", intlAccountTitle: "", intlAccountNumber: "", intlIban: "", intlSwiftCode: "", intlInstructions: "",
};

function FieldGrid({ fields, form, setForm }: { fields: typeof LOCAL_FIELDS; form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fields.map(([key, label, placeholder]) => (
        <div key={key}>
          <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
          <input
            placeholder={placeholder}
            value={form[key as keyof typeof form]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      ))}
    </div>
  );
}

export default function PaymentSettingsPage() {
  const { data: settings } = usePaymentSettings();
  const updatePaymentSettings = useUpdatePaymentSettings();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!settings) return;
    setForm({
      bankName: settings.bank_name ?? "",
      accountTitle: settings.account_title ?? "",
      accountNumber: settings.account_number ?? "",
      iban: settings.iban ?? "",
      branchCode: settings.branch_code ?? "",
      swiftCode: settings.swift_code ?? "",
      instructions: settings.instructions ?? "",
      intlBankName: settings.intl_bank_name ?? "",
      intlAccountTitle: settings.intl_account_title ?? "",
      intlAccountNumber: settings.intl_account_number ?? "",
      intlIban: settings.intl_iban ?? "",
      intlSwiftCode: settings.intl_swift_code ?? "",
      intlInstructions: settings.intl_instructions ?? "",
    });
  }, [settings]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updatePaymentSettings.mutate(form);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Payment Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Bank details shown to clients when they submit proof of payment for an invoice</p>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {updatePaymentSettings.isError && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{(updatePaymentSettings.error as Error).message}</div>
        )}
        {updatePaymentSettings.isSuccess && (
          <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">Payment settings saved.</div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
          <h2 className="text-sm font-bold mb-4">Local Bank Transfer</h2>
          <FieldGrid fields={LOCAL_FIELDS} form={form} setForm={setForm} />
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Payment Instructions (optional)</label>
            <textarea
              placeholder="Any extra notes for the client, e.g. reference to include with the transfer"
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-vertical"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
          <h2 className="text-sm font-bold mb-4">International Payment</h2>
          <FieldGrid fields={INTL_FIELDS} form={form} setForm={setForm} />
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Payment Instructions (optional)</label>
            <textarea
              placeholder="Any extra notes for international clients"
              value={form.intlInstructions}
              onChange={(e) => setForm({ ...form, intlInstructions: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-vertical"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={updatePaymentSettings.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
            {updatePaymentSettings.isPending ? "Saving…" : "Save Payment Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
