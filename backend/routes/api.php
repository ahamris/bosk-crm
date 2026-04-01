<?php

use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ClientController;
use App\Http\Controllers\Api\V1\ClientNoteController;
use App\Http\Controllers\Api\V1\CommunicationLogController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\ServiceCategoryController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\IntegrationController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\BookingSettingController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PublicController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\ClientPortalController;
use App\Http\Controllers\Api\V1\MessagingController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\Api\V1\WorkingHourController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — /api/v1
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1 (set in bootstrap/app.php).
|
*/

// Webhooks (no auth — verified by provider tokens)
Route::post('webhooks/moneybird', [WebhookController::class, 'moneybird']);
Route::post('webhooks/whatsapp', [MessagingController::class, 'whatsappWebhook']);
Route::post('webhooks/telegram', [MessagingController::class, 'telegramWebhook']);
Route::get('webhooks/whatsapp', fn() => response(request('hub_challenge'))); // WhatsApp verification

// Public (no auth required)
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

// Protected (Sanctum auth required)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('dashboard', DashboardController::class);

    // Locations
    Route::apiResource('locations', LocationController::class);

    // Services scoped to location
    Route::apiResource('locations.services', ServiceController::class);

    // Clients scoped to location
    Route::apiResource('locations.clients', ClientController::class);

    // Appointments scoped to location
    Route::apiResource('locations.appointments', AppointmentController::class);

    // Appointment status transition
    Route::patch('locations/{location}/appointments/{appointment}/transition', [AppointmentController::class, 'transition']);

    // Client notes
    Route::get('locations/{location}/clients/{client}/notes', [ClientNoteController::class, 'index']);
    Route::post('locations/{location}/clients/{client}/notes', [ClientNoteController::class, 'store']);
    Route::delete('locations/{location}/clients/{client}/notes/{clientNote}', [ClientNoteController::class, 'destroy']);

    // Communication logs
    Route::get('locations/{location}/clients/{client}/communication-logs', [CommunicationLogController::class, 'index']);
    Route::post('locations/{location}/clients/{client}/communication-logs', [CommunicationLogController::class, 'store']);

    // Service categories (global)
    Route::apiResource('service-categories', ServiceCategoryController::class);

    // Employees
    Route::get('employees', [EmployeeController::class, 'index']);
    Route::post('employees', [EmployeeController::class, 'store']);
    Route::get('employees/{employee}', [EmployeeController::class, 'show']);
    Route::put('employees/{employee}', [EmployeeController::class, 'update']);
    Route::get('employees/{employee}/availability', [EmployeeController::class, 'availability']);

    // Working hours per employee (bulk MUST come before apiResource to avoid {workingHour} conflict)
    Route::put('employees/{employee}/working-hours/bulk', [WorkingHourController::class, 'bulkUpdate']);
    Route::apiResource('employees.working-hours', WorkingHourController::class)
        ->parameters(['working-hours' => 'workingHour']);

    // Integrations — Moneybird-specific routes first (before {provider} wildcard)
    Route::post('integrations/moneybird/sync-contacts', [IntegrationController::class, 'syncContacts']);
    Route::post('integrations/moneybird/sync-products', [IntegrationController::class, 'syncProducts']);
    Route::get('integrations/moneybird/config', [IntegrationController::class, 'moneybirdConfig']);

    // Integrations — generic CRUD
    Route::get('integrations', [IntegrationController::class, 'index']);
    Route::get('integrations/{provider}', [IntegrationController::class, 'show']);
    Route::put('integrations/{provider}', [IntegrationController::class, 'update']);
    Route::post('integrations/{provider}/test', [IntegrationController::class, 'testConnection']);

    // Invoices
    Route::get('locations/{location}/invoices', [InvoiceController::class, 'index']);
    Route::post('locations/{location}/invoices', [InvoiceController::class, 'store']);
    Route::get('locations/{location}/invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::post('locations/{location}/invoices/{invoice}/send', [InvoiceController::class, 'send']);
    Route::post('locations/{location}/invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid']);
    Route::post('locations/{location}/appointments/{appointment}/invoice', [InvoiceController::class, 'fromAppointment']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead']);

    // Reviews
    Route::get('locations/{location}/reviews', [ReviewController::class, 'index']);
    Route::post('locations/{location}/reviews', [ReviewController::class, 'store']);
    Route::get('locations/{location}/reviews/{review}', [ReviewController::class, 'show']);
    Route::patch('locations/{location}/reviews/{review}/toggle-publish', [ReviewController::class, 'togglePublish']);
    Route::delete('locations/{location}/reviews/{review}', [ReviewController::class, 'destroy']);

    // Booking settings (admin)
    Route::get('locations/{location}/booking-settings', [BookingSettingController::class, 'show']);
    Route::put('locations/{location}/booking-settings', [BookingSettingController::class, 'update']);

    // Messaging
    Route::post('messaging/send', [MessagingController::class, 'send']);
    Route::post('messaging/confirm/{appointment}', [MessagingController::class, 'sendConfirmation']);

    // Client Portal
    Route::prefix('portal')->group(function () {
        Route::get('profile', [ClientPortalController::class, 'profile']);
        Route::put('profile', [ClientPortalController::class, 'updateProfile']);
        Route::get('appointments', [ClientPortalController::class, 'appointments']);
        Route::get('upcoming', [ClientPortalController::class, 'upcoming']);
        Route::post('reviews', [ClientPortalController::class, 'submitReview']);
        Route::post('appointments/{appointment}/cancel', [ClientPortalController::class, 'cancelAppointment']);
    });
});

// Public landing page (no auth required)
Route::get('public/{location}/landing', [PublicController::class, 'landing']);
Route::get('public/{location}/booking-settings', [PublicController::class, 'bookingSettings']);

// Public booking widget (no auth required)
Route::prefix('booking/{location}')->group(function () {
    Route::get('services', [BookingController::class, 'services']);
    Route::get('availability', [BookingController::class, 'availability']);
    Route::post('book', [BookingController::class, 'book']);
    Route::get('employees/{user}/reviews', [ReviewController::class, 'employeeReviews']);
});
