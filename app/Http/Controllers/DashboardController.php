<?php

namespace App\Http\Controllers;

use App\Services\GsamApiClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(protected GsamApiClient $gsam)
    {
    }

    public function index(Request $request)
    {
        return Inertia::render('Dashboard', $this->buildDashboardProps($request));
    }

    public function analytics(Request $request)
    {
        return Inertia::render('Analytics', $this->buildDashboardProps($request));
    }

    protected function buildDashboardProps(Request $request): array
    {
        $valueDate = $request->input('value_date', now()->format('Y-m-d'));
        $currencyId = (int) $request->input('currency_id', 9);
        $fumDate                    = $request->input('fum_date', $valueDate);
        $shareMovementDate          = $request->input('share_movement_date', $valueDate);
        $cashMovementDate           = $request->input('cash_movement_date', $valueDate);
        $cashFlowForecastDate       = $request->input('cash_flow_forecast_date', $valueDate);
        $maturityAssetsDate         = $request->input('maturity_assets_date', $valueDate);
        $maturityLiabilitiesDate    = $request->input('maturity_liabilities_date', $valueDate);
        $maturitiesVsPlacementsDate = $request->input('maturities_vs_placements_date', $valueDate);

        $clientDetails = $this->gsam->clientDetails();
        $shareMovement = $this->gsam->shareMovement($shareMovementDate);
        $fum           = $this->gsam->fundsUnderManagement($fumDate, $currencyId);
        $cashMovement  = $this->getCashMovement($cashMovementDate);
        $topGainsLosses = $this->getTopGainsAndLosses();
        $cashFlowForecast = $this->getCashFlowForecast($cashFlowForecastDate);
        $maturities = $this->getMaturities($maturityAssetsDate, $maturityLiabilitiesDate);
        $maturitiesVsPlacements = $this->getMaturitiesVsPlacements($maturitiesVsPlacementsDate);
        $currencyOptions = $this->gsam->currencyOptions();

        return [
            'filters' => [
                'value_date'                    => $valueDate,
                'currency_id'                   => $currencyId,
                'fum_date'                      => $fumDate,
                'share_movement_date'           => $shareMovementDate,
                'cash_movement_date'            => $cashMovementDate,
                'cash_flow_forecast_date'       => $cashFlowForecastDate,
                'maturity_assets_date'          => $maturityAssetsDate,
                'maturity_liabilities_date'     => $maturityLiabilitiesDate,
                'maturities_vs_placements_date' => $maturitiesVsPlacementsDate,
            ],
            'currencyOptions'      => $currencyOptions,
            'clientDetails'        => $clientDetails,
            'shareMovement'        => $shareMovement,
            'fundsUnderManagement' => [
                'rows' => $fum['rows'] ?? [],
                'sums' => $fum['sums'] ?? null,
            ],
            'cashMovement'            => $cashMovement,
            'topGainsLosses'          => $topGainsLosses,
            'cashFlowForecast'        => $cashFlowForecast,
            'maturities'              => $maturities,
            'maturitiesVsPlacements'  => $maturitiesVsPlacements,
        ];
    }

    /**
     * Fetches maturity deal rows for both the asset and liability side,
     * each with a totals row — mirrors the two MaturityDataGrid instances
     * (isAssets=true / isAssets=false) from the original app.
     */
    protected function getMaturities(string $assetsDate, string $liabilitiesDate): array
    {
        $sum = fn (array $rows, string $field) => array_sum(array_map(fn ($r) => (float) ($r[$field] ?? 0), $rows));

        $buildSide = function (string $valueDate, bool $isAssets) use ($sum) {
            $date = \Carbon\Carbon::parse($valueDate);
            $startDate = $date->copy()->startOfMonth()->format('Y-m-d');
            $endDate   = $date->copy()->format('Y-m-d');

            $rows = $this->gsam->maturities($startDate, $endDate, $isAssets);

            return [
                'rows' => $rows,
                'totals' => [
                    'count'         => count($rows),
                    'nominal'       => $sum($rows, 'nominal'),
                    'interest'      => $sum($rows, 'interest'),
                    'maturityValue' => $sum($rows, 'maturityValue'),
                    'netAmount'     => $sum($rows, 'netAmount'),
                ],
            ];
        };

        return [
            'assets'      => $buildSide($assetsDate, true),
            'liabilities' => $buildSide($liabilitiesDate, false),
        ];
    }

    /**
     * Builds a 6-month trend by calling MaturitiesCashMovement and
     * PlacementsCashMovement once per month (these endpoints only return a
     * single aggregate for a given date, not a month-by-month series, so we
     * stitch the trend together here instead of relying on the .NET API to
     * do it). Lines are Assets/Liabilities, not Buy/Sell — that's the actual
     * split these endpoints expose.
     */
    protected function getMaturitiesVsPlacements(string $referenceDate, int $months = 6): array
    {
        $reference = \Carbon\Carbon::parse($referenceDate);
        $rows = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $monthDate = $reference->copy()->subMonths($i);
            // Cap at the reference date for the current month so we don't ask
            // for data past "today" when the reference date isn't month-end.
            $endOfMonth = $monthDate->isSameMonth($reference)
                ? $reference->copy()
                : $monthDate->copy()->endOfMonth();
            $endDateIso = $endOfMonth->format('Y-m-d');

            $mat = $this->gsam->maturitiesCashMovement($endDateIso);
            $pla = $this->gsam->placementsCashMovement($endDateIso);

            $rows[] = [
                'month'                 => $monthDate->format('M'),
                'maturitiesAssets'      => (float) str_replace(',', '', $mat[0]['totalMaturities'] ?? 0),
                'maturitiesLiabilities' => (float) str_replace(',', '', $mat[0]['totalMaturitiesLiability'] ?? 0),
                'placementsAssets'      => (float) str_replace(',', '', $pla[0]['totalPlacements'] ?? 0),
                'placementsLiabilities' => (float) str_replace(',', '', $pla[0]['totalPlacementsLiability'] ?? 0),
            ];
        }

        return $rows;
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

        Log::info('GSAM EndDate being sent', ['endDateIso' => $endDateIso]);

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