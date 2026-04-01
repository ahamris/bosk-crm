<?php

use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ClientController;
use App\Http\Controllers\Api\V1\ClientNoteController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\ServiceCategoryController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\IntegrationController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\ReviewController;
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

    // Service categories (global)
    Route::apiResource('service-categories', ServiceCategoryController::class);

    // Employees
    Route::get('employees', [EmployeeController::class, 'index']);
    Route::get('employees/{employee}', [EmployeeController::class, 'show']);
    Route::get('employees/{employee}/availability', [EmployeeController::class, 'availability']);

    // Working hours per employee
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

    // Reviews
    Route::get('locations/{location}/reviews', [ReviewController::class, 'index']);
    Route::post('locations/{location}/reviews', [ReviewController::class, 'store']);
    Route::get('locations/{location}/reviews/{review}', [ReviewController::class, 'show']);
    Route::patch('locations/{location}/reviews/{review}/toggle-publish', [ReviewController::class, 'togglePublish']);
    Route::delete('locations/{location}/reviews/{review}', [ReviewController::class, 'destroy']);
});

// Public booking widget (no auth required)
Route::prefix('booking/{location}')->group(function () {
    Route::get('services', [BookingController::class, 'services']);
    Route::get('availability', [BookingController::class, 'availability']);
    Route::post('book', [BookingController::class, 'book']);
    Route::get('employees/{user}/reviews', [ReviewController::class, 'employeeReviews']);
});
