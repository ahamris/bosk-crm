<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\EmployeeProfile;
use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Models\WorkingHour;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Roles ──────────────────────────────────────────────
        $owner = Role::firstOrCreate(['name' => 'owner']);
        $manager = Role::firstOrCreate(['name' => 'manager']);
        $employee = Role::firstOrCreate(['name' => 'employee']);
        $receptionist = Role::firstOrCreate(['name' => 'receptionist']);

        // ── Admin user ─────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@bosk.nl'],
            [
                'name' => 'Admin Beheerder',
                'password' => bcrypt('password'),
            ]
        );
        $admin->assignRole('owner');

        // ── Location ───────────────────────────────────────────
        $location = Location::firstOrCreate(
            ['name' => 'BOSK Gouda'],
            [
                'address' => 'Markt 15',
                'city' => 'Gouda',
                'phone' => '+31 182 123 456',
                'email' => 'info@bosk-gouda.nl',
                'timezone' => 'Europe/Amsterdam',
                'is_active' => true,
            ]
        );

        // ── Service Categories ─────────────────────────────────
        $categories = [
            ['name_nl' => 'Huidbehandelingen', 'name_en' => 'Skin Treatments', 'name_ru' => 'Процедуры для кожи', 'slug' => 'huidbehandelingen', 'sort_order' => 1],
            ['name_nl' => 'Gezichtsbehandeling', 'name_en' => 'Facial Treatments', 'name_ru' => 'Уход за лицом', 'slug' => 'gezichtsbehandeling', 'sort_order' => 2],
            ['name_nl' => 'Lichaam', 'name_en' => 'Body', 'name_ru' => 'Тело', 'slug' => 'lichaam', 'sort_order' => 3],
            ['name_nl' => 'Nagels', 'name_en' => 'Nails', 'name_ru' => 'Ногти', 'slug' => 'nagels', 'sort_order' => 4],
            ['name_nl' => 'Overig', 'name_en' => 'Other', 'name_ru' => 'Прочее', 'slug' => 'overig', 'sort_order' => 5],
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[$cat['slug']] = ServiceCategory::firstOrCreate(
                ['slug' => $cat['slug']],
                $cat,
            );
        }

        // ── Services ───────────────────────────────────────────
        $services = [
            ['category' => 'huidbehandelingen', 'name_nl' => 'Microdermabrasie', 'name_en' => 'Microdermabrasion', 'duration_minutes' => 45, 'price_cents' => 7500, 'color' => '#ef4444'],
            ['category' => 'huidbehandelingen', 'name_nl' => 'Chemische Peeling', 'name_en' => 'Chemical Peel', 'duration_minutes' => 30, 'price_cents' => 6500, 'color' => '#f97316'],
            ['category' => 'gezichtsbehandeling', 'name_nl' => 'Klassieke Gezichtsbehandeling', 'name_en' => 'Classic Facial', 'duration_minutes' => 60, 'price_cents' => 8500, 'color' => '#8b5cf6'],
            ['category' => 'gezichtsbehandeling', 'name_nl' => 'Anti-Age Behandeling', 'name_en' => 'Anti-Age Treatment', 'duration_minutes' => 75, 'price_cents' => 12000, 'color' => '#a855f7'],
            ['category' => 'gezichtsbehandeling', 'name_nl' => 'Hydrafacial', 'name_en' => 'Hydrafacial', 'duration_minutes' => 50, 'price_cents' => 11000, 'color' => '#6366f1'],
            ['category' => 'lichaam', 'name_nl' => 'Lichaamsmassage 60 min', 'name_en' => 'Body Massage 60 min', 'duration_minutes' => 60, 'price_cents' => 7000, 'color' => '#22c55e'],
            ['category' => 'lichaam', 'name_nl' => 'Lichaamsscrub', 'name_en' => 'Body Scrub', 'duration_minutes' => 45, 'price_cents' => 5500, 'color' => '#14b8a6'],
            ['category' => 'nagels', 'name_nl' => 'Manicure', 'name_en' => 'Manicure', 'duration_minutes' => 30, 'price_cents' => 3500, 'color' => '#ec4899'],
            ['category' => 'nagels', 'name_nl' => 'Pedicure', 'name_en' => 'Pedicure', 'duration_minutes' => 45, 'price_cents' => 4500, 'color' => '#f43f5e'],
            ['category' => 'overig', 'name_nl' => 'Wimper Extensions', 'name_en' => 'Lash Extensions', 'duration_minutes' => 90, 'price_cents' => 9500, 'color' => '#0ea5e9'],
        ];

        $serviceModels = [];
        foreach ($services as $svc) {
            $serviceModels[] = Service::firstOrCreate(
                [
                    'location_id' => $location->id,
                    'name_nl' => $svc['name_nl'],
                ],
                [
                    'location_id' => $location->id,
                    'service_category_id' => $categoryModels[$svc['category']]->id,
                    'name_nl' => $svc['name_nl'],
                    'name_en' => $svc['name_en'] ?? null,
                    'duration_minutes' => $svc['duration_minutes'],
                    'buffer_minutes' => 10,
                    'price_cents' => $svc['price_cents'],
                    'color' => $svc['color'],
                    'is_active' => true,
                ],
            );
        }

        // ── Employees ──────────────────────────────────────────
        $employees = [
            ['name' => 'Sophie de Vries', 'email' => 'sophie@bosk.nl', 'bio_nl' => 'Huidtherapeut met 8 jaar ervaring', 'specializations' => ['huidbehandelingen', 'gezichtsbehandeling']],
            ['name' => 'Elena Petrova', 'email' => 'elena@bosk.nl', 'bio_nl' => 'Specialist in lichaamsmassage en scrubs', 'specializations' => ['lichaam', 'overig']],
            ['name' => 'Lisa Jansen', 'email' => 'lisa@bosk.nl', 'bio_nl' => 'Nagelstyliste en wimperspecialist', 'specializations' => ['nagels', 'overig']],
        ];

        $employeeModels = [];
        foreach ($employees as $emp) {
            $user = User::firstOrCreate(
                ['email' => $emp['email']],
                [
                    'name' => $emp['name'],
                    'password' => bcrypt('password'),
                ],
            );
            $user->assignRole('employee');

            EmployeeProfile::firstOrCreate(
                ['user_id' => $user->id, 'location_id' => $location->id],
                [
                    'bio_nl' => $emp['bio_nl'],
                    'specializations' => $emp['specializations'],
                    'is_active' => true,
                ],
            );

            // Working hours: Mon-Fri, 09:00-17:00
            for ($day = 1; $day <= 5; $day++) {
                WorkingHour::firstOrCreate(
                    ['user_id' => $user->id, 'location_id' => $location->id, 'day_of_week' => $day],
                    [
                        'start_time' => '09:00',
                        'end_time' => '17:00',
                        'is_available' => true,
                    ],
                );
            }

            $employeeModels[] = $user;
        }

        // ── Clients ────────────────────────────────────────────
        $clients = [
            ['first_name' => 'Maria', 'last_name' => 'Bakker', 'email' => 'maria.bakker@example.com', 'phone' => '+31 6 1234 5678', 'gender' => 'female', 'date_of_birth' => '1985-03-15'],
            ['first_name' => 'Anna', 'last_name' => 'de Jong', 'email' => 'anna.dejong@example.com', 'phone' => '+31 6 2345 6789', 'gender' => 'female', 'date_of_birth' => '1990-07-22'],
            ['first_name' => 'Fatima', 'last_name' => 'El Amrani', 'email' => 'fatima@example.com', 'phone' => '+31 6 3456 7890', 'gender' => 'female', 'date_of_birth' => '1988-11-03'],
            ['first_name' => 'Peter', 'last_name' => 'Visser', 'email' => 'peter.visser@example.com', 'phone' => '+31 6 4567 8901', 'gender' => 'male', 'date_of_birth' => '1975-01-30'],
            ['first_name' => 'Svetlana', 'last_name' => 'Ivanova', 'email' => 'svetlana@example.com', 'phone' => '+31 6 5678 9012', 'gender' => 'female', 'locale' => 'ru', 'date_of_birth' => '1992-05-18'],
        ];

        $clientModels = [];
        foreach ($clients as $cl) {
            $clientModels[] = Client::firstOrCreate(
                ['email' => $cl['email']],
                array_merge($cl, ['location_id' => $location->id, 'is_active' => true]),
            );
        }

        // ── Appointments ───────────────────────────────────────
        $statuses = ['scheduled', 'confirmed', 'completed', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'scheduled'];

        for ($i = 0; $i < 10; $i++) {
            $service = $serviceModels[$i % count($serviceModels)];
            $client = $clientModels[$i % count($clientModels)];
            $emp = $employeeModels[$i % count($employeeModels)];
            $status = $statuses[$i];

            // Spread appointments over the next 5 days
            $startsAt = now()
                ->addDays($i % 5)
                ->setHour(9 + $i)
                ->setMinute(0)
                ->setSecond(0);

            $endsAt = $startsAt->copy()->addMinutes($service->duration_minutes);

            $appointmentData = [
                'location_id' => $location->id,
                'client_id' => $client->id,
                'user_id' => $emp->id,
                'service_id' => $service->id,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'status' => $status,
                'notes' => $i === 0 ? 'Eerste afspraak' : null,
            ];

            if ($status === 'cancelled') {
                $appointmentData['cancelled_at'] = now();
                $appointmentData['cancellation_reason'] = 'Klant heeft afgezegd';
            }

            Appointment::create($appointmentData);
        }
    }
}
