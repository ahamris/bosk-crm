<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\ClientNote;
use App\Models\EmployeeProfile;
use App\Models\Location;
use App\Models\Review;
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
                'type' => 'staff',
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
            // Huidbehandelingen (Skin Treatments)
            ['category' => 'huidbehandelingen', 'name_nl' => 'Laser Ontharing', 'name_en' => 'Laser Hair Removal', 'name_ru' => 'Лазерная эпиляция', 'duration_minutes' => 30, 'buffer_minutes' => 10, 'price_cents' => 8900, 'color' => '#ef4444'],
            ['category' => 'huidbehandelingen', 'name_nl' => 'Cryolipolyse', 'name_en' => 'Cryolipolysis', 'name_ru' => 'Криолиполиз', 'duration_minutes' => 60, 'buffer_minutes' => 15, 'price_cents' => 24900, 'color' => '#3b82f6'],
            ['category' => 'huidbehandelingen', 'name_nl' => 'Velashape Behandeling', 'name_en' => 'Velashape Treatment', 'name_ru' => 'Велашейп процедура', 'duration_minutes' => 45, 'buffer_minutes' => 10, 'price_cents' => 14900, 'color' => '#f97316'],
            ['category' => 'huidbehandelingen', 'name_nl' => 'Microneedling', 'name_en' => 'Microneedling', 'name_ru' => 'Микронидлинг', 'duration_minutes' => 45, 'buffer_minutes' => 15, 'price_cents' => 12900, 'color' => '#e11d48'],
            ['category' => 'huidbehandelingen', 'name_nl' => 'Chemische Peeling', 'name_en' => 'Chemical Peel', 'name_ru' => 'Химический пилинг', 'duration_minutes' => 30, 'buffer_minutes' => 10, 'price_cents' => 8900, 'color' => '#a855f7'],

            // Gezichtsbehandeling (Facial Treatments)
            ['category' => 'gezichtsbehandeling', 'name_nl' => 'Hydrafacial', 'name_en' => 'Hydrafacial', 'name_ru' => 'Гидрафейшл', 'duration_minutes' => 60, 'buffer_minutes' => 10, 'price_cents' => 13900, 'color' => '#6366f1'],
            ['category' => 'gezichtsbehandeling', 'name_nl' => 'Anti-Age Behandeling', 'name_en' => 'Anti-Age Treatment', 'name_ru' => 'Антивозрастной уход', 'duration_minutes' => 75, 'buffer_minutes' => 15, 'price_cents' => 15900, 'color' => '#8b5cf6'],
            ['category' => 'gezichtsbehandeling', 'name_nl' => 'Acne Behandeling', 'name_en' => 'Acne Treatment', 'name_ru' => 'Лечение акне', 'duration_minutes' => 45, 'buffer_minutes' => 10, 'price_cents' => 9900, 'color' => '#14b8a6'],

            // Lichaam (Body)
            ['category' => 'lichaam', 'name_nl' => 'Lichaamspeeling', 'name_en' => 'Body Scrub', 'name_ru' => 'Скраб для тела', 'duration_minutes' => 30, 'buffer_minutes' => 10, 'price_cents' => 6900, 'color' => '#22c55e'],
            ['category' => 'lichaam', 'name_nl' => 'Lichaamsmassage', 'name_en' => 'Body Massage', 'name_ru' => 'Массаж тела', 'duration_minutes' => 60, 'buffer_minutes' => 10, 'price_cents' => 8900, 'color' => '#10b981'],
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
                    'name_en' => $svc['name_en'],
                    'name_ru' => $svc['name_ru'],
                    'duration_minutes' => $svc['duration_minutes'],
                    'buffer_minutes' => $svc['buffer_minutes'],
                    'price_cents' => $svc['price_cents'],
                    'color' => $svc['color'],
                    'is_active' => true,
                ],
            );
        }

        // ── Employees ──────────────────────────────────────────
        $employees = [
            ['name' => 'Sophie de Vries', 'email' => 'sophie@bosk.nl', 'bio_nl' => 'Huidtherapeut met 8 jaar ervaring', 'specializations' => ['huidbehandelingen', 'gezichtsbehandeling'], 'type' => 'staff'],
            ['name' => 'Elena Petrova', 'email' => 'elena@bosk.nl', 'bio_nl' => 'Specialist in lichaamsmassage en scrubs', 'specializations' => ['lichaam', 'overig'], 'type' => 'staff'],
            ['name' => 'Lisa Jansen', 'email' => 'lisa@bosk.nl', 'bio_nl' => 'Nagelstyliste en wimperspecialist', 'specializations' => ['nagels', 'overig'], 'type' => 'staff'],
            ['name' => 'Daria Kuznetsova', 'email' => 'daria@bosk.nl', 'bio_nl' => 'Freelance huidtherapeut, gespecialiseerd in gezichtsbehandelingen', 'specializations' => ['gezichtsbehandeling', 'huidbehandelingen'], 'type' => 'freelancer'],
        ];

        $employeeModels = [];
        foreach ($employees as $emp) {
            $user = User::firstOrCreate(
                ['email' => $emp['email']],
                [
                    'name' => $emp['name'],
                    'password' => bcrypt('password'),
                    'type' => $emp['type'],
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
            // Existing clients
            ['first_name' => 'Maria', 'last_name' => 'Bakker', 'email' => 'maria.bakker@example.com', 'phone' => '+31 6 1234 5678', 'gender' => 'female', 'date_of_birth' => '1985-03-15'],
            ['first_name' => 'Anna', 'last_name' => 'de Jong', 'email' => 'anna.dejong@example.com', 'phone' => '+31 6 2345 6789', 'gender' => 'female', 'date_of_birth' => '1990-07-22'],
            ['first_name' => 'Fatima', 'last_name' => 'El Amrani', 'email' => 'fatima@example.com', 'phone' => '+31 6 3456 7890', 'gender' => 'female', 'date_of_birth' => '1988-11-03'],
            ['first_name' => 'Peter', 'last_name' => 'Visser', 'email' => 'peter.visser@example.com', 'phone' => '+31 6 4567 8901', 'gender' => 'male', 'date_of_birth' => '1975-01-30'],
            ['first_name' => 'Svetlana', 'last_name' => 'Ivanova', 'email' => 'svetlana@example.com', 'phone' => '+31 6 5678 9012', 'gender' => 'female', 'locale' => 'ru', 'date_of_birth' => '1992-05-18'],

            // New clients
            ['first_name' => 'Sophie', 'last_name' => 'van den Berg', 'email' => 'sophie@email.nl', 'phone' => '+31 6 9876 5432', 'gender' => 'female', 'date_of_birth' => '1990-07-22'],
            ['first_name' => 'Emma', 'last_name' => 'de Groot', 'email' => 'emma.degroot@gmail.com', 'phone' => '+31 6 5555 1234', 'gender' => 'female', 'date_of_birth' => '1988-11-03'],
            ['first_name' => 'Anna', 'last_name' => 'Jansen', 'email' => 'anna.j@outlook.nl', 'phone' => '+31 6 4321 8765', 'gender' => 'female', 'date_of_birth' => '1995-02-14'],
            ['first_name' => 'Lisa', 'last_name' => 'Bakker', 'email' => 'lisa.b@hotmail.nl', 'phone' => '+31 6 6789 1234', 'gender' => 'female', 'date_of_birth' => '1982-09-18'],
            ['first_name' => 'Nadia', 'last_name' => 'Youssef', 'email' => 'nadia.y@email.nl', 'phone' => '+31 6 3456 7890', 'gender' => 'female', 'date_of_birth' => '1993-04-07'],
        ];

        $clientModels = [];
        foreach ($clients as $cl) {
            $clientModels[] = Client::firstOrCreate(
                ['email' => $cl['email']],
                array_merge($cl, ['location_id' => $location->id, 'is_active' => true]),
            );
        }

        // ── Appointments ───────────────────────────────────────
        // 15 appointments spread across this week and next week
        $monday = now()->startOfWeek(); // Monday of this week

        $appointments = [
            // This week
            ['day_offset' => 0, 'hour' => 9,  'service_idx' => 0, 'client_idx' => 0, 'employee_idx' => 0, 'status' => 'completed'],   // Mon - Laser Ontharing
            ['day_offset' => 0, 'hour' => 11, 'service_idx' => 5, 'client_idx' => 1, 'employee_idx' => 0, 'status' => 'completed'],   // Mon - Hydrafacial
            ['day_offset' => 1, 'hour' => 10, 'service_idx' => 1, 'client_idx' => 5, 'employee_idx' => 1, 'status' => 'completed'],   // Tue - Cryolipolyse
            ['day_offset' => 1, 'hour' => 14, 'service_idx' => 9, 'client_idx' => 6, 'employee_idx' => 1, 'status' => 'confirmed'],   // Tue - Lichaamsmassage
            ['day_offset' => 2, 'hour' => 9,  'service_idx' => 3, 'client_idx' => 2, 'employee_idx' => 0, 'status' => 'in_progress'], // Wed - Microneedling
            ['day_offset' => 2, 'hour' => 13, 'service_idx' => 7, 'client_idx' => 7, 'employee_idx' => 2, 'status' => 'scheduled'],   // Wed - Acne Behandeling
            ['day_offset' => 3, 'hour' => 10, 'service_idx' => 2, 'client_idx' => 8, 'employee_idx' => 0, 'status' => 'confirmed'],   // Thu - Velashape
            ['day_offset' => 3, 'hour' => 15, 'service_idx' => 4, 'client_idx' => 3, 'employee_idx' => 0, 'status' => 'scheduled'],   // Thu - Chemische Peeling
            ['day_offset' => 4, 'hour' => 11, 'service_idx' => 6, 'client_idx' => 4, 'employee_idx' => 0, 'status' => 'scheduled'],   // Fri - Anti-Age Behandeling
            ['day_offset' => 4, 'hour' => 14, 'service_idx' => 8, 'client_idx' => 9, 'employee_idx' => 1, 'status' => 'confirmed'],   // Fri - Lichaamspeeling

            // Next week
            ['day_offset' => 7, 'hour' => 9,  'service_idx' => 0, 'client_idx' => 5, 'employee_idx' => 0, 'status' => 'scheduled'],   // Mon - Laser Ontharing
            ['day_offset' => 7, 'hour' => 13, 'service_idx' => 5, 'client_idx' => 6, 'employee_idx' => 0, 'status' => 'scheduled'],   // Mon - Hydrafacial
            ['day_offset' => 8, 'hour' => 10, 'service_idx' => 1, 'client_idx' => 7, 'employee_idx' => 1, 'status' => 'confirmed'],   // Tue - Cryolipolyse
            ['day_offset' => 9, 'hour' => 11, 'service_idx' => 3, 'client_idx' => 8, 'employee_idx' => 0, 'status' => 'scheduled'],   // Wed - Microneedling
            ['day_offset' => 10, 'hour' => 14, 'service_idx' => 9, 'client_idx' => 9, 'employee_idx' => 1, 'status' => 'scheduled'],  // Thu - Lichaamsmassage
        ];

        foreach ($appointments as $appt) {
            $service = $serviceModels[$appt['service_idx']];
            $client = $clientModels[$appt['client_idx']];
            $emp = $employeeModels[$appt['employee_idx']];

            $startsAt = $monday->copy()
                ->addDays($appt['day_offset'])
                ->setHour($appt['hour'])
                ->setMinute(0)
                ->setSecond(0);

            $endsAt = $startsAt->copy()->addMinutes($service->duration_minutes);

            Appointment::create([
                'location_id' => $location->id,
                'client_id' => $client->id,
                'user_id' => $emp->id,
                'service_id' => $service->id,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'status' => $appt['status'],
                'notes' => null,
            ]);
        }

        // ── Client Notes ───────────────────────────────────────
        $notes = [
            ['client_idx' => 0, 'employee_idx' => 0, 'note' => 'Gevoelige huid, gebruik milde producten. Reageert goed op hydraterende serums.', 'is_private' => false],
            ['client_idx' => 0, 'employee_idx' => 0, 'note' => 'Allergie voor parabenen vermeld bij intake.', 'is_private' => true],
            ['client_idx' => 1, 'employee_idx' => 0, 'note' => 'Wil graag overstappen naar anti-age behandeltraject. Volgende afspraak consultatiegesprek plannen.', 'is_private' => false],
            ['client_idx' => 2, 'employee_idx' => 0, 'note' => 'Heeft last van acne op de kaaklijn. Hormoongebonden, doorverwezen naar dermatoloog voor combinatieaanpak.', 'is_private' => false],
            ['client_idx' => 4, 'employee_idx' => 1, 'note' => 'Предпочитает общение на русском языке. Чувствительная кожа в зоне декольте.', 'is_private' => false],
            ['client_idx' => 5, 'employee_idx' => 0, 'note' => 'Eerste keer laser ontharing. Patch test uitgevoerd, geen reactie. Kan verdere behandelingen plannen.', 'is_private' => false],
            ['client_idx' => 6, 'employee_idx' => 1, 'note' => 'Komt voor cryolipolyse buikzone. Foto\'s gemaakt voor-na vergelijking. Volgende sessie over 6 weken.', 'is_private' => false],
            ['client_idx' => 7, 'employee_idx' => 2, 'note' => 'Jonge huid, milde acne. Gestart met maandelijks behandelplan. Thuiszorgadvies meegegeven.', 'is_private' => false],
            ['client_idx' => 8, 'employee_idx' => 0, 'note' => 'Velashape behandeling bovenbenen. Goede resultaten na 3 sessies. Nog 2 behandelingen gepland.', 'is_private' => false],
            ['client_idx' => 9, 'employee_idx' => 1, 'note' => 'Nieuwe klant via doorverwijzing. Geinteresseerd in combinatie lichaamsmassage + peeling. Proefbehandeling gehad.', 'is_private' => false],
        ];

        foreach ($notes as $note) {
            ClientNote::create([
                'client_id' => $clientModels[$note['client_idx']]->id,
                'user_id' => $employeeModels[$note['employee_idx']]->id,
                'note' => $note['note'],
                'is_private' => $note['is_private'],
            ]);
        }

        // ── Reviews ────────────────────────────────────────────
        $reviews = [
            ['client_idx' => 0, 'employee_idx' => 0, 'rating' => 5, 'comment' => 'Fantastische behandeling! Sophie nam de tijd om alles uit te leggen en het resultaat is geweldig.', 'is_published' => true],
            ['client_idx' => 1, 'employee_idx' => 0, 'rating' => 4, 'comment' => 'Heel professioneel en vriendelijk. De Hydrafacial voelde heerlijk aan.', 'is_published' => true],
            ['client_idx' => 2, 'employee_idx' => 0, 'rating' => 5, 'comment' => 'Na drie sessies microneedling zie ik echt verschil. Zeer tevreden!', 'is_published' => true],
            ['client_idx' => 5, 'employee_idx' => 0, 'rating' => 4, 'comment' => 'Goede ervaring met laser ontharing. Resultaat is duidelijk zichtbaar.', 'is_published' => true],
            ['client_idx' => 8, 'employee_idx' => 0, 'rating' => 3, 'comment' => 'Behandeling was prima, maar de wachttijd was langer dan verwacht.', 'is_published' => true],
            ['client_idx' => 5, 'employee_idx' => 1, 'rating' => 5, 'comment' => 'Elena is een topper! De lichaamsmassage was precies wat ik nodig had.', 'is_published' => true],
            ['client_idx' => 6, 'employee_idx' => 1, 'rating' => 4, 'comment' => 'Fijne behandeling, rustige sfeer. Kom zeker terug voor de volgende sessie.', 'is_published' => true],
            ['client_idx' => 9, 'employee_idx' => 1, 'rating' => 5, 'comment' => 'Heel blij met de lichaamspeeling. Mijn huid voelt zo zacht aan!', 'is_published' => true],
            ['client_idx' => 4, 'employee_idx' => 1, 'rating' => 4, 'comment' => 'Отличный массаж, очень расслабляющий. Елена настоящий профессионал.', 'is_published' => true],
            ['client_idx' => 7, 'employee_idx' => 2, 'rating' => 5, 'comment' => 'Lisa is heel kundig met de acnebehandeling. Mijn huid is veel rustiger geworden.', 'is_published' => true],
            ['client_idx' => 3, 'employee_idx' => 2, 'rating' => 4, 'comment' => 'Prettige sfeer en goed advies voor thuisverzorging. Aanrader!', 'is_published' => true],
            ['client_idx' => 1, 'employee_idx' => 3, 'rating' => 5, 'comment' => 'Daria is heel vakkundig. De gezichtsbehandeling was heerlijk ontspannend.', 'is_published' => true],
            ['client_idx' => 2, 'employee_idx' => 3, 'rating' => 4, 'comment' => 'Mooie resultaten na de chemische peeling. Goed nabehandeld.', 'is_published' => true],
            ['client_idx' => 6, 'employee_idx' => 0, 'rating' => 5, 'comment' => 'Tweede keer bij Sophie en weer top! Ze onthoudt precies wat je huid nodig heeft.', 'is_published' => false],
            ['client_idx' => 3, 'employee_idx' => 1, 'rating' => 3, 'comment' => 'Behandeling was oké, maar ik verwachtte iets meer uitleg over het proces.', 'is_published' => false],
        ];

        foreach ($reviews as $rev) {
            Review::create([
                'location_id' => $location->id,
                'client_id' => $clientModels[$rev['client_idx']]->id,
                'employee_user_id' => $employeeModels[$rev['employee_idx']]->id,
                'rating' => $rev['rating'],
                'comment' => $rev['comment'],
                'is_published' => $rev['is_published'],
            ]);
        }
    }
}
