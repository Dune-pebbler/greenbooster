"use client";

import { useState, useEffect } from "react";
import { getSettings } from "@/app/actions/settingsActions";
import { Settings } from "@/types/settings";

interface BudgetProps {
  totalAmount: number;
}

export default function Budget({ totalAmount }: BudgetProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const result = await getSettings();
        if (result.success && result.data) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Format currency values
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate budget breakdown with all factors from settings
  const calculateBudgetBreakdown = () => {
    if (!settings) return null;

    // Start with base amount (direct costs)
    const directCosts = Math.max(0, totalAmount);

    
    const customValue1Amount = directCosts > 0 ? settings.customValue1 || 0 : 0;
    const customValue2Amount =  directCosts > 0 ? settings.customValue2 || 0 : 0;

    // Subtotal after direct costs and custom values
    const subtotalDirectAndCustom =
      directCosts + customValue1Amount + customValue2Amount;

    // ABK / Materieel
    const abkMaterieelAmount =
      subtotalDirectAndCustom * (settings.abkMaterieel / 100);

    // Subtotal after ABK
    const subtotalAfterABK = subtotalDirectAndCustom + abkMaterieelAmount;

    // Afkoop
    const afkoopAmount = subtotalDirectAndCustom * (settings.afkoop / 100);

    // Subtotal "Directe kosten + ABK + Afkoop"
    const subtotalDirectABKAfkoop = subtotalAfterABK + afkoopAmount;

    // Kosten t.b.v. nadere planuitwerking
    const planuitwerkingAmount =
      subtotalDirectAndCustom * (settings.kostenPlanuitwerking / 100);

    // Subtotal after planuitwerking
    const subtotalAfterPlanuitwerking =
      subtotalDirectABKAfkoop + planuitwerkingAmount;

    // Nazorg / Service
    const nazorgServiceAmount =
      subtotalDirectAndCustom * (settings.nazorgService / 100);

    // CAR / PI / DIC verzekering
    const carPiDicAmount =
      subtotalDirectAndCustom * (settings.carPiDicVerzekering / 100);

    // Bankgarantie
    const bankgarantieAmount =
      subtotalDirectAndCustom * (settings.bankgarantie / 100);

    // Algemene kosten (AK)
    const algemeneKostenAmount =
      subtotalDirectAndCustom * (settings.algemeneKosten / 100);

    // Risico
    const risicoAmount = subtotalDirectAndCustom * (settings.risico / 100);

    // Winst
    const winstAmount = subtotalDirectAndCustom * (settings.winst / 100);

    // Subtotal "Bouwkosten"
    const subtotalBouwkosten =
      subtotalAfterPlanuitwerking +
      nazorgServiceAmount +
      carPiDicAmount +
      bankgarantieAmount +
      algemeneKostenAmount +
      risicoAmount +
      winstAmount;

    // Bijkomende kosten: Planvoorbereiding
    const planvoorbereidingAmount =
      subtotalDirectAndCustom * (settings.planvoorbereiding / 100);

    // Bijkomende kosten: Huurdersbegeleiding
    const huurdersbegeleidingAmount =
      subtotalDirectAndCustom * (settings.huurdersbegeleiding / 100);

    // Subtotal after Bijkomende kosten
    const subtotalAfterBijkomendeKosten =
      subtotalBouwkosten + planvoorbereidingAmount + huurdersbegeleidingAmount;

    // Total offering excluding VAT
    const totalExclVAT = subtotalAfterBijkomendeKosten;

    // BTW (VAT)
    const vat = totalExclVAT * (settings.vatPercentage / 100);

    // Final amount including VAT
    const finalAmount = totalExclVAT + vat;

    return {
      directCosts,
      customValue1Amount,
      customValue2Amount,
      subtotalDirectAndCustom,
      abkMaterieelAmount,
      subtotalAfterABK,
      afkoopAmount,
      subtotalDirectABKAfkoop,
      planuitwerkingAmount,
      subtotalAfterPlanuitwerking,
      nazorgServiceAmount,
      carPiDicAmount,
      bankgarantieAmount,
      algemeneKostenAmount,
      risicoAmount,
      winstAmount,
      subtotalBouwkosten,
      planvoorbereidingAmount,
      huurdersbegeleidingAmount,
      subtotalAfterBijkomendeKosten,
      totalExclVAT,
      vat,
      finalAmount,
    };
  };

  const breakdown = calculateBudgetBreakdown();

  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section className="budget tile">
      <div className="budget__header">
        <h4 className="tile-title">Kosten</h4>
        {!isLoading && breakdown && (
          <button
            onClick={toggleExpanded}
            className="budget__toggle-btn"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Verberg details" : "Toon details"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="budget__loading">Berekenen...</div>
      ) : !settings ? (
        <div className="budget__error">Kon instellingen niet laden</div>
      ) : (
        <>
          <div className="budget__amount">
            <span className="budget__currency">€</span>
            <span className="budget__sum">
              {breakdown ? formatCurrency(breakdown.finalAmount) : "0,00"}
            </span>
            <span className="budget__vat-note">incl. BTW</span>
          </div>

          {isExpanded && breakdown && (
            <div className="budget__breakdown">
              {/* Section 1: Direct costs and custom values */}
              <div className="budget__section">
                <div className="budget__line budget__line--main">
                  <span>Directe kosten</span>
                  <span>€ {formatCurrency(breakdown.directCosts)}</span>
                </div>
                {settings.customValue1 > 0 && (
                  <div className="budget__line">
                    <span>{settings.customValue1Name || "Extra veld 1"}</span>
                    <span>
                      € {formatCurrency(breakdown.customValue1Amount)}
                    </span>
                  </div>
                )}

                {settings.customValue2 > 0 && (
                  <div className="budget__line">
                    <span>{settings.customValue2Name || "Extra veld 2"}</span>
                    <span>
                      € {formatCurrency(breakdown.customValue2Amount)}
                    </span>
                  </div>
                )}

                <div className="budget__line budget__line--subtotal">
                  <span>Subtotaal</span>
                  <span>
                    € {formatCurrency(breakdown.subtotalDirectAndCustom)}
                  </span>
                </div>
              </div>

              {/* Section 2: ABK */}
              <div className="budget__section">
                <div className="budget__line">
                  <span>
                    ABK / materieel volgens begroting ({settings.abkMaterieel}%)
                  </span>
                  <span>€ {formatCurrency(breakdown.abkMaterieelAmount)}</span>
                </div>

                <div className="budget__line budget__line--subtotal">
                  <span>Subtotaal na ABK</span>
                  <span>€ {formatCurrency(breakdown.subtotalAfterABK)}</span>
                </div>
              </div>

              {/* Section 3: Afkoop */}
              <div className="budget__section">
                <div className="budget__line">
                  <span>Afkoop ({settings.afkoop}%)</span>
                  <span>€ {formatCurrency(breakdown.afkoopAmount)}</span>
                </div>

                <div className="budget__line budget__line--subtotal">
                  <span>Directe kosten + ABK + Afkoop</span>
                  <span>
                    € {formatCurrency(breakdown.subtotalDirectABKAfkoop)}
                  </span>
                </div>
              </div>

              {/* Section 4: Planuitwerking */}
              <div className="budget__section">
                <div className="budget__line">
                  <span>
                    Kosten t.b.v. nadere planuitwerking (
                    {settings.kostenPlanuitwerking}%)
                  </span>
                  <span>
                    € {formatCurrency(breakdown.planuitwerkingAmount)}
                  </span>
                </div>

                <div className="budget__line budget__line--subtotal">
                  <span>Subtotaal na planuitwerking</span>
                  <span>
                    € {formatCurrency(breakdown.subtotalAfterPlanuitwerking)}
                  </span>
                </div>
              </div>

              {/* Section 5: Various percentages leading to Bouwkosten */}
              <div className="budget__section">
                <div className="budget__line">
                  <span>Nazorg / Service ({settings.nazorgService}%)</span>
                  <span>€ {formatCurrency(breakdown.nazorgServiceAmount)}</span>
                </div>

                <div className="budget__line">
                  <span>
                    CAR / PI / DIC verzekering ({settings.carPiDicVerzekering}%)
                  </span>
                  <span>€ {formatCurrency(breakdown.carPiDicAmount)}</span>
                </div>

                <div className="budget__line">
                  <span>Bankgarantie ({settings.bankgarantie}%)</span>
                  <span>€ {formatCurrency(breakdown.bankgarantieAmount)}</span>
                </div>

                <div className="budget__line">
                  <span>Algemene kosten (AK) ({settings.algemeneKosten}%)</span>
                  <span>
                    € {formatCurrency(breakdown.algemeneKostenAmount)}
                  </span>
                </div>

                <div className="budget__line">
                  <span>Risico ({settings.risico}%)</span>
                  <span>€ {formatCurrency(breakdown.risicoAmount)}</span>
                </div>

                <div className="budget__line">
                  <span>Winst ({settings.winst}%)</span>
                  <span>€ {formatCurrency(breakdown.winstAmount)}</span>
                </div>

                <div className="budget__line budget__line--subtotal">
                  <span>Bouwkosten</span>
                  <span>€ {formatCurrency(breakdown.subtotalBouwkosten)}</span>
                </div>
              </div>

              {/* Section 6: Bijkomende kosten */}
              <div className="budget__section">
                <div className="budget__line">
                  <span>Planvoorbereiding ({settings.planvoorbereiding}%)</span>
                  <span>
                    € {formatCurrency(breakdown.planvoorbereidingAmount)}
                  </span>
                </div>

                <div className="budget__line">
                  <span>
                    Huurdersbegeleiding ({settings.huurdersbegeleiding}%)
                  </span>
                  <span>
                    € {formatCurrency(breakdown.huurdersbegeleidingAmount)}
                  </span>
                </div>
              </div>

              {/* Section 7: Final totals */}
              <div className="budget__section">
                <div className="budget__line budget__line--subtotal">
                  <span>Totale aanbieding excl. BTW</span>
                  <span>€ {formatCurrency(breakdown.totalExclVAT)}</span>
                </div>

                <div className="budget__line">
                  <span>BTW ({settings.vatPercentage}%)</span>
                  <span>€ {formatCurrency(breakdown.vat)}</span>
                </div>

                <div className="budget__line budget__line--final">
                  <span>Totaal incl. BTW</span>
                  <span>€ {formatCurrency(breakdown.finalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .budget {
          display: flex;
          flex-direction: column;
        }

        .budget__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .budget__toggle-btn {
          background: transparent;
          border: none;
          color: var(--accent-color, #4361ee);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
          min-width: 92px;
        }

        .budget__toggle-btn:hover {
          background: rgba(67, 97, 238, 0.1);
        }

        .budget__amount {
          display: flex;
          align-items: baseline;
          margin-bottom: 10px;
          justify-content: center;
        }

        .budget__currency {
          font-size: 24px;
          font-weight: bold;
          margin-right: 4px;
        }

        .budget__sum {
          font-size: 32px;
          font-weight: bold;
        }

        .budget__vat-note {
          font-size: 14px;
          color: #666;
          margin-left: 8px;
        }

        .budget__breakdown {
          margin-top: 16px;
          border-top: 1px solid #eaeaea;
          padding-top: 16px;
        }

        .budget__section {
          margin-bottom: 16px;
        }

        .budget__section:last-child {
          margin-bottom: 0;
        }

        .budget__heading {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #eaeaea;
        }

        .budget__line {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .budget__line span {
          font-size: 15px;
        }
        .budget__line--subtotal span {
          font-size: 16px;
        }
        .budget__line--main {
          font-weight: 600;
        }

        .budget__line--subtotal {
          border-top: 1px dashed #eaeaea;
          padding-top: 8px;
          margin-top: 8px;
        }

        .budget__line--subtotal span {
          font-weight: 600;
        }

        .budget__line--final span {
          font-weight: 700;
          font-size: 18px;
          padding-top: 12px;
          margin-top: 12px;
        }

        .budget__loading {
          font-size: 16px;
          color: #666;
          text-align: center;
          padding: 20px 0;
        }

        .budget__error {
          font-size: 16px;
          color: #e53e3e;
          text-align: center;
          padding: 20px 0;
        }
      `}</style>
    </section>
  );
}
