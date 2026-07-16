<?php

namespace App\Http\Controllers;

use App\Services\GsamApiClient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(protected GsamApiClient $gsam)
    {
    }

    public function index(Request $request)
    {
        $valueDate = $request->input('value_date', now()->format('Y-m-d'));
        $currency  = $request->input('currency', 'USD');
        // The .NET API expects a numeric currency ID, not a code like "USD".
        // 9 matches the default the Next.js app used — adjust if your
        // CurrencyRate params table uses a different ID for USD.
        $currencyId = (int) $request->input('currency_id', 9);

        $clientDetails = $this->gsam->clientDetails();
        $shareMovement = $this->gsam->shareMovement($valueDate);
        $fum           = $this->gsam->fundsUnderManagement($valueDate, $currencyId);
        $cashMovement  = $this->getCashMovement($valueDate);

        return Inertia::render('Dashboard', [
            'filters' => [
                'value_date' => $valueDate,
                'currency'   => $currency,
            ],
            'clientDetails'        => $clientDetails,
            'shareMovement'        => $shareMovement,
            'fundsUnderManagement' => [
                'rows' => $fum['rows'] ?? [],
                'sums' => $fum['sums'] ?? null,
            ],
            'cashMovement' => $cashMovement,
        ]);
    }

    /**
     * Combines Transaction (deposits/withdrawals), MaturitiesCashMovement, and
     * PlacementsCashMovement into the 6-slice breakdown the Cash Movement
     * widget shows — mirrors the merge logic PieChart_CashMovementVV.tsx did
     * client-side in the original Next.js app.
     */
    protected function getCashMovement(string $valueDate): array
    {
        $date = \Carbon\Carbon::parse($valueDate);
        $monthStart = $date->copy()->startOfMonth()->format('d F Y');
        $monthEnd   = $date->copy()->endOfMonth()->format('d F Y');
        $endDateIso = $date->copy()->format('Y-m-d');

        \Log::info('GSAM EndDate being sent', ['endDateIso' => $endDateIso]);

        $tx  = $this->gsam->transaction($monthStart, $monthEnd);
        $mat = $this->gsam->maturitiesCashMovement($endDateIso);
        $pla = $this->gsam->placementsCashMovement($endDateIso);

        $totalDeposits = 0;
        $totalWithdrawals = 0;
        foreach ($tx as $row) {
            $totalDeposits    += (float) str_replace(',', '', $row['deposits'] ?? 0);
            $totalWithdrawals += (float) str_replace(',', '', $row['withdrawal'] ?? 0);
        }

        $assetMaturities     = (float) str_replace(',', '', $mat[0]['totalMaturities'] ?? 0);
        $liabilityMaturities = (float) str_replace(',', '', $mat[0]['totalMaturitiesLiability'] ?? 0);
        $assetPlacements     = (float) str_replace(',', '', $pla[0]['totalPlacements'] ?? 0);
        $liabilityPlacements = (float) str_replace(',', '', $pla[0]['totalPlacementsLiability'] ?? 0);

        $items = [
            ['name' => 'Total Deposits',       'value' => $totalDeposits],
            ['name' => 'Total Withdrawals',    'value' => $totalWithdrawals],
            ['name' => 'Asset Maturities',     'value' => $assetMaturities],
            ['name' => 'Liability Maturities', 'value' => $liabilityMaturities],
            ['name' => 'Asset Placements',     'value' => $assetPlacements],
            ['name' => 'Liability Placements', 'value' => $liabilityPlacements],
        ];

        return [
            'items' => $items,
            'total' => array_sum(array_column($items, 'value')),
        ];
    }
}