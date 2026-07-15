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
        ]);
    }
}
