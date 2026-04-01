<?php

use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ClientController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\ServiceCategoryController;
use App\Http\Controllers\Api\V1\ServiceController;
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

    // Service categories (global)
    Route::apiResource('service-categories', ServiceCategoryController::class);

    // Employees
    Route::get('employees', [EmployeeController::class, 'index']);
    Route::get('employees/{employee}', [EmployeeController::class, 'show']);
    Route::get('employees/{employee}/availability', [EmployeeController::class, 'availability']);

    // Working hours per employee
    Route::apiResource('employees.working-hours', WorkingHourController::class)
        ->parameters(['working-hours' => 'workingHour']);
});
