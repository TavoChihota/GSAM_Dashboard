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
        $topGainsLosses = $this->getTopGainsAndLosses();
        $cashFlowForecast = $this->getCashFlowForecast($valueDate);
        $maturities = $this->getMaturities($valueDate);

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
            'cashMovement'      => $cashMovement,
            'topGainsLosses'    => $topGainsLosses,
            'cashFlowForecast'  => $cashFlowForecast,
            'maturities'        => $maturities,
        ]);
    }

    /**
     * Fetches maturity deal rows for both the asset and liability side,
     * each with a totals row — mirrors the two MaturityDataGrid instances
     * (isAssets=true / isAssets=false) from the original app.
     */
    protected function getMaturities(string $valueDate): array
    {
        $date = \Carbon\Carbon::parse($valueDate);
        $startDate = $date->copy()->startOfMonth()->format('Y-m-d');
        $endDate   = $date->copy()->format('Y-m-d');

        $buildSide = function (array $rows) {
            $sum = fn ($field) => array_sum(array_map(fn ($r) => (float) ($r[$field] ?? 0), $rows));
            return [
                'rows' => $rows,
                'totals' => [
                    'count'         => count($rows),
                    'nominal'       => $sum('nominal'),
                    'interest'      => $sum('interest'),
                    'maturityValue' => $sum('maturityValue'),
                    'netAmount'     => $sum('netAmount'),
                ],
            ];
        };

        return [
            'assets'      => $buildSide($this->gsam->maturities($startDate, $endDate, true)),
            'liabilities' => $buildSide($this->gsam->maturities($startDate, $endDate, false)),
        ];
    }

    /**
     * Fetches per-instrument cash flow rows from the 1st of the selected
     * month through the selected date, plus pre-computed column totals for
     * the summary row (mirrors CashFlowForecastGrid.js's DevExtreme Summary).
     */
    protected function getCashFlowForecast(string $valueDate): array
    {
        $date = \Carbon\Carbon::parse($valueDate);
        $startDate = $date->copy()->startOfMonth()->format('Y-m-d');
        $endDate   = $date->copy()->format('Y-m-d');

        $rows = $this->gsam->cashFlowForecast($startDate, $endDate);

        $sum = fn ($field) => array_sum(array_map(fn ($r) => (float) ($r[$field] ?? 0), $rows));

        return [
            'rows'  => $rows,
            'totals' => [
                'count'       => count($rows),
                'price'       => $sum('price'),
                'interest'    => $sum('interest'),
                'cashFlow'    => $sum('cashFlow'),
                'cashFlowIn'  => $sum('cashFlowIn'),
                'cashFlowOut' => $sum('cashFlowOut'),
            ],
        ];
    }

    /**
     * Splits the flat Top5GainsAndLosses response into two sorted, capped
     * lists — mirrors the client-side filter/sort Table_Top5GainsAndLosses.tsx
     * did in the original Next.js app.
     */
    protected function getTopGainsAndLosses(): array
    {
        $rows = $this->gsam->top5GainsAndLosses();

        $gains = collect($rows)
            ->filter(fn ($r) => str_contains(strtolower($r['category'] ?? ''), 'gain'))
            ->sortByDesc(fn ($r) => $r['percentageDifference'] ?? 0)
            ->take(5)
            ->values()
            ->toArray();

        $losses = collect($rows)
            ->filter(fn ($r) => str_contains(strtolower($r['category'] ?? ''), 'loss'))
            ->sortBy(fn ($r) => $r['percentageDifference'] ?? 0)
            ->take(5)
            ->values()
            ->toArray();

        return ['gains' => $gains, 'losses' => $losses];
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