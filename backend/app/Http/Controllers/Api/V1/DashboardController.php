<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\AppointmentResource;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $today = now()->toDateString();
        $user = $request->user();

        // Today's appointments
        $todaysAppointments = Appointment::query()
            ->with(['client', 'employee', 'service', 'location'])
            ->whereDate('starts_at', $today)
            ->orderBy('starts_at')
            ->get();

        // Stats
        $totalClients = Client::count();
        $totalServices = Service::count();

        $todayStats = [
            'total' => $todaysAppointments->count(),
            'scheduled' => $todaysAppointments->where('status', 'scheduled')->count(),
            'confirmed' => $todaysAppointments->where('status', 'confirmed')->count(),
            'in_progress' => $todaysAppointments->where('status', 'in_progress')->count(),
            'completed' => $todaysAppointments->where('status', 'completed')->count(),
            'cancelled' => $todaysAppointments->where('status', 'cancelled')->count(),
            'no_show' => $todaysAppointments->where('status', 'no_show')->count(),
        ];

        // Revenue today (completed appointments)
        $revenueToday = $todaysAppointments
            ->where('status', 'completed')
            ->sum(fn ($apt) => $apt->service?->price_cents ?? 0);

        // Upcoming appointments (next 7 days, excluding today)
        $upcomingCount = Appointment::query()
            ->where('starts_at', '>', now()->endOfDay())
            ->where('starts_at', '<=', now()->addDays(7)->endOfDay())
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->count();

        return response()->json([
            'today' => $today,
            'appointments_today' => AppointmentResource::collection($todaysAppointments),
            'stats' => [
                'today' => $todayStats,
                'total_clients' => $totalClients,
                'total_services' => $totalServices,
                'revenue_today_cents' => $revenueToday,
                'upcoming_7_days' => $upcomingCount,
            ],
        ]);
    }
}
