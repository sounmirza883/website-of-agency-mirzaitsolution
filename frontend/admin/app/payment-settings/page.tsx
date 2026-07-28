"use client";

import { useEffect, useState } from "react";
import { usePaymentSettings, useUpdatePaymentSettings } from "../hooks";

const FIELDS: Array<[key: string, label: string, placeholder: string]> = [
  ["bankName", "Bank Name", "e.g. Habib Bank Limited"],
  ["accountTitle", "Account Title", "e.g. Mirza IT Solution"],
  ["accountNumber", "Account Number", "e.g. 0123456789"],
  ["iban", "IBAN", "e.g. PK00HABB0000000123456789"],
  ["branchCode", "Branch Code", "e.g. 1234"],
  ["swiftCode", "SWIFT / BIC Code", "e.g. HABBPKKA"],
];

export default function PaymentSettingsPage() {
  const { data: settings } = usePaymentSettings();
  const updatePaymentSettings = useUpdatePaymentSettings();
  const [form, setForm] = useState({
    bankName: "", accountTitle: "", accountNumber: "", iban: "", branchCode: "", swiftCode: "", instructions: "",
  });

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
      <form onSubmit={handleSubmit} className="max-w-xl bg-white border border-gray-200 rounded-xl p-6">
        {updatePaymentSettings.isError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{(updatePaymentSettings.error as Error).message}</div>
        )}
        {updatePaymentSettings.isSuccess && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">Payment settings saved.</div>
        )}
        <div className="space-y-3">
          {FIELDS.map(([key, label, placeholder]) => (
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
          <div>
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
        <div className="flex justify-end mt-6">
          <button type="submit" disabled={updatePaymentSettings.isPending} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
            {updatePaymentSettings.isPending ? "Saving…" : "Save Payment Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
