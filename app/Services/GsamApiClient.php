<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GsamApiClient
{
    protected string $baseUrl;

    public function __construct()
    {
        // Set GSAM_API_BASE_URL in your .env — defaults to the IIS Express port
        // the Next.js app was already using.
        $this->baseUrl = rtrim(config('services.gsam.base_url', 'https://localhost:44356'), '/');
    }

    /**
     * Every call to the .NET API goes through here.
     * withoutVerifying() skips SSL cert checks — needed because localhost:44356
     * uses a self-signed IIS Express dev certificate.
     */
    protected function client()
    {
        return Http::withoutVerifying()
            ->timeout(30)
            ->acceptJson()
            ->baseUrl($this->baseUrl);
    }

    /**
     * POST /api/UserSetUp/Login
     * Authenticates directly against SQL Server using the given credentials
     * as the SQL login (per the real controller — this is not a separate
     * app-level user table).
     */
    public function login(string $username, string $password): array
    {
        $response = $this->client()->post('/api/UserSetUp/Login', [
            'username' => $username,
            'password' => $password,
        ]);

        return $this->unwrap($response, 'login');
    }

    /**
     * POST /api/Dashboard/ClientDetails
     * Powers the Client Information 3D pie chart.
     * Returns array of { counterpartyCategory, recordCount }
     */
    public function clientDetails(): array
    {
        $response = $this->client()->post('/api/Dashboard/ClientDetails', [
            'selectedDate' => 'string', // matches what the Next.js app sends — the backend ignores this value
        ]);

        return $this->unwrap($response, 'clientDetails');
    }

    /**
     * POST /api/Dashboard/ShareMovement
     * Powers the Share Movement 3D column chart.
     * Returns array of { dealTypeName, totalCost }
     */
    public function shareMovement(string $selectedDate): array
    {
        $response = $this->client()->post('/api/Dashboard/ShareMovement', [
            'selectedDate' => $selectedDate,
        ]);

        return $this->unwrap($response, 'shareMovement');
    }

    /**
     * POST /api/Dashboard/FUNDSUNDERMANAGEMENT
     * Powers the FUM donut chart, summary table, and detail grid all at once.
     * Returns { rows: [...], sums: { moneyMarketPrescribedTotal, ... } }
     */
    public function fundsUnderManagement(string $valueDate, int $currencyId = 9): array
    {
        $response = $this->client()->post('/api/Dashboard/FUNDSUNDERMANAGEMENT', [
            'valueDate'  => $valueDate,
            'currencyID' => $currencyId,
        ]);

        return $this->unwrap($response, 'fundsUnderManagement');
    }

    /**
     * POST /api/Dashboard/Transaction
     * Deposits/withdrawals for the month containing the given date range.
     * Returns array of { deposits, withdrawal } (strings)
     */
    public function transaction(string $startDate, string $endDate): array
    {
        $response = $this->client()->post('/api/Dashboard/Transaction', [
            'StartDate' => $startDate,
            'EndDate'   => $endDate,
        ]);

        return $this->unwrap($response, 'transaction');
    }

    /**
     * POST /api/Dashboard/MaturitiesCashMovement
     * Returns array (single row) of { totalMaturities, totalMaturitiesLiability }
     */
    public function maturitiesCashMovement(string $endDate): array
    {
        $response = $this->client()->post('/api/Dashboard/MaturitiesCashMovement', [
            'EndDate' => $endDate,
        ]);

        return $this->unwrap($response, 'maturitiesCashMovement');
    }

    /**
     * POST /api/Dashboard/PlacementsCashMovement
     * Returns array (single row) of { totalPlacements, totalPlacementsLiability }
     */
    public function placementsCashMovement(string $endDate): array
    {
        $response = $this->client()->post('/api/Dashboard/PlacementsCashMovement', [
            'EndDate' => $endDate,
        ]);

        return $this->unwrap($response, 'placementsCashMovement');
    }

    /**
     * POST /api/Dashboard/Top5GainsAndLosses
     * Returns array of { category, name, id, price, previousPrice, difference,
     * percentageDifference, currentShares } — one flat list, split client-side
     * (or here) into gains vs losses.
     */
    public function top5GainsAndLosses(int $exchangeId = 1): array
    {
        $response = $this->client()->post('/api/Dashboard/Top5GainsAndLosses', [
            'exchangeID' => $exchangeId,
        ]);

        return $this->unwrap($response, 'top5GainsAndLosses');
    }

    /**
     * POST /api/Dashboard/CashFlowForecast_Data
     * Returns array of per-instrument cash flow rows for the given range.
     */
    public function cashFlowForecast(string $startDate, string $endDate): array
    {
        $response = $this->client()->post('/api/Dashboard/CashFlowForecast_Data', [
            'StartDate' => $startDate,
            'EndDate'   => $endDate,
        ]);

        return $this->unwrap($response, 'cashFlowForecast');
    }

    /**
     * POST /api/MoneyMarket/Maturities
     * Returns per-deal maturity rows, filtered to either the asset side or
     * the liability side depending on which flag is true.
     */
    public function maturities(string $startDate, string $endDate, bool $assets): array
    {
        $response = $this->client()->post('/api/MoneyMarket/Maturities', [
            'StartDate'   => $startDate,
            'EndDate'     => $endDate,
            'Assets'      => $assets,
            'Liabilities' => ! $assets,
        ]);

        return $this->unwrap($response, 'maturities');
    }

    /**
     * The .NET API always responds { status, message, data }.
     * This normalizes that into just the data (or throws/logs on error)
     * so controllers don't have to repeat this check everywhere.
     */
    protected function unwrap($response, string $context): array
    {
        if (! $response->successful()) {
            Log::warning("GSAM API [{$context}] HTTP error", [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return [];
        }

        $json = $response->json();

        if (($json['status'] ?? null) !== 'Ok') {
            Log::warning("GSAM API [{$context}] returned non-Ok status", [
                'message' => $json['message'] ?? null,
            ]);
            return [];
        }

        return $json['data'] ?? [];
    }
}